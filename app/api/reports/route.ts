import { prisma } from "@/app/_libs/prisma";
import { getCurrentUser } from "@/app/_libs/currentUser";
import { notifyAdmin } from "@/app/_libs/notifyAdmin";
import {
  REPORT_REASONS,
  REPORT_TARGET_LABELS,
  REPORT_TARGET_TYPES,
  ReportTargetType,
} from "@/app/_libs/report";
import { NextRequest, NextResponse } from "next/server";

export type CreateReportRequestBody = {
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  detail?: string;
};

//通報対象の本文と投稿者（存在しなければnull）
const findTarget = async (targetType: ReportTargetType, targetId: number) => {
  if (targetType === "post") {
    const post = await prisma.post.findUnique({
      where: { id: targetId },
      select: { content: true, userId: true },
    });
    return post && { text: post.content, userId: post.userId };
  }
  if (targetType === "comment") {
    const comment = await prisma.postComment.findUnique({
      where: { id: targetId },
      select: { content: true, userId: true },
    });
    return comment && { text: comment.content, userId: comment.userId };
  }
  const review = await prisma.spotReview.findUnique({
    where: { id: targetId },
    select: { comment: true, userId: true },
  });
  return review && { text: review.comment ?? "", userId: review.userId };
};

//通報する
export const POST = async (request: NextRequest) => {
  const me = await getCurrentUser(request);
  if (!me) {
    return NextResponse.json(
      { message: "ログインが必要です" },
      { status: 401 },
    );
  }

  try {
    const body: CreateReportRequestBody = await request.json();
    const { targetType, targetId, reason } = body;
    const detail = body.detail?.trim().slice(0, 1000) || null;

    if (
      !REPORT_TARGET_TYPES.includes(targetType) ||
      !Number.isInteger(targetId) ||
      !(REPORT_REASONS as readonly string[]).includes(reason)
    ) {
      return NextResponse.json(
        { message: "通報の内容が正しくありません" },
        { status: 400 },
      );
    }

    const target = await findTarget(targetType, targetId);
    if (!target) {
      return NextResponse.json(
        { message: "通報する対象が見つかりません" },
        { status: 404 },
      );
    }
    if (target.userId === me.id) {
      return NextResponse.json(
        { message: "自分の投稿は通報できません" },
        { status: 400 },
      );
    }

    // 同じ人が同じ対象を未対応のまま重ねて通報しても、1件にまとめる
    const existing = await prisma.report.findFirst({
      where: { reporterId: me.id, targetType, targetId, status: "open" },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { message: "すでに通報を受け付けています" },
        { status: 200 },
      );
    }

    const report = await prisma.report.create({
      data: { reporterId: me.id, targetType, targetId, reason, detail },
    });

    await notifyAdmin(
      `${REPORT_TARGET_LABELS[targetType]}への通報がありました`,
      [
        `通報ID: ${report.id}`,
        `対象: ${REPORT_TARGET_LABELS[targetType]} (ID: ${targetId})`,
        `理由: ${reason}`,
        detail ? `詳細: ${detail}` : null,
        `通報者: ${me.name} (@${me.nickname})`,
        "",
        "対象の内容:",
        target.text.slice(0, 500),
        "",
        "管理ページで確認してください: /admin",
      ]
        .filter((line) => line !== null)
        .join("\n"),
    );

    return NextResponse.json(
      { message: "通報を受け付けました" },
      { status: 201 },
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
