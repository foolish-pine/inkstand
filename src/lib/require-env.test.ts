import { describe, expect, it } from "vitest";
import { requireEnv } from "@/lib/require-env";

describe("requireEnv", () => {
  it("value が存在するなら、その値を返す", () => {
    expect(requireEnv("secret", "SECRET_KEY")).toBe("secret");
  });
  it.each(["", undefined])("value が %j なら、エラーを投げる", (value) => {
    expect(() => requireEnv(value, "SECRET_KEY")).toThrow(
      "SECRET_KEY is not defined.",
    );
  });
});
