import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const fulfillmentItemValidator =
  schema.tables.fulfillmentItems.validator.extend({
    _id: v.id("fulfillmentItems"),
    _creationTime: v.number(),
  });

export const listFulfillmentItems = query({
  args: {
    fulfillmentId: v.optional(v.id("fulfillments")),
    orderItemId: v.optional(v.id("orderItems")),
    limit: v.optional(v.number()),
  },
  returns: v.array(fulfillmentItemValidator),
  handler: async (ctx, args) => {
    if (args.fulfillmentId) {
      return await ctx.db
        .query("fulfillmentItems")
        .withIndex("by_fulfillment_id", (q) =>
          q.eq("fulfillmentId", args.fulfillmentId!),
        )
        .take(args.limit ?? 50);
    }

    if (args.orderItemId) {
      return await ctx.db
        .query("fulfillmentItems")
        .withIndex("by_order_item_id", (q) =>
          q.eq("orderItemId", args.orderItemId!),
        )
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("fulfillmentItems").take(args.limit ?? 50);
  },
});

export const getFulfillmentItem = query({
  args: {
    fulfillmentItemId: v.id("fulfillmentItems"),
  },
  returns: v.union(v.null(), fulfillmentItemValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("fulfillmentItems", args.fulfillmentItemId);
  },
});

export const createFulfillmentItem = mutation({
  args: {
    fulfillmentId: v.id("fulfillments"),
    orderItemId: v.id("orderItems"),
    quantity: v.number(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("fulfillmentItems"),
  handler: async (ctx, args) => {
    const fulfillment = await requireDoc(
      ctx,
      "fulfillments",
      args.fulfillmentId,
      "Fulfillment not found",
    );
    const orderItem = await requireDoc(
      ctx,
      "orderItems",
      args.orderItemId,
      "Order item not found",
    );
    if (orderItem.orderId !== fulfillment.orderId) {
      throw new Error("Order item does not match fulfillment order");
    }
    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    return await ctx.db.insert("fulfillmentItems", {
      fulfillmentId: args.fulfillmentId,
      orderItemId: args.orderItemId,
      quantity: args.quantity,
      metadata: args.metadata,
    });
  },
});

export const updateFulfillmentItem = mutation({
  args: {
    fulfillmentItemId: v.id("fulfillmentItems"),
    fulfillmentId: v.optional(v.id("fulfillments")),
    orderItemId: v.optional(v.id("orderItems")),
    quantity: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await requireDoc(
      ctx,
      "fulfillmentItems",
      args.fulfillmentItemId,
      "Fulfillment item not found",
    );
    const _existingFulfillment = await requireDoc(
      ctx,
      "fulfillments",
      existing.fulfillmentId,
      "Fulfillment not found",
    );
    const _existingOrderItem = await requireDoc(
      ctx,
      "orderItems",
      existing.orderItemId,
      "Order item not found",
    );
    const fulfillmentId = args.fulfillmentId ?? existing.fulfillmentId;
    const orderItemId = args.orderItemId ?? existing.orderItemId;
    const fulfillment = await requireDoc(
      ctx,
      "fulfillments",
      fulfillmentId,
      "Fulfillment not found",
    );
    const orderItem = await requireDoc(
      ctx,
      "orderItems",
      orderItemId,
      "Order item not found",
    );
    if (orderItem.orderId !== fulfillment.orderId) {
      throw new Error("Order item does not match fulfillment order");
    }
    if (args.quantity !== undefined && args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    const patch = buildPatch({
      fulfillmentId: args.fulfillmentId,
      orderItemId: args.orderItemId,
      quantity: args.quantity,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.fulfillmentItemId, patch);
  },
});
