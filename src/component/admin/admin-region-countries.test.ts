import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("admin region countries", () => {
  test("create/get/list/update region countries", async () => {
    const t = initConvexTest();
    const regionId = await t.mutation(api.admin.regions.createRegion, {
      name: "EU",
      currencyCode: "eur",
      automaticTaxes: false,
    });

    const regionCountryId = await t.mutation(
      api.admin.regionCountries.createRegionCountry,
      {
        regionId,
        countryCode: "DE",
      },
    );

    const byRegion = await t.query(
      api.admin.regionCountries.listRegionCountries,
      {
        regionId,
        limit: 10,
      },
    );
    expect(byRegion[0]?._id).toBe(regionCountryId);

    const byCountry = await t.query(
      api.admin.regionCountries.listRegionCountries,
      {
        countryCode: "DE",
        limit: 10,
      },
    );
    expect(byCountry[0]?._id).toBe(regionCountryId);

    const byBoth = await t.query(
      api.admin.regionCountries.listRegionCountries,
      {
        regionId,
        countryCode: "DE",
        limit: 10,
      },
    );
    expect(byBoth[0]?._id).toBe(regionCountryId);

    const regionCountry = await t.query(
      api.admin.regionCountries.getRegionCountry,
      { regionCountryId },
    );
    expect(regionCountry?.countryCode).toBe("DE");

    await t.mutation(api.admin.regionCountries.updateRegionCountry, {
      regionCountryId,
      countryCode: "FR",
    });
    const updated = await t.query(api.admin.regionCountries.getRegionCountry, {
      regionCountryId,
    });
    expect(updated?.countryCode).toBe("FR");
  });

  test("region country validation failures", async () => {
    const t = initConvexTest();
    const regionId = await t.mutation(api.admin.regions.createRegion, {
      name: "NA",
      currencyCode: "usd",
      automaticTaxes: false,
    });

    await t.mutation(api.admin.regionCountries.createRegionCountry, {
      regionId,
      countryCode: "US",
    });

    await expect(async () => {
      await t.mutation(api.admin.regionCountries.createRegionCountry, {
        regionId,
        countryCode: "US",
      });
    }).rejects.toThrowError("Region country already exists");

    const missingRegionId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("regions", {
        name: "Temp",
        currencyCode: "usd",
        automaticTaxes: false,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.regionCountries.createRegionCountry, {
        regionId: missingRegionId,
        countryCode: "CA",
      });
    }).rejects.toThrowError("Region not found");

    const regionCountryId = await t.mutation(
      api.admin.regionCountries.createRegionCountry,
      {
        regionId,
        countryCode: "CA",
      },
    );

    await expect(async () => {
      await t.mutation(api.admin.regionCountries.updateRegionCountry, {
        regionCountryId,
        regionId,
        countryCode: "US",
      });
    }).rejects.toThrowError("Region country already exists");
  });
});
