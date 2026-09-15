import { describe, expect, it } from "vitest";
import { coverImageUrl } from "./cover-image-url";

const validPath =
  "11111111-1111-1111-1111-111111111111/covers/V1StGXR8Z5jdHi6BmyT8s.jpg";

describe("coverImageUrl", () => {
  it("画像のパスを受け取り、URLを返す", () => {
    expect(coverImageUrl(validPath)).toBe(
      "https://example.supabase.co/storage/v1/object/public/images/11111111-1111-1111-1111-111111111111/covers/V1StGXR8Z5jdHi6BmyT8s.jpg",
    );
  });
  it("path が null のとき、nullを返す", () => {
    expect(coverImageUrl(null)).toBeNull();
  });
  it("path が空文字のとき、nullを返す", () => {
    expect(coverImageUrl("")).toBeNull();
  });
});
