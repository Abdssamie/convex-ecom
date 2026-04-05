import { defineApp } from "convex/server";
import convexEcommerce from "@abdssamie/convex-ecommerce/convex.config.js";

const app = defineApp();
app.use(convexEcommerce);

export default app;
