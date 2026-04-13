import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const blogTagValidator = schema.tables.blogTags.validator.extend({
  _id: v.id("blogTags"),
  _creationTime: v.number(),
});

export const listBlogTags = query({
  args: {
    paginationOpts: paginationOptsValidator,
    handle: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.handle !== undefined) {
      return await ctx.db
        .query("blogTags")
        .withIndex("by_handle", (q) => q.eq("handle", args.handle!))
        .paginate(args.paginationOpts);
    }

    if (args.name !== undefined) {
      return await ctx.db
        .query("blogTags")
        .withIndex("by_name", (q) => q.eq("name", args.name!))
        .paginate(args.paginationOpts);
    }

    return await ctx.db.query("blogTags").paginate(args.paginationOpts);
  },
});

export const getBlogTag = query({
  args: {
    tagId: v.id("blogTags"),
  },
  returns: v.union(v.null(), blogTagValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("blogTags", args.tagId);
  },
});

export const createBlogTag = mutation({
  args: {
    name: v.string(),
    handle: v.string(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("blogTags"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.handle.trim().length === 0) {
      throw new Error("Handle must not be empty");
    }
    const existing = await ctx.db
      .query("blogTags")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();
    if (existing) {
      throw new Error("Blog tag handle already exists");
    }
    return await ctx.db.insert("blogTags", {
      name: args.name,
      handle: args.handle,
      metadata: args.metadata,
    });
  },
});

export const updateBlogTag = mutation({
  args: {
    tagId: v.id("blogTags"),
    name: v.optional(v.string()),
    handle: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(ctx, "blogTags", args.tagId, "Tag not found");
    if (args.handle !== undefined) {
      if (args.handle.trim().length === 0) {
        throw new Error("Handle must not be empty");
      }
      const existing = await ctx.db
        .query("blogTags")
        .withIndex("by_handle", (q) => q.eq("handle", args.handle!))
        .first();
      if (existing && existing._id !== args.tagId) {
        throw new Error("Blog tag handle already exists");
      }
    }

    const patch = buildPatch({
      name: args.name,
      handle: args.handle,
      metadata: args.metadata,
    });

    if (Object.keys(patch).length === 0) {
      return;
    }

    await ctx.db.patch(args.tagId, patch);
  },
});

export const deleteBlogTag = mutation({
  args: {
    tagId: v.id("blogTags"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(ctx, "blogTags", args.tagId, "Tag not found");

    const references = await ctx.db
      .query("blogPostTags")
      .withIndex("by_tag_id", (q) => q.eq("tagId", args.tagId))
      .take(1);
    if (references.length > 0) {
      throw new Error("Cannot delete tag with assigned posts");
    }

    await ctx.db.delete(args.tagId);
  },
});
