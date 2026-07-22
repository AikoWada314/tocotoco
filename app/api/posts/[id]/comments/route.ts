import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

//コメント新規投稿
export type CreateCommentRequestBody = {
  content: string;
};

// POSTという命名にすることで、POSTリクエストの時にこの関数が呼ばれる
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

  try {
    const body: CreateCommentRequestBody = await request.json();
    const { content } = body;
    await prisma.postComment.create({
      data: {
        content,
        user: { connect: { supabaseUserId: authUser.id } },
        post: { connect: { id: Number(id) } },
      },
    });

    return NextResponse.json(
      { message: "コメントを投稿しました" },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }
};
