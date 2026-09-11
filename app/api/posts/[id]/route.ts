import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

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
    comments: {
      id: number;
      content: string;
      createdAt: Date;
      imageUrl: string | null;
      user: {
        id: number;
        name: string;
        nickname: string | null;
        iconUrl: string | null;
      };
    }[];
  };
};

export type UpdatePostRequestBody = {
  content: string;
  categoryId: number;
};

//投稿の更新(本人のみ。本文とカテゴリーのみ変更でき、画像の差し替えは未対応)
export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ message: "ログインが必要です" }, { status: 401 });
  }

  const { content, categoryId }: UpdatePostRequestBody = await request.json();
  if (!content || !categoryId) {
    return NextResponse.json(
      { message: "内容とカテゴリーは必須です" },
      { status: 400 },
    );
  }

  try {
    // whereに所有者条件を含める(他人の投稿は0件更新=見つからない扱いになりIDを差し替えた攻撃が効かない)
    const result = await prisma.post.updateMany({
      where: { id: Number(id), user: { supabaseUserId: authUser.id } },
      data: { content, categoryId },
    });
    if (result.count === 0) {
      return NextResponse.json(
        { message: "投稿が見つかりません" },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: "更新しました" }, { status: 200 });
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

//投稿の削除(本人のみ。画像・いいね・お気に入り・コメントはonDelete: Cascadeで一緒に消える)
export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ message: "ログインが必要です" }, { status: 401 });
  }

  try {
    const result = await prisma.post.deleteMany({
      where: { id: Number(id), user: { supabaseUserId: authUser.id } },
    });
    if (result.count === 0) {
      return NextResponse.json(
        { message: "投稿が見つかりません" },
        { status: 404 },
      );
    }
    return NextResponse.json({ message: "削除しました" }, { status: 200 });
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
        comments: {
          include: {
            user: {
              select: { id: true, name: true, nickname: true, iconUrl: true },
            },
          },
          orderBy: { createdAt: "desc" }, // 新しい順
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
