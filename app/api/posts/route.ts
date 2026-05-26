import { prisma } from "@/app/_libs/prisma";
import { NextResponse } from "next/server";
import { supabase } from "@/app/_libs/supabase";

//投稿一覧の型定義
export type PostsIndexResponse = {
  posts: {
    id: number;
    userId: number;
    title: string;
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
        user: {
          select: {
            id: true,
            name: true,
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
export type PostCreateResponse = {
  post: {
    id: number;
    userId: number;
    title: string;
    content: string;
    categoryId: number;
    isDraft: boolean;
    createdAt: Date;
    updatedAt: Date;
    category: {
      id: number;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    };
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
    user: {
      id: number;
      name: string;
      iconUrl: string | null;
    };
  };
};
