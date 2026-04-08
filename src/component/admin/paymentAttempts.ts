import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { attemptStatusValidator } from "../shared/validators";
import { buildPatch } from "../shared/utils";

const paymentAttemptValidator = schema.tables.paymentAttempts.validator.extend({
  _id: v.id("paymentAttempts"),
  _creationTime: v.number(),
});

export const listPaymentAttempts = query({
  args: {
    paymentId: v.optional(v.id("payments")),
    limit: v.optional(v.number()),
  },
  returns: v.array(paymentAttemptValidator),
  handler: async (ctx, args) => {
    if (args.paymentId) {
      return await ctx.db
        .query("paymentAttempts")
        .withIndex("by_payment", (q) => q.eq("paymentId", args.paymentId!))
        .take(args.limit ?? 50);
    }
    return await ctx.db.query("paymentAttempts").take(args.limit ?? 50);
  },
});

export const getPaymentAttempt = query({
  args: {
    paymentAttemptId: v.id("paymentAttempts"),
  },
  returns: v.union(v.null(), paymentAttemptValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("paymentAttempts", args.paymentAttemptId);
  },
});

export const createPaymentAttempt = mutation({
  args: {
    paymentId: v.id("payments"),
    status: attemptStatusValidator,
    error: v.optional(v.string()),
  },
  returns: v.id("paymentAttempts"),
  handler: async (ctx, args) => {
    await requireDoc(ctx, "payments", args.paymentId, "Payment not found");
    return await ctx.db.insert("paymentAttempts", {
      paymentId: args.paymentId,
      status: args.status,
      error: args.error,
      createdAt: Date.now(),
    });
  },
});

export const updatePaymentAttempt = mutation({
  args: {
    paymentAttemptId: v.id("paymentAttempts"),
    paymentId: v.optional(v.id("payments")),
    status: v.optional(attemptStatusValidator),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "paymentAttempts",
      args.paymentAttemptId,
      "Payment attempt not found",
    );
    if (args.paymentId) {
      await requireDoc(ctx, "payments", args.paymentId, "Payment not found");
    }
    const patch = buildPatch({
      paymentId: args.paymentId,
      status: args.status,
      error: args.error,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.paymentAttemptId, patch);
  },
});
