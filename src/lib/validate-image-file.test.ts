import { describe, expect, it } from "vitest";
import { validateImageFile } from "./validate-image-file";

const validType = { mime: "image/jpeg", extension: "jpg" };
const validSize = 1 * 1024 * 1024;

describe("validateImageFile", () => {
  it.each([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ])("type が %s のとき、success: true と %s を返す", (type, extension) => {
    expect(validateImageFile({ type, size: validSize })).toStrictEqual({
      success: true,
      extension,
    });
  });
  it.each(["image/svg+xml", "application/pdf", ""])(
    "type が許可されてない種別 %j のとき、success: false とエラーメッセージを返す",
    (type) => {
      expect(validateImageFile({ type, size: validSize })).toStrictEqual({
        success: false,
        message: "アップロード可能なのはjpeg、png、webpのいずれかです。",
      });
    },
  );
  it("size が 10MB のとき、success: true と拡張子を返す", () => {
    expect(
      validateImageFile({ type: validType.mime, size: 10 * 1024 * 1024 }),
    ).toStrictEqual({
      success: true,
      extension: validType.extension,
    });
  });
  it("size が 10MB を超えるとき、success: false とエラーメッセージを返す", () => {
    expect(
      validateImageFile({ type: validType.mime, size: 10 * 1024 * 1024 + 1 }),
    ).toStrictEqual({
      success: false,
      message: "10MB以下のファイルを選択してください。",
    });
  });
  it("type と size がともに不正値のとき、success: false と種別のエラーメッセージを返す", () => {
    expect(
      validateImageFile({ type: "image/svg+xml", size: 10 * 1024 * 1024 + 1 }),
    ).toStrictEqual({
      success: false,
      message: "アップロード可能なのはjpeg、png、webpのいずれかです。",
    });
  });
});
