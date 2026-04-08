import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const taxRegionValidator = schema.tables.taxRegions.validator.extend({
  _id: v.id("taxRegions"),
  _creationTime: v.number(),
});

export const listTaxRegions = query({
  args: {
    limit: v.optional(v.number()),
    countryCode: v.optional(v.string()),
    provinceCode: v.optional(v.string()),
    parentTaxRegionId: v.optional(v.id("taxRegions")),
  },
  returns: v.array(taxRegionValidator),
  handler: async (ctx, args) => {
    if (args.parentTaxRegionId !== undefined) {
      return await ctx.db
        .query("taxRegions")
        .withIndex("by_parent_tax_region_id", (q) =>
          q.eq("parentTaxRegionId", args.parentTaxRegionId!),
        )
        .take(args.limit ?? 50);
    }

    if (args.countryCode !== undefined && args.provinceCode !== undefined) {
      return await ctx.db
        .query("taxRegions")
        .withIndex("by_country_code_and_province_code", (q) =>
          q
            .eq("countryCode", args.countryCode!)
            .eq("provinceCode", args.provinceCode!),
        )
        .take(args.limit ?? 50);
    }

    if (args.countryCode !== undefined) {
      return await ctx.db
        .query("taxRegions")
        .withIndex("by_country_code", (q) =>
          q.eq("countryCode", args.countryCode!),
        )
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("taxRegions").take(args.limit ?? 50);
  },
});

export const getTaxRegion = query({
  args: {
    taxRegionId: v.id("taxRegions"),
  },
  returns: v.union(v.null(), taxRegionValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("taxRegions", args.taxRegionId);
  },
});

export const createTaxRegion = mutation({
  args: {
    taxRegion: schema.tables.taxRegions.validator,
  },
  returns: v.id("taxRegions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("taxRegions", args.taxRegion);
  },
});

export const updateTaxRegion = mutation({
  args: {
    taxRegionId: v.id("taxRegions"),
    countryCode: v.optional(v.string()),
    provinceCode: v.optional(v.string()),
    parentTaxRegionId: v.optional(v.id("taxRegions")),
    providerId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "taxRegions",
      args.taxRegionId,
      "Tax region not found",
    );
    const patch = buildPatch({
      countryCode: args.countryCode,
      provinceCode: args.provinceCode,
      parentTaxRegionId: args.parentTaxRegionId,
      providerId: args.providerId,
      metadata: args.metadata,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.taxRegionId, patch);
  },
});
