import { prisma } from "@/app/_libs/prisma";
import { getCurrentUser, isAdmin } from "@/app/_libs/currentUser";
import { NextRequest, NextResponse } from "next/server";

export type AdminContactsResponse = {
  contacts: {
    id: number;
    name: string | null;
    email: string;
    category: string;
    content: string;
    status: string;
    createdAt: Date;
    user: { id: number; name: string; nickname: string } | null;
  }[];
};

//お問い合わせ一覧（管理者だけ）。未対応を先に、新しい順
export const GET = async (request: NextRequest) => {
  const me = await getCurrentUser(request);
  if (!isAdmin(me)) {
    return NextResponse.json({ message: "権限がありません" }, { status: 403 });
  }

  try {
    const contacts = await prisma.contact.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        category: true,
        content: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, name: true, nickname: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
    });
    return NextResponse.json<AdminContactsResponse>(
      { contacts },
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
