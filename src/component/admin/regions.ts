import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const regionValidator = schema.tables.regions.validator.extend({
  _id: v.id("regions"),
  _creationTime: v.number(),
});

export const listRegions = query({
  args: {
    limit: v.optional(v.number()),
    currencyCode: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  returns: v.array(regionValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { currencyCode, name } = args;
    if (currencyCode !== undefined) {
      return await ctx.db
        .query("regions")
        .withIndex("by_currency_code", (q) =>
          q.eq("currencyCode", currencyCode),
        )
        .take(args.limit ?? 50);
    }

    if (name !== undefined) {
      return await ctx.db
        .query("regions")
        .withIndex("by_name", (q) => q.eq("name", name))
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("regions").take(args.limit ?? 50);
  },
});

export const getRegion = query({
  args: {
    regionId: v.id("regions"),
  },
  returns: v.union(v.null(), regionValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("regions", args.regionId);
  },
});

export const createRegion = mutation({
  args: {
    name: v.string(),
    currencyCode: v.string(),
    automaticTaxes: v.boolean(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("regions"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("regions", {
      name: args.name,
      currencyCode: args.currencyCode,
      automaticTaxes: args.automaticTaxes,
      metadata: args.metadata,
    });
  },
});

export const updateRegion = mutation({
  args: {
    regionId: v.id("regions"),
    name: v.optional(v.string()),
    currencyCode: v.optional(v.string()),
    automaticTaxes: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(ctx, "regions", args.regionId, "Region not found");
    const patch = buildPatch({
      name: args.name,
      currencyCode: args.currencyCode,
      automaticTaxes: args.automaticTaxes,
      metadata: args.metadata,
    });
    await ctx.db.patch(args.regionId, patch);
  },
});
