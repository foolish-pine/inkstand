import { type Browser, type Page, expect } from "@playwright/test";

export async function createTestUser(browser: Browser): Promise<{
  email: string;
  password: string;
  username: string;
}> {
  const randomID = crypto.randomUUID().slice(0, 8);
  const email = `test-${randomID}@example.com`;
  const password = "EVX6znj@nry6dzp8wuj";
  const username = `test_${randomID}`;

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/signup");

  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill(password);
  await page.getByLabel("ユーザー名").fill(username);
  await page.getByRole("button", { name: "アカウントを作成" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(
    page.getByRole("heading", { name: "ダッシュボード" }),
  ).toBeVisible();

  await context.close();

  return {
    email,
    password,
    username,
  };
}

export async function signIn(
  page: Page,
  {
    email,
    password,
  }: {
    email: string;
    password: string;
  },
): Promise<void> {
  await page.goto("/login");

  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(
    page.getByRole("heading", { name: "ダッシュボード" }),
  ).toBeVisible();
}
