import { NextRequest, NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/app/_libs/createClient";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  // オープンリダイレクト対策: 遷移先はこのアプリ内のパスだけを許可する
  const next = searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  const supabase = await createClient();

  // Google認証(OAuth)やパスワード再設定メールから戻ってきた場合:
  // codeをセッションに交換してCookie(httpOnly)に保存する
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(safeNext ?? "/posts", request.url));
    }

    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", request.url),
    );
  }

  // メール内リンクの検証。Cookie対応クライアントなので検証と同時にログイン状態になる
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });

    if (!error) {
      // パスワード再設定はこのセッションを使って新パスワードを入力してもらう
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/auth/reset-password", request.url));
      }
      return NextResponse.redirect(new URL(safeNext ?? "/", request.url));
    }
  }

  return NextResponse.redirect(new URL("/auth/login?error=confirmation_failed", request.url));
};
