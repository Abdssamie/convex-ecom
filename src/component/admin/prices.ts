import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";
import { requireAdmin } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const priceValidator = schema.tables.prices.validator.extend({
  _id: v.id("prices"),
  _creationTime: v.number(),
});

export const listPricesByVariant = query({
  args: {
    variantId: v.id("variants"),
    priceListId: v.optional(v.union(v.null(), v.id("priceLists"))),
    limit: v.optional(v.number()),
  },
  returns: v.array(priceValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const priceListId = args.priceListId as Id<"priceLists"> | null | undefined;
    if (priceListId === undefined) {
      return await ctx.db
        .query("prices")
        .withIndex("by_variant", (q) => q.eq("variantId", args.variantId))
        .take(args.limit ?? 200);
    }

    return await ctx.db
      .query("prices")
      .withIndex("by_variant_and_price_list_id", (q) =>
        q.eq("variantId", args.variantId).eq("priceListId", priceListId),
      )
      .take(args.limit ?? 200);
  },
});

export const listPricesByPriceList = query({
  args: {
    priceListId: v.union(v.null(), v.id("priceLists")),
    limit: v.optional(v.number()),
  },
  returns: v.array(priceValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("prices")
      .withIndex("by_price_list_id", (q) =>
        q.eq("priceListId", args.priceListId),
      )
      .take(args.limit ?? 200);
  },
});

export const createPrice = mutation({
  args: {
    price: schema.tables.prices.validator,
  },
  returns: v.id("prices"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const variant = await ctx.db.get("variants", args.price.variantId);
    if (!variant) {
      throw new Error("Variant not found");
    }

    if (args.price.priceListId) {
      const priceList = await ctx.db.get("priceLists", args.price.priceListId);
      if (!priceList) {
        throw new Error("Price list not found");
      }
    }

    const existing = await ctx.db
      .query("prices")
      .withIndex("by_variant_currency_and_price_list_id", (q) =>
        q
          .eq("variantId", args.price.variantId)
          .eq("currencyCode", args.price.currencyCode)
          .eq("priceListId", args.price.priceListId ?? null),
      )
      .first();
    if (existing) {
      throw new Error("Price already exists for variant/currency/price list");
    }

    return await ctx.db.insert("prices", args.price);
  },
});

export const updatePrice = mutation({
  args: {
    priceId: v.id("prices"),
    variantId: v.optional(v.id("variants")),
    title: v.optional(v.string()),
    currencyCode: v.optional(v.string()),
    amount: v.optional(v.number()),
    minQuantity: v.optional(v.number()),
    maxQuantity: v.optional(v.number()),
    priceListId: v.optional(v.union(v.null(), v.id("priceLists"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("prices", args.priceId);
    if (!existing) {
      throw new Error("Price not found");
    }

    if (args.variantId) {
      const variant = await ctx.db.get("variants", args.variantId);
      if (!variant) {
        throw new Error("Variant not found");
      }
    }

    if (args.priceListId) {
      const priceList = await ctx.db.get("priceLists", args.priceListId);
      if (!priceList) {
        throw new Error("Price list not found");
      }
    }

    const patch = buildPatch({
      variantId: args.variantId,
      title: args.title,
      currencyCode: args.currencyCode,
      amount: args.amount,
      minQuantity: args.minQuantity,
      maxQuantity: args.maxQuantity,
      priceListId: args.priceListId,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    const variantId = args.variantId ?? existing.variantId;
    const currencyCode = args.currencyCode ?? existing.currencyCode;
    const priceListId =
      args.priceListId === undefined ? existing.priceListId : args.priceListId;
    const duplicate = await ctx.db
      .query("prices")
      .withIndex("by_variant_currency_and_price_list_id", (q) =>
        q
          .eq("variantId", variantId)
          .eq("currencyCode", currencyCode)
          .eq("priceListId", priceListId ?? null),
      )
      .first();
    if (duplicate && duplicate._id !== args.priceId) {
      throw new Error("Price already exists for variant/currency/price list");
    }

    await ctx.db.patch(args.priceId, patch);
  },
});

export const deletePrice = mutation({
  args: {
    priceId: v.id("prices"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("prices", args.priceId);
    if (!existing) {
      return;
    }
    await ctx.db.delete(args.priceId);
  },
});
