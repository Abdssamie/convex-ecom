import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("admin promotion campaigns", () => {
  test("create/get/list/update promotion campaigns", async () => {
    const t = initConvexTest();
    const campaignId = await t.mutation(
      api.admin.promotionCampaigns.createPromotionCampaign,
      {
        promotionCampaign: {
          name: "Holiday",
          description: "Seasonal",
        },
      },
    );

    const list = await t.query(
      api.admin.promotionCampaigns.listPromotionCampaigns,
      { limit: 10 },
    );
    expect(list[0]?._id).toBe(campaignId);

    const byName = await t.query(
      api.admin.promotionCampaigns.listPromotionCampaigns,
      { name: "Holiday", limit: 10 },
    );
    expect(byName[0]?._id).toBe(campaignId);

    const campaign = await t.query(
      api.admin.promotionCampaigns.getPromotionCampaign,
      { promotionCampaignId: campaignId },
    );
    expect(campaign?.name).toBe("Holiday");

    await t.mutation(api.admin.promotionCampaigns.updatePromotionCampaign, {
      promotionCampaignId: campaignId,
      name: "Updated",
    });
    const updated = await t.query(
      api.admin.promotionCampaigns.getPromotionCampaign,
      { promotionCampaignId: campaignId },
    );
    expect(updated?.name).toBe("Updated");
  });

  test("promotion campaign validation failures", async () => {
    const t = initConvexTest();
    const missingId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("promotionCampaigns", {
        name: "Temp",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.promotionCampaigns.updatePromotionCampaign, {
        promotionCampaignId: missingId,
        name: "Nope",
      });
    }).rejects.toThrowError("Promotion campaign not found");
  });
});

describe("admin promotions", () => {
  test("create/get/list/update promotions", async () => {
    const t = initConvexTest();
    const campaignId = await t.mutation(
      api.admin.promotionCampaigns.createPromotionCampaign,
      {
        promotionCampaign: { name: "Campaign" },
      },
    );

    const promotionId = await t.mutation(api.admin.promotions.createPromotion, {
      promotion: {
        code: "SAVE10",
        isAutomatic: false,
        isTaxInclusive: false,
        limit: 10,
        used: 0,
        type: "standard",
        status: "active",
        campaignId,
      },
    });

    const byCode = await t.query(api.admin.promotions.listPromotions, {
      paginationOpts: { numItems: 10, cursor: null },
      code: "SAVE10",
    });
    expect(byCode.page[0]?._id).toBe(promotionId);

    const byStatus = await t.query(api.admin.promotions.listPromotions, {
      paginationOpts: { numItems: 10, cursor: null },
      status: "active",
    });
    expect(byStatus.page[0]?._id).toBe(promotionId);

    const byAutomatic = await t.query(api.admin.promotions.listPromotions, {
      paginationOpts: { numItems: 10, cursor: null },
      isAutomatic: false,
    });
    expect(byAutomatic.page[0]?._id).toBe(promotionId);

    const byCampaign = await t.query(api.admin.promotions.listPromotions, {
      paginationOpts: { numItems: 10, cursor: null },
      campaignId,
    });
    expect(byCampaign.page[0]?._id).toBe(promotionId);

    const promotion = await t.query(api.admin.promotions.getPromotion, {
      promotionId,
    });
    expect(promotion?.code).toBe("SAVE10");

    await t.mutation(api.admin.promotions.updatePromotion, {
      promotionId,
      code: "SAVE20",
      status: "inactive",
    });
    const updated = await t.query(api.admin.promotions.getPromotion, {
      promotionId,
    });
    expect(updated?.code).toBe("SAVE20");
    expect(updated?.status).toBe("inactive");
  });

  test("promotion validation failures", async () => {
    const t = initConvexTest();
    await expect(async () => {
      await t.mutation(api.admin.promotions.createPromotion, {
        promotion: {
          code: "BAD",
          isAutomatic: false,
          isTaxInclusive: false,
          used: 2,
          type: "standard",
          status: "draft",
        } as never,
      });
    }).rejects.toThrowError("Promotion used count must start at 0");

    await t.mutation(api.admin.promotions.createPromotion, {
      promotion: {
        code: "DUP",
        isAutomatic: false,
        isTaxInclusive: false,
        used: 0,
        type: "standard",
        status: "draft",
      },
    });

    await expect(async () => {
      await t.mutation(api.admin.promotions.createPromotion, {
        promotion: {
          code: "DUP",
          isAutomatic: true,
          isTaxInclusive: false,
          used: 0,
          type: "standard",
          status: "draft",
        },
      });
    }).rejects.toThrowError("Promotion code already exists");

    const promotionId = await t.mutation(api.admin.promotions.createPromotion, {
      promotion: {
        code: "UNIQUE",
        isAutomatic: false,
        isTaxInclusive: false,
        used: 0,
        type: "standard",
        status: "draft",
      },
    });

    await expect(async () => {
      await t.mutation(api.admin.promotions.updatePromotion, {
        promotionId,
        code: "DUP",
      });
    }).rejects.toThrowError("Promotion code already exists");

    const missingId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("promotions", {
        code: "TEMP",
        isAutomatic: false,
        isTaxInclusive: false,
        used: 0,
        type: "standard",
        status: "draft",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.promotions.updatePromotion, {
        promotionId: missingId,
        status: "active",
      });
    }).rejects.toThrowError("Promotion not found");
  });
});

