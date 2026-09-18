import { expect, test } from "@playwright/test";
import { createTestUser, signIn } from "./helpers";

test.describe("記事操作の権限", () => {
  test("ユーザーは別のユーザーの記事の編集画面にアクセスできない", async ({
    page,
    browser,
  }) => {
    const { email: authorEmail, password: authorPassword } =
      await createTestUser(browser);

    await signIn(page, {
      email: authorEmail,
      password: authorPassword,
    });

    await page.getByRole("link", { name: "記事を書く" }).click();

    const randomID = crypto.randomUUID().slice(0, 8);
    await page.getByLabel("タイトル").fill(randomID);
    await page.getByLabel("本文").fill(randomID);
    await page.getByRole("radio", { name: "公開" }).click();
    await page.getByLabel("価格（円）").fill("0");
    await page.getByRole("button", { name: "保存する" }).click();

    await expect(page).toHaveURL("/dashboard");

    await page.getByRole("link", { name: randomID }).click();
    await expect(
      page.getByRole("heading", { name: "記事を編集する" }),
    ).toBeVisible();
    const articleUrl = page.url();

    await page.getByRole("button", { name: "ログアウト" }).click();

    await expect(page).toHaveURL("/login");

    const { email: editorEmail, password: editorPassword } =
      await createTestUser(browser);

    await signIn(page, {
      email: editorEmail,
      password: editorPassword,
    });

    await expect(page).toHaveURL("/dashboard");

    await page.goto(articleUrl);
    await expect(page).toHaveURL(articleUrl);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });

  test("ユーザーは別のユーザーの記事を更新できない", async ({
    page,
    browser,
  }) => {
    const { email: authorEmail, password: authorPassword } =
      await createTestUser(browser);

    await signIn(page, {
      email: authorEmail,
      password: authorPassword,
    });

    await page.getByRole("link", { name: "記事を書く" }).click();

    const authorRandomID = crypto.randomUUID().slice(0, 8);
    await page.getByLabel("タイトル").fill(authorRandomID);
    await page.getByLabel("本文").fill(authorRandomID);
    await page.getByRole("radio", { name: "公開" }).click();
    await page.getByLabel("価格（円）").fill("0");
    await page.getByRole("button", { name: "保存する" }).click();

    await expect(page).toHaveURL("/dashboard");

    await page.goto("/");
    await expect(
      page.getByRole("list").getByRole("heading", { name: authorRandomID }),
    ).toBeVisible();
    const authorArticleUrl = await page
      .getByRole("link", { name: authorRandomID })
      .getAttribute("href");

    if (!authorArticleUrl) throw Error("href is missing");

    const authorArticleId = authorArticleUrl.split("/").at(-1);

    if (!authorArticleId) throw Error("authorArticleId is missing");

    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
    await page.getByRole("button", { name: "ログアウト" }).click();

    await expect(page).toHaveURL("/login");

    const { email: editorEmail, password: editorPassword } =
      await createTestUser(browser);

    await signIn(page, {
      email: editorEmail,
      password: editorPassword,
    });

    await expect(page).toHaveURL("/dashboard");

    await page.getByRole("link", { name: "記事を書く" }).click();

    const editorRandomID = crypto.randomUUID().slice(0, 8);
    await page.getByLabel("タイトル").fill(editorRandomID);
    await page.getByLabel("本文").fill(editorRandomID);
    await page.getByRole("radio", { name: "公開" }).click();
    await page.getByLabel("価格（円）").fill("0");
    await page.getByRole("button", { name: "保存する" }).click();

    await page.getByRole("link", { name: editorRandomID }).click();
    await expect(
      page.getByRole("heading", { name: "記事を編集する" }),
    ).toBeVisible();
    const editorArticleUrl = page.url();

    await page.evaluate((id) => {
      const articleIdInput = document.getElementsByName("articleId")[0];

      if (!articleIdInput || !(articleIdInput instanceof HTMLInputElement))
        throw Error("articleId field is missing");

      articleIdInput.value = id;
    }, authorArticleId);
    await page.getByLabel("タイトル").fill("new title");
    await page.getByRole("button", { name: "保存する" }).click();

    await expect(page).toHaveURL(editorArticleUrl);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();

    await page.goto(authorArticleUrl);
    await expect(
      page.getByRole("heading", { name: authorRandomID }),
    ).toBeVisible();
  });

  test("ユーザーは別のユーザーの記事を削除できない", async ({
    page,
    browser,
  }) => {
    const { email: authorEmail, password: authorPassword } =
      await createTestUser(browser);

    await signIn(page, {
      email: authorEmail,
      password: authorPassword,
    });

    await page.getByRole("link", { name: "記事を書く" }).click();

    const authorRandomID = crypto.randomUUID().slice(0, 8);
    await page.getByLabel("タイトル").fill(authorRandomID);
    await page.getByLabel("本文").fill(authorRandomID);
    await page.getByRole("radio", { name: "公開" }).click();
    await page.getByLabel("価格（円）").fill("0");
    await page.getByRole("button", { name: "保存する" }).click();

    await expect(page).toHaveURL("/dashboard");

    await page.goto("/");
    await expect(
      page.getByRole("list").getByRole("heading", { name: authorRandomID }),
    ).toBeVisible();
    const authorArticleUrl = await page
      .getByRole("link", { name: authorRandomID })
      .getAttribute("href");

    if (!authorArticleUrl) throw Error("href is missing");

    const authorArticleId = authorArticleUrl.split("/").at(-1);

    if (!authorArticleId) throw Error("authorArticleId is missing");

    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
    await page.getByRole("button", { name: "ログアウト" }).click();

    await expect(page).toHaveURL("/login");

    const { email: editorEmail, password: editorPassword } =
      await createTestUser(browser);

    await signIn(page, {
      email: editorEmail,
      password: editorPassword,
    });

    await expect(page).toHaveURL("/dashboard");

    await page.getByRole("link", { name: "記事を書く" }).click();

    const editorRandomID = crypto.randomUUID().slice(0, 8);
    await page.getByLabel("タイトル").fill(editorRandomID);
    await page.getByLabel("本文").fill(editorRandomID);
    await page.getByRole("radio", { name: "公開" }).click();
    await page.getByLabel("価格（円）").fill("0");
    await page.getByRole("button", { name: "保存する" }).click();

    await page.getByRole("link", { name: editorRandomID }).click();
    await expect(
      page.getByRole("heading", { name: "記事を編集する" }),
    ).toBeVisible();
    const editorArticleUrl = page.url();

    await page.getByRole("button", { name: "この記事を削除する" }).click();
    await page
      .getByRole("dialog")
      .locator('input[name="articleId"]')
      .evaluate((el: HTMLInputElement, id) => {
        el.value = id;
      }, authorArticleId);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "削除する" })
      .click();

    await expect(page).toHaveURL(editorArticleUrl);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();

    await page.goto(authorArticleUrl);
    await expect(
      page.getByRole("heading", { name: authorRandomID }),
    ).toBeVisible();
  });
});
