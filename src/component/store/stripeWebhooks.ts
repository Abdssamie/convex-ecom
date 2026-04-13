import { v } from "convex/values";
import Stripe from "stripe";
import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { mapStripeStatus } from "./stripeStatus";

const stripe = new Stripe("sk_test_webhook_verifier");

const stripePaymentStatus = v.union(
  v.literal("succeeded"),
  v.literal("canceled"),
  v.literal("processing"),
  v.literal("requires_action"),
  v.literal("requires_confirmation"),
  v.literal("requires_payment_method"),
  v.literal("requires_capture"),
  v.literal("payment_failed"),
);

export const handleStripePaymentIntent = internalMutation({
  args: {
    paymentIntentId: v.string(),
    paymentId: v.optional(v.string()),
    status: stripePaymentStatus,
    amount: v.number(),
    currency: v.string(),
    stripeEventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await resolveStripePayment(ctx, {
      paymentIntentId: args.paymentIntentId,
      paymentId: args.paymentId,
    });

    if (!payment) {
      return;
    }

    if (
      args.stripeEventId &&
      hasProcessedStripeEvent(payment.metadata, args.stripeEventId)
    ) {
      return;
    }

    if (
      payment.status === "refunded" ||
      payment.status === "partially_refunded"
    ) {
      return;
    }

    const status = mapStripeStatus(args.status);
    if (payment.status === "completed" && status !== "completed") {
      return;
    }

    const cart = await ctx.db.get(payment.cartId);
    if (!cart) {
      return;
    }

    const order = payment.orderId ? await ctx.db.get(payment.orderId) : null;
    const eventCurrency = args.currency.toLowerCase();
    const paymentCurrency = payment.currencyCode.toLowerCase();
    const cartCurrency = cart.currencyCode.toLowerCase();
    const orderCurrency = order?.currencyCode?.toLowerCase();

    const amountMismatch =
      args.amount !== payment.amount ||
      args.amount !== cart.total ||
      (order ? args.amount !== order.total : false);
    const currencyMismatch =
      eventCurrency !== paymentCurrency ||
      eventCurrency !== cartCurrency ||
      (orderCurrency ? eventCurrency !== orderCurrency : false);

    if (amountMismatch || currencyMismatch) {
      await ctx.db.patch(payment._id, { status: "failed" });
      if (payment.orderId) {
        await ctx.db.patch(payment.orderId, { paymentStatus: "failed" });
      }
      return;
    }

    await ctx.db.patch(payment._id, {
      status,
      currencyCode: eventCurrency,
    });

    let orderId = payment.orderId;
    if (!orderId && status === "completed") {
      const existingOrder = await ctx.db
        .query("orders")
        .withIndex("by_cart", (q) => q.eq("cartId", payment.cartId))
        .first();
      if (existingOrder) {
        orderId = existingOrder._id;
      } else {
        orderId = await ctx.runMutation(
          internal.store.orders.createOrderFromCartInternal,
          {
            cartId: payment.cartId,
          },
        );
      }
      await ctx.db.patch(payment._id, { orderId });
    }

    if (orderId) {
      await ctx.db.patch(orderId, { paymentStatus: status });
    }

    if (args.stripeEventId) {
      await markStripeEventProcessed(
        ctx,
        payment._id,
        payment.metadata,
        args.stripeEventId,
      );
    }
  },
});

export const handleStripeRefund = internalMutation({
  args: {
    paymentIntentId: v.string(),
    paymentId: v.optional(v.string()),
    amountRefunded: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await resolveStripePayment(ctx, {
      paymentIntentId: args.paymentIntentId,
      paymentId: args.paymentId,
    });

    if (!payment) {
      return;
    }

    const eventCurrency = args.currency.toLowerCase();
    if (eventCurrency !== payment.currencyCode.toLowerCase()) {
      return;
    }

    if (args.amountRefunded <= 0) {
      return;
    }

    if (args.amountRefunded > payment.amount) {
      return;
    }

    const status =
      args.amountRefunded < payment.amount ? "partially_refunded" : "refunded";

    await ctx.db.patch(payment._id, {
      status,
      currencyCode: eventCurrency,
    });

    if (payment.orderId) {
      await ctx.db.patch(payment.orderId, { paymentStatus: status });
    }
  },
});

export const handleSignedStripeWebhook = internalMutation({
  args: {
    payload: v.string(),
    signature: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await verifyStripeWebhook(
      args.payload,
      args.signature,
      args.secret,
    );
    if (event.type !== "payment_intent.succeeded") {
      return;
    }

    const paymentIntent = event.data.object;

    await ctx.runMutation(
      internal.store.stripeWebhooks.handleStripePaymentIntent,
      {
        paymentIntentId: paymentIntent.id,
        paymentId: paymentIntent.metadata?.paymentId,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        stripeEventId: event.id,
      },
    );
  },
});

async function resolveStripePayment(
  ctx: MutationCtx,
  args: { paymentIntentId: string; paymentId?: string },
) {
  const paymentByIntent = await ctx.db
    .query("payments")
    .withIndex("by_payment_intent", (q) =>
      q.eq("paymentIntentId", args.paymentIntentId),
    )
    .first();
  if (paymentByIntent) {
    return paymentByIntent;
  }

  if (!args.paymentId) {
    return null;
  }

  const normalizedPaymentId = ctx.db.normalizeId("payments", args.paymentId);
  if (!normalizedPaymentId) {
    return null;
  }

  const paymentById = await ctx.db.get(normalizedPaymentId);
  if (!paymentById) {
    return null;
  }

  if (!paymentById.paymentIntentId) {
    await ctx.db.patch(paymentById._id, {
      paymentIntentId: args.paymentIntentId,
    });
    return {
      ...paymentById,
      paymentIntentId: args.paymentIntentId,
    };
  }

  return paymentById;
}

type StripeWebhookEvent = {
  id: string;
  type: string;
  data: { object: Stripe.PaymentIntent };
};

function verifyStripeWebhook(
  payload: string,
  signatureHeader: string,
  secret: string,
): StripeWebhookEvent {
  return stripe.webhooks.constructEvent(
    payload,
    signatureHeader,
    secret,
  ) as StripeWebhookEvent;
}

function hasProcessedStripeEvent(metadata: unknown, eventId: string) {
  if (!metadata || typeof metadata !== "object") {
    return false;
  }

  const processed = (metadata as Record<string, unknown>)
    .processedStripeEventIds;
  return Array.isArray(processed) && processed.includes(eventId);
}

async function markStripeEventProcessed(
  ctx: MutationCtx,
  paymentId: Id<"payments">,
  metadata: unknown,
  eventId: string,
) {
  const currentMetadata =
    metadata && typeof metadata === "object"
      ? { ...(metadata as Record<string, unknown>) }
      : {};
  const processedStripeEventIds = Array.isArray(
    currentMetadata.processedStripeEventIds,
  )
    ? currentMetadata.processedStripeEventIds.filter(
        (value): value is string => typeof value === "string",
      )
    : [];

  await ctx.db.patch(paymentId, {
    metadata: {
      ...currentMetadata,
      processedStripeEventIds: [...processedStripeEventIds, eventId],
    },
  });
}
