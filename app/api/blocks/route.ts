import { prisma } from "@/app/_libs/prisma";
import { getCurrentUser } from "@/app/_libs/currentUser";
import { NextRequest, NextResponse } from "next/server";

export type BlocksIndexResponse = {
  blocks: {
    id: number;
    createdAt: Date;
    blocked: {
      id: number;
      name: string;
      nickname: string;
      iconUrl: string | null;
    };
  }[];
};

export type CreateBlockRequestBody = {
  userId: number;
};

//自分がブロックしているユーザー一覧
export const GET = async (request: NextRequest) => {
  const me = await getCurrentUser(request);
  if (!me) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

  try {
    const blocks = await prisma.userBlock.findMany({
      where: { blockerId: me.id },
      select: {
        id: true,
        createdAt: true,
        blocked: {
          select: { id: true, name: true, nickname: true, iconUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json<BlocksIndexResponse>({ blocks }, { status: 200 });
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

//ユーザーをブロックする
export const POST = async (request: NextRequest) => {
  const me = await getCurrentUser(request);
  if (!me) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

  try {
    const { userId }: CreateBlockRequestBody = await request.json();
    if (!Number.isInteger(userId) || userId === me.id) {
      return NextResponse.json(
        { message: "このユーザーはブロックできません" },
        { status: 400 },
      );
    }
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 },
      );
    }

    await prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId: me.id, blockedId: userId } },
      update: {},
      create: { blockerId: me.id, blockedId: userId },
    });
    return NextResponse.json({ message: "ブロックしました" }, { status: 201 });
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
