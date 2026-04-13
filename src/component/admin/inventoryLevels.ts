import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const inventoryLevelValidator = schema.tables.inventoryLevels.validator.extend({
  _id: v.id("inventoryLevels"),
  _creationTime: v.number(),
});

export const listInventoryLevels = query({
  args: {
    inventoryItemId: v.optional(v.id("inventoryItems")),
    locationId: v.optional(v.id("locations")),
    limit: v.optional(v.number()),
  },
  returns: v.array(inventoryLevelValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.inventoryItemId && args.locationId) {
      return await ctx.db
        .query("inventoryLevels")
        .withIndex("by_inventory_item_id_and_location_id", (q) =>
          q
            .eq("inventoryItemId", args.inventoryItemId!)
            .eq("locationId", args.locationId!),
        )
        .take(args.limit ?? 50);
    }

    if (args.inventoryItemId) {
      return await ctx.db
        .query("inventoryLevels")
        .withIndex("by_inventory_item_id", (q) =>
          q.eq("inventoryItemId", args.inventoryItemId!),
        )
        .take(args.limit ?? 50);
    }

    if (args.locationId) {
      return await ctx.db
        .query("inventoryLevels")
        .withIndex("by_location_id", (q) =>
          q.eq("locationId", args.locationId!),
        )
        .take(args.limit ?? 50);
    }

    return await ctx.db.query("inventoryLevels").take(args.limit ?? 50);
  },
});

export const getInventoryLevel = query({
  args: {
    inventoryLevelId: v.id("inventoryLevels"),
  },
  returns: v.union(v.null(), inventoryLevelValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("inventoryLevels", args.inventoryLevelId);
  },
});

export const createInventoryLevel = mutation({
  args: {
    inventoryItemId: v.id("inventoryItems"),
    locationId: v.id("locations"),
    stockedQuantity: v.number(),
    reservedQuantity: v.number(),
    incomingQuantity: v.number(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("inventoryLevels"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "inventoryItems",
      args.inventoryItemId,
      "Inventory item not found",
    );
    await requireDoc(ctx, "locations", args.locationId, "Location not found");
    const existing = await ctx.db
      .query("inventoryLevels")
      .withIndex("by_inventory_item_id_and_location_id", (q) =>
        q
          .eq("inventoryItemId", args.inventoryItemId)
          .eq("locationId", args.locationId),
      )
      .first();
    if (existing) {
      throw new Error("Inventory level already exists for item/location");
    }
    return await ctx.db.insert("inventoryLevels", {
      inventoryItemId: args.inventoryItemId,
      locationId: args.locationId,
      stockedQuantity: args.stockedQuantity,
      reservedQuantity: args.reservedQuantity,
      incomingQuantity: args.incomingQuantity,
      metadata: args.metadata,
    });
  },
});

export const updateInventoryLevel = mutation({
  args: {
    inventoryLevelId: v.id("inventoryLevels"),
    stockedQuantity: v.optional(v.number()),
    reservedQuantity: v.optional(v.number()),
    incomingQuantity: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "inventoryLevels",
      args.inventoryLevelId,
      "Inventory level not found",
    );
    const patch = buildPatch({
      stockedQuantity: args.stockedQuantity,
      reservedQuantity: args.reservedQuantity,
      incomingQuantity: args.incomingQuantity,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.inventoryLevelId, patch);
  },
});
