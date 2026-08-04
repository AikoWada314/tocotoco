import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";
import { PostsIndexResponse } from "@/app/api/posts/route";

//投稿一覧の取得
export const GET = async (request: NextRequest) => {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

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
      where: { user: { supabaseUserId: authUser.id } },
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
