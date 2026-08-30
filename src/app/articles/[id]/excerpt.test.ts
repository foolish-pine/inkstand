import { describe, expect, it } from "vitest";
import { buildExcerpt } from "./excerpt";

// 上限を小さくして、テストから境界が読み取れるようにする。
const MAX = 20;

describe("buildExcerpt", () => {
  describe("段落の切れ目で切る", () => {
    it("上限に収まる段落だけを取る", () => {
      const body = ["あ".repeat(10), "い".repeat(10), "う".repeat(10)].join(
        "\n\n",
      );
      const result = buildExcerpt(body, MAX);

      // 1 段落目(10) + 区切り(2) + 2 段落目(10) = 22 で上限超え
      expect(result).toStrictEqual({ text: "あ".repeat(10), hasMore: true });
    });

    it("ちょうど上限に収まる段落は含める", () => {
      const body = ["あ".repeat(9), "い".repeat(9), "う".repeat(9)].join(
        "\n\n",
      );
      const result = buildExcerpt(body, MAX);

      // 9 + 2 + 9 = 20 で上限ちょうど
      expect(result).toStrictEqual({
        text: `${"あ".repeat(9)}\n\n${"い".repeat(9)}`,
        hasMore: true,
      });
    });

    it("全部収まるなら hasMore は false", () => {
      const body = ["あ".repeat(5), "い".repeat(5)].join("\n\n");
      const result = buildExcerpt(body, MAX);

      expect(result).toStrictEqual({ text: body, hasMore: false });
    });

    it("空行に空白が混ざっていても区切りとして扱う", () => {
      const body = `${"あ".repeat(5)}\n   \n${"い".repeat(5)}`;
      const result = buildExcerpt(body, MAX);

      expect(result).toStrictEqual({
        text: `${"あ".repeat(5)}\n\n${"い".repeat(5)}`,
        hasMore: false,
      });
    });

    it("空行が続いても区切りは 1 つとして扱う", () => {
      const body = `${"あ".repeat(5)}\n\n\n\n${"い".repeat(5)}`;
      const result = buildExcerpt(body, MAX);

      expect(result).toStrictEqual({
        text: `${"あ".repeat(5)}\n\n${"い".repeat(5)}`,
        hasMore: false,
      });
    });
  });

  describe("全文が漏れないこと", () => {
    it("1 段落しかなくても上限を超えたら切る", () => {
      const body = "あ".repeat(100);
      const result = buildExcerpt(body, MAX);

      expect(result).toStrictEqual({ text: "あ".repeat(MAX), hasMore: true });
    });

    it("1 段落目が上限を超えたら、後続があっても文字数で切る", () => {
      const body = `${"あ".repeat(100)}\n\n${"い".repeat(5)}`;
      const result = buildExcerpt(body, MAX);

      expect(result).toStrictEqual({ text: "あ".repeat(MAX), hasMore: true });
    });
  });

  describe("コードブロックが開いたまま終わらない", () => {
    it("対にならない ``` の手前で切る", () => {
      const body = ["あ".repeat(5), "```ts\nconst x = 1;\n```", "```js"].join(
        "\n\n",
      );
      const result = buildExcerpt(body, 60);

      expect(result.text).toBe(
        `${"あ".repeat(5)}\n\n\`\`\`ts\nconst x = 1;\n\`\`\``,
      );
    });

    it("対になっている ``` はそのまま残す", () => {
      const body = "```ts\nconst x = 1;\n```";
      const result = buildExcerpt(body, 60);

      expect(result).toStrictEqual({ text: body, hasMore: false });
    });
  });

  describe("中身が無い本文", () => {
    it.each(["", "   ", "\n\n\n"])("%j は空の抜粋を返す", (body) => {
      expect(buildExcerpt(body, MAX)).toStrictEqual({
        text: "",
        hasMore: false,
      });
    });
  });
});
