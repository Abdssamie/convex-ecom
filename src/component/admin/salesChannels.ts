import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const salesChannelValidator = schema.tables.salesChannels.validator.extend({
  _id: v.id("salesChannels"),
  _creationTime: v.number(),
});

export const listSalesChannels = query({
  args: {
    limit: v.optional(v.number()),
    name: v.optional(v.string()),
    isDisabled: v.optional(v.boolean()),
  },
  returns: v.array(salesChannelValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { name, isDisabled } = args;
    if (name !== undefined) {
      return await ctx.db
        .query("salesChannels")
        .withIndex("by_name", (q) => q.eq("name", name))
        .take(args.limit ?? 50);
    }

    if (isDisabled !== undefined) {
      return await ctx.db
        .query("salesChannels")
        .withIndex("by_is_disabled", (q) => q.eq("isDisabled", isDisabled))
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("salesChannels").take(args.limit ?? 50);
  },
});

export const getSalesChannel = query({
  args: {
    salesChannelId: v.id("salesChannels"),
  },
  returns: v.union(v.null(), salesChannelValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("salesChannels", args.salesChannelId);
  },
});

export const createSalesChannel = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isDisabled: v.boolean(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("salesChannels"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("salesChannels", {
      name: args.name,
      description: args.description,
      isDisabled: args.isDisabled,
      metadata: args.metadata,
    });
  },
});

export const updateSalesChannel = mutation({
  args: {
    salesChannelId: v.id("salesChannels"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isDisabled: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "salesChannels",
      args.salesChannelId,
      "Sales channel not found",
    );
    const patch = buildPatch({
      name: args.name,
      description: args.description,
      isDisabled: args.isDisabled,
      metadata: args.metadata,
    });
    await ctx.db.patch(args.salesChannelId, patch);
  },
});
