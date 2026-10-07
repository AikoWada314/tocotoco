import { prisma } from "@/app/_libs/prisma";
import { getCurrentUser, isAdmin } from "@/app/_libs/currentUser";
import { NextRequest, NextResponse } from "next/server";

export type UpdateContactRequestBody = {
  status: "open" | "resolved";
};

//お問い合わせの対応状況を切り替える（管理者だけ）
export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const me = await getCurrentUser(request);
  if (!isAdmin(me)) {
    return NextResponse.json({ message: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const { status }: UpdateContactRequestBody = await request.json();
    if (status !== "open" && status !== "resolved") {
      return NextResponse.json(
        { message: "statusが正しくありません" },
        { status: 400 },
      );
    }
    await prisma.contact.update({
      where: { id: Number(id) },
      data: { status },
    });
    return NextResponse.json({ message: "更新しました" }, { status: 200 });
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
