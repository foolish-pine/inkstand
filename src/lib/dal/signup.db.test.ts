import { describe, expect, it } from "vitest";
import {
  createProfile,
  DuplicatedUsernameError,
  isUsernameTaken,
} from "@/lib/dal/signup";
import { createTestAuthUser, createTestUser } from "@/test/fixtures";

describe("isUsernameTaken", () => {
  it("username が既に使用されていれば、true を返す", async () => {
    const { username } = await createTestUser();
    const result = await isUsernameTaken(username);

    expect(result).toBe(true);
  });
  it("大文字小文字に関わらず文字が同じ username が既に使用されていれば、true を返す", async () => {
    const { username } = await createTestUser();
    const result = await isUsernameTaken(username.toUpperCase());

    expect(result).toBe(true);
  });
  it("username が使用されていなければ、false を返す", async () => {
    await createTestUser();
    const result = await isUsernameTaken("otherUsername");

    expect(result).toBe(false);
  });
});

describe("createProfile", () => {
  it("profiles を作成する", async () => {
    const userId = await createTestAuthUser();
    const username = "username";
    const result = await createProfile(userId, username);

    expect(result?.id).toStrictEqual(userId);
    expect(result?.username).toStrictEqual(username);
    expect(result?.displayName).toStrictEqual(username);
  });
  it("username が既存のものと重複する場合、DuplicatedUsernameError が投げられる", async () => {
    const userId = await createTestAuthUser();
    const otherUserId = await createTestAuthUser();
    const username = "taken-name";
    await createProfile(userId, username);

    await expect(createProfile(otherUserId, username)).rejects.toBeInstanceOf(
      DuplicatedUsernameError,
    );
  });
});
