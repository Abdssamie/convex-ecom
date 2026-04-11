import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const blogCategoryValidator = schema.tables.blogCategories.validator.extend({
  _id: v.id("blogCategories"),
  _creationTime: v.number(),
});

export const listBlogCategories = query({
  args: {
    paginationOpts: paginationOptsValidator,
    handle: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.handle !== undefined) {
      return await ctx.db
        .query("blogCategories")
        .withIndex("by_handle", (q) => q.eq("handle", args.handle!))
        .paginate(args.paginationOpts);
    }

    if (args.name !== undefined) {
      return await ctx.db
        .query("blogCategories")
        .withIndex("by_name", (q) => q.eq("name", args.name!))
        .paginate(args.paginationOpts);
    }

    return await ctx.db.query("blogCategories").paginate(args.paginationOpts);
  },
});

export const getBlogCategory = query({
  args: {
    categoryId: v.id("blogCategories"),
  },
  returns: v.union(v.null(), blogCategoryValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("blogCategories", args.categoryId);
  },
});

export const createBlogCategory = mutation({
  args: {
    name: v.string(),
    handle: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("blogCategories"),
  handler: async (ctx, args) => {
    if (args.handle.trim().length === 0) {
      throw new Error("Handle must not be empty");
    }
    const existing = await ctx.db
      .query("blogCategories")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();
    if (existing) {
      throw new Error("Blog category handle already exists");
    }
    return await ctx.db.insert("blogCategories", {
      name: args.name,
      handle: args.handle,
      description: args.description,
      metadata: args.metadata,
    });
  },
});

export const updateBlogCategory = mutation({
  args: {
    categoryId: v.id("blogCategories"),
    name: v.optional(v.string()),
    handle: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "blogCategories",
      args.categoryId,
      "Category not found",
    );
    if (args.handle !== undefined) {
      if (args.handle.trim().length === 0) {
        throw new Error("Handle must not be empty");
      }
      const existing = await ctx.db
        .query("blogCategories")
        .withIndex("by_handle", (q) => q.eq("handle", args.handle!))
        .first();
      if (existing && existing._id !== args.categoryId) {
        throw new Error("Blog category handle already exists");
      }
    }

    const patch = buildPatch({
      name: args.name,
      handle: args.handle,
      description: args.description,
      metadata: args.metadata,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.categoryId, patch);
  },
});

export const deleteBlogCategory = mutation({
  args: {
    categoryId: v.id("blogCategories"),
  },
  handler: async (ctx, args) => {
    await requireDoc(
      ctx,
      "blogCategories",
      args.categoryId,
      "Category not found",
    );

    const references = await ctx.db
      .query("blogPostCategories")
      .withIndex("by_category_id", (q) => q.eq("categoryId", args.categoryId))
      .take(1);
    if (references.length > 0) {
      throw new Error("Cannot delete category with assigned posts");
    }

    await ctx.db.delete(args.categoryId);
  },
});
