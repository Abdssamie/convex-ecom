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
        { currency: string },
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
            currency: string;
            customerId?: string;
            metadata?: any;
            shippingTotal: number;
            status: "active" | "completed" | "canceled";
            subtotal: number;
            total: number;
          };
          items: Array<{
            _creationTime: number;
            _id: string;
            cartId: string;
            metadata?: any;
            quantity: number;
            total: number;
            unitPrice: number;
            variantId: string;
          }>;
        },
        Name
      >;
      listProducts: FunctionReference<
        "query",
        "internal",
        { currency: string; limit?: number },
        Array<{
          product: {
            _creationTime: number;
            _id: string;
            description?: string;
            handle: string;
            metadata?: any;
            status: "draft" | "published" | "archived";
            title: string;
          };
          variants: Array<{
            _creationTime: number;
            _id: string;
            allowBackorder: boolean;
            manageInventory: boolean;
            metadata?: any;
            price?: {
              _creationTime: number;
              _id: string;
              amount: number;
              currency: string;
              maxQty?: number;
              minQty?: number;
              variantId: string;
            };
            productId: string;
            sku?: string;
            title: string;
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
