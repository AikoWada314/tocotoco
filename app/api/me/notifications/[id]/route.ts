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
    await prisma.userNotification.update({
      where: { id: Number(id) }, // どの UserNotification を
      data: { isRead: true }, // 既読にする
    });
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
