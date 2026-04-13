import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAdmin, requireDoc } from "../shared/guards";
import { buildPatch } from "../shared/utils";

const locationValidator = schema.tables.locations.validator.extend({
  _id: v.id("locations"),
  _creationTime: v.number(),
});

export const listLocations = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(locationValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.query("locations").take(args.limit ?? 50);
  },
});

export const getLocation = query({
  args: {
    locationId: v.id("locations"),
  },
  returns: v.union(v.null(), locationValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("locations", args.locationId);
  },
});

export const createLocation = mutation({
  args: {
    name: v.string(),
    externalId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("locations"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("locations", {
      name: args.name,
      externalId: args.externalId,
      metadata: args.metadata,
    });
  },
});

export const updateLocation = mutation({
  args: {
    locationId: v.id("locations"),
    name: v.optional(v.string()),
    externalId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireDoc(ctx, "locations", args.locationId, "Location not found");
    const patch = buildPatch({
      name: args.name,
      externalId: args.externalId,
      metadata: args.metadata,
    });
    if (Object.keys(patch).length === 0) {
      return;
    }
    await ctx.db.patch(args.locationId, patch);
  },
});
