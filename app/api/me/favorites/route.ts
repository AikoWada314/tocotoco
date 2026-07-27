import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

export type MyFavoritesResponse = {
  spots: { id: number; name: string; images: { imageUrl: string }[] }[];
  events: {
    id: number;
    title: string;
    eventDate: Date;
    place: string;
    images: { imageUrl: string }[];
  }[];
  posts: {
    id: number;
    content: string;
    images: { imageUrl: string }[];
    user: { name: string; nickname: string | null; iconUrl: string | null };
  }[];
};

export const GET = async (request: NextRequest) => {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

  try {
    const [postFavs, spotFavs, eventFavs] = await Promise.all([
      prisma.postFavorite.findMany({
        where: { user: { supabaseUserId: user.id } },
        orderBy: { createdAt: "desc" },
        select: {
          post: {
            select: {
              id: true,
              content: true,
              images: { select: { imageUrl: true }, take: 1 },
              user: { select: { name: true, nickname: true, iconUrl: true } },
            },
          },
        },
      }),
      prisma.spotFavorite.findMany({
        where: { user: { supabaseUserId: user.id } },
        orderBy: { createdAt: "desc" },
        select: {
          spot: {
            select: {
              id: true,
              name: true,
              images: { select: { imageUrl: true }, take: 1 },
            },
          },
        },
      }),
      prisma.eventFavorite.findMany({
        where: { user: { supabaseUserId: user.id } },
        orderBy: { createdAt: "desc" },
        select: {
          event: {
            select: {
              id: true,
              title: true,
              eventDate: true,
              place: true,
              images: { select: { imageUrl: true }, take: 1 },
            },
          },
        },
      }),
    ]);

    const posts = postFavs.map((f) => f.post);
    const spots = spotFavs.map((f) => f.spot);
    const events = eventFavs.map((f) => f.event);

    return NextResponse.json<MyFavoritesResponse>(
      { spots, events, posts },
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
