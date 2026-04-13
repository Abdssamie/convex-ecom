/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_blogPosts from "../admin/blogPosts.js";
import type * as admin_blogTags from "../admin/blogTags.js";
import type * as admin_customers from "../admin/customers.js";
import type * as admin_fulfillmentAddresses from "../admin/fulfillmentAddresses.js";
import type * as admin_fulfillmentItems from "../admin/fulfillmentItems.js";
import type * as admin_fulfillmentLabels from "../admin/fulfillmentLabels.js";
import type * as admin_fulfillments from "../admin/fulfillments.js";
import type * as admin_index from "../admin/index.js";
import type * as admin_inventoryItems from "../admin/inventoryItems.js";
import type * as admin_inventoryLevels from "../admin/inventoryLevels.js";
import type * as admin_locations from "../admin/locations.js";
import type * as admin_orderShippingMethods from "../admin/orderShippingMethods.js";
import type * as admin_paymentAttempts from "../admin/paymentAttempts.js";
import type * as admin_payments from "../admin/payments.js";
import type * as admin_priceLists from "../admin/priceLists.js";
import type * as admin_prices from "../admin/prices.js";
import type * as admin_products from "../admin/products.js";
import type * as admin_promotionApplicationMethods from "../admin/promotionApplicationMethods.js";
import type * as admin_promotionCampaigns from "../admin/promotionCampaigns.js";
import type * as admin_promotionConditions from "../admin/promotionConditions.js";
import type * as admin_promotions from "../admin/promotions.js";
import type * as admin_refundReasons from "../admin/refundReasons.js";
import type * as admin_refunds from "../admin/refunds.js";
import type * as admin_regionCountries from "../admin/regionCountries.js";
import type * as admin_regions from "../admin/regions.js";
import type * as admin_salesChannels from "../admin/salesChannels.js";
import type * as admin_taxRates from "../admin/taxRates.js";
import type * as admin_taxRegions from "../admin/taxRegions.js";
import type * as admin_variants from "../admin/variants.js";
import type * as lib from "../lib.js";
import type * as shared_guards from "../shared/guards.js";
import type * as shared_utils from "../shared/utils.js";
import type * as shared_validators from "../shared/validators.js";
import type * as store_addresses from "../store/addresses.js";
import type * as store_blog from "../store/blog.js";
import type * as store_carts from "../store/carts.js";
import type * as store_index from "../store/index.js";
import type * as store_orders from "../store/orders.js";
import type * as store_pricing from "../store/pricing.js";
import type * as store_products from "../store/products.js";
import type * as store_stripe from "../store/stripe.js";
import type * as store_stripeStatus from "../store/stripeStatus.js";
import type * as store_stripeWebhooks from "../store/stripeWebhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  "admin/blogPosts": typeof admin_blogPosts;
  "admin/blogTags": typeof admin_blogTags;
  "admin/customers": typeof admin_customers;
  "admin/fulfillmentAddresses": typeof admin_fulfillmentAddresses;
  "admin/fulfillmentItems": typeof admin_fulfillmentItems;
  "admin/fulfillmentLabels": typeof admin_fulfillmentLabels;
  "admin/fulfillments": typeof admin_fulfillments;
  "admin/index": typeof admin_index;
  "admin/inventoryItems": typeof admin_inventoryItems;
  "admin/inventoryLevels": typeof admin_inventoryLevels;
  "admin/locations": typeof admin_locations;
  "admin/orderShippingMethods": typeof admin_orderShippingMethods;
  "admin/paymentAttempts": typeof admin_paymentAttempts;
  "admin/payments": typeof admin_payments;
  "admin/priceLists": typeof admin_priceLists;
  "admin/prices": typeof admin_prices;
  "admin/products": typeof admin_products;
  "admin/promotionApplicationMethods": typeof admin_promotionApplicationMethods;
  "admin/promotionCampaigns": typeof admin_promotionCampaigns;
  "admin/promotionConditions": typeof admin_promotionConditions;
  "admin/promotions": typeof admin_promotions;
  "admin/refundReasons": typeof admin_refundReasons;
  "admin/refunds": typeof admin_refunds;
  "admin/regionCountries": typeof admin_regionCountries;
  "admin/regions": typeof admin_regions;
  "admin/salesChannels": typeof admin_salesChannels;
  "admin/taxRates": typeof admin_taxRates;
  "admin/taxRegions": typeof admin_taxRegions;
  "admin/variants": typeof admin_variants;
  lib: typeof lib;
  "shared/guards": typeof shared_guards;
  "shared/utils": typeof shared_utils;
  "shared/validators": typeof shared_validators;
  "store/addresses": typeof store_addresses;
  "store/blog": typeof store_blog;
  "store/carts": typeof store_carts;
  "store/index": typeof store_index;
  "store/orders": typeof store_orders;
  "store/pricing": typeof store_pricing;
  "store/products": typeof store_products;
  "store/stripe": typeof store_stripe;
  "store/stripeStatus": typeof store_stripeStatus;
  "store/stripeWebhooks": typeof store_stripeWebhooks;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {
  stripe: import("@convex-dev/stripe/_generated/component.js").ComponentApi<"stripe">;
};
