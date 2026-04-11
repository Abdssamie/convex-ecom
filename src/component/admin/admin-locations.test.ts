import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("admin locations", () => {
  test("create/get/list/update locations", async () => {
    const t = initConvexTest();
    const locationId = await t.mutation(api.admin.locations.createLocation, {
      name: "Warehouse",
      externalId: "ext-1",
    });

    const list = await t.query(api.admin.locations.listLocations, {
      limit: 10,
    });
    expect(list[0]?._id).toBe(locationId);

    const location = await t.query(api.admin.locations.getLocation, {
      locationId,
    });
    expect(location?.externalId).toBe("ext-1");

    await t.mutation(api.admin.locations.updateLocation, {
      locationId,
      name: "Updated",
    });
    const updated = await t.query(api.admin.locations.getLocation, {
      locationId,
    });
    expect(updated?.name).toBe("Updated");
  });

  test("location validation failures", async () => {
    const t = initConvexTest();
    const missingId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("locations", { name: "Temp" });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.locations.updateLocation, {
        locationId: missingId,
        name: "Nope",
      });
    }).rejects.toThrowError("Location not found");
  });
});
