import Stripe from "stripe";
import { requireEnv } from "@/lib/require-env";

const stripeSecretKey = requireEnv(
  process.env.STRIPE_SECRET_KEY,
  "STRIPE_SECRET_KEY",
);

export const stripe = new Stripe(stripeSecretKey);
