
import { supabase } from "./supabase";

// キーを渡すと、表示用の公開URLを返す関数
export const getPostImageUrl = (key: string) => {
  return supabase.storage.from("post_images").getPublicUrl(key).data.publicUrl;
};
