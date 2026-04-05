/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    lib: {
      addItem: FunctionReference<
        "mutation",
        "internal",
        { cartId: string; quantity: number; variantId: string },
        string,
        Name
      >;
      createCart: FunctionReference<
        "mutation",
        "internal",
        { currencyCode: string; priceListId?: string },
        string,
        Name
      >;
      createOrderAddress: FunctionReference<
        "mutation",
        "internal",
        {
          address1?: string;
          address2?: string;
          cartId: string;
          city?: string;
          company?: string;
          countryCode?: string;
          customerId?: string;
          firstName?: string;
          lastName?: string;
          metadata?: any;
          orderId?: string;
          phone?: string;
          postalCode?: string;
          province?: string;
          role: "shipping" | "billing";
        },
        string,
        Name
      >;
      getCart: FunctionReference<
        "query",
        "internal",
        { cartId: string },
        null | {
          cart: {
            _creationTime: number;
            _id: string;
            completedAt?: number;
            currencyCode: string;
            customerId?: string;
            email?: string;
            locale?: string;
            metadata?: any;
            priceListId?: string;
            regionId?: string;
            salesChannelId?: string;
            shippingTotal: number;
            subtotal: number;
            total: number;
          };
          items: Array<{
            _creationTime: number;
            _id: string;
            cartId: string;
            isTaxInclusive?: boolean;
            metadata?: any;
            productId?: string;
            quantity: number;
            requiresShipping?: boolean;
            thumbnail?: string;
            title?: string;
            total: number;
            unitPrice: number;
            variantId: string;
            variantSku?: string;
            variantTitle?: string;
          }>;
        },
        Name
      >;
      listProducts: FunctionReference<
        "query",
        "internal",
        { currencyCode: string; limit?: number; priceListId?: string },
        Array<{
          product: {
            _creationTime: number;
            _id: string;
            description?: string;
            discountable: boolean;
            externalId?: string;
            handle: string;
            isGiftcard: boolean;
            metadata?: any;
            status: "draft" | "proposed" | "published" | "rejected";
            subtitle?: string;
            thumbnail?: string;
            title: string;
          };
          variants: Array<{
            _creationTime: number;
            _id: string;
            allowBackorder: boolean;
            barcode?: string;
            inventoryItemId?: string;
            manageInventory: boolean;
            metadata?: any;
            price?: {
              _creationTime: number;
              _id: string;
              amount: number;
              currencyCode: string;
              maxQuantity?: number;
              minQuantity?: number;
              priceListId: null | string;
              title?: string;
              variantId: string;
            };
            productId: string;
            sku?: string;
            thumbnail?: string;
            title: string;
            variantRank: number;
          }>;
        }>,
        Name
      >;
      removeItem: FunctionReference<
        "mutation",
        "internal",
        { cartItemId: string },
        any,
        Name
      >;
      setCustomer: FunctionReference<
        "mutation",
        "internal",
        { cartId: string; customerId: string },
        any,
        Name
      >;
      updateItem: FunctionReference<
        "mutation",
        "internal",
        { cartItemId: string; quantity: number },
        any,
        Name
      >;
    };
  };
