import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("admin regions", () => {
  test("create/get/list/update regions", async () => {
    const t = initConvexTest();
    const regionId = await t.mutation(api.admin.regions.createRegion, {
      name: "US",
      currencyCode: "usd",
      automaticTaxes: true,
    });

    const byCurrency = await t.query(api.admin.regions.listRegions, {
      currencyCode: "usd",
      limit: 10,
    });
    expect(byCurrency[0]?._id).toBe(regionId);

    const byName = await t.query(api.admin.regions.listRegions, {
      name: "US",
      limit: 10,
    });
    expect(byName[0]?._id).toBe(regionId);

    const region = await t.query(api.admin.regions.getRegion, { regionId });
    expect(region?.name).toBe("US");

    await t.mutation(api.admin.regions.updateRegion, {
      regionId,
      automaticTaxes: false,
    });
    const updated = await t.query(api.admin.regions.getRegion, { regionId });
    expect(updated?.automaticTaxes).toBe(false);
  });

  test("region validation failures", async () => {
    const t = initConvexTest();
    const missingId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("regions", {
        name: "Temp",
        currencyCode: "usd",
        automaticTaxes: false,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.regions.updateRegion, {
        regionId: missingId,
        name: "Nope",
      });
    }).rejects.toThrowError("Region not found");
  });
});
