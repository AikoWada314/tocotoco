import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";
import { createNotification } from "@/app/_libs/notification";

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

    // 通知（失敗してもいいね自体は成功のまま）
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      select: { userId: true }, // 投稿の持ち主（受信者）
    });
    const actor = await prisma.user.findUnique({
      where: { supabaseUserId: authUser.id },
      select: { id: true, name: true }, // いいねした本人（DBのid＋名前）
    });
    if (post && actor) {
      try {
        await createNotification({
          recipientUserId: post.userId,
          actorUserId: actor.id,
          title: "コメント",
          content: `${actor.name}さんがあなたの投稿にコメントしました`,
          type: "comment",
        });
      } catch (e) {
        console.error("通知の作成に失敗", e); // 通知失敗はログだけ
      }
    }

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
