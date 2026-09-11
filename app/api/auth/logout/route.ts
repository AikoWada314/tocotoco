import { NextResponse } from "next/server";
import { createClient } from "@/app/_libs/createClient";

// httpOnlyのセッションCookieはJSから消せないため、ログアウトもサーバーで行う
export const POST = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.json({ message: "ログアウトしました" }, { status: 200 });
};
