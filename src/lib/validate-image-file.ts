type ValidateImageFileResult =
  | {
      success: true;
      extension: string;
    }
  | {
      success: false;
      message: string;
    };

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImageFile({
  type,
  size,
}: {
  type: string;
  size: number;
}): ValidateImageFileResult {
  const extension = ALLOWED_MIME[type];

  if (extension === undefined)
    return {
      success: false,
      message: "アップロード可能なのはjpeg、png、webpのいずれかです。",
    };

  if (size > MAX_FILE_SIZE)
    return {
      success: false,
      message: "10MB以下のファイルを選択してください。",
    };

  return {
    success: true,
    extension,
  };
}
