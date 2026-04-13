import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import {
  priceListStatusValidator,
  priceListTypeValidator,
} from "../shared/validators";
import { buildPatch } from "../shared/utils";

const priceListValidator = schema.tables.priceLists.validator.extend({
  _id: v.id("priceLists"),
  _creationTime: v.number(),
});

export const listPriceLists = query({
  args: {
    status: v.optional(priceListStatusValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(priceListValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status === undefined) {
      return await ctx.db.query("priceLists").take(args.limit ?? 50);
    }

    return await ctx.db
      .query("priceLists")
      .withIndex("by_status", (q) => q.eq("status", args.status!))
      .take(args.limit ?? 50);
  },
});

export const getPriceList = query({
  args: {
    priceListId: v.id("priceLists"),
  },
  returns: v.union(v.null(), priceListValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("priceLists", args.priceListId);
  },
});

export const createPriceList = mutation({
  args: {
    priceList: schema.tables.priceLists.validator,
  },
  returns: v.id("priceLists"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("priceLists", args.priceList);
  },
});

export const updatePriceList = mutation({
  args: {
    priceListId: v.id("priceLists"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(priceListStatusValidator),
    type: v.optional(priceListTypeValidator),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    rulesCount: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "priceLists",
      args.priceListId,
      "Price list not found",
    );

    const patch = buildPatch({
      title: args.title,
      description: args.description,
      status: args.status,
      type: args.type,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      rulesCount: args.rulesCount,
      metadata: args.metadata,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.priceListId, patch);
  },
});

export const deletePriceList = mutation({
  args: {
    priceListId: v.id("priceLists"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "priceLists",
      args.priceListId,
      "Price list not found",
    );
    await ctx.db.patch(args.priceListId, { status: "draft" });
  },
});