describe("admin promotion application methods", () => {
  test("create/get/list/update promotion application methods", async () => {
    const t = initConvexTest();
    const promotionId = await t.mutation(api.admin.promotions.createPromotion, {
      promotion: {
        code: "APP",
        isAutomatic: false,
        isTaxInclusive: false,
        used: 0,
        type: "standard",
        status: "active",
      },
    });

    const methodId = await t.mutation(
      api.admin.promotionApplicationMethods.createPromotionApplicationMethod,
      {
        promotionApplicationMethod: {
          promotionId,
          type: "fixed",
          targetType: "order",
          allocation: "once",
          value: 500,
          currencyCode: "usd",
        },
      },
    );

    const list = await t.query(
      api.admin.promotionApplicationMethods.listPromotionApplicationMethods,
      { promotionId, limit: 10 },
    );
    expect(list[0]?._id).toBe(methodId);

    const method = await t.query(
      api.admin.promotionApplicationMethods.getPromotionApplicationMethod,
      { promotionApplicationMethodId: methodId },
    );
    expect(method?.value).toBe(500);

    await t.mutation(
      api.admin.promotionApplicationMethods.updatePromotionApplicationMethod,
      {
        promotionApplicationMethodId: methodId,
        value: 750,
      },
    );
    const updated = await t.query(
      api.admin.promotionApplicationMethods.getPromotionApplicationMethod,
      { promotionApplicationMethodId: methodId },
    );
    expect(updated?.value).toBe(750);
  });

  test("promotion application method validation failures", async () => {
    const t = initConvexTest();
    const missingPromotionId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("promotions", {
        code: "TEMP",
        isAutomatic: false,
        isTaxInclusive: false,
        used: 0,
        type: "standard",
        status: "draft",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(
        api.admin.promotionApplicationMethods.createPromotionApplicationMethod,
        {
          promotionApplicationMethod: {
            promotionId: missingPromotionId,
            type: "fixed",
            targetType: "order",
            allocation: "once",
            value: 100,
          },
        },
      );
    }).rejects.toThrowError("Promotion not found");

    const promotionId = await t.mutation(api.admin.promotions.createPromotion, {
      promotion: {
        code: "APP2",
        isAutomatic: false,
        isTaxInclusive: false,
        used: 0,
        type: "standard",
        status: "draft",
      },
    });

    const methodId = await t.mutation(
      api.admin.promotionApplicationMethods.createPromotionApplicationMethod,
      {
        promotionApplicationMethod: {
          promotionId,
          type: "fixed",
          targetType: "order",
          allocation: "once",
          value: 100,
        },
      },
    );

    await expect(async () => {
      await t.mutation(
        api.admin.promotionApplicationMethods.updatePromotionApplicationMethod,
        {
          promotionApplicationMethodId: methodId,
          promotionId: missingPromotionId,
        },
      );
    }).rejects.toThrowError("Promotion not found");
  });
});

describe("admin promotion conditions", () => {
  test("create/get/list/update promotion conditions", async () => {
    const t = initConvexTest();
    const promotionId = await t.mutation(api.admin.promotions.createPromotion, {
      promotion: {
        code: "COND",
        isAutomatic: false,
        isTaxInclusive: false,
        used: 0,
        type: "standard",
        status: "active",
      },
    });

    const conditionId = await t.mutation(
      api.admin.promotionConditions.createPromotionCondition,
      {
        promotionCondition: {
          promotionId,
          attribute: "order.total",
          operator: "gte",
          value: 1000,
        },
      },
    );

    const list = await t.query(
      api.admin.promotionConditions.listPromotionConditions,
      { promotionId, limit: 10 },
    );
    expect(list[0]?._id).toBe(conditionId);

    const condition = await t.query(
      api.admin.promotionConditions.getPromotionCondition,
      { promotionConditionId: conditionId },
    );
    expect(condition?.attribute).toBe("order.total");

    await t.mutation(api.admin.promotionConditions.updatePromotionCondition, {
      promotionConditionId: conditionId,
      operator: "gt",
    });
    const updated = await t.query(
      api.admin.promotionConditions.getPromotionCondition,
      { promotionConditionId: conditionId },
    );
    expect(updated?.operator).toBe("gt");
  });

  test("promotion condition validation failures", async () => {
    const t = initConvexTest();
    const missingPromotionId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("promotions", {
        code: "TEMP",
        isAutomatic: false,
        isTaxInclusive: false,
        used: 0,
        type: "standard",
        status: "draft",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.promotionConditions.createPromotionCondition, {
        promotionCondition: {
          promotionId: missingPromotionId,
          attribute: "order.total",
          operator: "gte",
          value: 1000,
        },
      });
    }).rejects.toThrowError("Promotion not found");

    const promotionId = await t.mutation(api.admin.promotions.createPromotion, {
      promotion: {
        code: "COND2",
        isAutomatic: false,
        isTaxInclusive: false,
        used: 0,
        type: "standard",
        status: "draft",
      },
    });

    const conditionId = await t.mutation(
      api.admin.promotionConditions.createPromotionCondition,
      {
        promotionCondition: {
          promotionId,
          attribute: "order.total",
          operator: "gte",
          value: 500,
        },
      },
    );

    await expect(async () => {
      await t.mutation(api.admin.promotionConditions.updatePromotionCondition, {
        promotionConditionId: conditionId,
        promotionId: missingPromotionId,
      });
    }).rejects.toThrowError("Promotion not found");

    const missingConditionId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("promotionConditions", {
        promotionId,
        attribute: "order.total",
        operator: "gte",
        value: 100,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.promotionConditions.updatePromotionCondition, {
        promotionConditionId: missingConditionId,
        operator: "lt",
      });
    }).rejects.toThrowError("Promotion condition not found");
  });
});
