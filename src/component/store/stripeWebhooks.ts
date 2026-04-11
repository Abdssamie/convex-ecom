import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { api } from "../_generated/api";

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

export const handleStripePaymentIntent = mutation({
  args: {
    paymentIntentId: v.string(),
    paymentId: v.optional(v.string()),
    status: stripePaymentStatus,
    amount: v.number(),
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

    if (
      payment.status === "refunded" ||
      payment.status === "partially_refunded"
    ) {
      return;
    }

    const status = mapStripeStatus(args.status);
    await ctx.db.patch(payment._id, {
      status,
      amount: args.amount,
      currencyCode: args.currency,
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
        orderId = await ctx.runMutation(api.store.orders.createOrderFromCart, {
          cartId: payment.cartId,
        });
      }
      await ctx.db.patch(payment._id, { orderId });
    }

    if (orderId) {
      await ctx.db.patch(orderId, { paymentStatus: status });
    }
  },
});

export const handleStripeRefund = mutation({
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

    if (args.amountRefunded <= 0) {
      return;
    }

    const status =
      args.amountRefunded < payment.amount ? "partially_refunded" : "refunded";

    await ctx.db.patch(payment._id, {
      status,
      currencyCode: args.currency,
    });

    if (payment.orderId) {
      await ctx.db.patch(payment.orderId, { paymentStatus: status });
    }
  },
});

function mapStripeStatus(status: string) {
  switch (status) {
    case "succeeded":
      return "completed" as const;
    case "canceled":
      return "canceled" as const;
    case "payment_failed":
      return "failed" as const;
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
