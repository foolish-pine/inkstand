import { describe, expect, it } from "vitest";
import { articleFormSchema } from "./article-form-schema";
import {
  ARTICLE_TITLE_MAX_LENGTH,
  PAID_ARTICLE_BODY_MIN_LENGTH,
} from "@/db/schema";

const validInput = {
  title: "タイトル",
  body: "あ".repeat(10000),
  status: "draft",
  price: "500",
  coverImagePath:
    "11111111-1111-1111-1111-111111111111/covers/V1StGXR8Z5jdHi6BmyT8s.jpg",
};

describe("articleFormSchema", () => {
  it("正常な入力はパースできる", () => {
    const expectedOutput = {
      ...validInput,
      price: 500,
    };
    const result = articleFormSchema.safeParse(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toStrictEqual(expectedOutput);
  });
  describe("title", () => {
    it.each([0, ARTICLE_TITLE_MAX_LENGTH + 1])(
      "%i 文字はパースできない",
      (length) => {
        const input = {
          ...validInput,
          title: "あ".repeat(length),
        };
        const result = articleFormSchema.safeParse(input);
        const errorFields = result.error?.issues.map((issue) => issue.path[0]);

        expect(result.success).toBe(false);
        expect(errorFields).toStrictEqual(["title"]);
      },
    );
    it.each([1, ARTICLE_TITLE_MAX_LENGTH])(
      "%i 文字はパースできる",
      (length) => {
        const title = "あ".repeat(length);
        const input = {
          ...validInput,
          title,
        };
        const result = articleFormSchema.safeParse(input);

        expect(result.success).toBe(true);
        expect(result.data?.title).toBe(title);
      },
    );
  });
  describe("body", () => {
    describe("priceが 0 のとき", () => {
      it("0 文字はパースできない", () => {
        const input = {
          ...validInput,
          body: "",
          price: "0",
        };
        const result = articleFormSchema.safeParse(input);
        const errorFields = result.error?.issues.map((issue) => issue.path[0]);

        expect(result.success).toBe(false);
        expect(errorFields).toStrictEqual(["body"]);
      });
      it("1 文字はパースできる", () => {
        const body = "あ";
        const input = {
          ...validInput,
          body,
          price: "0",
        };
        const result = articleFormSchema.safeParse(input);

        expect(result.success).toBe(true);
        expect(result.data?.body).toBe(body);
      });
    });
    describe("priceが 50 のとき", () => {
      it("0 文字はパースできない", () => {
        const input = {
          ...validInput,
          body: "",
          price: "50",
        };
        const result = articleFormSchema.safeParse(input);
        const errorFields = result.error?.issues.map((issue) => issue.path[0]);

        expect(result.success).toBe(false);
        expect(errorFields).toStrictEqual(["body", "body"]);
      });
      it.each([1, PAID_ARTICLE_BODY_MIN_LENGTH - 1])(
        "%s 文字はパースできない",
        (length) => {
          const input = {
            ...validInput,
            body: "あ".repeat(length),
            price: "50",
          };
          const result = articleFormSchema.safeParse(input);
          const errorFields = result.error?.issues.map(
            (issue) => issue.path[0],
          );

          expect(result.success).toBe(false);
          expect(errorFields).toStrictEqual(["body"]);
        },
      );
      it(`${PAID_ARTICLE_BODY_MIN_LENGTH} 文字はパースできる`, () => {
        const body = "あ".repeat(PAID_ARTICLE_BODY_MIN_LENGTH);
        const input = {
          ...validInput,
          body,
          price: "50",
        };
        const result = articleFormSchema.safeParse(input);

        expect(result.success).toBe(true);
        expect(result.data?.body).toBe(body);
      });
    });
  });
  describe("status", () => {
    it.each([null, "deleted"])("%j はパースできない", (status) => {
      const input = {
        ...validInput,
        status,
      };
      const result = articleFormSchema.safeParse(input);
      const errorFields = result.error?.issues.map((issue) => issue.path[0]);

      expect(result.success).toBe(false);
      expect(errorFields).toStrictEqual(["status"]);
    });
    it.each(["draft", "published"])("%j はパースできる", (status) => {
      const input = {
        ...validInput,
        status,
      };
      const result = articleFormSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe(status);
    });
  });
  describe("price", () => {
    it.each(["", "abc", "500.5", "-1", "49", "50001"])(
      "%j はパースできない",
      (price) => {
        const input = {
          ...validInput,
          price,
        };
        const result = articleFormSchema.safeParse(input);
        const errorFields = result.error?.issues.map((issue) => issue.path[0]);

        expect(result.success).toBe(false);
        expect(errorFields).toStrictEqual(["price"]);
      },
    );
    it("前後に半角スペースがある数字はパースできる", () => {
      const input = {
        ...validInput,
        price: " 100 ",
      };
      const result = articleFormSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.price).toBe(100);
    });
    it.each([
      ["0", 0],
      ["50", 50],
      ["50000", 50000],
    ])("%j は %i にパースできる", (price, expected) => {
      const input = {
        ...validInput,
        price,
      };
      const result = articleFormSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.price).toBe(expected);
    });
  });
  describe("coverImagePath", () => {
    it("空文字をパースして null に変換する", () => {
      const input = {
        ...validInput,
        coverImagePath: "",
      };
      const result = articleFormSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.coverImagePath).toBeNull();
    });
    it.each(["jpg", "png", "webp"])(
      "末尾が %s の文字列をパースできる",
      (extension) => {
        const coverImagePath = `11111111-1111-1111-1111-111111111111/covers/V1StGXR8Z5jdHi6BmyT8s.${extension}`;
        const input = {
          ...validInput,
          coverImagePath,
        };
        const result = articleFormSchema.safeParse(input);

        expect(result.success).toBe(true);
        expect(result.data?.coverImagePath).toBe(coverImagePath);
      },
    );
    it.each([
      [
        "想定より階層の深い文字列",
        "dir/11111111-1111-1111-1111-111111111111/covers/V1StGXR8Z5jdHi6BmyT8s.jpg",
      ],
      [
        "末尾に拡張子以外の文字がある文字列",
        "11111111-1111-1111-1111-111111111111/covers/V1StGXR8Z5jdHi6BmyT8s.jpg?x=1",
      ],
      [
        "'covers' を含まない文字列",
        "11111111-1111-1111-1111-111111111111/other/V1StGXR8Z5jdHi6BmyT8s.jpg",
      ],
      [
        "先頭が uuid ではない文字列",
        "user-id/covers/V1StGXR8Z5jdHi6BmyT8s.jpg",
      ],
      [
        "末尾が拡張子でない文字列",
        "11111111-1111-1111-1111-111111111111/covers/V1StGXR8Z5jdHi6BmyT8s",
      ],
      [
        "末尾が許可された拡張子でない文字列",
        "11111111-1111-1111-1111-111111111111/covers/V1StGXR8Z5jdHi6BmyT8s.pdf",
      ],
      ["数字", 123],
    ])("%s はパースできない", (_, coverImagePath) => {
      const input = {
        ...validInput,
        coverImagePath,
      };
      const result = articleFormSchema.safeParse(input);
      const errorFields = result.error?.issues.map((issue) => issue.path[0]);

      expect(result.success).toBe(false);
      expect(errorFields).toStrictEqual(["coverImagePath"]);
    });
  });
});
