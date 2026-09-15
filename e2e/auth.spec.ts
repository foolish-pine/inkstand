import { expect, test } from "@playwright/test";
import { createTestUser, signIn } from "./helpers";

test.describe("サインアップ・ログイン・ログアウト", () => {
  test("サインアップでき、成功後ダッシュボードページに遷移する", async ({
    page,
  }) => {
    await page.goto("/signup");

    const randomID = crypto.randomUUID().slice(0, 8);
    const email = `test-${randomID}@example.com`;
    const password = "EVX6znj@nry6dzp8wuj";

    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード").fill(password);
    await page.getByLabel("ユーザー名").fill(`test_${randomID}`);
    await page.getByRole("button", { name: "アカウントを作成" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("heading", { name: "ダッシュボード" }),
    ).toBeVisible();
  });

  test("ログインでき、成功後ダッシュボードページに遷移する", async ({
    page,
    browser,
  }) => {
    const { email, password } = await createTestUser(browser);

    await page.goto("/login");

    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード").fill(password);
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByRole("heading", { name: "ダッシュボード" }),
    ).toBeVisible();
  });

  test("誤ったパスワードではログインできず、エラーメッセージが表示される", async ({
    page,
    browser,
  }) => {
    const { email, password } = await createTestUser(browser);

    await page.goto("/login");

    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード").fill(password.slice(0, 1));
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
    await expect(
      page.getByText(
        "ログインに失敗しました。メールアドレスとパスワードをご確認の上もう一度お試しください。",
      ),
    ).toBeVisible();
  });

  test("ログアウトでき、成功後ログインページに遷移する", async ({
    page,
    browser,
  }) => {
    const { email, password } = await createTestUser(browser);

    await signIn(page, {
      email,
      password,
    });

    await page.getByRole("button", { name: "ログアウト" }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  });
});
