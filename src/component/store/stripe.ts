import { v } from "convex/values";
import { action } from "../_generated/server";
import type { ActionCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { api, components } from "../_generated/api";
import { StripeSubscriptions } from "@convex-dev/stripe";

const stripeClient = new StripeSubscriptions(components.stripe, {});

async function getOrCreateStripeCustomer(
  ctx: ActionCtx,
  customerId: Id<"customers">,
): Promise<string> {
  const customer: Doc<"customers"> | null = await ctx.runQuery(
    api.admin.customers.getCustomer,
    {
      customerId,
    },
  );
  if (!customer) {
    throw new Error("Customer not found");
  }

  const name =
    (customer.companyName ??
      `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim()) ||
    undefined;

  const stripeCustomer = await stripeClient.getOrCreateCustomer(ctx, {
    userId: customer.userId,
    email: customer.email,
    name,
  });

  if (customer.stripeCustomerId !== stripeCustomer.customerId) {
    await ctx.runMutation(api.admin.customers.updateCustomer, {
      customerId,
      stripeCustomerId: stripeCustomer.customerId,
    });
  }

  return stripeCustomer.customerId;
}

export const createCheckoutSession = action({
  args: {
    cartId: v.id("carts"),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  returns: v.object({ sessionId: v.string(), url: v.string() }),
  handler: async (ctx, args): Promise<{ sessionId: string; url: string }> => {
    const cartResult: { cart: Doc<"carts">; items: Doc<"cartItems">[] } | null =
      await ctx.runQuery(api.store.carts.getCart, {
        cartId: args.cartId,
      });
    if (!cartResult) {
      throw new Error("Cart not found");
    }
    const cart = cartResult.cart;
    if (cart.completedAt !== undefined) {
      throw new Error("Cart already completed");
    }
    if (!cart.customerId) {
      throw new Error("Cart customer is required for checkout");
    }
    if (cartResult.items.length !== 1) {
      throw new Error("Stripe checkout requires exactly one cart item");
    }

    const cartItem = cartResult.items[0];
    const variant = await ctx.runQuery(api.admin.variants.getVariant, {
      variantId: cartItem.variantId,
    });
    if (!variant) {
      throw new Error("Variant not found for cart item");
    }
    const priceId = getStripePriceId(variant.metadata);
    if (!priceId) {
      throw new Error(
        "Variant metadata.stripePriceId is required for Stripe checkout",
      );
    }

    const stripeCustomerId: string = await getOrCreateStripeCustomer(
      ctx,
      cart.customerId,
    );

    const paymentId: Id<"payments"> = await ctx.runMutation(
      api.admin.payments.createPayment,
      {
        cartId: args.cartId,
        orderId: undefined,
        providerId: "stripe",
        status: "awaiting",
        amount: cart.total,
        currencyCode: cart.currencyCode,
      },
    );

    await ctx.runMutation(api.admin.paymentAttempts.createPaymentAttempt, {
      paymentId,
      status: "created",
    });

    const session = await stripeClient.createCheckoutSession(ctx, {
      priceId,
      customerId: stripeCustomerId,
      mode: "payment",
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
      quantity: cartItem.quantity,
      metadata: {
        cartId: String(args.cartId),
        paymentId: String(paymentId),
        customerId: String(cart.customerId),
      },
      paymentIntentMetadata: {
        cartId: String(args.cartId),
        paymentId: String(paymentId),
        customerId: String(cart.customerId),
      },
    });

    await ctx.runMutation(api.admin.payments.updatePayment, {
      paymentId,
      metadata: {
        stripeCheckoutSessionId: session.sessionId,
      },
    });

    if (!session.url) {
      throw new Error("Stripe session URL not available");
    }

    return { sessionId: session.sessionId, url: session.url };
  },
});

export const syncPaymentIntent = action({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const paymentIntent = await ctx.runQuery(
      components.stripe.public.getPayment,
      {
        stripePaymentIntentId: args.paymentIntentId,
      },
    );
    if (!paymentIntent) {
      return;
    }

    const payments = await ctx.runQuery(api.admin.payments.listPayments, {
      paymentIntentId: args.paymentIntentId,
      limit: 1,
    });
    if (!payments[0]) {
      return;
    }

    const status = mapStripeStatus(paymentIntent.status);
    await ctx.runMutation(api.admin.payments.updatePayment, {
      paymentId: payments[0]._id,
      status,
      amount: paymentIntent.amount,
      currencyCode: paymentIntent.currency,
    });

    if (payments[0].orderId) {
      await ctx.runMutation(api.store.orders.setOrderPaymentStatus, {
        orderId: payments[0].orderId,
        paymentStatus: status,
      });
    }
  },
});

function mapStripeStatus(status: string) {
  switch (status) {
    case "succeeded":
      return "completed" as const;
    case "canceled":
      return "canceled" as const;
    case "processing":
    case "requires_action":
    case "requires_confirmation":
    case "requires_payment_method":
      return "awaiting" as const;
    case "requires_capture":
      return "authorized" as const;
    default:
      return "awaiting" as const;
  }
}

function getStripePriceId(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }
  const record = metadata as Record<string, unknown>;
  const direct = record.stripePriceId;
  if (typeof direct === "string" && direct.length > 0) {
    return direct;
  }
  const stripe = record.stripe;
  if (!stripe || typeof stripe !== "object") {
    return null;
  }
  const nested = (stripe as Record<string, unknown>).priceId;
  if (typeof nested === "string" && nested.length > 0) {
    return nested;
  }
  return null;
}
