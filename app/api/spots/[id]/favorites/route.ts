import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";
import { createNotification } from "@/app/_libs/notification";

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

    // 通知（付けた時だけ・失敗してもお気に入り自体は成功のまま）
    const spot = await prisma.spot.findUnique({
      where: { id: Number(id) },
      select: { createdBy: true }, // スポット作成者（受信者）
    });
    const actor = await prisma.user.findUnique({
      where: { supabaseUserId: authUser.id },
      select: { id: true, name: true }, // お気に入りした本人
    });
    if (spot && actor) {
      try {
        await createNotification({
          recipientUserId: spot.createdBy,
          actorUserId: actor.id,
          title: "お気に入り",
          content: `${actor.name}さんがあなたのスポットをお気に入りに追加しました`,
          type: "favorite",
        });
      } catch (e) {
        console.error("通知の作成に失敗", e);
      }
    }

    return NextResponse.json({ favorited: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }
};
