import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("admin sales channels", () => {
  test("create/get/list/update sales channels", async () => {
    const t = initConvexTest();
    const salesChannelId = await t.mutation(
      api.admin.salesChannels.createSalesChannel,
      {
        name: "Web",
        isDisabled: false,
      },
    );

    const byName = await t.query(api.admin.salesChannels.listSalesChannels, {
      name: "Web",
      limit: 10,
    });
    expect(byName[0]?._id).toBe(salesChannelId);

    const byStatus = await t.query(api.admin.salesChannels.listSalesChannels, {
      isDisabled: false,
      limit: 10,
    });
    expect(byStatus[0]?._id).toBe(salesChannelId);

    const channel = await t.query(api.admin.salesChannels.getSalesChannel, {
      salesChannelId,
    });
    expect(channel?.name).toBe("Web");

    await t.mutation(api.admin.salesChannels.updateSalesChannel, {
      salesChannelId,
      isDisabled: true,
    });
    const updated = await t.query(api.admin.salesChannels.getSalesChannel, {
      salesChannelId,
    });
    expect(updated?.isDisabled).toBe(true);
  });

  test("sales channel validation failures", async () => {
    const t = initConvexTest();
    const missingId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("salesChannels", {
        name: "Temp",
        isDisabled: false,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.salesChannels.updateSalesChannel, {
        salesChannelId: missingId,
        name: "Nope",
      });
    }).rejects.toThrowError("Sales channel not found");
  });
});
