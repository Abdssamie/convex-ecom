import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import {
  promotionStatusValidator,
  promotionTypeValidator,
} from "../shared/validators";
import { buildPatch } from "../shared/utils";

const promotionValidator = schema.tables.promotions.validator.extend({
  _id: v.id("promotions"),
  _creationTime: v.number(),
});

type PromotionStatus = "draft" | "active" | "inactive";

export const listPromotions = query({
  args: {
    status: v.optional(promotionStatusValidator),
    code: v.optional(v.string()),
    isAutomatic: v.optional(v.boolean()),
    campaignId: v.optional(v.id("promotionCampaigns")),
    limit: v.optional(v.number()),
  },
  returns: v.array(promotionValidator),
  handler: async (ctx, args) => {
    if (args.code !== undefined) {
      return await ctx.db
        .query("promotions")
        .withIndex("by_code", (q) => q.eq("code", args.code!))
        .take(args.limit ?? 50);
    }

    if (args.status !== undefined) {
      const status = args.status as PromotionStatus;
      return await ctx.db
        .query("promotions")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(args.limit ?? 50);
    }

    if (args.isAutomatic !== undefined) {
      return await ctx.db
        .query("promotions")
        .withIndex("by_is_automatic", (q) =>
          q.eq("isAutomatic", args.isAutomatic!),
        )
        .take(args.limit ?? 50);
    }

    if (args.campaignId !== undefined) {
      return await ctx.db
        .query("promotions")
        .withIndex("by_campaign_id", (q) =>
          q.eq("campaignId", args.campaignId!),
        )
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("promotions").take(args.limit ?? 50);
  },
});

export const getPromotion = query({
  args: {
    promotionId: v.id("promotions"),
  },
  returns: v.union(v.null(), promotionValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("promotions", args.promotionId);
  },
});

export const createPromotion = mutation({
  args: {
    promotion: schema.tables.promotions.validator,
  },
  returns: v.id("promotions"),
  handler: async (ctx, args) => {
    if (args.promotion.used !== 0) {
      throw new Error("Promotion used count must start at 0");
    }
    const existing = await ctx.db
      .query("promotions")
      .withIndex("by_code", (q) => q.eq("code", args.promotion.code))
      .first();
    if (existing) {
      throw new Error("Promotion code already exists");
    }
    return await ctx.db.insert("promotions", args.promotion);
  },
});

export const updatePromotion = mutation({
  args: {
    promotionId: v.id("promotions"),
    code: v.optional(v.string()),
    isAutomatic: v.optional(v.boolean()),
    isTaxInclusive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    type: v.optional(promotionTypeValidator),
    status: v.optional(promotionStatusValidator),
    campaignId: v.optional(v.id("promotionCampaigns")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "promotions",
      args.promotionId,
      "Promotion not found",
    );
    if (args.code) {
      const existing = await ctx.db
        .query("promotions")
        .withIndex("by_code", (q) => q.eq("code", args.code!))
        .first();
      if (existing && existing._id !== args.promotionId) {
        throw new Error("Promotion code already exists");
      }
    }

    const patch = buildPatch({
      code: args.code,
      isAutomatic: args.isAutomatic,
      isTaxInclusive: args.isTaxInclusive,
      limit: args.limit,
      type: args.type,
      status: args.status,
      campaignId: args.campaignId,
      metadata: args.metadata,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.promotionId, patch);
  },
});
