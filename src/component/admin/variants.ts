import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const variantValidator = schema.tables.variants.validator.extend({
  _id: v.id("variants"),
  _creationTime: v.number(),
});

export const listVariantsByProduct = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  returns: v.array(variantValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("variants")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .take(args.limit ?? 100);
  },
});

export const getVariant = query({
  args: {
    variantId: v.id("variants"),
  },
  returns: v.union(v.null(), variantValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("variants", args.variantId);
  },
});

export const createVariant = mutation({
  args: {
    variant: schema.tables.variants.validator,
  },
  returns: v.id("variants"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(
      ctx,
      "products",
      args.variant.productId,
      "Product not found",
    );
    if (args.variant.inventoryItemId) {
      await requireDoc(
        ctx,
        "inventoryItems",
        args.variant.inventoryItemId,
        "Inventory item not found",
      );
    }
    if (args.variant.sku) {
      const existingSku = await ctx.db
        .query("variants")
        .withIndex("by_sku", (q) => q.eq("sku", args.variant.sku!))
        .first();
      if (existingSku) {
        throw new Error("Variant SKU already exists");
      }
    }
    return await ctx.db.insert("variants", args.variant);
  },
});

export const updateVariant = mutation({
  args: {
    variantId: v.id("variants"),
    productId: v.optional(v.id("products")),
    title: v.optional(v.string()),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    allowBackorder: v.optional(v.boolean()),
    manageInventory: v.optional(v.boolean()),
    variantRank: v.optional(v.number()),
    thumbnail: v.optional(v.string()),
    inventoryItemId: v.optional(v.id("inventoryItems")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("variants", args.variantId);
    if (!existing) {
      throw new Error("Variant not found");
    }

    if (args.productId) {
      await requireDoc(ctx, "products", args.productId, "Product not found");
    }
    if (args.inventoryItemId) {
      await requireDoc(
        ctx,
        "inventoryItems",
        args.inventoryItemId,
        "Inventory item not found",
      );
    }
    if (args.sku) {
      const existingSku = await ctx.db
        .query("variants")
        .withIndex("by_sku", (q) => q.eq("sku", args.sku!))
        .first();
      if (existingSku && existingSku._id !== args.variantId) {
        throw new Error("Variant SKU already exists");
      }
    }

    const patch = buildPatch({
      productId: args.productId,
      title: args.title,
      sku: args.sku,
      barcode: args.barcode,
      allowBackorder: args.allowBackorder,
      manageInventory: args.manageInventory,
      variantRank: args.variantRank,
      thumbnail: args.thumbnail,
      inventoryItemId: args.inventoryItemId,
      metadata: args.metadata,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.variantId, patch);
  },
});
