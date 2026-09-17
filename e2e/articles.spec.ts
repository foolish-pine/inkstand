import { expect, test } from "@playwright/test";
import { createTestUser, signIn } from "./helpers";

test.describe("記事の作成", () => {
  test("ログイン後新規記事を作成でき、新着記事一覧に作成した記事のタイトルが表示される", async ({
    page,
    browser,
  }) => {
    const { email, password } = await createTestUser(browser);

    await signIn(page, {
      email,
      password,
    });

    await page.getByRole("link", { name: "記事を書く" }).click();

    const randomID = crypto.randomUUID().slice(0, 8);
    await page.getByLabel("タイトル").fill(randomID);
    await page.getByLabel("本文").fill(randomID);
    await page.getByRole("radio", { name: "公開" }).click();
    await page.getByLabel("価格（円）").fill("0");
    await page.getByRole("button", { name: "保存する" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("heading", { name: "ダッシュボード" }),
    ).toBeVisible();

    await page.goto("/");

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "新着記事一覧" }),
    ).toBeVisible();
    await expect(
      page.getByRole("list").getByRole("heading", { name: randomID }),
    ).toBeVisible();
  });

  test("ログイン後新規記事を作成でき、下書き状態の記事は新着記事一覧に表示されない", async ({
    page,
    browser,
  }) => {
    const { email, password } = await createTestUser(browser);

    await signIn(page, {
      email,
      password,
    });

    await page.getByRole("link", { name: "記事を書く" }).click();

    const randomID = crypto.randomUUID().slice(0, 8);
    await page.getByLabel("タイトル").fill(randomID);
    await page.getByLabel("本文").fill(randomID);
    await page.getByRole("radio", { name: "下書き" }).click();
    await page.getByLabel("価格（円）").fill("0");
    await page.getByRole("button", { name: "保存する" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("heading", { name: "ダッシュボード" }),
    ).toBeVisible();

    await page.goto("/");

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "新着記事一覧" }),
    ).toBeVisible();
    await expect(
      page.getByRole("list").getByRole("heading", { name: randomID }),
    ).toHaveCount(0);
  });
});
