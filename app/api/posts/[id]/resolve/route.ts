import { prisma } from "@/app/_libs/prisma";
import { getAuthUser } from "@/app/_libs/auth";
import { CONSULT_CATEGORY_NAME } from "@/app/_libs/postCategory";
import { NextRequest, NextResponse } from "next/server";

export type ResolvePostRequestBody = {
  isResolved: boolean;
};

//相談の「解決済み」を切り替える（投稿した本人だけ）
export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

  const { id } = await params;
  try {
    const body: ResolvePostRequestBody = await request.json();
    if (typeof body.isResolved !== "boolean") {
      return NextResponse.json(
        { message: "isResolvedを指定してください" },
        { status: 400 },
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      select: {
        user: { select: { supabaseUserId: true } },
        category: { select: { name: true } },
      },
    });
    if (!post) {
      return NextResponse.json(
        { message: "投稿が見つかりません" },
        { status: 404 },
      );
    }
    if (post.user.supabaseUserId !== authUser.id) {
      return NextResponse.json(
        { message: "自分の投稿だけ変更できます" },
        { status: 403 },
      );
    }
    if (post.category.name !== CONSULT_CATEGORY_NAME) {
      return NextResponse.json(
        { message: "相談の投稿だけ解決済みにできます" },
        { status: 400 },
      );
    }

    await prisma.post.update({
      where: { id: Number(id) },
      data: { isResolved: body.isResolved },
    });
    return NextResponse.json(
      { message: "更新しました" },
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
