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
    admin: {
      customers: {
        createCustomer: FunctionReference<
          "mutation",
          "internal",
          {
            companyName?: string;
            email?: string;
            firstName?: string;
            hasAccount: boolean;
            lastName?: string;
            metadata?: any;
            phone?: string;
            userId: string;
          },
          string,
          Name
        >;
        getCustomer: FunctionReference<
          "query",
          "internal",
          { customerId: string },
          null | {
            _creationTime: number;
            _id: string;
            companyName?: string;
            email?: string;
            firstName?: string;
            hasAccount: boolean;
            lastName?: string;
            metadata?: any;
            phone?: string;
            userId: string;
          },
          Name
        >;
        listCustomers: FunctionReference<
          "query",
          "internal",
          {
            email?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            userId?: string;
          },
          any,
          Name
        >;
        updateCustomer: FunctionReference<
          "mutation",
          "internal",
          {
            companyName?: string;
            customerId: string;
            email?: string;
            firstName?: string;
            hasAccount?: boolean;
            lastName?: string;
            metadata?: any;
            phone?: string;
          },
          any,
          Name
        >;
      };
      fulfillmentAddresses: {
        createFulfillmentAddress: FunctionReference<
          "mutation",
          "internal",
          {
            address1?: string;
            address2?: string;
            city?: string;
            company?: string;
            countryCode?: string;
            firstName?: string;
            fulfillmentId: string;
            lastName?: string;
            metadata?: any;
            phone?: string;
            postalCode?: string;
            province?: string;
          },
          string,
          Name
        >;
        getFulfillmentAddress: FunctionReference<
          "query",
          "internal",
          { fulfillmentAddressId: string },
          null | {
            _creationTime: number;
            _id: string;
            address1?: string;
            address2?: string;
            city?: string;
            company?: string;
            countryCode?: string;
            firstName?: string;
            fulfillmentId: string;
            lastName?: string;
            metadata?: any;
            phone?: string;
            postalCode?: string;
            province?: string;
          },
          Name
        >;
        listFulfillmentAddresses: FunctionReference<
          "query",
          "internal",
          { fulfillmentId?: string; limit?: number },
          Array<{
            _creationTime: number;
            _id: string;
            address1?: string;
            address2?: string;
            city?: string;
            company?: string;
            countryCode?: string;
            firstName?: string;
            fulfillmentId: string;
            lastName?: string;
            metadata?: any;
            phone?: string;
            postalCode?: string;
            province?: string;
          }>,
          Name
        >;
        updateFulfillmentAddress: FunctionReference<
          "mutation",
          "internal",
          {
            address1?: string;
            address2?: string;
            city?: string;
            company?: string;
            countryCode?: string;
            firstName?: string;
            fulfillmentAddressId: string;
            fulfillmentId?: string;
            lastName?: string;
            metadata?: any;
            phone?: string;
            postalCode?: string;
            province?: string;
          },
          any,
          Name
        >;
      };
      fulfillmentItems: {
        createFulfillmentItem: FunctionReference<
          "mutation",
          "internal",
          {
            fulfillmentId: string;
            metadata?: any;
            orderItemId: string;
            quantity: number;
          },
          string,
          Name
        >;
        getFulfillmentItem: FunctionReference<
          "query",
          "internal",
          { fulfillmentItemId: string },
          null | {
            _creationTime: number;
            _id: string;
            fulfillmentId: string;
            metadata?: any;
            orderItemId: string;
            quantity: number;
          },
          Name
        >;
        listFulfillmentItems: FunctionReference<
          "query",
          "internal",
          { fulfillmentId?: string; limit?: number; orderItemId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            fulfillmentId: string;
            metadata?: any;
            orderItemId: string;
            quantity: number;
          }>,
          Name
        >;
        updateFulfillmentItem: FunctionReference<
          "mutation",
          "internal",
          {
            fulfillmentId?: string;
            fulfillmentItemId: string;
            metadata?: any;
            orderItemId?: string;
            quantity?: number;
          },
          any,
          Name
        >;
      };
      fulfillmentLabels: {
        createFulfillmentLabel: FunctionReference<
          "mutation",
          "internal",
          {
            fulfillmentId: string;
            labelUrl?: string;
            metadata?: any;
            trackingNumber?: string;
            trackingUrl?: string;
          },
          string,
          Name
        >;
        getFulfillmentLabel: FunctionReference<
          "query",
          "internal",
          { fulfillmentLabelId: string },
          null | {
            _creationTime: number;
            _id: string;
            fulfillmentId: string;
            labelUrl?: string;
            metadata?: any;
            trackingNumber?: string;
            trackingUrl?: string;
          },
          Name
        >;
        listFulfillmentLabels: FunctionReference<
          "query",
          "internal",
          { fulfillmentId?: string; limit?: number },
          Array<{
            _creationTime: number;
            _id: string;
            fulfillmentId: string;
            labelUrl?: string;
            metadata?: any;
            trackingNumber?: string;
            trackingUrl?: string;
          }>,
          Name
        >;
        updateFulfillmentLabel: FunctionReference<
          "mutation",
          "internal",
          {
            fulfillmentId?: string;
            fulfillmentLabelId: string;
            labelUrl?: string;
            metadata?: any;
            trackingNumber?: string;
            trackingUrl?: string;
          },
          any,
          Name
        >;
      };
      fulfillments: {
        createFulfillment: FunctionReference<
          "mutation",
          "internal",
          {
            canceledAt?: number;
            createdBy?: string;
            data?: any;
            deliveredAt?: number;
            fulfillmentProviderId?: string;
            locationId: string;
            markedShippedBy?: string;
            metadata?: any;
            orderId: string;
            orderShippingMethodId?: string;
            packedAt?: number;
            requiresShipping: boolean;
            shippedAt?: number;
            shippingOptionId?: string;
          },
          string,
          Name
        >;
        getFulfillment: FunctionReference<
          "query",
          "internal",
          { fulfillmentId: string },
          null | {
            _creationTime: number;
            _id: string;
            canceledAt?: number;
            createdBy?: string;
            data?: any;
            deliveredAt?: number;
            fulfillmentProviderId?: string;
            locationId: string;
            markedShippedBy?: string;
            metadata?: any;
            orderId: string;
            orderShippingMethodId?: string;
            packedAt?: number;
            requiresShipping: boolean;
            shippedAt?: number;
            shippingOptionId?: string;
          },
          Name
        >;
        listFulfillments: FunctionReference<
          "query",
          "internal",
          {
            locationId?: string;
            orderId?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any,
          Name
        >;
        updateFulfillment: FunctionReference<
          "mutation",
          "internal",
          {
            canceledAt?: number;
            createdBy?: string;
            data?: any;
            deliveredAt?: number;
            fulfillmentId: string;
            fulfillmentProviderId?: string;
            locationId?: string;
            markedShippedBy?: string;
            metadata?: any;
            orderId?: string;
            orderShippingMethodId?: string;
            packedAt?: number;
            requiresShipping?: boolean;
            shippedAt?: number;
            shippingOptionId?: string;
          },
          any,
          Name
        >;
      };
      index: {
        archiveProduct: FunctionReference<
          "mutation",
          "internal",
          { productId: string },
          any,
          Name
        >;
        createCustomer: FunctionReference<
          "mutation",
          "internal",
          {
            companyName?: string;
            email?: string;
            firstName?: string;
            hasAccount: boolean;
            lastName?: string;
            metadata?: any;
            phone?: string;
            userId: string;
          },
          string,
          Name
        >;
        createFulfillment: FunctionReference<
          "mutation",
          "internal",
          {
            canceledAt?: number;
            createdBy?: string;
            data?: any;
            deliveredAt?: number;
            fulfillmentProviderId?: string;
            locationId: string;
            markedShippedBy?: string;
            metadata?: any;
            orderId: string;
            orderShippingMethodId?: string;
            packedAt?: number;
            requiresShipping: boolean;
            shippedAt?: number;
            shippingOptionId?: string;
          },
          string,
          Name
        >;
        createFulfillmentAddress: FunctionReference<
          "mutation",
          "internal",
          {
            address1?: string;
            address2?: string;
            city?: string;
            company?: string;
            countryCode?: string;
            firstName?: string;
            fulfillmentId: string;
            lastName?: string;
            metadata?: any;
            phone?: string;
            postalCode?: string;
            province?: string;
          },
          string,
          Name
        >;
        createFulfillmentItem: FunctionReference<
          "mutation",
          "internal",
          {
            fulfillmentId: string;
            metadata?: any;
            orderItemId: string;
            quantity: number;
          },
          string,
          Name
        >;
        createFulfillmentLabel: FunctionReference<
          "mutation",
          "internal",
          {
            fulfillmentId: string;
            labelUrl?: string;
            metadata?: any;
            trackingNumber?: string;
            trackingUrl?: string;
          },
          string,
          Name
        >;
        createInventoryItem: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            metadata?: any;
            requiresShipping: boolean;
            sku?: string;
            thumbnail?: string;
            title?: string;
          },
          string,
          Name
        >;
        createInventoryLevel: FunctionReference<
          "mutation",
          "internal",
          {
            incomingQuantity: number;
            inventoryItemId: string;
            locationId: string;
            metadata?: any;
            reservedQuantity: number;
            stockedQuantity: number;
          },
          string,
          Name
        >;
        createLocation: FunctionReference<
          "mutation",
          "internal",
          { externalId?: string; metadata?: any; name: string },
          string,
          Name
        >;
        createOrderShippingMethod: FunctionReference<
          "mutation",
          "internal",
          {
            amount: number;
            data?: any;
            isCustomAmount: boolean;
            isTaxInclusive: boolean;
            metadata?: any;
            name: string;
            orderId: string;
            shippingOptionId?: string;
          },
          string,
          Name
        >;
        createPayment: FunctionReference<
          "mutation",
          "internal",
          {
            amount: number;
            cartId: string;
            clientSecret?: string;
            currencyCode: string;
            metadata?: any;
            orderId?: string;
            paymentIntentId?: string;
            providerId: string;
            status:
              | "not_paid"
              | "awaiting"
              | "authorized"
              | "partially_authorized"
              | "canceled"
              | "failed"
              | "partially_captured"
              | "completed";
          },
          string,
          Name
        >;
        createPaymentAttempt: FunctionReference<
          "mutation",
          "internal",
          {
            error?: string;
            paymentId: string;
            status: "created" | "failed" | "succeeded";
          },
          string,
          Name
        >;
        createPrice: FunctionReference<
          "mutation",
          "internal",
          {
            price: {
              amount: number;
              currencyCode: string;
              maxQuantity?: number;
              minQuantity?: number;
              priceListId: null | string;
              title?: string;
              variantId: string;
            };
          },
          string,
          Name
        >;
        createPriceList: FunctionReference<
          "mutation",
          "internal",
          {
            priceList: {
              description: string;
              endsAt?: number;
              metadata?: any;
              rulesCount?: number;
              startsAt?: number;
              status: "active" | "draft";
              title: string;
              type: "sale" | "override";
            };
          },
          string,
          Name
        >;
        createProduct: FunctionReference<
          "mutation",
          "internal",
          {
            product: {
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
          },
          string,
          Name
        >;
        createPromotion: FunctionReference<
          "mutation",
          "internal",
          {
            promotion: {
              campaignId?: string;
              code: string;
              isAutomatic: boolean;
              isTaxInclusive: boolean;
              limit?: number;
              metadata?: any;
              status: "draft" | "active" | "inactive";
              type: "standard" | "buyget";
              used: number;
            };
          },
          string,
          Name
        >;
        createPromotionApplicationMethod: FunctionReference<
          "mutation",
          "internal",
          {
            promotionApplicationMethod: {
              allocation: "each" | "across" | "once";
              currencyCode?: string;
              maxQuantity?: number;
              promotionId: string;
              targetType: "order" | "shipping_methods" | "items";
              type: "fixed" | "percentage";
              value: number;
            };
          },
          string,
          Name
        >;
        createPromotionCampaign: FunctionReference<
          "mutation",
          "internal",
          {
            promotionCampaign: {
              description?: string;
              metadata?: any;
              name: string;
            };
          },
          string,
          Name
        >;
        createPromotionCondition: FunctionReference<
          "mutation",
          "internal",
          {
            promotionCondition: {
              attribute: string;
              operator: "gte" | "lte" | "gt" | "lt" | "eq" | "ne" | "in";
              promotionId: string;
              value?: any;
            };
          },
          string,
          Name
        >;
        createRefund: FunctionReference<
          "mutation",
          "internal",
          {
            amount: number;
            createdBy?: string;
            metadata?: any;
            note?: string;
            paymentId: string;
            refundReasonId?: string;
          },
          string,
          Name
        >;
        createRefundReason: FunctionReference<
          "mutation",
          "internal",
          { code: string; description?: string; label: string; metadata?: any },
          string,
          Name
        >;
        createRegion: FunctionReference<
          "mutation",
          "internal",
          {
            automaticTaxes: boolean;
            currencyCode: string;
            metadata?: any;
            name: string;
          },
          string,
          Name
        >;
        createRegionCountry: FunctionReference<
          "mutation",
          "internal",
          { countryCode: string; metadata?: any; regionId: string },
          string,
          Name
        >;
        createSalesChannel: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            isDisabled: boolean;
            metadata?: any;
            name: string;
          },
          string,
          Name
        >;
        createTaxRate: FunctionReference<
          "mutation",
          "internal",
          {
            taxRate: {
              code: string;
              isCombinable: boolean;
              isDefault: boolean;
              metadata?: any;
              name: string;
              rate?: null | number;
              taxRegionId: string;
            };
          },
          string,
          Name
        >;
        createTaxRegion: FunctionReference<
          "mutation",
          "internal",
          {
            taxRegion: {
              countryCode: string;
              metadata?: any;
              parentTaxRegionId?: string;
              providerId?: string;
              provinceCode?: string;
            };
          },
          string,
          Name
        >;
        createVariant: FunctionReference<
          "mutation",
          "internal",
          {
            variant: {
              allowBackorder: boolean;
              barcode?: string;
              inventoryItemId?: string;
              manageInventory: boolean;
              metadata?: any;
              productId: string;
              sku?: string;
              thumbnail?: string;
              title: string;
              variantRank: number;
            };
          },
          string,
          Name
        >;
        deletePrice: FunctionReference<
          "mutation",
          "internal",
          { priceId: string },
          any,
          Name
        >;
        deletePriceList: FunctionReference<
          "mutation",
          "internal",
          { priceListId: string },
          any,
          Name
        >;
        deleteRefund: FunctionReference<
          "mutation",
          "internal",
          { refundId: string },
          any,
          Name
        >;
        deleteRefundReason: FunctionReference<
          "mutation",
          "internal",
          { refundReasonId: string },
          any,
          Name
        >;
        getCustomer: FunctionReference<
          "query",
          "internal",
          { customerId: string },
          null | {
            _creationTime: number;
            _id: string;
            companyName?: string;
            email?: string;
            firstName?: string;
            hasAccount: boolean;
            lastName?: string;
            metadata?: any;
            phone?: string;
            userId: string;
          },
          Name
        >;
        getFulfillment: FunctionReference<
          "query",
          "internal",
          { fulfillmentId: string },
          null | {
            _creationTime: number;
            _id: string;
            canceledAt?: number;
            createdBy?: string;
            data?: any;
            deliveredAt?: number;
            fulfillmentProviderId?: string;
            locationId: string;
            markedShippedBy?: string;
            metadata?: any;
            orderId: string;
            orderShippingMethodId?: string;
            packedAt?: number;
            requiresShipping: boolean;
            shippedAt?: number;
            shippingOptionId?: string;
          },
          Name
        >;
        getFulfillmentAddress: FunctionReference<
          "query",
          "internal",
          { fulfillmentAddressId: string },
          null | {
            _creationTime: number;
            _id: string;
            address1?: string;
            address2?: string;
            city?: string;
            company?: string;
            countryCode?: string;
            firstName?: string;
            fulfillmentId: string;
            lastName?: string;
            metadata?: any;
            phone?: string;
            postalCode?: string;
            province?: string;
          },
          Name
        >;
        getFulfillmentItem: FunctionReference<
          "query",
          "internal",
          { fulfillmentItemId: string },
          null | {
            _creationTime: number;
            _id: string;
            fulfillmentId: string;
            metadata?: any;
            orderItemId: string;
            quantity: number;
          },
          Name
        >;
        getFulfillmentLabel: FunctionReference<
          "query",
          "internal",
          { fulfillmentLabelId: string },
          null | {
            _creationTime: number;
            _id: string;
            fulfillmentId: string;
            labelUrl?: string;
            metadata?: any;
            trackingNumber?: string;
            trackingUrl?: string;
          },
          Name
        >;
        getInventoryItem: FunctionReference<
          "query",
          "internal",
          { inventoryItemId: string },
          null | {
            _creationTime: number;
            _id: string;
            description?: string;
            metadata?: any;
            requiresShipping: boolean;
            sku?: string;
            thumbnail?: string;
            title?: string;
          },
          Name
        >;
        getInventoryLevel: FunctionReference<
          "query",
          "internal",
          { inventoryLevelId: string },
          null | {
            _creationTime: number;
            _id: string;
            incomingQuantity: number;
            inventoryItemId: string;
            locationId: string;
            metadata?: any;
            reservedQuantity: number;
            stockedQuantity: number;
          },
          Name
        >;
        getLocation: FunctionReference<
          "query",
          "internal",
          { locationId: string },
          null | {
            _creationTime: number;
            _id: string;
            externalId?: string;
            metadata?: any;
            name: string;
          },
          Name
        >;
        getOrderShippingMethod: FunctionReference<
          "query",
          "internal",
          { orderShippingMethodId: string },
          null | {
            _creationTime: number;
            _id: string;
            amount: number;
            data?: any;
            isCustomAmount: boolean;
            isTaxInclusive: boolean;
            metadata?: any;
            name: string;
            orderId: string;
            shippingOptionId?: string;
          },
          Name
        >;
        getPayment: FunctionReference<
          "query",
          "internal",
          { paymentId: string },
          null | {
            _creationTime: number;
            _id: string;
            amount: number;
            cartId: string;
            clientSecret?: string;
            currencyCode: string;
            metadata?: any;
            orderId?: string;
            paymentIntentId?: string;
            providerId: string;
            status:
              | "not_paid"
              | "awaiting"
              | "authorized"
              | "partially_authorized"
              | "canceled"
              | "failed"
              | "partially_captured"
              | "completed";
          },
          Name
        >;
        getPaymentAttempt: FunctionReference<
          "query",
          "internal",
          { paymentAttemptId: string },
          null | {
            _creationTime: number;
            _id: string;
            createdAt: number;
            error?: string;
            paymentId: string;
            status: "created" | "failed" | "succeeded";
          },
          Name
        >;
        getPriceList: FunctionReference<
          "query",
          "internal",
          { priceListId: string },
          null | {
            _creationTime: number;
            _id: string;
            description: string;
            endsAt?: number;
            metadata?: any;
            rulesCount?: number;
            startsAt?: number;
            status: "active" | "draft";
            title: string;
            type: "sale" | "override";
          },
          Name
        >;
        getProduct: FunctionReference<
          "query",
          "internal",
          { productId: string },
          null | {
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
          },
          Name
        >;
        getPromotion: FunctionReference<
          "query",
          "internal",
          { promotionId: string },
          null | {
            _creationTime: number;
            _id: string;
            campaignId?: string;
            code: string;
            isAutomatic: boolean;
            isTaxInclusive: boolean;
            limit?: number;
            metadata?: any;
            status: "draft" | "active" | "inactive";
            type: "standard" | "buyget";
            used: number;
          },
          Name
        >;
        getPromotionApplicationMethod: FunctionReference<
          "query",
          "internal",
          { promotionApplicationMethodId: string },
          null | {
            _creationTime: number;
            _id: string;
            allocation: "each" | "across" | "once";
            currencyCode?: string;
            maxQuantity?: number;
            promotionId: string;
            targetType: "order" | "shipping_methods" | "items";
            type: "fixed" | "percentage";
            value: number;
          },
          Name
        >;
        getPromotionCampaign: FunctionReference<
          "query",
          "internal",
          { promotionCampaignId: string },
          null | {
            _creationTime: number;
            _id: string;
            description?: string;
            metadata?: any;
            name: string;
          },
          Name
        >;
        getPromotionCondition: FunctionReference<
          "query",
          "internal",
          { promotionConditionId: string },
          null | {
            _creationTime: number;
            _id: string;
            attribute: string;
            operator: "gte" | "lte" | "gt" | "lt" | "eq" | "ne" | "in";
            promotionId: string;
            value?: any;
          },
          Name
        >;
        getRefund: FunctionReference<
          "query",
          "internal",
          { refundId: string },
          null | {
            _creationTime: number;
            _id: string;
            amount: number;
            createdBy?: string;
            metadata?: any;
            note?: string;
            paymentId: string;
            refundReasonId?: string;
          },
          Name
        >;
        getRefundReason: FunctionReference<
          "query",
          "internal",
          { refundReasonId: string },
          null | {
            _creationTime: number;
            _id: string;
            code: string;
            description?: string;
            label: string;
            metadata?: any;
          },
          Name
        >;
        getRegion: FunctionReference<
          "query",
          "internal",
          { regionId: string },
          null | {
            _creationTime: number;
            _id: string;
            automaticTaxes: boolean;
            currencyCode: string;
            metadata?: any;
            name: string;
          },
          Name
        >;
        getRegionCountry: FunctionReference<
          "query",
          "internal",
          { regionCountryId: string },
          null | {
            _creationTime: number;
            _id: string;
            countryCode: string;
            metadata?: any;
            regionId: string;
          },
          Name
        >;
        getSalesChannel: FunctionReference<
          "query",
          "internal",
          { salesChannelId: string },
          null | {
            _creationTime: number;
            _id: string;
            description?: string;
            isDisabled: boolean;
            metadata?: any;
            name: string;
          },
          Name
        >;
        getTaxRate: FunctionReference<
          "query",
          "internal",
          { taxRateId: string },
          null | {
            _creationTime: number;
            _id: string;
            code: string;
            isCombinable: boolean;
            isDefault: boolean;
            metadata?: any;
            name: string;
            rate?: null | number;
            taxRegionId: string;
          },
          Name
        >;
        getTaxRegion: FunctionReference<
          "query",
          "internal",
          { taxRegionId: string },
          null | {
            _creationTime: number;
            _id: string;
            countryCode: string;
            metadata?: any;
            parentTaxRegionId?: string;
            providerId?: string;
            provinceCode?: string;
          },
          Name
        >;
        getVariant: FunctionReference<
          "query",
          "internal",
          { variantId: string },
          null | {
            _creationTime: number;
            _id: string;
            allowBackorder: boolean;
            barcode?: string;
            inventoryItemId?: string;
            manageInventory: boolean;
            metadata?: any;
            productId: string;
            sku?: string;
            thumbnail?: string;
            title: string;
            variantRank: number;
          },
          Name
        >;
        listCustomers: FunctionReference<
          "query",
          "internal",
          {
            email?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            userId?: string;
          },
          any,
          Name
        >;
        listFulfillmentAddresses: FunctionReference<
          "query",
          "internal",
          { fulfillmentId?: string; limit?: number },
          Array<{
            _creationTime: number;
            _id: string;
            address1?: string;
            address2?: string;
            city?: string;
            company?: string;
            countryCode?: string;
            firstName?: string;
            fulfillmentId: string;
            lastName?: string;
            metadata?: any;
            phone?: string;
            postalCode?: string;
            province?: string;
          }>,
          Name
        >;
        listFulfillmentItems: FunctionReference<
          "query",
          "internal",
          { fulfillmentId?: string; limit?: number; orderItemId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            fulfillmentId: string;
            metadata?: any;
            orderItemId: string;
            quantity: number;
          }>,
          Name
        >;
        listFulfillmentLabels: FunctionReference<
          "query",
          "internal",
          { fulfillmentId?: string; limit?: number },
          Array<{
            _creationTime: number;
            _id: string;
            fulfillmentId: string;
            labelUrl?: string;
            metadata?: any;
            trackingNumber?: string;
            trackingUrl?: string;
          }>,
          Name
        >;
        listFulfillments: FunctionReference<
          "query",
          "internal",
          {
            locationId?: string;
            orderId?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any,
          Name
        >;
        listInventoryItems: FunctionReference<
          "query",
          "internal",
          {
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any,
          Name
        >;
        listInventoryLevels: FunctionReference<
          "query",
          "internal",
          { inventoryItemId?: string; limit?: number; locationId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            incomingQuantity: number;
            inventoryItemId: string;
            locationId: string;
            metadata?: any;
            reservedQuantity: number;
            stockedQuantity: number;
          }>,
          Name
        >;
        listLocations: FunctionReference<
          "query",
          "internal",
          { limit?: number },
          Array<{
            _creationTime: number;
            _id: string;
            externalId?: string;
            metadata?: any;
            name: string;
          }>,
          Name
        >;
        listOrderShippingMethods: FunctionReference<
          "query",
          "internal",
          { limit?: number; orderId?: string; shippingOptionId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            data?: any;
            isCustomAmount: boolean;
            isTaxInclusive: boolean;
            metadata?: any;
            name: string;
            orderId: string;
            shippingOptionId?: string;
          }>,
          Name
        >;
        listPaymentAttempts: FunctionReference<
          "query",
          "internal",
          { limit?: number; paymentId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            createdAt: number;
            error?: string;
            paymentId: string;
            status: "created" | "failed" | "succeeded";
          }>,
          Name
        >;
        listPayments: FunctionReference<
          "query",
          "internal",
          { cartId?: string; limit?: number; paymentIntentId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            cartId: string;
            clientSecret?: string;
            currencyCode: string;
            metadata?: any;
            orderId?: string;
            paymentIntentId?: string;
            providerId: string;
            status:
              | "not_paid"
              | "awaiting"
              | "authorized"
              | "partially_authorized"
              | "canceled"
              | "failed"
              | "partially_captured"
              | "completed";
          }>,
          Name
        >;
        listPriceLists: FunctionReference<
          "query",
          "internal",
          { limit?: number; status?: "active" | "draft" },
          Array<{
            _creationTime: number;
            _id: string;
            description: string;
            endsAt?: number;
            metadata?: any;
            rulesCount?: number;
            startsAt?: number;
            status: "active" | "draft";
            title: string;
            type: "sale" | "override";
          }>,
          Name
        >;
        listPricesByPriceList: FunctionReference<
          "query",
          "internal",
          { limit?: number; priceListId: null | string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            currencyCode: string;
            maxQuantity?: number;
            minQuantity?: number;
            priceListId: null | string;
            title?: string;
            variantId: string;
          }>,
          Name
        >;
        listPricesByVariant: FunctionReference<
          "query",
          "internal",
          { limit?: number; priceListId?: null | string; variantId: string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            currencyCode: string;
            maxQuantity?: number;
            minQuantity?: number;
            priceListId: null | string;
            title?: string;
            variantId: string;
          }>,
          Name
        >;
        listProducts: FunctionReference<
          "query",
          "internal",
          {
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            status?: "draft" | "proposed" | "published" | "rejected";
          },
          any,
          Name
        >;
        listPromotionApplicationMethods: FunctionReference<
          "query",
          "internal",
          { limit?: number; promotionId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            allocation: "each" | "across" | "once";
            currencyCode?: string;
            maxQuantity?: number;
            promotionId: string;
            targetType: "order" | "shipping_methods" | "items";
            type: "fixed" | "percentage";
            value: number;
          }>,
          Name
        >;
        listPromotionCampaigns: FunctionReference<
          "query",
          "internal",
          { limit?: number; name?: string },
          Array<{
            _creationTime: number;
            _id: string;
            description?: string;
            metadata?: any;
            name: string;
          }>,
          Name
        >;
        listPromotionConditions: FunctionReference<
          "query",
          "internal",
          { limit?: number; promotionId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            attribute: string;
            operator: "gte" | "lte" | "gt" | "lt" | "eq" | "ne" | "in";
            promotionId: string;
            value?: any;
          }>,
          Name
        >;
        listPromotions: FunctionReference<
          "query",
          "internal",
          {
            campaignId?: string;
            code?: string;
            isAutomatic?: boolean;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            status?: "draft" | "active" | "inactive";
          },
          any,
          Name
        >;
        listRefundReasons: FunctionReference<
          "query",
          "internal",
          { code?: string; limit?: number },
          Array<{
            _creationTime: number;
            _id: string;
            code: string;
            description?: string;
            label: string;
            metadata?: any;
          }>,
          Name
        >;
        listRefunds: FunctionReference<
          "query",
          "internal",
          { limit?: number; paymentId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            createdBy?: string;
            metadata?: any;
            note?: string;
            paymentId: string;
            refundReasonId?: string;
          }>,
          Name
        >;
        listRegionCountries: FunctionReference<
          "query",
          "internal",
          { countryCode?: string; limit?: number; regionId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            countryCode: string;
            metadata?: any;
            regionId: string;
          }>,
          Name
        >;
        listRegions: FunctionReference<
          "query",
          "internal",
          { currencyCode?: string; limit?: number; name?: string },
          Array<{
            _creationTime: number;
            _id: string;
            automaticTaxes: boolean;
            currencyCode: string;
            metadata?: any;
            name: string;
          }>,
          Name
        >;
        listSalesChannels: FunctionReference<
          "query",
          "internal",
          { isDisabled?: boolean; limit?: number; name?: string },
          Array<{
            _creationTime: number;
            _id: string;
            description?: string;
            isDisabled: boolean;
            metadata?: any;
            name: string;
          }>,
          Name
        >;
        listTaxRates: FunctionReference<
          "query",
          "internal",
          { code?: string; limit?: number; taxRegionId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            code: string;
            isCombinable: boolean;
            isDefault: boolean;
            metadata?: any;
            name: string;
            rate?: null | number;
            taxRegionId: string;
          }>,
          Name
        >;
        listTaxRegions: FunctionReference<
          "query",
          "internal",
          {
            countryCode?: string;
            limit?: number;
            parentTaxRegionId?: string;
            provinceCode?: string;
          },
          Array<{
            _creationTime: number;
            _id: string;
            countryCode: string;
            metadata?: any;
            parentTaxRegionId?: string;
            providerId?: string;
            provinceCode?: string;
          }>,
          Name
        >;
        listVariantsByProduct: FunctionReference<
          "query",
          "internal",
          { limit?: number; productId: string },
          Array<{
            _creationTime: number;
            _id: string;
            allowBackorder: boolean;
            barcode?: string;
            inventoryItemId?: string;
            manageInventory: boolean;
            metadata?: any;
            productId: string;
            sku?: string;
            thumbnail?: string;
            title: string;
            variantRank: number;
          }>,
          Name
        >;
        updateCustomer: FunctionReference<
          "mutation",
          "internal",
          {
            companyName?: string;
            customerId: string;
            email?: string;
            firstName?: string;
            hasAccount?: boolean;
            lastName?: string;
            metadata?: any;
            phone?: string;
          },
          any,
          Name
        >;
        updateFulfillment: FunctionReference<
          "mutation",
          "internal",
          {
            canceledAt?: number;
            createdBy?: string;
            data?: any;
            deliveredAt?: number;
            fulfillmentId: string;
            fulfillmentProviderId?: string;
            locationId?: string;
            markedShippedBy?: string;
            metadata?: any;
            orderId?: string;
            orderShippingMethodId?: string;
            packedAt?: number;
            requiresShipping?: boolean;
            shippedAt?: number;
            shippingOptionId?: string;
          },
          any,
          Name
        >;
        updateFulfillmentAddress: FunctionReference<
          "mutation",
          "internal",
          {
            address1?: string;
            address2?: string;
            city?: string;
            company?: string;
            countryCode?: string;
            firstName?: string;
            fulfillmentAddressId: string;
            fulfillmentId?: string;
            lastName?: string;
            metadata?: any;
            phone?: string;
            postalCode?: string;
            province?: string;
          },
          any,
          Name
        >;
        updateFulfillmentItem: FunctionReference<
          "mutation",
          "internal",
          {
            fulfillmentId?: string;
            fulfillmentItemId: string;
            metadata?: any;
            orderItemId?: string;
            quantity?: number;
          },
          any,
          Name
        >;
        updateFulfillmentLabel: FunctionReference<
          "mutation",
          "internal",
          {
            fulfillmentId?: string;
            fulfillmentLabelId: string;
            labelUrl?: string;
            metadata?: any;
            trackingNumber?: string;
            trackingUrl?: string;
          },
          any,
          Name
        >;
        updateInventoryItem: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            inventoryItemId: string;
            metadata?: any;
            requiresShipping?: boolean;
            sku?: string;
            thumbnail?: string;
            title?: string;
          },
          any,
          Name
        >;
        updateInventoryLevel: FunctionReference<
          "mutation",
          "internal",
          {
            incomingQuantity?: number;
            inventoryLevelId: string;
            metadata?: any;
            reservedQuantity?: number;
            stockedQuantity?: number;
          },
          any,
          Name
        >;
        updateLocation: FunctionReference<
          "mutation",
          "internal",
          {
            externalId?: string;
            locationId: string;
            metadata?: any;
            name?: string;
          },
          any,
          Name
        >;
        updateOrderShippingMethod: FunctionReference<
          "mutation",
          "internal",
          {
            amount?: number;
            data?: any;
            isCustomAmount?: boolean;
            isTaxInclusive?: boolean;
            metadata?: any;
            name?: string;
            orderId?: string;
            orderShippingMethodId: string;
            shippingOptionId?: string;
          },
          any,
          Name
        >;
        updatePayment: FunctionReference<
          "mutation",
          "internal",
          {
            amount?: number;
            cartId?: string;
            clientSecret?: string;
            currencyCode?: string;
            metadata?: any;
            orderId?: string;
            paymentId: string;
            paymentIntentId?: string;
            providerId?: string;
            status?:
              | "not_paid"
              | "awaiting"
              | "authorized"
              | "partially_authorized"
              | "canceled"
              | "failed"
              | "partially_captured"
              | "completed";
          },
          any,
          Name
        >;
        updatePaymentAttempt: FunctionReference<
          "mutation",
          "internal",
          {
            error?: string;
            paymentAttemptId: string;
            paymentId?: string;
            status?: "created" | "failed" | "succeeded";
          },
          any,
          Name
        >;
        updatePrice: FunctionReference<
          "mutation",
          "internal",
          {
            amount?: number;
            currencyCode?: string;
            maxQuantity?: number;
            minQuantity?: number;
            priceId: string;
            priceListId?: null | string;
            title?: string;
            variantId?: string;
          },
          any,
          Name
        >;
        updatePriceList: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            endsAt?: number;
            metadata?: any;
            priceListId: string;
            rulesCount?: number;
            startsAt?: number;
            status?: "active" | "draft";
            title?: string;
            type?: "sale" | "override";
          },
          any,
          Name
        >;
        updateProduct: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            discountable?: boolean;
            externalId?: string;
            handle?: string;
            isGiftcard?: boolean;
            metadata?: any;
            productId: string;
            status?: "draft" | "proposed" | "published" | "rejected";
            subtitle?: string;
            thumbnail?: string;
            title?: string;
          },
          any,
          Name
        >;
        updatePromotion: FunctionReference<
          "mutation",
          "internal",
          {
            campaignId?: string;
            code?: string;
            isAutomatic?: boolean;
            isTaxInclusive?: boolean;
            limit?: number;
            metadata?: any;
            promotionId: string;
            status?: "draft" | "active" | "inactive";
            type?: "standard" | "buyget";
          },
          any,
          Name
        >;
        updatePromotionApplicationMethod: FunctionReference<
          "mutation",
          "internal",
          {
            allocation?: "each" | "across" | "once";
            currencyCode?: string;
            maxQuantity?: number;
            promotionApplicationMethodId: string;
            promotionId?: string;
            targetType?: "order" | "shipping_methods" | "items";
            type?: "fixed" | "percentage";
            value?: number;
          },
          any,
          Name
        >;
        updatePromotionCampaign: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            metadata?: any;
            name?: string;
            promotionCampaignId: string;
          },
          any,
          Name
        >;
        updatePromotionCondition: FunctionReference<
          "mutation",
          "internal",
          {
            attribute?: string;
            operator?: "gte" | "lte" | "gt" | "lt" | "eq" | "ne" | "in";
            promotionConditionId: string;
            promotionId?: string;
            value?: any;
          },
          any,
          Name
        >;
        updateRefund: FunctionReference<
          "mutation",
          "internal",
          {
            amount?: number;
            createdBy?: string;
            metadata?: any;
            note?: string;
            paymentId?: string;
            refundId: string;
            refundReasonId?: string;
          },
          any,
          Name
        >;
        updateRefundReason: FunctionReference<
          "mutation",
          "internal",
          {
            code?: string;
            description?: string;
            label?: string;
            metadata?: any;
            refundReasonId: string;
          },
          any,
          Name
        >;
        updateRegion: FunctionReference<
          "mutation",
          "internal",
          {
            automaticTaxes?: boolean;
            currencyCode?: string;
            metadata?: any;
            name?: string;
            regionId: string;
          },
          any,
          Name
        >;
        updateRegionCountry: FunctionReference<
          "mutation",
          "internal",
          {
            countryCode?: string;
            metadata?: any;
            regionCountryId: string;
            regionId?: string;
          },
          any,
          Name
        >;
        updateSalesChannel: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            isDisabled?: boolean;
            metadata?: any;
            name?: string;
            salesChannelId: string;
          },
          any,
          Name
        >;
        updateTaxRate: FunctionReference<
          "mutation",
          "internal",
          {
            code?: string;
            isCombinable?: boolean;
            isDefault?: boolean;
            metadata?: any;
            name?: string;
            rate?: null | number;
            taxRateId: string;
            taxRegionId?: string;
          },
          any,
          Name
        >;
        updateTaxRegion: FunctionReference<
          "mutation",
          "internal",
          {
            countryCode?: string;
            metadata?: any;
            parentTaxRegionId?: string;
            providerId?: string;
            provinceCode?: string;
            taxRegionId: string;
          },
          any,
          Name
        >;
        updateVariant: FunctionReference<
          "mutation",
          "internal",
          {
            allowBackorder?: boolean;
            barcode?: string;
            inventoryItemId?: string;
            manageInventory?: boolean;
            metadata?: any;
            productId?: string;
            sku?: string;
            thumbnail?: string;
            title?: string;
            variantId: string;
            variantRank?: number;
          },
          any,
          Name
        >;
      };
      inventoryItems: {
        createInventoryItem: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            metadata?: any;
            requiresShipping: boolean;
            sku?: string;
            thumbnail?: string;
            title?: string;
          },
          string,
          Name
        >;
        getInventoryItem: FunctionReference<
          "query",
          "internal",
          { inventoryItemId: string },
          null | {
            _creationTime: number;
            _id: string;
            description?: string;
            metadata?: any;
            requiresShipping: boolean;
            sku?: string;
            thumbnail?: string;
            title?: string;
          },
          Name
        >;
        listInventoryItems: FunctionReference<
          "query",
          "internal",
          {
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any,
          Name
        >;
        updateInventoryItem: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            inventoryItemId: string;
            metadata?: any;
            requiresShipping?: boolean;
            sku?: string;
            thumbnail?: string;
            title?: string;
          },
          any,
          Name
        >;
      };
      inventoryLevels: {
        createInventoryLevel: FunctionReference<
          "mutation",
          "internal",
          {
            incomingQuantity: number;
            inventoryItemId: string;
            locationId: string;
            metadata?: any;
            reservedQuantity: number;
            stockedQuantity: number;
          },
          string,
          Name
        >;
        getInventoryLevel: FunctionReference<
          "query",
          "internal",
          { inventoryLevelId: string },
          null | {
            _creationTime: number;
            _id: string;
            incomingQuantity: number;
            inventoryItemId: string;
            locationId: string;
            metadata?: any;
            reservedQuantity: number;
            stockedQuantity: number;
          },
          Name
        >;
        listInventoryLevels: FunctionReference<
          "query",
          "internal",
          { inventoryItemId?: string; limit?: number; locationId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            incomingQuantity: number;
            inventoryItemId: string;
            locationId: string;
            metadata?: any;
            reservedQuantity: number;
            stockedQuantity: number;
          }>,
          Name
        >;
        updateInventoryLevel: FunctionReference<
          "mutation",
          "internal",
          {
            incomingQuantity?: number;
            inventoryLevelId: string;
            metadata?: any;
            reservedQuantity?: number;
            stockedQuantity?: number;
          },
          any,
          Name
        >;
      };
      locations: {
        createLocation: FunctionReference<
          "mutation",
          "internal",
          { externalId?: string; metadata?: any; name: string },
          string,
          Name
        >;
        getLocation: FunctionReference<
          "query",
          "internal",
          { locationId: string },
          null | {
            _creationTime: number;
            _id: string;
            externalId?: string;
            metadata?: any;
            name: string;
          },
          Name
        >;
        listLocations: FunctionReference<
          "query",
          "internal",
          { limit?: number },
          Array<{
            _creationTime: number;
            _id: string;
            externalId?: string;
            metadata?: any;
            name: string;
          }>,
          Name
        >;
        updateLocation: FunctionReference<
          "mutation",
          "internal",
          {
            externalId?: string;
            locationId: string;
            metadata?: any;
            name?: string;
          },
          any,
          Name
        >;
      };
      orderShippingMethods: {
        createOrderShippingMethod: FunctionReference<
          "mutation",
          "internal",
          {
            amount: number;
            data?: any;
            isCustomAmount: boolean;
            isTaxInclusive: boolean;
            metadata?: any;
            name: string;
            orderId: string;
            shippingOptionId?: string;
          },
          string,
          Name
        >;
        getOrderShippingMethod: FunctionReference<
          "query",
          "internal",
          { orderShippingMethodId: string },
          null | {
            _creationTime: number;
            _id: string;
            amount: number;
            data?: any;
            isCustomAmount: boolean;
            isTaxInclusive: boolean;
            metadata?: any;
            name: string;
            orderId: string;
            shippingOptionId?: string;
          },
          Name
        >;
        listOrderShippingMethods: FunctionReference<
          "query",
          "internal",
          { limit?: number; orderId?: string; shippingOptionId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            data?: any;
            isCustomAmount: boolean;
            isTaxInclusive: boolean;
            metadata?: any;
            name: string;
            orderId: string;
            shippingOptionId?: string;
          }>,
          Name
        >;
        updateOrderShippingMethod: FunctionReference<
          "mutation",
          "internal",
          {
            amount?: number;
            data?: any;
            isCustomAmount?: boolean;
            isTaxInclusive?: boolean;
            metadata?: any;
            name?: string;
            orderId?: string;
            orderShippingMethodId: string;
            shippingOptionId?: string;
          },
          any,
          Name
        >;
      };
      paymentAttempts: {
        createPaymentAttempt: FunctionReference<
          "mutation",
          "internal",
          {
            error?: string;
            paymentId: string;
            status: "created" | "failed" | "succeeded";
          },
          string,
          Name
        >;
        getPaymentAttempt: FunctionReference<
          "query",
          "internal",
          { paymentAttemptId: string },
          null | {
            _creationTime: number;
            _id: string;
            createdAt: number;
            error?: string;
            paymentId: string;
            status: "created" | "failed" | "succeeded";
          },
          Name
        >;
        listPaymentAttempts: FunctionReference<
          "query",
          "internal",
          { limit?: number; paymentId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            createdAt: number;
            error?: string;
            paymentId: string;
            status: "created" | "failed" | "succeeded";
          }>,
          Name
        >;
        updatePaymentAttempt: FunctionReference<
          "mutation",
          "internal",
          {
            error?: string;
            paymentAttemptId: string;
            paymentId?: string;
            status?: "created" | "failed" | "succeeded";
          },
          any,
          Name
        >;
      };
      payments: {
        createPayment: FunctionReference<
          "mutation",
          "internal",
          {
            amount: number;
            cartId: string;
            clientSecret?: string;
            currencyCode: string;
            metadata?: any;
            orderId?: string;
            paymentIntentId?: string;
            providerId: string;
            status:
              | "not_paid"
              | "awaiting"
              | "authorized"
              | "partially_authorized"
              | "canceled"
              | "failed"
              | "partially_captured"
              | "completed";
          },
          string,
          Name
        >;
        getPayment: FunctionReference<
          "query",
          "internal",
          { paymentId: string },
          null | {
            _creationTime: number;
            _id: string;
            amount: number;
            cartId: string;
            clientSecret?: string;
            currencyCode: string;
            metadata?: any;
            orderId?: string;
            paymentIntentId?: string;
            providerId: string;
            status:
              | "not_paid"
              | "awaiting"
              | "authorized"
              | "partially_authorized"
              | "canceled"
              | "failed"
              | "partially_captured"
              | "completed";
          },
          Name
        >;
        listPayments: FunctionReference<
          "query",
          "internal",
          { cartId?: string; limit?: number; paymentIntentId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            cartId: string;
            clientSecret?: string;
            currencyCode: string;
            metadata?: any;
            orderId?: string;
            paymentIntentId?: string;
            providerId: string;
            status:
              | "not_paid"
              | "awaiting"
              | "authorized"
              | "partially_authorized"
              | "canceled"
              | "failed"
              | "partially_captured"
              | "completed";
          }>,
          Name
        >;
        updatePayment: FunctionReference<
          "mutation",
          "internal",
          {
            amount?: number;
            cartId?: string;
            clientSecret?: string;
            currencyCode?: string;
            metadata?: any;
            orderId?: string;
            paymentId: string;
            paymentIntentId?: string;
            providerId?: string;
            status?:
              | "not_paid"
              | "awaiting"
              | "authorized"
              | "partially_authorized"
              | "canceled"
              | "failed"
              | "partially_captured"
              | "completed";
          },
          any,
          Name
        >;
      };
      priceLists: {
        createPriceList: FunctionReference<
          "mutation",
          "internal",
          {
            priceList: {
              description: string;
              endsAt?: number;
              metadata?: any;
              rulesCount?: number;
              startsAt?: number;
              status: "active" | "draft";
              title: string;
              type: "sale" | "override";
            };
          },
          string,
          Name
        >;
        deletePriceList: FunctionReference<
          "mutation",
          "internal",
          { priceListId: string },
          any,
          Name
        >;
        getPriceList: FunctionReference<
          "query",
          "internal",
          { priceListId: string },
          null | {
            _creationTime: number;
            _id: string;
            description: string;
            endsAt?: number;
            metadata?: any;
            rulesCount?: number;
            startsAt?: number;
            status: "active" | "draft";
            title: string;
            type: "sale" | "override";
          },
          Name
        >;
        listPriceLists: FunctionReference<
          "query",
          "internal",
          { limit?: number; status?: "active" | "draft" },
          Array<{
            _creationTime: number;
            _id: string;
            description: string;
            endsAt?: number;
            metadata?: any;
            rulesCount?: number;
            startsAt?: number;
            status: "active" | "draft";
            title: string;
            type: "sale" | "override";
          }>,
          Name
        >;
        updatePriceList: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            endsAt?: number;
            metadata?: any;
            priceListId: string;
            rulesCount?: number;
            startsAt?: number;
            status?: "active" | "draft";
            title?: string;
            type?: "sale" | "override";
          },
          any,
          Name
        >;
      };
      prices: {
        createPrice: FunctionReference<
          "mutation",
          "internal",
          {
            price: {
              amount: number;
              currencyCode: string;
              maxQuantity?: number;
              minQuantity?: number;
              priceListId: null | string;
              title?: string;
              variantId: string;
            };
          },
          string,
          Name
        >;
        deletePrice: FunctionReference<
          "mutation",
          "internal",
          { priceId: string },
          any,
          Name
        >;
        listPricesByPriceList: FunctionReference<
          "query",
          "internal",
          { limit?: number; priceListId: null | string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            currencyCode: string;
            maxQuantity?: number;
            minQuantity?: number;
            priceListId: null | string;
            title?: string;
            variantId: string;
          }>,
          Name
        >;
        listPricesByVariant: FunctionReference<
          "query",
          "internal",
          { limit?: number; priceListId?: null | string; variantId: string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            currencyCode: string;
            maxQuantity?: number;
            minQuantity?: number;
            priceListId: null | string;
            title?: string;
            variantId: string;
          }>,
          Name
        >;
        updatePrice: FunctionReference<
          "mutation",
          "internal",
          {
            amount?: number;
            currencyCode?: string;
            maxQuantity?: number;
            minQuantity?: number;
            priceId: string;
            priceListId?: null | string;
            title?: string;
            variantId?: string;
          },
          any,
          Name
        >;
      };
      products: {
        archiveProduct: FunctionReference<
          "mutation",
          "internal",
          { productId: string },
          any,
          Name
        >;
        createProduct: FunctionReference<
          "mutation",
          "internal",
          {
            product: {
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
          },
          string,
          Name
        >;
        getProduct: FunctionReference<
          "query",
          "internal",
          { productId: string },
          null | {
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
          },
          Name
        >;
        listProducts: FunctionReference<
          "query",
          "internal",
          {
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            status?: "draft" | "proposed" | "published" | "rejected";
          },
          any,
          Name
        >;
        updateProduct: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            discountable?: boolean;
            externalId?: string;
            handle?: string;
            isGiftcard?: boolean;
            metadata?: any;
            productId: string;
            status?: "draft" | "proposed" | "published" | "rejected";
            subtitle?: string;
            thumbnail?: string;
            title?: string;
          },
          any,
          Name
        >;
      };
      promotionApplicationMethods: {
        createPromotionApplicationMethod: FunctionReference<
          "mutation",
          "internal",
          {
            promotionApplicationMethod: {
              allocation: "each" | "across" | "once";
              currencyCode?: string;
              maxQuantity?: number;
              promotionId: string;
              targetType: "order" | "shipping_methods" | "items";
              type: "fixed" | "percentage";
              value: number;
            };
          },
          string,
          Name
        >;
        getPromotionApplicationMethod: FunctionReference<
          "query",
          "internal",
          { promotionApplicationMethodId: string },
          null | {
            _creationTime: number;
            _id: string;
            allocation: "each" | "across" | "once";
            currencyCode?: string;
            maxQuantity?: number;
            promotionId: string;
            targetType: "order" | "shipping_methods" | "items";
            type: "fixed" | "percentage";
            value: number;
          },
          Name
        >;
        listPromotionApplicationMethods: FunctionReference<
          "query",
          "internal",
          { limit?: number; promotionId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            allocation: "each" | "across" | "once";
            currencyCode?: string;
            maxQuantity?: number;
            promotionId: string;
            targetType: "order" | "shipping_methods" | "items";
            type: "fixed" | "percentage";
            value: number;
          }>,
          Name
        >;
        updatePromotionApplicationMethod: FunctionReference<
          "mutation",
          "internal",
          {
            allocation?: "each" | "across" | "once";
            currencyCode?: string;
            maxQuantity?: number;
            promotionApplicationMethodId: string;
            promotionId?: string;
            targetType?: "order" | "shipping_methods" | "items";
            type?: "fixed" | "percentage";
            value?: number;
          },
          any,
          Name
        >;
      };
      promotionCampaigns: {
        createPromotionCampaign: FunctionReference<
          "mutation",
          "internal",
          {
            promotionCampaign: {
              description?: string;
              metadata?: any;
              name: string;
            };
          },
          string,
          Name
        >;
        getPromotionCampaign: FunctionReference<
          "query",
          "internal",
          { promotionCampaignId: string },
          null | {
            _creationTime: number;
            _id: string;
            description?: string;
            metadata?: any;
            name: string;
          },
          Name
        >;
        listPromotionCampaigns: FunctionReference<
          "query",
          "internal",
          { limit?: number; name?: string },
          Array<{
            _creationTime: number;
            _id: string;
            description?: string;
            metadata?: any;
            name: string;
          }>,
          Name
        >;
        updatePromotionCampaign: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            metadata?: any;
            name?: string;
            promotionCampaignId: string;
          },
          any,
          Name
        >;
      };
      promotionConditions: {
        createPromotionCondition: FunctionReference<
          "mutation",
          "internal",
          {
            promotionCondition: {
              attribute: string;
              operator: "gte" | "lte" | "gt" | "lt" | "eq" | "ne" | "in";
              promotionId: string;
              value?: any;
            };
          },
          string,
          Name
        >;
        getPromotionCondition: FunctionReference<
          "query",
          "internal",
          { promotionConditionId: string },
          null | {
            _creationTime: number;
            _id: string;
            attribute: string;
            operator: "gte" | "lte" | "gt" | "lt" | "eq" | "ne" | "in";
            promotionId: string;
            value?: any;
          },
          Name
        >;
        listPromotionConditions: FunctionReference<
          "query",
          "internal",
          { limit?: number; promotionId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            attribute: string;
            operator: "gte" | "lte" | "gt" | "lt" | "eq" | "ne" | "in";
            promotionId: string;
            value?: any;
          }>,
          Name
        >;
        updatePromotionCondition: FunctionReference<
          "mutation",
          "internal",
          {
            attribute?: string;
            operator?: "gte" | "lte" | "gt" | "lt" | "eq" | "ne" | "in";
            promotionConditionId: string;
            promotionId?: string;
            value?: any;
          },
          any,
          Name
        >;
      };
      promotions: {
        createPromotion: FunctionReference<
          "mutation",
          "internal",
          {
            promotion: {
              campaignId?: string;
              code: string;
              isAutomatic: boolean;
              isTaxInclusive: boolean;
              limit?: number;
              metadata?: any;
              status: "draft" | "active" | "inactive";
              type: "standard" | "buyget";
              used: number;
            };
          },
          string,
          Name
        >;
        getPromotion: FunctionReference<
          "query",
          "internal",
          { promotionId: string },
          null | {
            _creationTime: number;
            _id: string;
            campaignId?: string;
            code: string;
            isAutomatic: boolean;
            isTaxInclusive: boolean;
            limit?: number;
            metadata?: any;
            status: "draft" | "active" | "inactive";
            type: "standard" | "buyget";
            used: number;
          },
          Name
        >;
        listPromotions: FunctionReference<
          "query",
          "internal",
          {
            campaignId?: string;
            code?: string;
            isAutomatic?: boolean;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            status?: "draft" | "active" | "inactive";
          },
          any,
          Name
        >;
        updatePromotion: FunctionReference<
          "mutation",
          "internal",
          {
            campaignId?: string;
            code?: string;
            isAutomatic?: boolean;
            isTaxInclusive?: boolean;
            limit?: number;
            metadata?: any;
            promotionId: string;
            status?: "draft" | "active" | "inactive";
            type?: "standard" | "buyget";
          },
          any,
          Name
        >;
      };
      refundReasons: {
        createRefundReason: FunctionReference<
          "mutation",
          "internal",
          { code: string; description?: string; label: string; metadata?: any },
          string,
          Name
        >;
        deleteRefundReason: FunctionReference<
          "mutation",
          "internal",
          { refundReasonId: string },
          any,
          Name
        >;
        getRefundReason: FunctionReference<
          "query",
          "internal",
          { refundReasonId: string },
          null | {
            _creationTime: number;
            _id: string;
            code: string;
            description?: string;
            label: string;
            metadata?: any;
          },
          Name
        >;
        listRefundReasons: FunctionReference<
          "query",
          "internal",
          { code?: string; limit?: number },
          Array<{
            _creationTime: number;
            _id: string;
            code: string;
            description?: string;
            label: string;
            metadata?: any;
          }>,
          Name
        >;
        updateRefundReason: FunctionReference<
          "mutation",
          "internal",
          {
            code?: string;
            description?: string;
            label?: string;
            metadata?: any;
            refundReasonId: string;
          },
          any,
          Name
        >;
      };
      refunds: {
        createRefund: FunctionReference<
          "mutation",
          "internal",
          {
            amount: number;
            createdBy?: string;
            metadata?: any;
            note?: string;
            paymentId: string;
            refundReasonId?: string;
          },
          string,
          Name
        >;
        deleteRefund: FunctionReference<
          "mutation",
          "internal",
          { refundId: string },
          any,
          Name
        >;
        getRefund: FunctionReference<
          "query",
          "internal",
          { refundId: string },
          null | {
            _creationTime: number;
            _id: string;
            amount: number;
            createdBy?: string;
            metadata?: any;
            note?: string;
            paymentId: string;
            refundReasonId?: string;
          },
          Name
        >;
        listRefunds: FunctionReference<
          "query",
          "internal",
          { limit?: number; paymentId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            amount: number;
            createdBy?: string;
            metadata?: any;
            note?: string;
            paymentId: string;
            refundReasonId?: string;
          }>,
          Name
        >;
        updateRefund: FunctionReference<
          "mutation",
          "internal",
          {
            amount?: number;
            createdBy?: string;
            metadata?: any;
            note?: string;
            paymentId?: string;
            refundId: string;
            refundReasonId?: string;
          },
          any,
          Name
        >;
      };
      regionCountries: {
        createRegionCountry: FunctionReference<
          "mutation",
          "internal",
          { countryCode: string; metadata?: any; regionId: string },
          string,
          Name
        >;
        getRegionCountry: FunctionReference<
          "query",
          "internal",
          { regionCountryId: string },
          null | {
            _creationTime: number;
            _id: string;
            countryCode: string;
            metadata?: any;
            regionId: string;
          },
          Name
        >;
        listRegionCountries: FunctionReference<
          "query",
          "internal",
          { countryCode?: string; limit?: number; regionId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            countryCode: string;
            metadata?: any;
            regionId: string;
          }>,
          Name
        >;
        updateRegionCountry: FunctionReference<
          "mutation",
          "internal",
          {
            countryCode?: string;
            metadata?: any;
            regionCountryId: string;
            regionId?: string;
          },
          any,
          Name
        >;
      };
      regions: {
        createRegion: FunctionReference<
          "mutation",
          "internal",
          {
            automaticTaxes: boolean;
            currencyCode: string;
            metadata?: any;
            name: string;
          },
          string,
          Name
        >;
        getRegion: FunctionReference<
          "query",
          "internal",
          { regionId: string },
          null | {
            _creationTime: number;
            _id: string;
            automaticTaxes: boolean;
            currencyCode: string;
            metadata?: any;
            name: string;
          },
          Name
        >;
        listRegions: FunctionReference<
          "query",
          "internal",
          { currencyCode?: string; limit?: number; name?: string },
          Array<{
            _creationTime: number;
            _id: string;
            automaticTaxes: boolean;
            currencyCode: string;
            metadata?: any;
            name: string;
          }>,
          Name
        >;
        updateRegion: FunctionReference<
          "mutation",
          "internal",
          {
            automaticTaxes?: boolean;
            currencyCode?: string;
            metadata?: any;
            name?: string;
            regionId: string;
          },
          any,
          Name
        >;
      };
      salesChannels: {
        createSalesChannel: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            isDisabled: boolean;
            metadata?: any;
            name: string;
          },
          string,
          Name
        >;
        getSalesChannel: FunctionReference<
          "query",
          "internal",
          { salesChannelId: string },
          null | {
            _creationTime: number;
            _id: string;
            description?: string;
            isDisabled: boolean;
            metadata?: any;
            name: string;
          },
          Name
        >;
        listSalesChannels: FunctionReference<
          "query",
          "internal",
          { isDisabled?: boolean; limit?: number; name?: string },
          Array<{
            _creationTime: number;
            _id: string;
            description?: string;
            isDisabled: boolean;
            metadata?: any;
            name: string;
          }>,
          Name
        >;
        updateSalesChannel: FunctionReference<
          "mutation",
          "internal",
          {
            description?: string;
            isDisabled?: boolean;
            metadata?: any;
            name?: string;
            salesChannelId: string;
          },
          any,
          Name
        >;
      };
      taxRates: {
        createTaxRate: FunctionReference<
          "mutation",
          "internal",
          {
            taxRate: {
              code: string;
              isCombinable: boolean;
              isDefault: boolean;
              metadata?: any;
              name: string;
              rate?: null | number;
              taxRegionId: string;
            };
          },
          string,
          Name
        >;
        getTaxRate: FunctionReference<
          "query",
          "internal",
          { taxRateId: string },
          null | {
            _creationTime: number;
            _id: string;
            code: string;
            isCombinable: boolean;
            isDefault: boolean;
            metadata?: any;
            name: string;
            rate?: null | number;
            taxRegionId: string;
          },
          Name
        >;
        listTaxRates: FunctionReference<
          "query",
          "internal",
          { code?: string; limit?: number; taxRegionId?: string },
          Array<{
            _creationTime: number;
            _id: string;
            code: string;
            isCombinable: boolean;
            isDefault: boolean;
            metadata?: any;
            name: string;
            rate?: null | number;
            taxRegionId: string;
          }>,
          Name
        >;
        updateTaxRate: FunctionReference<
          "mutation",
          "internal",
          {
            code?: string;
            isCombinable?: boolean;
            isDefault?: boolean;
            metadata?: any;
            name?: string;
            rate?: null | number;
            taxRateId: string;
            taxRegionId?: string;
          },
          any,
          Name
        >;
      };
      taxRegions: {
        createTaxRegion: FunctionReference<
          "mutation",
          "internal",
          {
            taxRegion: {
              countryCode: string;
              metadata?: any;
              parentTaxRegionId?: string;
              providerId?: string;
              provinceCode?: string;
            };
          },
          string,
          Name
        >;
        getTaxRegion: FunctionReference<
          "query",
          "internal",
          { taxRegionId: string },
          null | {
            _creationTime: number;
            _id: string;
            countryCode: string;
            metadata?: any;
            parentTaxRegionId?: string;
            providerId?: string;
            provinceCode?: string;
          },
          Name
        >;
        listTaxRegions: FunctionReference<
          "query",
          "internal",
          {
            countryCode?: string;
            limit?: number;
            parentTaxRegionId?: string;
            provinceCode?: string;
          },
          Array<{
            _creationTime: number;
            _id: string;
            countryCode: string;
            metadata?: any;
            parentTaxRegionId?: string;
            providerId?: string;
            provinceCode?: string;
          }>,
          Name
        >;
        updateTaxRegion: FunctionReference<
          "mutation",
          "internal",
          {
            countryCode?: string;
            metadata?: any;
            parentTaxRegionId?: string;
            providerId?: string;
            provinceCode?: string;
            taxRegionId: string;
          },
          any,
          Name
        >;
      };
      variants: {
        createVariant: FunctionReference<
          "mutation",
          "internal",
          {
            variant: {
              allowBackorder: boolean;
              barcode?: string;
              inventoryItemId?: string;
              manageInventory: boolean;
              metadata?: any;
              productId: string;
              sku?: string;
              thumbnail?: string;
              title: string;
              variantRank: number;
            };
          },
          string,
          Name
        >;
        getVariant: FunctionReference<
          "query",
          "internal",
          { variantId: string },
          null | {
            _creationTime: number;
            _id: string;
            allowBackorder: boolean;
            barcode?: string;
            inventoryItemId?: string;
            manageInventory: boolean;
            metadata?: any;
            productId: string;
            sku?: string;
            thumbnail?: string;
            title: string;
            variantRank: number;
          },
          Name
        >;
        listVariantsByProduct: FunctionReference<
          "query",
          "internal",
          { limit?: number; productId: string },
          Array<{
            _creationTime: number;
            _id: string;
            allowBackorder: boolean;
            barcode?: string;
            inventoryItemId?: string;
            manageInventory: boolean;
            metadata?: any;
            productId: string;
            sku?: string;
            thumbnail?: string;
            title: string;
            variantRank: number;
          }>,
          Name
        >;
        updateVariant: FunctionReference<
          "mutation",
          "internal",
          {
            allowBackorder?: boolean;
            barcode?: string;
            inventoryItemId?: string;
            manageInventory?: boolean;
            metadata?: any;
            productId?: string;
            sku?: string;
            thumbnail?: string;
            title?: string;
            variantId: string;
            variantRank?: number;
          },
          any,
          Name
        >;
      };
    };
    store: {
      addresses: {
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
      };
      carts: {
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
          { currencyCode: string; email?: string; priceListId?: string },
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
      index: {
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
          { currencyCode: string; email?: string; priceListId?: string },
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
        createOrderFromCart: FunctionReference<
          "mutation",
          "internal",
          {
            cartId: string;
            status?:
              | "pending"
              | "completed"
              | "draft"
              | "archived"
              | "canceled"
              | "requires_action";
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
        getOrder: FunctionReference<
          "query",
          "internal",
          { orderId: string },
          null | {
            addresses: Array<{
              _creationTime: number;
              _id: string;
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
            }>;
            items: Array<{
              _creationTime: number;
              _id: string;
              compareAtUnitPrice?: number;
              deliveredQuantity: number;
              fulfilledQuantity: number;
              isTaxInclusive?: boolean;
              metadata?: any;
              orderId: string;
              productId?: string;
              quantity: number;
              requiresShipping?: boolean;
              returnDismissedQuantity: number;
              returnReceivedQuantity: number;
              returnRequestedQuantity: number;
              shippedQuantity: number;
              thumbnail?: string;
              title?: string;
              unitPrice: number;
              variantId: string;
              variantSku?: string;
              variantTitle?: string;
              version: number;
              writtenOffQuantity: number;
            }>;
            order: {
              _creationTime: number;
              _id: string;
              canceledAt?: number;
              cartId: string;
              currencyCode: string;
              customerId?: string;
              email?: string;
              locale?: string;
              metadata?: any;
              paymentStatus:
                | "not_paid"
                | "awaiting"
                | "authorized"
                | "partially_authorized"
                | "canceled"
                | "failed"
                | "partially_captured"
                | "completed";
              regionId?: string;
              salesChannelId?: string;
              status:
                | "pending"
                | "completed"
                | "draft"
                | "archived"
                | "canceled"
                | "requires_action";
              total: number;
            };
            shippingMethods: Array<{
              _creationTime: number;
              _id: string;
              amount: number;
              data?: any;
              isCustomAmount: boolean;
              isTaxInclusive: boolean;
              metadata?: any;
              name: string;
              orderId: string;
              shippingOptionId?: string;
            }>;
          },
          Name
        >;
        listOrdersByCustomer: FunctionReference<
          "query",
          "internal",
          {
            customerId: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any,
          Name
        >;
        listProducts: FunctionReference<
          "query",
          "internal",
          {
            currencyCode: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            priceListId?: string;
          },
          any,
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
        setOrderStatus: FunctionReference<
          "mutation",
          "internal",
          {
            orderId: string;
            status:
              | "pending"
              | "completed"
              | "draft"
              | "archived"
              | "canceled"
              | "requires_action";
          },
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
      orders: {
        createOrderFromCart: FunctionReference<
          "mutation",
          "internal",
          {
            cartId: string;
            status?:
              | "pending"
              | "completed"
              | "draft"
              | "archived"
              | "canceled"
              | "requires_action";
          },
          string,
          Name
        >;
        getOrder: FunctionReference<
          "query",
          "internal",
          { orderId: string },
          null | {
            addresses: Array<{
              _creationTime: number;
              _id: string;
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
            }>;
            items: Array<{
              _creationTime: number;
              _id: string;
              compareAtUnitPrice?: number;
              deliveredQuantity: number;
              fulfilledQuantity: number;
              isTaxInclusive?: boolean;
              metadata?: any;
              orderId: string;
              productId?: string;
              quantity: number;
              requiresShipping?: boolean;
              returnDismissedQuantity: number;
              returnReceivedQuantity: number;
              returnRequestedQuantity: number;
              shippedQuantity: number;
              thumbnail?: string;
              title?: string;
              unitPrice: number;
              variantId: string;
              variantSku?: string;
              variantTitle?: string;
              version: number;
              writtenOffQuantity: number;
            }>;
            order: {
              _creationTime: number;
              _id: string;
              canceledAt?: number;
              cartId: string;
              currencyCode: string;
              customerId?: string;
              email?: string;
              locale?: string;
              metadata?: any;
              paymentStatus:
                | "not_paid"
                | "awaiting"
                | "authorized"
                | "partially_authorized"
                | "canceled"
                | "failed"
                | "partially_captured"
                | "completed";
              regionId?: string;
              salesChannelId?: string;
              status:
                | "pending"
                | "completed"
                | "draft"
                | "archived"
                | "canceled"
                | "requires_action";
              total: number;
            };
            shippingMethods: Array<{
              _creationTime: number;
              _id: string;
              amount: number;
              data?: any;
              isCustomAmount: boolean;
              isTaxInclusive: boolean;
              metadata?: any;
              name: string;
              orderId: string;
              shippingOptionId?: string;
            }>;
          },
          Name
        >;
        listOrdersByCustomer: FunctionReference<
          "query",
          "internal",
          {
            customerId: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any,
          Name
        >;
        setOrderStatus: FunctionReference<
          "mutation",
          "internal",
          {
            orderId: string;
            status:
              | "pending"
              | "completed"
              | "draft"
              | "archived"
              | "canceled"
              | "requires_action";
          },
          any,
          Name
        >;
      };
      products: {
        listProducts: FunctionReference<
          "query",
          "internal",
          {
            currencyCode: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            priceListId?: string;
          },
          any,
          Name
        >;
      };
    };
  };
