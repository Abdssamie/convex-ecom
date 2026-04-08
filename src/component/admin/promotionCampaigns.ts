import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const promotionCampaignValidator =
  schema.tables.promotionCampaigns.validator.extend({
    _id: v.id("promotionCampaigns"),
    _creationTime: v.number(),
  });

export const listPromotionCampaigns = query({
  args: {
    limit: v.optional(v.number()),
    name: v.optional(v.string()),
  },
  returns: v.array(promotionCampaignValidator),
  handler: async (ctx, args) => {
    if (args.name !== undefined) {
      return await ctx.db
        .query("promotionCampaigns")
        .withIndex("by_name", (q) => q.eq("name", args.name!))
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("promotionCampaigns").take(args.limit ?? 50);
  },
});

export const getPromotionCampaign = query({
  args: {
    promotionCampaignId: v.id("promotionCampaigns"),
  },
  returns: v.union(v.null(), promotionCampaignValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("promotionCampaigns", args.promotionCampaignId);
  },
});

export const createPromotionCampaign = mutation({
  args: {
    promotionCampaign: schema.tables.promotionCampaigns.validator,
  },
  returns: v.id("promotionCampaigns"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("promotionCampaigns", args.promotionCampaign);
  },
});

export const updatePromotionCampaign = mutation({
  args: {
    promotionCampaignId: v.id("promotionCampaigns"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "promotionCampaigns",
      args.promotionCampaignId,
      "Promotion campaign not found",
    );
    const patch = buildPatch({
      name: args.name,
      description: args.description,
      metadata: args.metadata,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.promotionCampaignId, patch);
  },
});
