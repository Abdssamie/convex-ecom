import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";
import { blogPostStatusValidator } from "../shared/validators";

const blogPostValidator = schema.tables.blogPosts.validator.extend({
  _id: v.id("blogPosts"),
  _creationTime: v.number(),
});

export const listBlogPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(blogPostStatusValidator),
    handle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.handle !== undefined) {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_handle", (q) => q.eq("handle", args.handle!))
        .paginate(args.paginationOpts);
    }

    if (args.status !== undefined) {
      return await ctx.db
        .query("blogPosts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .paginate(args.paginationOpts);
    }

    return await ctx.db.query("blogPosts").paginate(args.paginationOpts);
  },
});

export const getBlogPost = query({
  args: {
    postId: v.id("blogPosts"),
  },
  returns: v.union(v.null(), blogPostValidator),
  handler: async (ctx, args) => {
    return await ctx.db.get("blogPosts", args.postId);
  },
});

export const createBlogPost = mutation({
  args: {
    title: v.string(),
    handle: v.string(),
    excerpt: v.optional(v.string()),
    content: v.string(),
    coverImageUrl: v.optional(v.string()),
    status: blogPostStatusValidator,
    publishedAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
    categoryIds: v.optional(v.array(v.id("blogCategories"))),
    tagIds: v.optional(v.array(v.id("blogTags"))),
  },
  returns: v.id("blogPosts"),
  handler: async (ctx, args) => {
    if (args.handle.trim().length === 0) {
      throw new Error("Handle must not be empty");
    }
    const existing = await ctx.db
      .query("blogPosts")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .first();
    if (existing) {
      throw new Error("Blog post handle already exists");
    }

    if (args.categoryIds) {
      for (const categoryId of args.categoryIds) {
        await requireDoc(
          ctx,
          "blogCategories",
          categoryId,
          "Blog category not found",
        );
      }
    }

    if (args.tagIds) {
      for (const tagId of args.tagIds) {
        await requireDoc(ctx, "blogTags", tagId, "Blog tag not found");
      }
    }

    const postId = await ctx.db.insert("blogPosts", {
      title: args.title,
      handle: args.handle,
      excerpt: args.excerpt,
      content: args.content,
      coverImageUrl: args.coverImageUrl,
      status: args.status,
      publishedAt: args.publishedAt,
      metadata: args.metadata,
    });

    if (args.categoryIds?.length) {
      await Promise.all(
        args.categoryIds.map((categoryId) =>
          ctx.db.insert("blogPostCategories", { postId, categoryId }),
        ),
      );
    }

    if (args.tagIds?.length) {
      await Promise.all(
        args.tagIds.map((tagId) =>
          ctx.db.insert("blogPostTags", { postId, tagId }),
        ),
      );
    }

    return postId;
  },
});

export const updateBlogPost = mutation({
  args: {
    postId: v.id("blogPosts"),
    title: v.optional(v.string()),
    handle: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    status: v.optional(blogPostStatusValidator),
    publishedAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
    categoryIds: v.optional(v.array(v.id("blogCategories"))),
    tagIds: v.optional(v.array(v.id("blogTags"))),
  },
  handler: async (ctx, args) => {
    await requireDoc(ctx, "blogPosts", args.postId, "Blog post not found");
    if (args.handle !== undefined) {
      if (args.handle.trim().length === 0) {
        throw new Error("Handle must not be empty");
      }
      const existing = await ctx.db
        .query("blogPosts")
        .withIndex("by_handle", (q) => q.eq("handle", args.handle!))
        .first();
      if (existing && existing._id !== args.postId) {
        throw new Error("Blog post handle already exists");
      }
    }

    if (args.categoryIds) {
      for (const categoryId of args.categoryIds) {
        await requireDoc(
          ctx,
          "blogCategories",
          categoryId,
          "Blog category not found",
        );
      }
    }

    if (args.tagIds) {
      for (const tagId of args.tagIds) {
        await requireDoc(ctx, "blogTags", tagId, "Blog tag not found");
      }
    }

    const patch = buildPatch({
      title: args.title,
      handle: args.handle,
      excerpt: args.excerpt,
      content: args.content,
      coverImageUrl: args.coverImageUrl,
      status: args.status,
      publishedAt: args.publishedAt,
      metadata: args.metadata,
    });

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.postId, patch);
    }

    if (args.categoryIds) {
      const existing = await ctx.db
        .query("blogPostCategories")
        .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
        .collect();
      const existingIds = new Set(existing.map((row) => row.categoryId));
      const nextIds = new Set(args.categoryIds);

      const toAdd = args.categoryIds.filter((id) => !existingIds.has(id));
      const toRemove = existing.filter((row) => !nextIds.has(row.categoryId));

      await Promise.all([
        ...toAdd.map((categoryId) =>
          ctx.db.insert("blogPostCategories", {
            postId: args.postId,
            categoryId,
          }),
        ),
        ...toRemove.map((row) => ctx.db.delete(row._id)),
      ]);
    }

    if (args.tagIds) {
      const existing = await ctx.db
        .query("blogPostTags")
        .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
        .collect();
      const existingIds = new Set(existing.map((row) => row.tagId));
      const nextIds = new Set(args.tagIds);

      const toAdd = args.tagIds.filter((id) => !existingIds.has(id));
      const toRemove = existing.filter((row) => !nextIds.has(row.tagId));

      await Promise.all([
        ...toAdd.map((tagId) =>
          ctx.db.insert("blogPostTags", { postId: args.postId, tagId }),
        ),
        ...toRemove.map((row) => ctx.db.delete(row._id)),
      ]);
    }
  },
});

export const deleteBlogPost = mutation({
  args: {
    postId: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    await requireDoc(ctx, "blogPosts", args.postId, "Blog post not found");

    const [categoryLinks, tagLinks] = await Promise.all([
      ctx.db
        .query("blogPostCategories")
        .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
        .collect(),
      ctx.db
        .query("blogPostTags")
        .withIndex("by_post_id", (q) => q.eq("postId", args.postId))
        .collect(),
    ]);

    await Promise.all([
      ...categoryLinks.map((row) => ctx.db.delete(row._id)),
      ...tagLinks.map((row) => ctx.db.delete(row._id)),
    ]);

    await ctx.db.delete(args.postId);
  },
});
