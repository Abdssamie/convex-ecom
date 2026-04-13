import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const refundReasonValidator = schema.tables.refundReasons.validator.extend({
  _id: v.id("refundReasons"),
  _creationTime: v.number(),
});

export const listRefundReasons = query({
  args: {
    code: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(refundReasonValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.code) {
      return await ctx.db
        .query("refundReasons")
        .withIndex("by_code", (q) => q.eq("code", args.code!))
        .take(args.limit ?? 50);
    }
    return await ctx.db.query("refundReasons").take(args.limit ?? 50);
  },
});

export const getRefundReason = query({
  args: {
    refundReasonId: v.id("refundReasons"),
  },
  returns: v.union(v.null(), refundReasonValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("refundReasons", args.refundReasonId);
  },
});

export const createRefundReason = mutation({
  args: {
    code: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("refundReasons"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("refundReasons", {
      code: args.code,
      label: args.label,
      description: args.description,
      metadata: args.metadata,
    });
  },
});

export const updateRefundReason = mutation({
  args: {
    refundReasonId: v.id("refundReasons"),
    code: v.optional(v.string()),
    label: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "refundReasons",
      args.refundReasonId,
      "Refund reason not found",
    );
    const patch = buildPatch({
      code: args.code,
      label: args.label,
      description: args.description,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.refundReasonId, patch);
  },
});

export const deleteRefundReason = mutation({
  args: {
    refundReasonId: v.id("refundReasons"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "refundReasons",
      args.refundReasonId,
      "Refund reason not found",
    );
    await ctx.db.delete(args.refundReasonId);
  },
});
