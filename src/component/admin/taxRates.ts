import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";
import type { Id } from "../_generated/dataModel";

const taxRateValidator = schema.tables.taxRates.validator.extend({
  _id: v.id("taxRates"),
  _creationTime: v.number(),
});

export const listTaxRates = query({
  args: {
    taxRegionId: v.optional(v.id("taxRegions")),
    code: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(taxRateValidator),
  handler: async (ctx, args) => {
    if (args.taxRegionId !== undefined && args.code !== undefined) {
      return await ctx.db
        .query("taxRates")
        .withIndex("by_tax_region_id_and_code", (q) =>
          q.eq("taxRegionId", args.taxRegionId!).eq("code", args.code!),
        )
        .take(args.limit ?? 50);
    }

    if (args.taxRegionId !== undefined) {
      return await ctx.db
        .query("taxRates")
        .withIndex("by_tax_region_id", (q) =>
          q.eq("taxRegionId", args.taxRegionId!),
        )
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("taxRates").take(args.limit ?? 50);
  },
});

export const getTaxRate = query({
  args: {
    taxRateId: v.id("taxRates"),
  },
  returns: v.union(v.null(), taxRateValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("taxRates", args.taxRateId);
  },
});

export const createTaxRate = mutation({
  args: {
    taxRate: schema.tables.taxRates.validator,
  },
  returns: v.id("taxRates"),
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "taxRegions",
      args.taxRate.taxRegionId,
      "Tax region not found",
    );
    if (args.taxRate.isDefault) {
      const existingDefault = await ctx.db
        .query("taxRates")
        .withIndex("by_tax_region_id", (q) =>
          q.eq("taxRegionId", args.taxRate.taxRegionId),
        )
        .filter((q) => q.eq(q.field("isDefault"), true))
        .first();
      if (existingDefault) {
        throw new Error("Default tax rate already exists for region");
      }
    }
    return await ctx.db.insert("taxRates", args.taxRate);
  },
});

export const updateTaxRate = mutation({
  args: {
    taxRateId: v.id("taxRates"),
    taxRegionId: v.optional(v.id("taxRegions")),
    rate: v.optional(v.union(v.null(), v.number())),
    code: v.optional(v.string()),
    name: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    isCombinable: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await requireDoc(
      ctx,
      "taxRates",
      args.taxRateId,
      "Tax rate not found",
    );
    if (args.taxRegionId) {
      await requireDoc(
        ctx,
        "taxRegions",
        args.taxRegionId,
        "Tax region not found",
      );
    }
    const patch = buildPatch({
      taxRegionId: args.taxRegionId,
      rate: args.rate,
      code: args.code,
      name: args.name,
      isDefault: args.isDefault,
      isCombinable: args.isCombinable,
      metadata: args.metadata,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    const taxRegionId = (args.taxRegionId ??
      existing.taxRegionId) as Id<"taxRegions">;
    const isDefault = args.isDefault ?? existing.isDefault;
    if (isDefault) {
      const existingDefault = await ctx.db
        .query("taxRates")
        .withIndex("by_tax_region_id", (q) => q.eq("taxRegionId", taxRegionId))
        .filter((q) => q.eq(q.field("isDefault"), true))
        .first();
      if (existingDefault && existingDefault._id !== args.taxRateId) {
        throw new Error("Default tax rate already exists for region");
      }
    }

    await ctx.db.patch(args.taxRateId, patch);
  },
});
