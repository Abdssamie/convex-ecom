import { v } from "convex/values";

export const addressRoleValidator = v.union(
  v.literal("shipping"),
  v.literal("billing"),
);

export const productStatusValidator = v.union(
  v.literal("draft"),
  v.literal("proposed"),
  v.literal("published"),
  v.literal("rejected"),
);

export const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("draft"),
  v.literal("archived"),
  v.literal("canceled"),
  v.literal("requires_action"),
);

export const paymentStatusValidator = v.union(
  v.literal("not_paid"),
  v.literal("awaiting"),
  v.literal("authorized"),
  v.literal("partially_authorized"),
  v.literal("canceled"),
  v.literal("failed"),
  v.literal("partially_captured"),
  v.literal("completed"),
);

export const attemptStatusValidator = v.union(
  v.literal("created"),
  v.literal("failed"),
  v.literal("succeeded"),
);

export const promotionTypeValidator = v.union(
  v.literal("standard"),
  v.literal("buyget"),
);

export const promotionStatusValidator = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("inactive"),
);

export const applicationMethodTypeValidator = v.union(
  v.literal("fixed"),
  v.literal("percentage"),
);

export const applicationMethodTargetTypeValidator = v.union(
  v.literal("order"),
  v.literal("shipping_methods"),
  v.literal("items"),
);

export const applicationMethodAllocationValidator = v.union(
  v.literal("each"),
  v.literal("across"),
  v.literal("once"),
);

export const promotionRuleOperatorValidator = v.union(
  v.literal("gte"),
  v.literal("lte"),
  v.literal("gt"),
  v.literal("lt"),
  v.literal("eq"),
  v.literal("ne"),
  v.literal("in"),
);

export const priceListStatusValidator = v.union(
  v.literal("active"),
  v.literal("draft"),
);

export const priceListTypeValidator = v.union(
  v.literal("sale"),
  v.literal("override"),
);

export const blogPostStatusValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);
