import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { productStatusValidator } from "../shared/validators";
import { buildPatch } from "../shared/utils";

const productValidator = schema.tables.products.validator.extend({
  _id: v.id("products"),
  _creationTime: v.number(),
});

type ProductStatus = "draft" | "proposed" | "published" | "rejected";

export const listProducts = query({
  args: {
    status: v.optional(productStatusValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(productValidator),
  handler: async (ctx, args) => {
    const status = args.status as ProductStatus | undefined;
    if (status === undefined) {
      return await ctx.db.query("products").take(args.limit ?? 50);
    }

    const statusValue: ProductStatus = status;
    return await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", statusValue))
      .take(args.limit ?? 50);
  },
});

export const getProduct = query({
  args: {
    productId: v.id("products"),
  },
  returns: v.union(v.null(), productValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("products", args.productId);
  },
});

export const createProduct = mutation({
  args: {
    product: schema.tables.products.validator,
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args.product);
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    title: v.optional(v.string()),
    handle: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    status: v.optional(productStatusValidator),
    isGiftcard: v.optional(v.boolean()),
    discountable: v.optional(v.boolean()),
    externalId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireDoc(ctx, "products", args.productId, "Product not found");

    const patch = buildPatch({
      title: args.title,
      handle: args.handle,
      subtitle: args.subtitle,
      description: args.description,
      thumbnail: args.thumbnail,
      status: args.status,
      isGiftcard: args.isGiftcard,
      discountable: args.discountable,
      externalId: args.externalId,
      metadata: args.metadata,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.productId, patch);
  },
});

export const archiveProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    await requireDoc(ctx, "products", args.productId, "Product not found");
    await ctx.db.patch(args.productId, { status: "draft" });
  },
});
