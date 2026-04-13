import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const fulfillmentAddressValidator =
  schema.tables.fulfillmentAddresses.validator.extend({
    _id: v.id("fulfillmentAddresses"),
    _creationTime: v.number(),
  });

export const listFulfillmentAddresses = query({
  args: {
    fulfillmentId: v.optional(v.id("fulfillments")),
    limit: v.optional(v.number()),
  },
  returns: v.array(fulfillmentAddressValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.fulfillmentId) {
      return await ctx.db
        .query("fulfillmentAddresses")
        .withIndex("by_fulfillment_id", (q) =>
          q.eq("fulfillmentId", args.fulfillmentId!),
        )
        .take(args.limit ?? 50);
    }
    return await ctx.db.query("fulfillmentAddresses").take(args.limit ?? 50);
  },
});

export const getFulfillmentAddress = query({
  args: {
    fulfillmentAddressId: v.id("fulfillmentAddresses"),
  },
  returns: v.union(v.null(), fulfillmentAddressValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("fulfillmentAddresses", args.fulfillmentAddressId);
  },
});

export const createFulfillmentAddress = mutation({
  args: {
    fulfillmentId: v.id("fulfillments"),
    company: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    address1: v.optional(v.string()),
    address2: v.optional(v.string()),
    city: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    province: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("fulfillmentAddresses"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "fulfillments",
      args.fulfillmentId,
      "Fulfillment not found",
    );
    return await ctx.db.insert("fulfillmentAddresses", {
      fulfillmentId: args.fulfillmentId,
      company: args.company,
      firstName: args.firstName,
      lastName: args.lastName,
      address1: args.address1,
      address2: args.address2,
      city: args.city,
      countryCode: args.countryCode,
      province: args.province,
      postalCode: args.postalCode,
      phone: args.phone,
      metadata: args.metadata,
    });
  },
});

export const updateFulfillmentAddress = mutation({
  args: {
    fulfillmentAddressId: v.id("fulfillmentAddresses"),
    fulfillmentId: v.optional(v.id("fulfillments")),
    company: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    address1: v.optional(v.string()),
    address2: v.optional(v.string()),
    city: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    province: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "fulfillmentAddresses",
      args.fulfillmentAddressId,
      "Fulfillment address not found",
    );
    if (args.fulfillmentId) {
      await requireDoc(
        ctx,
        "fulfillments",
        args.fulfillmentId,
        "Fulfillment not found",
      );
    }
    const patch = buildPatch({
      fulfillmentId: args.fulfillmentId,
      company: args.company,
      firstName: args.firstName,
      lastName: args.lastName,
      address1: args.address1,
      address2: args.address2,
      city: args.city,
      countryCode: args.countryCode,
      province: args.province,
      postalCode: args.postalCode,
      phone: args.phone,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.fulfillmentAddressId, patch);
  },
});
