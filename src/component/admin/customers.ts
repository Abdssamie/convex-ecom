import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const customerValidator = schema.tables.customers.validator.extend({
  _id: v.id("customers"),
  _creationTime: v.number(),
});

export const listCustomers = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.array(customerValidator),
  handler: async (ctx, args) => {
    const { userId, email } = args;
    if (userId !== undefined) {
      return await ctx.db
        .query("customers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .take(args.limit ?? 50);
    }

    if (email !== undefined) {
      return await ctx.db
        .query("customers")
        .withIndex("by_email", (q) => q.eq("email", email))
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("customers").take(args.limit ?? 50);
  },
});

export const getCustomer = query({
  args: {
    customerId: v.id("customers"),
  },
  returns: v.union(v.null(), customerValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("customers", args.customerId);
  },
});

export const createCustomer = mutation({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    companyName: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    hasAccount: v.boolean(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("customers"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("customers", {
      userId: args.userId,
      email: args.email,
      companyName: args.companyName,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      hasAccount: args.hasAccount,
      metadata: args.metadata,
    });
  },
});

export const updateCustomer = mutation({
  args: {
    customerId: v.id("customers"),
    email: v.optional(v.string()),
    companyName: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    hasAccount: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireDoc(ctx, "customers", args.customerId, "Customer not found");
    const patch = buildPatch({
      email: args.email,
      companyName: args.companyName,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      hasAccount: args.hasAccount,
      metadata: args.metadata,
    });
    await ctx.db.patch(args.customerId, patch);
  },
});
