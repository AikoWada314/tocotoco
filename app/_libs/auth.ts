import { supabase } from "./supabase";

//ログイン中のユーザー情報の取得
export const getAuthUser = async (request: Request) => {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
  }