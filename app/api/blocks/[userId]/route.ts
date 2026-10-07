import { prisma } from "@/app/_libs/prisma";
import { getCurrentUser } from "@/app/_libs/currentUser";
import { NextRequest, NextResponse } from "next/server";

//ブロックを解除する
export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) => {
  const me = await getCurrentUser(request);
  if (!me) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

  const { userId } = await params;
  try {
    await prisma.userBlock.deleteMany({
      where: { blockerId: me.id, blockedId: Number(userId) },
    });
    return NextResponse.json(
      { message: "ブロックを解除しました" },
      { status: 200 },
    );
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
