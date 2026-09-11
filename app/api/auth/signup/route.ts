import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/_libs/createClient";

export type SignupRequestBody = {
  email: string;
  password: string;
  name: string;
  nickname: string;
};

export const POST = async (request: NextRequest) => {
  const { email, password, name, nickname }: SignupRequestBody =
    await request.json();

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, nickname },
    },
  });

  if (error) {
    return NextResponse.json(
      { message: "登録に失敗しました。もう一度お試しください。" },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: "確認メールを送信しました" }, { status: 200 });
};
