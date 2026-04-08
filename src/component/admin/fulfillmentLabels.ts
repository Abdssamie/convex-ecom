import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const fulfillmentLabelValidator =
  schema.tables.fulfillmentLabels.validator.extend({
    _id: v.id("fulfillmentLabels"),
    _creationTime: v.number(),
  });

export const listFulfillmentLabels = query({
  args: {
    fulfillmentId: v.optional(v.id("fulfillments")),
    limit: v.optional(v.number()),
  },
  returns: v.array(fulfillmentLabelValidator),
  handler: async (ctx, args) => {
    if (args.fulfillmentId) {
      return await ctx.db
        .query("fulfillmentLabels")
        .withIndex("by_fulfillment_id", (q) =>
          q.eq("fulfillmentId", args.fulfillmentId!),
        )
        .take(args.limit ?? 50);
    }
    return await ctx.db.query("fulfillmentLabels").take(args.limit ?? 50);
  },
});

export const getFulfillmentLabel = query({
  args: {
    fulfillmentLabelId: v.id("fulfillmentLabels"),
  },
  returns: v.union(v.null(), fulfillmentLabelValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("fulfillmentLabels", args.fulfillmentLabelId);
  },
});

export const createFulfillmentLabel = mutation({
  args: {
    fulfillmentId: v.id("fulfillments"),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    labelUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("fulfillmentLabels"),
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "fulfillments",
      args.fulfillmentId,
      "Fulfillment not found",
    );
    return await ctx.db.insert("fulfillmentLabels", {
      fulfillmentId: args.fulfillmentId,
      trackingNumber: args.trackingNumber,
      trackingUrl: args.trackingUrl,
      labelUrl: args.labelUrl,
      metadata: args.metadata,
    });
  },
});

export const updateFulfillmentLabel = mutation({
  args: {
    fulfillmentLabelId: v.id("fulfillmentLabels"),
    fulfillmentId: v.optional(v.id("fulfillments")),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    labelUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "fulfillmentLabels",
      args.fulfillmentLabelId,
      "Fulfillment label not found",
    );
    if (args.fulfillmentId) {
      await requireDoc(
        ctx,
        "fulfillments",
        args.fulfillmentId,
        "Fulfillment not found",
      );
    }
    const patch = buildPatch({
      fulfillmentId: args.fulfillmentId,
      trackingNumber: args.trackingNumber,
      trackingUrl: args.trackingUrl,
      labelUrl: args.labelUrl,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.fulfillmentLabelId, patch);
  },
});
