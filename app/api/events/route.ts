import { getAuthUser } from "@/app/_libs/auth";
import { prisma } from "@/app/_libs/prisma";
import { NextResponse, NextRequest } from "next/server";

//イベント一覧の型定義
export type EventsIndexResponse = {
  events: {
    id: number;
    title: string;
    description: string | null;
    eventDate: Date;
    eventEndDate: Date | null,
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
export const GET = async (request: NextRequest) => {
  try {
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");

    // 期間指定(カレンダー用)があればその範囲、なければ今日以降(直近リスト用)
    const where =
      from && to
        ? { eventDate: { gte: new Date(from), lte: new Date(to) } }
        : { eventDate: { gte: new Date() } };

    const events = await prisma.event.findMany({
      where,
      include: {
        images: true,
      },
      orderBy: {
        eventDate: "asc",
      },
      take: from && to ? undefined : 10, // 直近リストのときだけ10件に制限
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

//新規投稿
export type CreateEventRequestBody = {
  title: string;
  eventDate: string;
  eventEndDate?: string;
  place: string;
  organizerName: string;
  organizerLink?: string;
  description?: string;
  imageUrl?: string;
  lat: number;
  lng: number;
};

// POSTという命名にすることで、POSTリクエストの時にこの関数が呼ばれる
export const POST = async (request: NextRequest) => {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

  try {
    const body: CreateEventRequestBody = await request.json();
    const {
      title,
      eventDate,
      eventEndDate,
      place,
      organizerName,
      organizerLink,
      description,
      lat,
      lng,
      imageUrl,
    } = body;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: authUser.id },
    });
    if (!dbUser) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 },
      );
    }

    await prisma.event.create({
      data: {
        title,
        eventDate: new Date(eventDate),
        eventEndDate: eventEndDate ? new Date(eventEndDate) : undefined,
        place,
        organizerName,
        organizerLink,
        description,
        lat,
        lng,
        createdBy: dbUser.id,
        status: "published",
        ...(imageUrl ? { images: { create: { imageUrl } } } : {}),
      },
    });

    return NextResponse.json(
      { message: "イベントを作成しました" },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }
};
