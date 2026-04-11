import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("admin tax rates", () => {
  test("create/get/list/update tax rates", async () => {
    const t = initConvexTest();
    const taxRegionId = await t.mutation(api.admin.taxRegions.createTaxRegion, {
      taxRegion: { countryCode: "US" },
    });

    const taxRateId = await t.mutation(api.admin.taxRates.createTaxRate, {
      taxRate: {
        taxRegionId,
        rate: 7.5,
        code: "state",
        name: "State",
        isDefault: true,
        isCombinable: false,
      },
    });

    const byRegion = await t.query(api.admin.taxRates.listTaxRates, {
      taxRegionId,
      limit: 10,
    });
    expect(byRegion[0]?._id).toBe(taxRateId);

    const byRegionCode = await t.query(api.admin.taxRates.listTaxRates, {
      taxRegionId,
      code: "state",
      limit: 10,
    });
    expect(byRegionCode[0]?._id).toBe(taxRateId);

    const taxRate = await t.query(api.admin.taxRates.getTaxRate, {
      taxRateId,
    });
    expect(taxRate?.code).toBe("state");

    await t.mutation(api.admin.taxRates.updateTaxRate, {
      taxRateId,
      name: "Updated",
    });
    const updated = await t.query(api.admin.taxRates.getTaxRate, {
      taxRateId,
    });
    expect(updated?.name).toBe("Updated");
  });

  test("tax rate validation failures", async () => {
    const t = initConvexTest();
    const taxRegionId = await t.mutation(api.admin.taxRegions.createTaxRegion, {
      taxRegion: { countryCode: "CA" },
    });
    await t.mutation(api.admin.taxRates.createTaxRate, {
      taxRate: {
        taxRegionId,
        rate: 5,
        code: "default",
        name: "Default",
        isDefault: true,
        isCombinable: false,
      },
    });

    await expect(async () => {
      await t.mutation(api.admin.taxRates.createTaxRate, {
        taxRate: {
          taxRegionId,
          rate: 6,
          code: "other",
          name: "Other",
          isDefault: true,
          isCombinable: false,
        },
      });
    }).rejects.toThrowError("Default tax rate already exists for region");

    const missingRegionId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("taxRegions", { countryCode: "MX" });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.taxRates.createTaxRate, {
        taxRate: {
          taxRegionId: missingRegionId,
          rate: 7,
          code: "x",
          name: "X",
          isDefault: false,
          isCombinable: false,
        },
      });
    }).rejects.toThrowError("Tax region not found");

    const secondRateId = await t.mutation(api.admin.taxRates.createTaxRate, {
      taxRate: {
        taxRegionId,
        rate: 3,
        code: "secondary",
        name: "Secondary",
        isDefault: false,
        isCombinable: false,
      },
    });

    await expect(async () => {
      await t.mutation(api.admin.taxRates.updateTaxRate, {
        taxRateId: secondRateId,
        isDefault: true,
      });
    }).rejects.toThrowError("Default tax rate already exists for region");

    const missingTaxRegionId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("taxRegions", { countryCode: "BR" });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.taxRates.updateTaxRate, {
        taxRateId: secondRateId,
        taxRegionId: missingTaxRegionId,
      });
    }).rejects.toThrowError("Tax region not found");
  });
});
