import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("store blog", () => {
  test("list/get published posts with categories and tags", async () => {
    const t = initConvexTest();

    const tagId = await t.mutation(api.admin.blogTags.createBlogTag, {
      name: "Launch",
      handle: "launch",
    });

    await t.mutation(api.admin.blogPosts.createBlogPost, {
      title: "Draft",
      handle: "draft",
      content: "Body",
      status: "draft",
    });

    const postId = await t.mutation(api.admin.blogPosts.createBlogPost, {
      title: "Published",
      handle: "published",
      content: "Body",
      status: "published",
      publishedAt: 10,
      tagIds: [tagId, tagId],
    });

    const list = await t.query(api.store.blog.listBlogPosts, {
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(list.page).toHaveLength(1);
    expect(list.page[0]?.handle).toBe("published");

    const byHandle = await t.query(api.store.blog.getBlogPostByHandle, {
      handle: "published",
    });
    expect(byHandle?.post._id).toBe(postId);
    expect(byHandle?.tags[0]?.handle).toBe("launch");

    const missing = await t.query(api.store.blog.getBlogPostByHandle, {
      handle: "draft",
    });
    expect(missing).toBeNull();
  });

  test("list published posts by category and tag", async () => {
    const t = initConvexTest();

    const tagId = await t.mutation(api.admin.blogTags.createBlogTag, {
      name: "Ops",
      handle: "ops",
    });

    await t.mutation(api.admin.blogPosts.createBlogPost, {
      title: "Alpha",
      handle: "alpha",
      content: "Body",
      status: "published",
      publishedAt: 5,
    });
    await t.mutation(api.admin.blogPosts.createBlogPost, {
      title: "Beta",
      handle: "beta",
      content: "Body",
      status: "published",
      publishedAt: 8,
      tagIds: [tagId],
    });

    const byTag = await t.query(api.store.blog.listBlogPosts, {
      paginationOpts: { numItems: 10, cursor: null },
      tagId,
    });
    expect(byTag.page).toHaveLength(1);
    expect(byTag.page[0]?.handle).toBe("beta");
  });
});
