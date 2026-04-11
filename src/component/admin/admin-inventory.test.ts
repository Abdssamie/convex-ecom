import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("admin inventory", () => {
  test("create/get/list/update inventory items and levels", async () => {
    const t = initConvexTest();
    const inventoryItemId = await t.mutation(
      api.admin.inventoryItems.createInventoryItem,
      {
        sku: "sku-1",
        title: "Inventory",
        requiresShipping: true,
      },
    );

    const items = await t.query(api.admin.inventoryItems.listInventoryItems, {
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(items.page[0]?._id).toBe(inventoryItemId);

    const inventoryItem = await t.query(
      api.admin.inventoryItems.getInventoryItem,
      {
        inventoryItemId,
      },
    );
    expect(inventoryItem?.sku).toBe("sku-1");

    await t.mutation(api.admin.inventoryItems.updateInventoryItem, {
      inventoryItemId,
      title: "Updated",
    });
    const updatedItem = await t.query(
      api.admin.inventoryItems.getInventoryItem,
      {
        inventoryItemId,
      },
    );
    expect(updatedItem?.title).toBe("Updated");

    const locationId = await t.mutation(api.admin.locations.createLocation, {
      name: "Warehouse",
    });

    const inventoryLevelId = await t.mutation(
      api.admin.inventoryLevels.createInventoryLevel,
      {
        inventoryItemId,
        locationId,
        stockedQuantity: 10,
        reservedQuantity: 0,
        incomingQuantity: 0,
      },
    );

    const levelsByItem = await t.query(
      api.admin.inventoryLevels.listInventoryLevels,
      {
        inventoryItemId,
        limit: 10,
      },
    );
    expect(levelsByItem[0]?._id).toBe(inventoryLevelId);

    const levelsByLocation = await t.query(
      api.admin.inventoryLevels.listInventoryLevels,
      {
        locationId,
        limit: 10,
      },
    );
    expect(levelsByLocation[0]?._id).toBe(inventoryLevelId);

    const level = await t.query(api.admin.inventoryLevels.getInventoryLevel, {
      inventoryLevelId,
    });
    expect(level?.stockedQuantity).toBe(10);

    await t.mutation(api.admin.inventoryLevels.updateInventoryLevel, {
      inventoryLevelId,
      stockedQuantity: 8,
    });
    const updatedLevel = await t.query(
      api.admin.inventoryLevels.getInventoryLevel,
      { inventoryLevelId },
    );
    expect(updatedLevel?.stockedQuantity).toBe(8);
  });

  test("inventory validation failures", async () => {
    const t = initConvexTest();
    const missingItemId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("inventoryItems", {
        sku: "temp",
        requiresShipping: false,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.inventoryItems.updateInventoryItem, {
        inventoryItemId: missingItemId,
        title: "Nope",
      });
    }).rejects.toThrowError("Inventory item not found");

    const locationId = await t.mutation(api.admin.locations.createLocation, {
      name: "Main",
    });

    await expect(async () => {
      await t.mutation(api.admin.inventoryLevels.createInventoryLevel, {
        inventoryItemId: missingItemId,
        locationId,
        stockedQuantity: 1,
        reservedQuantity: 0,
        incomingQuantity: 0,
      });
    }).rejects.toThrowError("Inventory item not found");

    const inventoryItemId = await t.mutation(
      api.admin.inventoryItems.createInventoryItem,
      {
        sku: "sku-2",
        requiresShipping: false,
      },
    );

    const inventoryLevelId = await t.mutation(
      api.admin.inventoryLevels.createInventoryLevel,
      {
        inventoryItemId,
        locationId,
        stockedQuantity: 1,
        reservedQuantity: 0,
        incomingQuantity: 0,
      },
    );

    await expect(async () => {
      await t.mutation(api.admin.inventoryLevels.createInventoryLevel, {
        inventoryItemId,
        locationId,
        stockedQuantity: 1,
        reservedQuantity: 0,
        incomingQuantity: 0,
      });
    }).rejects.toThrowError("Inventory level already exists for item/location");

    const missingLevelId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("inventoryLevels", {
        inventoryItemId,
        locationId,
        stockedQuantity: 0,
        reservedQuantity: 0,
        incomingQuantity: 0,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.inventoryLevels.updateInventoryLevel, {
        inventoryLevelId: missingLevelId,
        stockedQuantity: 2,
      });
    }).rejects.toThrowError("Inventory level not found");

    await t.mutation(api.admin.inventoryLevels.updateInventoryLevel, {
      inventoryLevelId,
      reservedQuantity: 1,
    });
  });
});
