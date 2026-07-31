import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

export type MeResponse = {
  user: {
    id: number;
    name: string;
    nickname: string | null;
    iconUrl: string | null;
  };
};

export type UpdateMeRequestBody = {
  name: string;
  nickname: string | null;
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

  try {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
      select: { id: true, name: true, nickname: true, iconUrl: true },
    });
    if (!dbUser) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 },
      );
    }
    return NextResponse.json<MeResponse>({ user: dbUser }, { status: 200 });
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
