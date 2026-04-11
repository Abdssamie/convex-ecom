import { v } from "convex/values";
import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import schema from "../schema";

const blogPostValidator = schema.tables.blogPosts.validator.extend({
  _id: v.id("blogPosts"),
  _creationTime: v.number(),
});

const blogTagValidator = schema.tables.blogTags.validator.extend({
  _id: v.id("blogTags"),
  _creationTime: v.number(),
});

export const listBlogPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
    tagId: v.optional(v.id("blogTags")),
  },
  handler: async (ctx, args) => {
    if (args.tagId !== undefined) {
      const links = await ctx.db
        .query("blogPostTags")
        .withIndex("by_tag_id", (q) => q.eq("tagId", args.tagId!))
        .collect();
      const postIds = [...new Set(links.map((link) => link.postId))];
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

    const tagLinks = await ctx.db
      .query("blogPostTags")
      .withIndex("by_post_id", (q) => q.eq("postId", post._id))
      .collect();

    const tagIds = [...new Set(tagLinks.map((link) => link.tagId))];
    const tags = await Promise.all(
      tagIds.map((tagId) => ctx.db.get("blogTags", tagId)),
    );

    return {
      post,
      tags: tags.filter((tag): tag is NonNullable<typeof tag> => tag !== null),
    };
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
