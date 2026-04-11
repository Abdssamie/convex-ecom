import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("admin price lists", () => {
  test("create/get/list/update/delete price lists", async () => {
    const t = initConvexTest();
    const priceListId = await t.mutation(api.admin.priceLists.createPriceList, {
      priceList: {
        title: "Spring",
        description: "Seasonal",
        status: "active",
        type: "sale",
      },
    });

    const listAll = await t.query(api.admin.priceLists.listPriceLists, {});
    expect(listAll.length).toBe(1);

    const active = await t.query(api.admin.priceLists.listPriceLists, {
      status: "active",
      limit: 10,
    });
    expect(active[0]?._id).toBe(priceListId);

    const priceList = await t.query(api.admin.priceLists.getPriceList, {
      priceListId,
    });
    expect(priceList?.title).toBe("Spring");

    await t.mutation(api.admin.priceLists.updatePriceList, {
      priceListId,
      title: "Updated",
    });
    const updated = await t.query(api.admin.priceLists.getPriceList, {
      priceListId,
    });
    expect(updated?.title).toBe("Updated");

    await t.mutation(api.admin.priceLists.deletePriceList, { priceListId });
    const deleted = await t.query(api.admin.priceLists.getPriceList, {
      priceListId,
    });
    expect(deleted?.status).toBe("draft");
  });

  test("price list validation failures", async () => {
    const t = initConvexTest();
    const missingId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("priceLists", {
        title: "Temp",
        description: "Temp",
        status: "active",
        type: "sale",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.priceLists.updatePriceList, {
        priceListId: missingId,
        title: "Nope",
      });
    }).rejects.toThrowError("Price list not found");

    await expect(async () => {
      await t.mutation(api.admin.priceLists.deletePriceList, {
        priceListId: missingId,
      });
    }).rejects.toThrowError("Price list not found");
  });
});
