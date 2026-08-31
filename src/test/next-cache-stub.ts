// Next.js の外（Vitest）では "use cache" の変換が走らないため、cacheTag などを
// 呼ぶと「cacheComponents が有効でない」と言われて落ちる。
//
// DB テストで確かめたいのは発行されるクエリであって、キャッシュの層ではない。
// キャッシュが効いているかはビルド出力（シェルのバイト数）で確認している。
// ここではキャッシュ関連の関数を何もしない実装に差し替え、素のクエリを走らせる。
export const cacheTag = () => {};
export const cacheLife = () => {};
export const updateTag = () => {};
export const revalidateTag = () => {};
export const revalidatePath = () => {};
export const refresh = () => {};
