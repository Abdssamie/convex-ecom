import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("admin tax regions", () => {
  test("create/get/list/update tax regions", async () => {
    const t = initConvexTest();
    const parentId = await t.mutation(api.admin.taxRegions.createTaxRegion, {
      taxRegion: {
        countryCode: "US",
        provinceCode: "CA",
      },
    });
    const childId = await t.mutation(api.admin.taxRegions.createTaxRegion, {
      taxRegion: {
        countryCode: "US",
        provinceCode: "NY",
        parentTaxRegionId: parentId,
      },
    });

    const byParent = await t.query(api.admin.taxRegions.listTaxRegions, {
      parentTaxRegionId: parentId,
      limit: 10,
    });
    expect(byParent[0]?._id).toBe(childId);

    const byCountry = await t.query(api.admin.taxRegions.listTaxRegions, {
      countryCode: "US",
      limit: 10,
    });
    expect(byCountry.length).toBe(2);

    const byCountryProvince = await t.query(
      api.admin.taxRegions.listTaxRegions,
      {
        countryCode: "US",
        provinceCode: "CA",
        limit: 10,
      },
    );
    expect(byCountryProvince[0]?._id).toBe(parentId);

    const taxRegion = await t.query(api.admin.taxRegions.getTaxRegion, {
      taxRegionId: parentId,
    });
    expect(taxRegion?.provinceCode).toBe("CA");

    await t.mutation(api.admin.taxRegions.updateTaxRegion, {
      taxRegionId: parentId,
      providerId: "tax-provider",
    });
    const updated = await t.query(api.admin.taxRegions.getTaxRegion, {
      taxRegionId: parentId,
    });
    expect(updated?.providerId).toBe("tax-provider");
  });

  test("tax region validation failures", async () => {
    const t = initConvexTest();
    const missingId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("taxRegions", { countryCode: "US" });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.taxRegions.updateTaxRegion, {
        taxRegionId: missingId,
        providerId: "nope",
      });
    }).rejects.toThrowError("Tax region not found");
  });
});
