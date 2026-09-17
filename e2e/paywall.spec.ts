import { expect, test } from "@playwright/test";
import { createTestUser, signIn } from "./helpers";

test.describe("有料記事のペイウォール", () => {
  test("未ログインの場合、有料記事は抜粋と有料である旨が表示され、本文全体は表示されない", async ({
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
    const firstParagraph = `抜粋-${randomID}` + "第1段落".repeat(1000);
    const secondParagraph = `続き-${randomID}` + "第2段落".repeat(1000);
    await page
      .getByLabel("本文")
      .fill(firstParagraph + "\n\n" + secondParagraph);
    await page.getByRole("radio", { name: "公開" }).click();
    await page.getByLabel("価格（円）").fill("100");
    await page.getByRole("button", { name: "保存する" }).click();

    await expect(page).toHaveURL("/dashboard");

    await page.getByRole("button", { name: "ログアウト" }).click();
    await page.goto("/");
    await page.getByRole("link", { name: randomID }).click();

    await expect(page.getByRole("heading", { name: randomID })).toBeVisible();
    await expect(page.getByText(`抜粋-${randomID}`)).toBeVisible();
    await expect(page.getByText(`続き-${randomID}`)).toHaveCount(0);
    await expect(page.getByText("ここから先は有料です")).toBeVisible();
  });

  test("著者本人には全文が表示される", async ({ page, browser }) => {
    const { email, password } = await createTestUser(browser);

    await signIn(page, {
      email,
      password,
    });

    await page.getByRole("link", { name: "記事を書く" }).click();

    const randomID = crypto.randomUUID().slice(0, 8);
    await page.getByLabel("タイトル").fill(randomID);
    const firstParagraph = `抜粋-${randomID}` + "第1段落".repeat(1000);
    const secondParagraph = `続き-${randomID}` + "第2段落".repeat(1000);
    await page
      .getByLabel("本文")
      .fill(firstParagraph + "\n\n" + secondParagraph);
    await page.getByRole("radio", { name: "公開" }).click();
    await page.getByLabel("価格（円）").fill("100");
    await page.getByRole("button", { name: "保存する" }).click();

    await expect(page).toHaveURL("/dashboard");

    await page.goto("/");
    await page.getByRole("link", { name: randomID }).click();

    await expect(page.getByRole("heading", { name: randomID })).toBeVisible();
    await expect(page.getByText(`抜粋-${randomID}`)).toBeVisible();
    await expect(page.getByText(`続き-${randomID}`)).toBeVisible();
  });
});
