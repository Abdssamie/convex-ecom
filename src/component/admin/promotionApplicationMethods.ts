import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import {
  applicationMethodAllocationValidator,
  applicationMethodTargetTypeValidator,
  applicationMethodTypeValidator,
} from "../shared/validators";
import { buildPatch } from "../shared/utils";

const promotionApplicationMethodValidator =
  schema.tables.promotionApplicationMethods.validator.extend({
    _id: v.id("promotionApplicationMethods"),
    _creationTime: v.number(),
  });

export const listPromotionApplicationMethods = query({
  args: {
    promotionId: v.optional(v.id("promotions")),
    limit: v.optional(v.number()),
  },
  returns: v.array(promotionApplicationMethodValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.promotionId !== undefined) {
      return await ctx.db
        .query("promotionApplicationMethods")
        .withIndex("by_promotion_id", (q) =>
          q.eq("promotionId", args.promotionId!),
        )
        .take(args.limit ?? 50);
    }

    return await ctx.db
      .query("promotionApplicationMethods")
      .take(args.limit ?? 50);
  },
});

export const getPromotionApplicationMethod = query({
  args: {
    promotionApplicationMethodId: v.id("promotionApplicationMethods"),
  },
  returns: v.union(v.null(), promotionApplicationMethodValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(
      "promotionApplicationMethods",
      args.promotionApplicationMethodId,
    );
  },
});

export const createPromotionApplicationMethod = mutation({
  args: {
    promotionApplicationMethod:
      schema.tables.promotionApplicationMethods.validator,
  },
  returns: v.id("promotionApplicationMethods"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "promotions",
      args.promotionApplicationMethod.promotionId,
      "Promotion not found",
    );
    return await ctx.db.insert(
      "promotionApplicationMethods",
      args.promotionApplicationMethod,
    );
  },
});

export const updatePromotionApplicationMethod = mutation({
  args: {
    promotionApplicationMethodId: v.id("promotionApplicationMethods"),
    promotionId: v.optional(v.id("promotions")),
    type: v.optional(applicationMethodTypeValidator),
    targetType: v.optional(applicationMethodTargetTypeValidator),
    allocation: v.optional(applicationMethodAllocationValidator),
    value: v.optional(v.number()),
    currencyCode: v.optional(v.string()),
    maxQuantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "promotionApplicationMethods",
      args.promotionApplicationMethodId,
      "Promotion application method not found",
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
      type: args.type,
      targetType: args.targetType,
      allocation: args.allocation,
      value: args.value,
      currencyCode: args.currencyCode,
      maxQuantity: args.maxQuantity,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.promotionApplicationMethodId, patch);
  },
});
