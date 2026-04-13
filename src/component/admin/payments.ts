import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { paymentStatusValidator } from "../shared/validators";
import { buildPatch } from "../shared/utils";

const paymentValidator = schema.tables.payments.validator.extend({
  _id: v.id("payments"),
  _creationTime: v.number(),
});

export const listPayments = query({
  args: {
    cartId: v.optional(v.id("carts")),
    paymentIntentId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(paymentValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.cartId) {
      return await ctx.db
        .query("payments")
        .withIndex("by_cart", (q) => q.eq("cartId", args.cartId!))
        .take(args.limit ?? 50);
    }

    if (args.paymentIntentId) {
      return await ctx.db
        .query("payments")
        .withIndex("by_payment_intent", (q) =>
          q.eq("paymentIntentId", args.paymentIntentId!),
        )
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("payments").take(args.limit ?? 50);
  },
});

export const getPayment = query({
  args: {
    paymentId: v.id("payments"),
  },
  returns: v.union(v.null(), paymentValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("payments", args.paymentId);
  },
});

export const createPayment = mutation({
  args: {
    cartId: v.id("carts"),
    orderId: v.optional(v.id("orders")),
    providerId: v.string(),
    status: paymentStatusValidator,
    amount: v.number(),
    currencyCode: v.string(),
    paymentIntentId: v.optional(v.string()),
    clientSecret: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("payments"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(ctx, "carts", args.cartId, "Cart not found");
    if (args.orderId) {
      const order = await requireDoc(
        ctx,
        "orders",
        args.orderId,
        "Order not found",
      );
      if (order.cartId !== args.cartId) {
        throw new Error("Order does not match cart");
      }
    }
    return await ctx.db.insert("payments", {
      cartId: args.cartId,
      orderId: args.orderId,
      providerId: args.providerId,
      status: args.status,
      amount: args.amount,
      currencyCode: args.currencyCode,
      paymentIntentId: args.paymentIntentId,
      clientSecret: args.clientSecret,
      metadata: args.metadata,
    });
  },
});

export const updatePayment = mutation({
  args: {
    paymentId: v.id("payments"),
    cartId: v.optional(v.id("carts")),
    orderId: v.optional(v.id("orders")),
    providerId: v.optional(v.string()),
    status: v.optional(paymentStatusValidator),
    amount: v.optional(v.number()),
    currencyCode: v.optional(v.string()),
    paymentIntentId: v.optional(v.string()),
    clientSecret: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await requireDoc(
      ctx,
      "payments",
      args.paymentId,
      "Payment not found",
    );
    if (args.cartId) {
      await requireDoc(ctx, "carts", args.cartId, "Cart not found");
    }
    if (args.orderId) {
      const order = await requireDoc(
        ctx,
        "orders",
        args.orderId,
        "Order not found",
      );
      const cartId = args.cartId ?? existing.cartId;
      if (order.cartId !== cartId) {
        throw new Error("Order does not match cart");
      }
    }
    const patch = buildPatch({
      cartId: args.cartId,
      orderId: args.orderId,
      providerId: args.providerId,
      status: args.status,
      amount: args.amount,
      currencyCode: args.currencyCode,
      paymentIntentId: args.paymentIntentId,
      clientSecret: args.clientSecret,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.paymentId, patch);
  },
});
