import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

function categoryPayload(
  overrides?: Partial<{ name: string; handle: string }>,
) {
  return {
    name: overrides?.name ?? "Announcements",
    handle: overrides?.handle ?? `announcements-${Math.random()}`,
  };
}

function tagPayload(overrides?: Partial<{ name: string; handle: string }>) {
  return {
    name: overrides?.name ?? "Shipping",
    handle: overrides?.handle ?? `shipping-${Math.random()}`,
  };
}

describe("admin blog", () => {
  test("create/get/list/update/delete blog entities", async () => {
    const t = initConvexTest();

    const categoryId = await t.mutation(
      api.admin.blogCategories.createBlogCategory,
      {
        name: "News",
        handle: "news",
        description: "Updates",
      },
    );
    const tagId = await t.mutation(api.admin.blogTags.createBlogTag, {
      name: "Release",
      handle: "release",
    });

    const postId = await t.mutation(api.admin.blogPosts.createBlogPost, {
      title: "Hello",
      handle: "hello-world",
      content: "Welcome",
      status: "draft",
      categoryIds: [categoryId],
      tagIds: [tagId],
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

    const categoryList = await t.query(
      api.admin.blogCategories.listBlogCategories,
      {
        paginationOpts: { numItems: 10, cursor: null },
      },
    );
    expect(categoryList.page).toHaveLength(1);

    const tagList = await t.query(api.admin.blogTags.listBlogTags, {
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(tagList.page).toHaveLength(1);

    await expect(async () => {
      await t.mutation(api.admin.blogCategories.deleteBlogCategory, {
        categoryId,
      });
    }).rejects.toThrowError("Cannot delete category with assigned posts");

    await expect(async () => {
      await t.mutation(api.admin.blogTags.deleteBlogTag, { tagId });
    }).rejects.toThrowError("Cannot delete tag with assigned posts");

    await t.mutation(api.admin.blogPosts.updateBlogPost, {
      postId,
      categoryIds: [],
      tagIds: [],
    });

    await t.mutation(api.admin.blogPosts.deleteBlogPost, { postId });
    await t.mutation(api.admin.blogCategories.deleteBlogCategory, {
      categoryId,
    });
    await t.mutation(api.admin.blogTags.deleteBlogTag, { tagId });
  });

  test("blog validation failures", async () => {
    const t = initConvexTest();

    await t.mutation(api.admin.blogCategories.createBlogCategory, {
      name: "News",
      handle: "news",
    });

    await expect(async () => {
      await t.mutation(api.admin.blogCategories.createBlogCategory, {
        name: "Other",
        handle: "news",
      });
    }).rejects.toThrowError("Blog category handle already exists");

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
  });

  test("blog update with category/tag swap", async () => {
    const t = initConvexTest();

    const categoryA = await t.mutation(
      api.admin.blogCategories.createBlogCategory,
      {
        ...categoryPayload({ handle: "category-a" }),
      },
    );
    const categoryB = await t.mutation(
      api.admin.blogCategories.createBlogCategory,
      {
        ...categoryPayload({ handle: "category-b" }),
      },
    );
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
      categoryIds: [categoryA],
      tagIds: [tagA],
    });

    await t.mutation(api.admin.blogPosts.updateBlogPost, {
      postId,
      categoryIds: [categoryB],
      tagIds: [tagB],
    });

    await t.mutation(api.admin.blogPosts.deleteBlogPost, { postId });
  });
});
