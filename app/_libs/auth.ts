import { createClient } from "./createClient";

//ログイン中のユーザー情報の取得
export const getAuthUser = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};
