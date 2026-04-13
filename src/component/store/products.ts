import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireDoc } from "../shared/guards";
import { getBasePriceForVariant } from "./pricing";
import { paginationOptsValidator } from "convex/server";

export const listProducts = query({
  args: {
    paginationOpts: paginationOptsValidator,
    currencyCode: v.string(),
    priceListId: v.optional(v.id("priceLists")),
  },
  handler: async (ctx, args) => {
    let isPriceListActive: boolean | undefined = undefined;
    if (args.priceListId) {
      const priceList = await requireDoc(
        ctx,
        "priceLists",
        args.priceListId,
        "Price list not found",
      );
      const now = Date.now();
      isPriceListActive =
        priceList.status === "active" &&
        (priceList.startsAt === undefined || now >= priceList.startsAt) &&
        (priceList.endsAt === undefined || now <= priceList.endsAt);
    }

    const paginatedProducts = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .paginate(args.paginationOpts);

    const page = await Promise.all(
      paginatedProducts.page.map(async (product) => {
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
              isPriceListActive,
            );
            return { variant, price: price ?? null };
          }),
        );

        return {
          product,
          variants: variantsWithPrice,
        };
      }),
    );

    return {
      ...paginatedProducts,
      page,
    };
  },
});
