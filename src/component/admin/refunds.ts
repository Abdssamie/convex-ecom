import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const refundValidator = schema.tables.refunds.validator.extend({
  _id: v.id("refunds"),
  _creationTime: v.number(),
});

export const listRefunds = query({
  args: {
    paymentId: v.optional(v.id("payments")),
    limit: v.optional(v.number()),
  },
  returns: v.array(refundValidator),
  handler: async (ctx, args) => {
    if (args.paymentId) {
      return await ctx.db
        .query("refunds")
        .withIndex("by_payment_id", (q) => q.eq("paymentId", args.paymentId!))
        .take(args.limit ?? 50);
    }
    return await ctx.db.query("refunds").take(args.limit ?? 50);
  },
});

export const getRefund = query({
  args: {
    refundId: v.id("refunds"),
  },
  returns: v.union(v.null(), refundValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("refunds", args.refundId);
  },
});

export const createRefund = mutation({
  args: {
    paymentId: v.id("payments"),
    amount: v.number(),
    refundReasonId: v.optional(v.id("refundReasons")),
    note: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("refunds"),
  handler: async (ctx, args) => {
    await requireDoc(ctx, "payments", args.paymentId, "Payment not found");
    if (args.refundReasonId) {
      await requireDoc(
        ctx,
        "refundReasons",
        args.refundReasonId,
        "Refund reason not found",
      );
    }
    return await ctx.db.insert("refunds", {
      paymentId: args.paymentId,
      amount: args.amount,
      refundReasonId: args.refundReasonId,
      note: args.note,
      createdBy: args.createdBy,
      metadata: args.metadata,
    });
  },
});

export const updateRefund = mutation({
  args: {
    refundId: v.id("refunds"),
    paymentId: v.optional(v.id("payments")),
    amount: v.optional(v.number()),
    refundReasonId: v.optional(v.id("refundReasons")),
    note: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireDoc(ctx, "refunds", args.refundId, "Refund not found");
    if (args.paymentId) {
      await requireDoc(ctx, "payments", args.paymentId, "Payment not found");
    }
    if (args.refundReasonId) {
      await requireDoc(
        ctx,
        "refundReasons",
        args.refundReasonId,
        "Refund reason not found",
      );
    }
    const patch = buildPatch({
      paymentId: args.paymentId,
      amount: args.amount,
      refundReasonId: args.refundReasonId,
      note: args.note,
      createdBy: args.createdBy,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.refundId, patch);
  },
});

export const deleteRefund = mutation({
  args: {
    refundId: v.id("refunds"),
  },
  handler: async (ctx, args) => {
    await requireDoc(ctx, "refunds", args.refundId, "Refund not found");
    await ctx.db.delete(args.refundId);
  },
});
