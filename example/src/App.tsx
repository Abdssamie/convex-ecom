import "./App.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function App() {
  const result = useQuery(api.example.listProducts, {
    paginationOpts: { numItems: 20, cursor: null },
    currencyCode: "usd",
    priceListId: undefined,
  });
  const createCart = useMutation(api.example.createCart);
  const products =
    result === undefined
      ? undefined
      : (result.page as Array<{
          product: { _id: string; title: string };
          variants: Array<{ _id: string }>;
        }>);

  return (
    <>
      <h1>Convex Commerce Example</h1>
      <div className="card">
        <p>
          This app demonstrates the Convex commerce component with a minimal
          catalog and cart flow.
        </p>
        <button onClick={() => createCart({ currencyCode: "usd" })}>
          Create Cart
        </button>
        <h3>Products</h3>
        {products && products.length === 0 && (
          <p>No products yet. Seed products in Convex to see them here.</p>
        )}
        <ul>
          {products?.map((entry) => (
            <li key={entry.product._id}>
              {entry.product.title} ({entry.variants.length} variants)
            </li>
          ))}
        </ul>
        <p>
          See <code>example/convex/example.ts</code> for server usage examples.
        </p>
      </div>
    </>
  );
}

export default App;
