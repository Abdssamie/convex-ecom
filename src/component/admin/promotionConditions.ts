import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { promotionRuleOperatorValidator } from "../shared/validators";
import { buildPatch } from "../shared/utils";

const promotionConditionValidator =
  schema.tables.promotionConditions.validator.extend({
    _id: v.id("promotionConditions"),
    _creationTime: v.number(),
  });

export const listPromotionConditions = query({
  args: {
    promotionId: v.optional(v.id("promotions")),
    limit: v.optional(v.number()),
  },
  returns: v.array(promotionConditionValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.promotionId !== undefined) {
      return await ctx.db
        .query("promotionConditions")
        .withIndex("by_promotion_id", (q) =>
          q.eq("promotionId", args.promotionId!),
        )
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("promotionConditions").take(args.limit ?? 50);
  },
});

export const getPromotionCondition = query({
  args: {
    promotionConditionId: v.id("promotionConditions"),
  },
  returns: v.union(v.null(), promotionConditionValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("promotionConditions", args.promotionConditionId);
  },
});

export const createPromotionCondition = mutation({
  args: {
    promotionCondition: schema.tables.promotionConditions.validator,
  },
  returns: v.id("promotionConditions"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "promotions",
      args.promotionCondition.promotionId,
      "Promotion not found",
    );
    return await ctx.db.insert("promotionConditions", args.promotionCondition);
  },
});

export const updatePromotionCondition = mutation({
  args: {
    promotionConditionId: v.id("promotionConditions"),
    promotionId: v.optional(v.id("promotions")),
    attribute: v.optional(v.string()),
    operator: v.optional(promotionRuleOperatorValidator),
    value: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "promotionConditions",
      args.promotionConditionId,
      "Promotion condition not found",
    );
    if (args.promotionId) {
      await requireDoc(
        ctx,
        "promotions",
        args.promotionId,
        "Promotion not found",
      );
    }
    const patch = buildPatch({
      promotionId: args.promotionId,
      attribute: args.attribute,
      operator: args.operator,
      value: args.value,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.promotionConditionId, patch);
  },
});
