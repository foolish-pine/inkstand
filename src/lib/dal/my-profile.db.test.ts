import { describe, expect, it } from "vitest";
import { getMyProfile } from "./my-profile";
import { signInAs } from "@/test/current-user-stub";
import { createTestUser } from "@/test/fixtures";

describe("getMyProfile", () => {
  it("自分のプロフィールを取得する", async () => {
    const { userId: myId } = await createTestUser();
    await createTestUser();
    signInAs(myId);
    const result = await getMyProfile();

    expect(result?.id).toBe(myId);
  });
  it("プロフィールが無ければ undefined", async () => {
    await createTestUser();
    signInAs(crypto.randomUUID());
    const result = await getMyProfile();

    expect(result).toBeUndefined();
  });
});
