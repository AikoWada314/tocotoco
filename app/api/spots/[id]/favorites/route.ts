import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

// POSTで呼ばれる。押すたびにお気に入り登録/解除を切り替えるトグル
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
    // 既にお気に入り済みか確認
    const existing = await prisma.spotFavorite.findFirst({
      where: {
        spotId: Number(id),
        user: { supabaseUserId: authUser.id }, // リレーション経由で絞る(userIdを知らなくていい)
      },
    });

    if (existing) {
      await prisma.spotFavorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false }, { status: 200 });
    }
    await prisma.spotFavorite.create({
      data: {
        user: { connect: { supabaseUserId: authUser.id } },
        spot: { connect: { id: Number(id) } },
      },
    });

    return NextResponse.json({ favorited: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }
};
