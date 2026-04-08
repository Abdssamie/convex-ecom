import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const customerValidator = schema.tables.customers.validator.extend({
  _id: v.id("customers"),
  _creationTime: v.number(),
});

export const listCustomers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, email } = args;
    if (userId !== undefined) {
      return await ctx.db
        .query("customers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .paginate(args.paginationOpts);
    }

    if (email !== undefined) {
      return await ctx.db
        .query("customers")
        .withIndex("by_email", (q) => q.eq("email", email))
        .paginate(args.paginationOpts);
    }

    return await ctx.db.query("customers").paginate(args.paginationOpts);
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
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) {
      throw new Error("Customer with this userId already exists");
    }
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
