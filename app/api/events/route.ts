import { prisma } from "@/app/_libs/prisma";
import { NextResponse } from "next/server";

//イベント一覧の型定義
export type EventsIndexResponse = {
  events: {
    id: number;
    title: string;
    description: string | null;
    eventDate: Date;
    place: string;
    lat: number;
    lng: number;
    organizerName: string;
    organizerLink: string | null;
    createdBy: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    images: {
      id: number;
      eventId: number;
      imageUrl: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }[];
};

//イベント一覧の取得
export const GET = async () => {
  try {
    const events = await prisma.event.findMany({
      include: {
        images: true,
      },
      orderBy: {
        eventDate: "asc"
      },
    });
    return NextResponse.json<EventsIndexResponse>({ events }, { status: 200 });
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

