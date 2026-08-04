import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

export type MyNotificationsResponse = {
  notifications: {
    id: number;
    isRead: boolean;
    notification: {
      id: number;
      title: string;
      content: string;
      type: string;
      createdAt: Date;
    };
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
    const notifications = await prisma.userNotification.findMany({
      where: { user: { supabaseUserId: user.id } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        isRead: true,
        notification: {
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json<MyNotificationsResponse>(
      { notifications },
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
