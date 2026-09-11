import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/_libs/createClient";

export type LoginRequestBody = {
  email: string;
  password: string;
};

// ログイン成功時はcreateClientのsetAll経由でセッションCookie(httpOnly)が書き込まれる
export const POST = async (request: NextRequest) => {
  const { email, password }: LoginRequestBody = await request.json();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json(
      { message: "メールアドレスまたはパスワードが正しくありません" },
      { status: 401 },
    );
  }

  return NextResponse.json({ message: "ログインしました" }, { status: 200 });
};
