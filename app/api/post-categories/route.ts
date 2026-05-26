import { prisma } from "@/app/_libs/prisma";
import { NextResponse } from "next/server";

export type PostCategories = {
  categories: {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export const GET = async () => {
  try {
    const categories = await prisma.postCategory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json<PostCategories>({ categories }, { status: 200 });
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 });
    return NextResponse.json(
      { message: "予期せぬエラーが発生しました" },
      { status: 500 },
    );
  }
};
