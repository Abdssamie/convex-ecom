import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

function tagPayload(overrides?: Partial<{ name: string; handle: string }>) {
  return {
    name: overrides?.name ?? "Shipping",
    handle: overrides?.handle ?? `shipping-${Math.random()}`,
  };
}

describe("admin blog", () => {
  test("create/get/list/update/delete blog entities", async () => {
    const t = initConvexTest();

    const tagId = await t.mutation(api.admin.blogTags.createBlogTag, {
      name: "Release",
      handle: "release",
    });

    const postId = await t.mutation(api.admin.blogPosts.createBlogPost, {
      title: "Hello",
      handle: "hello-world",
      content: "Welcome",
      status: "draft",
      tagIds: [tagId, tagId],
    });

    const post = await t.query(api.admin.blogPosts.getBlogPost, { postId });
    expect(post?.handle).toBe("hello-world");

    const postList = await t.query(api.admin.blogPosts.listBlogPosts, {
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(postList.page).toHaveLength(1);

    await t.mutation(api.admin.blogPosts.updateBlogPost, {
      postId,
      title: "Updated",
      status: "published",
      publishedAt: 123,
    });
    const updated = await t.query(api.admin.blogPosts.getBlogPost, { postId });
    expect(updated?.title).toBe("Updated");
    expect(updated?.status).toBe("published");

    const tagList = await t.query(api.admin.blogTags.listBlogTags, {
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(tagList.page).toHaveLength(1);

    await expect(async () => {
      await t.mutation(api.admin.blogTags.deleteBlogTag, { tagId });
    }).rejects.toThrowError("Cannot delete tag with assigned posts");

    await t.mutation(api.admin.blogPosts.updateBlogPost, {
      postId,
      tagIds: [],
    });

    await t.mutation(api.admin.blogPosts.deleteBlogPost, { postId });
    await t.mutation(api.admin.blogTags.deleteBlogTag, { tagId });
  });

  test("blog validation failures", async () => {
    const t = initConvexTest();

    await t.mutation(api.admin.blogTags.createBlogTag, {
      name: "Launch",
      handle: "launch",
    });

    await expect(async () => {
      await t.mutation(api.admin.blogTags.createBlogTag, {
        name: "Other",
        handle: "launch",
      });
    }).rejects.toThrowError("Blog tag handle already exists");

    await t.mutation(api.admin.blogPosts.createBlogPost, {
      title: "Post",
      handle: "post",
      content: "Body",
      status: "draft",
    });

    await expect(async () => {
      await t.mutation(api.admin.blogPosts.createBlogPost, {
        title: "Other",
        handle: "post",
        content: "Body",
        status: "draft",
      });
    }).rejects.toThrowError("Blog post handle already exists");

    await expect(async () => {
      await t.mutation(api.admin.blogTags.createBlogTag, {
        name: "Empty",
        handle: "",
      });
    }).rejects.toThrowError("Handle must not be empty");

    const postId = await t.mutation(api.admin.blogPosts.createBlogPost, {
      title: "Handle Update",
      handle: "handle-update",
      content: "Body",
      status: "draft",
    });

    await expect(async () => {
      await t.mutation(api.admin.blogPosts.updateBlogPost, {
        postId,
        handle: " ",
      });
    }).rejects.toThrowError("Handle must not be empty");
  });

  test("blog update with category/tag swap", async () => {
    const t = initConvexTest();
    const tagA = await t.mutation(api.admin.blogTags.createBlogTag, {
      ...tagPayload({ handle: "tag-a" }),
    });
    const tagB = await t.mutation(api.admin.blogTags.createBlogTag, {
      ...tagPayload({ handle: "tag-b" }),
    });

    const postId = await t.mutation(api.admin.blogPosts.createBlogPost, {
      title: "Post",
      handle: "post-swap",
      content: "Body",
      status: "draft",
      tagIds: [tagA],
    });

    await t.mutation(api.admin.blogPosts.updateBlogPost, {
      postId,
      tagIds: [tagB, tagB],
    });

    await t.mutation(api.admin.blogPosts.deleteBlogPost, { postId });
  });
});
