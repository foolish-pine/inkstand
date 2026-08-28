import { describe, expect, it } from "vitest";
import { createArticleSchema } from "./create-article-schema";

const validInput = {
  title: "タイトル",
  body: "本文",
  status: "draft",
  price: "500",
};

describe("createArticleSchema", () => {
  it("正常な入力はパースできる", () => {
    const expectedOutput = {
      title: "タイトル",
      body: "本文",
      status: "draft",
      price: 500,
    };
    const result = createArticleSchema.safeParse(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toStrictEqual(expectedOutput);
  });
  describe("title", () => {
    it.each([0, 201])("%i 文字はパースできない", (length) => {
      const input = {
        ...validInput,
        title: "あ".repeat(length),
      };
      const result = createArticleSchema.safeParse(input);
      const errorFields = result.error?.issues.map((issue) => issue.path[0]);

      expect(result.success).toBe(false);
      expect(errorFields).toStrictEqual(["title"]);
    });
    it.each([1, 200])("%i 文字はパースできる", (length) => {
      const title = "あ".repeat(length);
      const input = {
        ...validInput,
        title,
      };
      const result = createArticleSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe(title);
    });
  });
  describe("body", () => {
    it("0 文字はパースできない", () => {
      const input = {
        ...validInput,
        body: "",
      };
      const result = createArticleSchema.safeParse(input);
      const errorFields = result.error?.issues.map((issue) => issue.path[0]);

      expect(result.success).toBe(false);
      expect(errorFields).toStrictEqual(["body"]);
    });
    it("1 文字はパースできる", () => {
      const body = "あ";
      const input = {
        ...validInput,
        body,
      };
      const result = createArticleSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.body).toBe(body);
    });
  });
  describe("status", () => {
    it.each([null, "deleted"])("%j はパースできない", (status) => {
      const input = {
        ...validInput,
        status,
      };
      const result = createArticleSchema.safeParse(input);
      const errorFields = result.error?.issues.map((issue) => issue.path[0]);

      expect(result.success).toBe(false);
      expect(errorFields).toStrictEqual(["status"]);
    });
    it.each(["draft", "published"])("%j はパースできる", (status) => {
      const input = {
        ...validInput,
        status,
      };
      const result = createArticleSchema.safeParse(input);

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
        const result = createArticleSchema.safeParse(input);
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
      const result = createArticleSchema.safeParse(input);

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
      const result = createArticleSchema.safeParse(input);

      expect(result.success).toBe(true);
      expect(result.data?.price).toBe(expected);
    });
  });
});
