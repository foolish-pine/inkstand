import { Resend } from "resend";
import { requireEnv } from "@/lib/require-env";

const resendSecretKey = requireEnv(
  process.env.RESEND_API_KEY,
  "RESEND_API_KEY",
);

export const resend = new Resend(resendSecretKey);
