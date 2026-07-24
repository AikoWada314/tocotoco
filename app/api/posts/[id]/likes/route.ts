import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

// POSTという命名にすることで、POSTリクエストの時にこの関数が呼ばれる
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }
  try {
    // 既にいいね済みか確認
    const existing = await prisma.postLike.findFirst({
      where: {
        postId: Number(id),
        user: { supabaseUserId: authUser.id }, // リレーション経由で絞る(userIdを知らなくていい)
      },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false }, { status: 200 });
    }
    await prisma.postLike.create({
      data: {
        user: { connect: { supabaseUserId: authUser.id } },
        post: { connect: { id: Number(id) } },
      },
    });

    return NextResponse.json({ liked: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }
};
