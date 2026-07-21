import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

//コメント新規投稿
export type CreateReviewRequestBody = {
  rating: number;
  comment?: string;
  imageUrls: string[];
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
    const body: CreateReviewRequestBody = await request.json();
    const { rating, comment, imageUrls } = body;
    await prisma.spotReview.create({
      data: {
        rating,
        comment,
        user: { connect: { supabaseUserId: authUser.id } },
        spot: { connect: { id: Number(id) } },
        images: { create: imageUrls.map((imageUrl) => ({ imageUrl })) },
      },
    });

    return NextResponse.json(
      { message: "口コミを投稿しました" },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }
};
