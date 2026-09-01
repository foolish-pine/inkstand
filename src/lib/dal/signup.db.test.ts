import { describe, expect, it } from "vitest";
import { createProfile, DuplicatedUsernameError } from "@/lib/dal/signup";
import { createTestAuthUser } from "@/test/fixtures";

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
