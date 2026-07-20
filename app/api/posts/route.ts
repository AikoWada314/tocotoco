import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

//投稿一覧の型定義
export type PostsIndexResponse = {
  posts: {
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
    comments: {
      id: number;
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
  }[];
};

//投稿一覧の取得
export const GET = async () => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        category: true,
        images: true,
        likes: true,
        favorites: true,
        comments: true,
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            iconUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json<PostsIndexResponse>({ posts }, { status: 200 });
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
export type CreatePostRequestBody = {
  content: string;
  categoryId: number;
  imageUrls?: string[];
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
    const body: CreatePostRequestBody = await request.json();
    const { content, categoryId, imageUrls } = body;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: authUser.id },
    });
    if (!dbUser) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 },
      );
    }

    await prisma.post.create({
      data: {
        content,
        categoryId,
        userId: dbUser.id,
        isDraft: false,
        ...(imageUrls?.length
          ? { images: { create: imageUrls?.map((imageUrl) => ({ imageUrl}))}}
          : {}),
        },
    });

    return NextResponse.json({ message: "投稿を作成しました" }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }
};
