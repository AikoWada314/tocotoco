import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getBlockedUserIds, getCurrentUser } from "@/app/_libs/currentUser";

//スポット詳細の型定義
export type SpotShowResponse = {
  spot: {
    id: number;
    name: string;
    description: string | null;
    address: string;
    lat: number;
    lng: number;
    categoryId: number;
    images: {
      imageUrl: string;
    }[];
    reviews: {
      id: number;
      rating: number;
      comment: string | null;
      createdAt: Date;
      user: {
        id: number;
        name: string;
        iconUrl: string | null;
      };
      images: {
        imageUrl: string;
      }[];
    }[];
    favorites: {
      userId: number;
    }[];
  };
};

//スポット詳細の取得
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  try {
    const me = await getCurrentUser(request);
    const blockedUserIds = await getBlockedUserIds(me?.id);
    const spot = await prisma.spot.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        categoryId: true,
        images: {
          select: { imageUrl: true },
        },
        reviews: {
          where: { userId: { notIn: blockedUserIds } }, // ブロック中のユーザーの口コミは出さない
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, name: true, iconUrl: true } },
            images: { select: { imageUrl: true } },
          },
        },
        favorites: {
          select: { userId: true }, // お気に入り判定用
        },
      },
    });
    if (!spot) {
      return NextResponse.json(
        { message: "スポットが見つかりません" },
        { status: 404 },
      );
    }
    return NextResponse.json<SpotShowResponse>({ spot }, { status: 200 });
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
