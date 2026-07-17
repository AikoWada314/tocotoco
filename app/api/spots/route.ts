import { getAuthUser } from "@/app/_libs/auth";
import { prisma } from "@/app/_libs/prisma";
import { NextResponse, NextRequest } from "next/server";

//スポット一覧の型定義
export type SpotsIndexResponse = {
  spots: {
    id: number;
    name: string;
    description: string | null;
    lat: number;
    lng: number;
    status: string;
    address: string;
    categoryId: number;
    images: {
      id: number;
      spotId: number;
      imageUrl: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
    reviews: {
      rating: number;
    }[];
  }[];
};

//スポット一覧の取得
export const GET = async (request: NextRequest) => {
  try {
    const spots = await prisma.spot.findMany({
      include: {
        images: true,
        reviews: { select: { rating: true } },
      },
    });
    return NextResponse.json<SpotsIndexResponse>({ spots }, { status: 200 });
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

//新規スポット登録
export type CreateSpotRequestBody = {
  name: string;
  address: string;
  categoryId: number;
  description?: string;
  imageUrls?: string[];
  lat: number;
  lng: number;
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
    const body: CreateSpotRequestBody = await request.json();
    const { name, address, categoryId, description, lat, lng, imageUrls } =
      body;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: authUser.id },
    });
    if (!dbUser) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 },
      );
    }

    await prisma.spot.create({
      data: {
        name,
        address,
        categoryId,
        description,
        lat,
        lng,
        createdBy: dbUser.id,
        status: "published",
        ...(imageUrls?.length
          ? { images: { create: imageUrls.map((imageUrl) => ({ imageUrl })) } }
          : {}),
      },
    });

    return NextResponse.json(
      { message: "スポットを作成しました" },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }
};
