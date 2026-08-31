import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";
import { Prisma } from "@/app/generated/prisma/client";

export type MeResponse = {
  user: {
    id: number;
    name: string;
    nickname: string;
    iconUrl: string | null;
  };
};

export type UpdateMeRequestBody = {
  name: string;
  nickname: string;
  iconUrl: string | null;
};

//ログイン中のユーザー情報の取得
export const GET = async (request: NextRequest) => {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

  // 新規作成時のニックネーム候補（登録フォーム入力 → メール@前の掃除 → 固定値）
  const baseNickname =
    user.user_metadata?.nickname ??
    (user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") ||
      "user");

  const upsertUser = (nickname: string) =>
    prisma.user.upsert({
      where: { supabaseUserId: user.id },
      select: { id: true, name: true, nickname: true, iconUrl: true },
      update: {},
      create: {
        supabaseUserId: user.id,
        name:
          user.user_metadata?.name ?? user.email?.split("@")[0] ?? "ユーザー",
        role: "user",
        status: "active",
        nickname,
      },
    });

  try {
    const dbUser = await upsertUser(baseNickname);
    return NextResponse.json<MeResponse>({ user: dbUser }, { status: 200 });
  } catch (error) {
    // ニックネームが既存ユーザーと衝突(P2002)した場合のみ、サフィックスを付けて一度だけ再試行
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const retryNickname = `${baseNickname.slice(0, 15)}_${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      const dbUser = await upsertUser(retryNickname);
      return NextResponse.json<MeResponse>({ user: dbUser }, { status: 200 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "予期せぬエラーが発生しました" },
      { status: 500 },
    );
  }
};

//更新用
export const PATCH = async (request: NextRequest) => {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }
  try {
    const body: UpdateMeRequestBody = await request.json();
    const { name, nickname, iconUrl } = body;

    const updated = await prisma.user.update({
      where: { supabaseUserId: authUser.id }, // どのユーザーを
      data: { name, nickname, iconUrl }, // 何に更新するか
      select: { id: true, name: true, nickname: true, iconUrl: true },
    });
    return NextResponse.json<MeResponse>({ user: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "予期せぬエラーが発生しました" },
      { status: 500 },
    );
  }
};
