import { v } from "convex/values";
import { query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { getBasePriceForVariant } from "./pricing";

const productValidator = schema.tables.products.validator.extend({
  _id: v.id("products"),
  _creationTime: v.number(),
});

const variantValidator = schema.tables.variants.validator.extend({
  _id: v.id("variants"),
  _creationTime: v.number(),
});

const priceValidator = schema.tables.prices.validator.extend({
  _id: v.id("prices"),
  _creationTime: v.number(),
});

const variantWithPriceValidator = variantValidator.extend({
  price: v.optional(priceValidator),
});

export const listProducts = query({
  args: {
    currencyCode: v.string(),
    limit: v.optional(v.number()),
    priceListId: v.optional(v.id("priceLists")),
  },
  returns: v.array(
    v.object({
      product: productValidator,
      variants: v.array(variantWithPriceValidator),
    }),
  ),
  handler: async (ctx, args) => {
    if (args.priceListId) {
      await requireDoc(
        ctx,
        "priceLists",
        args.priceListId,
        "Price list not found",
      );
    }
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(args.limit ?? 50);

    return await Promise.all(
      products.map(async (product) => {
        const variants = await ctx.db
          .query("variants")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .collect();
        const variantsWithPrice = await Promise.all(
          variants.map(async (variant) => {
            const price = await getBasePriceForVariant(
              ctx,
              variant._id,
              args.currencyCode,
              args.priceListId,
            );
            return { ...variant, price: price ?? undefined };
          }),
        );
        return { product, variants: variantsWithPrice };
      }),
    );
  },
});
