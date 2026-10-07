import { prisma } from "@/app/_libs/prisma";
import { getCurrentUser } from "@/app/_libs/currentUser";
import { notifyAdmin } from "@/app/_libs/notifyAdmin";
import { CONTACT_CATEGORIES } from "@/app/_libs/contact";
import { NextRequest, NextResponse } from "next/server";

export type CreateContactRequestBody = {
  name?: string;
  email: string;
  category: string;
  content: string;
  website?: string; // ボット対策のおとり項目（画面には見えない。入っていたら保存しない）
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//お問い合わせを送る（未ログインでも可）
export const POST = async (request: NextRequest) => {
  try {
    const body: CreateContactRequestBody = await request.json();
    const name = body.name?.trim().slice(0, 50) || null;
    const email = body.email?.trim() ?? "";
    const content = body.content?.trim() ?? "";
    const { category } = body;

    // おとり項目が埋まっていたらボットとみなし、成功したふりをして捨てる
    if (body.website) {
      return NextResponse.json({ message: "送信しました" }, { status: 201 });
    }

    if (
      !EMAIL_PATTERN.test(email) ||
      email.length > 254 ||
      !(CONTACT_CATEGORIES as readonly string[]).includes(category) ||
      content.length === 0 ||
      content.length > 2000
    ) {
      return NextResponse.json(
        { message: "入力内容を確認してください" },
        { status: 400 },
      );
    }

    const me = await getCurrentUser(request);
    const contact = await prisma.contact.create({
      data: { userId: me?.id ?? null, name, email, category, content },
    });

    await notifyAdmin(
      `お問い合わせ: ${category}`,
      [
        `お問い合わせID: ${contact.id}`,
        `種類: ${category}`,
        `お名前: ${name ?? "(未入力)"}`,
        `メール: ${email}`,
        me ? `ユーザー: ${me.name} (@${me.nickname})` : "ユーザー: 未ログイン",
        "",
        content,
        "",
        "管理ページで確認してください: /admin",
      ].join("\n"),
    );

    return NextResponse.json({ message: "送信しました" }, { status: 201 });
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
