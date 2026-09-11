
import { supabase } from "./supabase";
import type { CreateUploadResponse } from "@/app/api/uploads/route";

// キーを渡すと、表示用の公開URLを返す関数
export const getPostImageUrl = (key: string) => {
  return supabase.storage.from("post_images").getPublicUrl(key).data.publicUrl;
};

// 画像1枚をStorageへアップロードして保存キーを返す。
// ログイン確認はサーバー(/api/uploads)が行い、ブラウザは発行された
// 署名付きトークンで直接Storageへ送る(CookieがhttpOnlyでもアップロードできる方式)
export const uploadImage = async (file: File): Promise<string> => {
  const ext = file.name.split(".").pop() ?? "";

  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext }),
  });
  if (!res.ok) {
    throw new Error("画像のアップロード準備に失敗しました");
  }
  const { path, token }: CreateUploadResponse = await res.json();

  const { error } = await supabase.storage
    .from("post_images")
    .uploadToSignedUrl(path, token, file);
  if (error) {
    throw new Error(error.message);
  }

  return path;
};
