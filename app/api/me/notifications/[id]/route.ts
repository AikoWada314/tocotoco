import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const authUser = await getAuthUser(request);
  if (!authUser)
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );

  try {
    const result = await prisma.userNotification.updateMany({
      where: { id: Number(id), user: { supabaseUserId: authUser.id } }, // どの UserNotification を
      data: { isRead: true }, // 既読にする
      
    });
    // 自分の通知でなければ1件も更新されない（count が 0）
    if (result.count === 0) {
      return NextResponse.json(
        { message: "対象が見つかりません" },
        { status: 404 },
      );
    }
    return NextResponse.json({ isRead: true }, { status: 200 });
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
