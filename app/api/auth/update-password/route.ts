import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/_libs/createClient";

export type UpdatePasswordRequestBody = {
  password: string;
};

// パスワード再設定メールのリンク(/auth/callback)で作られたセッションを前提に更新する
export const POST = async (request: NextRequest) => {
  const { password }: UpdatePasswordRequestBody = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "再設定リンクが無効です。もう一度メールからやり直してください。" },
      { status: 401 },
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return NextResponse.json(
      { message: "パスワードの更新に失敗しました" },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: "パスワードを更新しました" }, { status: 200 });
};
