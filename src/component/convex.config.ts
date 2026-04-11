import { defineComponent } from "convex/server";
import stripe from "@convex-dev/stripe/convex.config.js";

const component = defineComponent("convexEcommerce");
component.use(stripe);

export default component;
