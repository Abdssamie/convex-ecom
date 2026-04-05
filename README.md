# Convex Ecommerce Component

This is a Convex component, ready to be published on npm.

To develop this component, run a dev process in the example project:

```sh
bun install
bun run dev
```

`bun install` will install dependencies. `bun run dev` will start a
file watcher to re-build the component, as well as the example project frontend
and backend, which does codegen and installs the component.

Modify the schema and index files in src/component/ to define your component.

### Component Directory structure

```
.
├── README.md           documentation of your component
├── package.json        component name, version number, other metadata
├── bun.lock            Lockfile for reproducible installs (Bun).
├── src
│   ├── component/
│   │   ├── _generated/ Files here are generated for the component.
│   │   ├── convex.config.ts  Name your component here and use other components
│   │   ├── lib.ts    Define functions here and in new files in this directory
│   │   └── schema.ts   schema specific to this component
│   ├── client/
│   │   └── index.ts    Code that needs to run in the app that uses the
│   │                   component. Generally the app interacts directly with
│   │                   the component's exposed API (src/component/*).
│   └── react/          Code intended to be used on the frontend goes here.
│       │               Your are free to delete this if this component
│       │               does not provide code.
│       └── index.ts
├── example/            example Convex app that uses this component
│   └── convex/
│       ├── _generated/       Files here are generated for the example app.
│       ├── convex.config.ts  Imports and uses this component
│       ├── myFunctions.ts    Functions that use the component
│       └── schema.ts         Example app schema
└── dist/               Publishing artifacts will be created here.
```

---

# Convex Ecommerce

[![npm version](https://badge.fury.io/js/@example%2Fconvex-ecommerce.svg)](https://badge.fury.io/js/@example%2Fconvex-ecommerce)

<!-- START: Include on https://convex.dev/components -->

- A production-oriented commerce foundation for Convex apps.

Found a bug? Feature request?
[File it here](https://github.com/abdssamie/convex-ecommerce/issues).

## Installation

Create a `convex.config.ts` file in your app's `convex/` folder and install the
component by calling `use`:

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import convexEcommerce from "@abdssamie/convex-ecommerce/convex.config.js";

const app = defineApp();
app.use(convexEcommerce);

export default app;
```

## Usage

```ts
import { components } from "./_generated/api";

export const createCart = mutation({
  args: { currencyCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runMutation(components.convexEcommerce.lib.createCart, {
      currencyCode: args.currencyCode,
    });
  },
});
```

See more example usage in [example.ts](./example/convex/example.ts).

### HTTP Routes

No HTTP routes are exposed in the MVP.

<!-- END: Include on https://convex.dev/components -->

Run the example:

```sh
bun install
bun run dev
```
