import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const inventoryItemValidator = schema.tables.inventoryItems.validator.extend({
  _id: v.id("inventoryItems"),
  _creationTime: v.number(),
});

export const listInventoryItems = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventoryItems")
      .paginate(args.paginationOpts);
  },
});

export const getInventoryItem = query({
  args: {
    inventoryItemId: v.id("inventoryItems"),
  },
  returns: v.union(v.null(), inventoryItemValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("inventoryItems", args.inventoryItemId);
  },
});

export const createInventoryItem = mutation({
  args: {
    sku: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requiresShipping: v.boolean(),
    thumbnail: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("inventoryItems"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("inventoryItems", {
      sku: args.sku,
      title: args.title,
      description: args.description,
      requiresShipping: args.requiresShipping,
      thumbnail: args.thumbnail,
      metadata: args.metadata,
    });
  },
});

export const updateInventoryItem = mutation({
  args: {
    inventoryItemId: v.id("inventoryItems"),
    sku: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requiresShipping: v.optional(v.boolean()),
    thumbnail: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "inventoryItems",
      args.inventoryItemId,
      "Inventory item not found",
    );
    const patch = buildPatch({
      sku: args.sku,
      title: args.title,
      description: args.description,
      requiresShipping: args.requiresShipping,
      thumbnail: args.thumbnail,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.inventoryItemId, patch);
  },
});
