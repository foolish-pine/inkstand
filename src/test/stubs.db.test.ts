import { describe, expect, it } from "vitest";
import { requireUser } from "@/lib/current-user";
import { signInAs } from "@/test/current-user-stub";

// スタブの差し替えが効いているかを見張る。vitest.db.config.mts の alias は
// 先に一致したものが使われるため、"@/" の総称を個別の差し替えより前に
// 置くと本物が読み込まれてしまう。壊れたときにここが最初に落ちる。
describe("current-user のスタブ", () => {
  it("signInAs で指定した人になる", async () => {
    signInAs("11111111-1111-1111-1111-111111111111");
    const user = await requireUser();
    expect(user.id).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("指定しないと落ちる（前のテストの人が残らない）", async () => {
    await expect(requireUser()).rejects.toThrow("signInAs()");
  });
});
