import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";

//イベント詳細の型定義
export type EventShowResponse = {
  event: {
    id: number;
    title: string;
    description: string | null;
    eventDate: Date;
    eventEndDate: Date | null;
    place: string;
    lat: number;
    lng: number;
    organizerName: string;
    organizerLink: string | null;
    images: {
      id: number;
      imageUrl: string;
    }[];
    favorites: {
      userId: number;
    }[];
  };
};

//イベント詳細の取得
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        eventEndDate: true,
        place: true,
        lat: true,
        lng: true,
        organizerName: true,
        organizerLink: true,
        images: {
          select: { id: true, imageUrl: true }, // 画像も必要な2つだけ
        },
        favorites: {
          select: { userId: true }, // お気に入り判定用
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { message: "イベントが見つかりません" },
        { status: 404 },
      );
    }
    return NextResponse.json<EventShowResponse>({ event }, { status: 200 });
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
