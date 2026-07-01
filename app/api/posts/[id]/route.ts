import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";

//投稿詳細の型定義
export type PostShowResponse = {
  post: {
    id: number;
    userId: number;
    content: string;
    images: {
      id: number;
      postId: number;
      imageUrl: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
    likes: {
      id: number;
      postId: number;
      userId: number;
      createdAt: Date;
      updatedAt: Date;
    }[];
    favorites: {
      id: number;
      postId: number;
      userId: number;
      createdAt: Date;
      updatedAt: Date;
    }[];
    isDraft: boolean;
    createdAt: Date;
    updatedAt: Date;
    category: {
      id: number;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    };
    user: {
      id: number;
      name: string;
      nickname: string | null;
      iconUrl: string | null;
    };
  };
};

//投稿詳細の取得
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
        images: true,
        likes: true,
        favorites: true,
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            iconUrl: true,
          },
        },
      },
    });
    if (!post) {
      return NextResponse.json(
        { message: "投稿が見つかりません" },
        { status: 404 },
      );
    }
    return NextResponse.json<PostShowResponse>({ post }, { status: 200 });
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

