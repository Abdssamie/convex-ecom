import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const regionCountryValidator = schema.tables.regionCountries.validator.extend({
  _id: v.id("regionCountries"),
  _creationTime: v.number(),
});

export const listRegionCountries = query({
  args: {
    limit: v.optional(v.number()),
    regionId: v.optional(v.id("regions")),
    countryCode: v.optional(v.string()),
  },
  returns: v.array(regionCountryValidator),
  handler: async (ctx, args) => {
    const { regionId, countryCode } = args;
    if (regionId !== undefined && countryCode !== undefined) {
      return await ctx.db
        .query("regionCountries")
        .withIndex("by_region_and_country_code", (q) =>
          q.eq("regionId", regionId).eq("countryCode", countryCode),
        )
        .take(args.limit ?? 50);
    }

    if (regionId !== undefined) {
      return await ctx.db
        .query("regionCountries")
        .withIndex("by_region", (q) => q.eq("regionId", regionId))
        .take(args.limit ?? 50);
    }

    if (countryCode !== undefined) {
      return await ctx.db
        .query("regionCountries")
        .withIndex("by_country_code", (q) => q.eq("countryCode", countryCode))
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("regionCountries").take(args.limit ?? 50);
  },
});

export const getRegionCountry = query({
  args: {
    regionCountryId: v.id("regionCountries"),
  },
  returns: v.union(v.null(), regionCountryValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("regionCountries", args.regionCountryId);
  },
});

export const createRegionCountry = mutation({
  args: {
    regionId: v.id("regions"),
    countryCode: v.string(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("regionCountries"),
  handler: async (ctx, args) => {
    await requireDoc(ctx, "regions", args.regionId, "Region not found");
    const existing = await ctx.db
      .query("regionCountries")
      .withIndex("by_region_and_country_code", (q) =>
        q.eq("regionId", args.regionId).eq("countryCode", args.countryCode),
      )
      .first();
    if (existing) {
      throw new Error("Region country already exists");
    }
    return await ctx.db.insert("regionCountries", {
      regionId: args.regionId,
      countryCode: args.countryCode,
      metadata: args.metadata,
    });
  },
});

export const updateRegionCountry = mutation({
  args: {
    regionCountryId: v.id("regionCountries"),
    regionId: v.optional(v.id("regions")),
    countryCode: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await requireDoc(
      ctx,
      "regionCountries",
      args.regionCountryId,
      "Region country not found",
    );
    const patch = buildPatch({
      regionId: args.regionId,
      countryCode: args.countryCode,
      metadata: args.metadata,
    });
    if (args.regionId) {
      await requireDoc(ctx, "regions", args.regionId, "Region not found");
    }
    const regionId = args.regionId ?? existing.regionId;
    const countryCode = args.countryCode ?? existing.countryCode;
    const duplicate = await ctx.db
      .query("regionCountries")
      .withIndex("by_region_and_country_code", (q) =>
        q.eq("regionId", regionId).eq("countryCode", countryCode),
      )
      .first();
    if (duplicate && duplicate._id !== args.regionCountryId) {
      throw new Error("Region country already exists");
    }
    await ctx.db.patch(args.regionCountryId, patch);
  },
});
