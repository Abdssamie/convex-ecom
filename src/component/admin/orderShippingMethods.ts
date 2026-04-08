import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const orderShippingMethodValidator =
  schema.tables.orderShippingMethods.validator.extend({
    _id: v.id("orderShippingMethods"),
    _creationTime: v.number(),
  });

export const listOrderShippingMethods = query({
  args: {
    orderId: v.optional(v.id("orders")),
    shippingOptionId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(orderShippingMethodValidator),
  handler: async (ctx, args) => {
    if (args.orderId) {
      return await ctx.db
        .query("orderShippingMethods")
        .withIndex("by_order_id", (q) => q.eq("orderId", args.orderId!))
        .take(args.limit ?? 50);
    }

    if (args.shippingOptionId) {
      return await ctx.db
        .query("orderShippingMethods")
        .withIndex("by_shipping_option_id", (q) =>
          q.eq("shippingOptionId", args.shippingOptionId!),
        )
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("orderShippingMethods").take(args.limit ?? 50);
  },
});

export const getOrderShippingMethod = query({
  args: {
    orderShippingMethodId: v.id("orderShippingMethods"),
  },
  returns: v.union(v.null(), orderShippingMethodValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("orderShippingMethods", args.orderShippingMethodId);
  },
});

export const createOrderShippingMethod = mutation({
  args: {
    orderId: v.id("orders"),
    name: v.string(),
    amount: v.number(),
    isTaxInclusive: v.boolean(),
    isCustomAmount: v.boolean(),
    shippingOptionId: v.optional(v.string()),
    data: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("orderShippingMethods"),
  handler: async (ctx, args) => {
    await requireDoc(ctx, "orders", args.orderId, "Order not found");
    return await ctx.db.insert("orderShippingMethods", {
      orderId: args.orderId,
      name: args.name,
      amount: args.amount,
      isTaxInclusive: args.isTaxInclusive,
      isCustomAmount: args.isCustomAmount,
      shippingOptionId: args.shippingOptionId,
      data: args.data,
      metadata: args.metadata,
    });
  },
});

export const updateOrderShippingMethod = mutation({
  args: {
    orderShippingMethodId: v.id("orderShippingMethods"),
    orderId: v.optional(v.id("orders")),
    name: v.optional(v.string()),
    amount: v.optional(v.number()),
    isTaxInclusive: v.optional(v.boolean()),
    isCustomAmount: v.optional(v.boolean()),
    shippingOptionId: v.optional(v.string()),
    data: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "orderShippingMethods",
      args.orderShippingMethodId,
      "Order shipping method not found",
    );
    if (args.orderId) {
      await requireDoc(ctx, "orders", args.orderId, "Order not found");
    }
    const patch = buildPatch({
      orderId: args.orderId,
      name: args.name,
      amount: args.amount,
      isTaxInclusive: args.isTaxInclusive,
      isCustomAmount: args.isCustomAmount,
      shippingOptionId: args.shippingOptionId,
      data: args.data,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.orderShippingMethodId, patch);
  },
});
