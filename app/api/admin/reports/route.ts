import { prisma } from "@/app/_libs/prisma";
import { getCurrentUser, isAdmin } from "@/app/_libs/currentUser";
import { ReportTargetType } from "@/app/_libs/report";
import { NextRequest, NextResponse } from "next/server";

export type AdminReportsResponse = {
  reports: {
    id: number;
    targetType: ReportTargetType;
    targetId: number;
    reason: string;
    detail: string | null;
    status: string;
    createdAt: Date;
    reporter: { id: number; name: string; nickname: string };
    // 対象が削除済みならnull
    target: {
      text: string;
      href: string;
      author: { id: number; name: string; nickname: string };
    } | null;
  }[];
};

const authorSelect = { select: { id: true, name: true, nickname: true } };

//通報一覧（管理者だけ）。未対応を先に、新しい順
export const GET = async (request: NextRequest) => {
  const me = await getCurrentUser(request);
  if (!isAdmin(me)) {
    return NextResponse.json({ message: "権限がありません" }, { status: 403 });
  }

  try {
    const reports = await prisma.report.findMany({
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        detail: true,
        status: true,
        createdAt: true,
        reporter: authorSelect,
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
    });

    // 対象をタイプごとにまとめて取得
    const idsOf = (type: ReportTargetType) =>
      reports.filter((r) => r.targetType === type).map((r) => r.targetId);
    const [posts, comments, reviews] = await Promise.all([
      prisma.post.findMany({
        where: { id: { in: idsOf("post") } },
        select: { id: true, content: true, user: authorSelect },
      }),
      prisma.postComment.findMany({
        where: { id: { in: idsOf("comment") } },
        select: { id: true, content: true, postId: true, user: authorSelect },
      }),
      prisma.spotReview.findMany({
        where: { id: { in: idsOf("review") } },
        select: { id: true, comment: true, spotId: true, user: authorSelect },
      }),
    ]);

    const findTarget = (type: string, id: number) => {
      if (type === "post") {
        const post = posts.find((p) => p.id === id);
        return post
          ? { text: post.content, href: `/posts/${post.id}`, author: post.user }
          : null;
      }
      if (type === "comment") {
        const comment = comments.find((c) => c.id === id);
        return comment
          ? {
              text: comment.content,
              href: `/posts/${comment.postId}`,
              author: comment.user,
            }
          : null;
      }
      const review = reviews.find((r) => r.id === id);
      return review
        ? {
            text: review.comment ?? "",
            href: `/spots/${review.spotId}`,
            author: review.user,
          }
        : null;
    };

    return NextResponse.json<AdminReportsResponse>(
      {
        reports: reports.map((report) => ({
          ...report,
          targetType: report.targetType as ReportTargetType,
          target: findTarget(report.targetType, report.targetId),
        })),
      },
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
