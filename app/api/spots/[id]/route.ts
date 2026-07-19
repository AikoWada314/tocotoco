import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";

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
      rating: number;
      comment: string | null;
      createdAt: Date;
      user: {
        name: string;
      };
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
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { name: true } },
          },
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
