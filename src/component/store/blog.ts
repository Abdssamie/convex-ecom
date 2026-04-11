import { v } from "convex/values";
import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import schema from "../schema";

const blogPostValidator = schema.tables.blogPosts.validator.extend({
  _id: v.id("blogPosts"),
  _creationTime: v.number(),
});

const blogCategoryValidator = schema.tables.blogCategories.validator.extend({
  _id: v.id("blogCategories"),
  _creationTime: v.number(),
});

const blogTagValidator = schema.tables.blogTags.validator.extend({
  _id: v.id("blogTags"),
  _creationTime: v.number(),
});

export const listBlogPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
    categoryId: v.optional(v.id("blogCategories")),
    tagId: v.optional(v.id("blogTags")),
  },
  handler: async (ctx, args) => {
    if (args.categoryId !== undefined) {
      const links = await ctx.db
        .query("blogPostCategories")
        .withIndex("by_category_id", (q) =>
          q.eq("categoryId", args.categoryId!),
        )
        .collect();
      const postIds = links.map((link) => link.postId);
      const posts = await Promise.all(
        postIds.map((postId) => ctx.db.get("blogPosts", postId)),
      );
      const published = posts
        .filter(
          (
            post,
          ): post is NonNullable<(typeof posts)[number]> & {
            status: "published";
          } => post !== null && post.status === "published",
        )
        .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
      const start = args.paginationOpts.cursor
        ? Math.max(
            0,
            published.findIndex(
              (post) => post._id === args.paginationOpts.cursor,
            ) + 1,
          )
        : 0;
      const page = published.slice(start, start + args.paginationOpts.numItems);
      return {
        page,
        isDone: start + args.paginationOpts.numItems >= published.length,
        continueCursor: page.length ? page[page.length - 1]._id : null,
      };
    }

    if (args.tagId !== undefined) {
      const links = await ctx.db
        .query("blogPostTags")
        .withIndex("by_tag_id", (q) => q.eq("tagId", args.tagId!))
        .collect();
      const postIds = links.map((link) => link.postId);
      const posts = await Promise.all(
        postIds.map((postId) => ctx.db.get("blogPosts", postId)),
      );
      const published = posts
        .filter(
          (
            post,
          ): post is NonNullable<(typeof posts)[number]> & {
            status: "published";
          } => post !== null && post.status === "published",
        )
        .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
      const start = args.paginationOpts.cursor
        ? Math.max(
            0,
            published.findIndex(
              (post) => post._id === args.paginationOpts.cursor,
            ) + 1,
          )
        : 0;
      const page = published.slice(start, start + args.paginationOpts.numItems);
      return {
        page,
        isDone: start + args.paginationOpts.numItems >= published.length,
        continueCursor: page.length ? page[page.length - 1]._id : null,
      };
    }

    return await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getBlogPostByHandle = query({
  args: {
    handle: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      post: blogPostValidator,
      categories: v.array(blogCategoryValidator),
      tags: v.array(blogTagValidator),
    }),
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (!post || post.status !== "published") {
      return null;
    }

    const [categoryLinks, tagLinks] = await Promise.all([
      ctx.db
        .query("blogPostCategories")
        .withIndex("by_post_id", (q) => q.eq("postId", post._id))
        .collect(),
      ctx.db
        .query("blogPostTags")
        .withIndex("by_post_id", (q) => q.eq("postId", post._id))
        .collect(),
    ]);

    const [categories, tags] = await Promise.all([
      Promise.all(
        categoryLinks.map((link) =>
          ctx.db.get("blogCategories", link.categoryId),
        ),
      ),
      Promise.all(tagLinks.map((link) => ctx.db.get("blogTags", link.tagId))),
    ]);

    return {
      post,
      categories: categories.filter(
        (category): category is NonNullable<typeof category> =>
          category !== null,
      ),
      tags: tags.filter((tag): tag is NonNullable<typeof tag> => tag !== null),
    };
  },
});

export const listBlogCategories = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("blogCategories").paginate(args.paginationOpts);
  },
});

export const listBlogTags = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("blogTags").paginate(args.paginationOpts);
  },
});
