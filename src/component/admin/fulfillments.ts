import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const fulfillmentValidator = schema.tables.fulfillments.validator.extend({
  _id: v.id("fulfillments"),
  _creationTime: v.number(),
});

export const listFulfillments = query({
  args: {
    paginationOpts: paginationOptsValidator,
    orderId: v.optional(v.id("orders")),
    locationId: v.optional(v.id("locations")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.orderId) {
      return await ctx.db
        .query("fulfillments")
        .withIndex("by_order_id", (q) => q.eq("orderId", args.orderId!))
        .paginate(args.paginationOpts);
    }

    if (args.locationId) {
      return await ctx.db
        .query("fulfillments")
        .withIndex("by_location_id", (q) =>
          q.eq("locationId", args.locationId!),
        )
        .paginate(args.paginationOpts);
    }

    return await ctx.db.query("fulfillments").paginate(args.paginationOpts);
  },
});

export const getFulfillment = query({
  args: {
    fulfillmentId: v.id("fulfillments"),
  },
  returns: v.union(v.null(), fulfillmentValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("fulfillments", args.fulfillmentId);
  },
});

export const createFulfillment = mutation({
  args: {
    orderId: v.id("orders"),
    orderShippingMethodId: v.optional(v.id("orderShippingMethods")),
    locationId: v.id("locations"),
    packedAt: v.optional(v.number()),
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    markedShippedBy: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    requiresShipping: v.boolean(),
    fulfillmentProviderId: v.optional(v.string()),
    shippingOptionId: v.optional(v.string()),
    data: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("fulfillments"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(ctx, "orders", args.orderId, "Order not found");
    await requireDoc(ctx, "locations", args.locationId, "Location not found");
    if (args.orderShippingMethodId) {
      const method = await requireDoc(
        ctx,
        "orderShippingMethods",
        args.orderShippingMethodId,
        "Order shipping method not found",
      );
      if (method.orderId !== args.orderId) {
        throw new Error("Shipping method does not match order");
      }
    }
    return await ctx.db.insert("fulfillments", {
      orderId: args.orderId,
      orderShippingMethodId: args.orderShippingMethodId,
      locationId: args.locationId,
      packedAt: args.packedAt,
      shippedAt: args.shippedAt,
      deliveredAt: args.deliveredAt,
      canceledAt: args.canceledAt,
      markedShippedBy: args.markedShippedBy,
      createdBy: args.createdBy,
      requiresShipping: args.requiresShipping,
      fulfillmentProviderId: args.fulfillmentProviderId,
      shippingOptionId: args.shippingOptionId,
      data: args.data,
      metadata: args.metadata,
    });
  },
});

export const updateFulfillment = mutation({
  args: {
    fulfillmentId: v.id("fulfillments"),
    orderId: v.optional(v.id("orders")),
    orderShippingMethodId: v.optional(v.id("orderShippingMethods")),
    locationId: v.optional(v.id("locations")),
    packedAt: v.optional(v.number()),
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    markedShippedBy: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    requiresShipping: v.optional(v.boolean()),
    fulfillmentProviderId: v.optional(v.string()),
    shippingOptionId: v.optional(v.string()),
    data: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await requireDoc(
      ctx,
      "fulfillments",
      args.fulfillmentId,
      "Fulfillment not found",
    );
    if (args.orderId) {
      await requireDoc(ctx, "orders", args.orderId, "Order not found");
    }
    if (args.locationId) {
      await requireDoc(ctx, "locations", args.locationId, "Location not found");
    }
    if (args.orderShippingMethodId) {
      const method = await requireDoc(
        ctx,
        "orderShippingMethods",
        args.orderShippingMethodId,
        "Order shipping method not found",
      );
      const orderId = args.orderId ?? existing.orderId;
      if (method.orderId !== orderId) {
        throw new Error("Shipping method does not match order");
      }
    }
    const patch = buildPatch({
      orderId: args.orderId,
      orderShippingMethodId: args.orderShippingMethodId,
      locationId: args.locationId,
      packedAt: args.packedAt,
      shippedAt: args.shippedAt,
      deliveredAt: args.deliveredAt,
      canceledAt: args.canceledAt,
      markedShippedBy: args.markedShippedBy,
      createdBy: args.createdBy,
      requiresShipping: args.requiresShipping,
      fulfillmentProviderId: args.fulfillmentProviderId,
      shippingOptionId: args.shippingOptionId,
      data: args.data,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.fulfillmentId, patch);
  },
});
