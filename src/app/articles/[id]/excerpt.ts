// 有料記事の冒頭だけを切り出す。
//
// 文字数で機械的に切ると Markdown の記法が途中で壊れるため、段落の切れ目を
// 優先する。ただし「必ず切れること」がペイウォールの前提なので、1 段落目だけで
// 上限を超える場合は文字数で切り落とす。見た目より、全文が漏れないことを優先する。
export const EXCERPT_MAX_LENGTH = 400;

export type Excerpt = {
  text: string;
  hasMore: boolean;
};

const PARAGRAPH_SEPARATOR = /\n[ \t]*\n/;
const CODE_FENCE = "```";

// コードブロックの開始だけが残ると、以降の本文が丸ごとコードとして描画される。
// 対になっていない ``` があれば、その手前で切る。
function dropDanglingCodeFence(text: string): string {
  const fenceCount = text.split(CODE_FENCE).length - 1;

  if (fenceCount % 2 === 0) return text;

  return text.slice(0, text.lastIndexOf(CODE_FENCE)).trimEnd();
}

export function buildExcerpt(
  body: string,
  maxLength: number = EXCERPT_MAX_LENGTH,
): Excerpt {
  const paragraphs = body
    .split(PARAGRAPH_SEPARATOR)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== "");

  if (paragraphs.length === 0) return { text: "", hasMore: false };

  const taken: string[] = [];
  let length = 0;

  for (const paragraph of paragraphs) {
    const nextLength =
      taken.length === 0 ? paragraph.length : length + 2 + paragraph.length;

    // 1 段落目は長さにかかわらず必ず入れる。空の抜粋を作らないため。
    if (taken.length > 0 && nextLength > maxLength) break;

    taken.push(paragraph);
    length = nextLength;
  }

  const joined = taken.join("\n\n");

  if (joined.length > maxLength) {
    return {
      text: dropDanglingCodeFence(joined.slice(0, maxLength)),
      hasMore: true,
    };
  }

  return {
    text: dropDanglingCodeFence(joined),
    hasMore: taken.length < paragraphs.length,
  };
}
