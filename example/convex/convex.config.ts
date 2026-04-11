import { defineApp } from "convex/server";
import convexEcommerce from "@abdssamie/convex-ecommerce/convex.config.js";
import stripe from "@convex-dev/stripe/convex.config.js";

const app = defineApp();
app.use(convexEcommerce);
app.use(stripe);

export default app;
