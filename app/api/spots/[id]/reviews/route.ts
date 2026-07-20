import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/app/_libs/auth";

//口コミ新規投稿
export type CreateSpotReviewRequestBody = {
  rating: number;
  comment?: string;
  imageUrls?: string[];
};

// POSTという命名にすることで、POSTリクエストの時にこの関数が呼ばれる
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ message: "ログインが必要です" }, { status: 401 });
  }

  try {
    const body: CreateSpotReviewRequestBody = await request.json();
    const { rating, comment, imageUrls } = body;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: authUser.id },
    });
    if (!dbUser) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 },
      );
    }

    await prisma.spotReview.create({
      data: {
        rating,
        comment,
        userId: dbUser.id,
        spotId: Number(id),
        ...(imageUrls?.length
          ? { images: { create: imageUrls.map((imageUrl) => ({ imageUrl })) } }
          : {}),
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
