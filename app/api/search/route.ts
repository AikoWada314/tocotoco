import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";

//検索機能の型定義
export type SearchResult = {
  type: "spot" | "event" | "post" | "review" | "comment";
  id: number;
  title: string | null; // 名前/タイトルがある物だけ。無ければ null
  text: string | null; // 表示する本文
  linkId: number;
  createdAt: Date;
};
export type SearchResponse = { results: SearchResult[]; hasMore: boolean };

//検索結果の取得
export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    if (!query?.trim()) {
      return NextResponse.json<SearchResponse>(
        { results: [], hasMore: false },
        { status: 200 },
      );
    }
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const limit = 20;

    const [spots, comments, posts, events, reviews] = await Promise.all([
      prisma.spot.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: page * limit,
      }),
      prisma.postComment.findMany({
        where: { content: { contains: query, mode: "insensitive" } },
        select: {
          id: true,
          content: true,
          postId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: page * limit,
      }),
      prisma.post.findMany({
        where: {
          OR: [{ content: { contains: query, mode: "insensitive" } }],
        },
        select: { id: true, content: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: page * limit,
      }),
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: page * limit,
      }),
      prisma.spotReview.findMany({
        where: {
          comment: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          comment: true,
          spotId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: page * limit,
      }),
    ]);

    const spotResults: SearchResult[] = spots.map((spot) => ({
      type: "spot",
      id: spot.id,
      title: spot.name,
      text: spot.description,
      linkId: spot.id,
      createdAt: spot.createdAt,
    }));
    const eventResults: SearchResult[] = events.map((event) => ({
      type: "event",
      id: event.id,
      title: event.title,
      text: event.description,
      linkId: event.id,
      createdAt: event.createdAt,
    }));
    const postResults: SearchResult[] = posts.map((post) => ({
      type: "post",
      id: post.id,
      title: null,
      text: post.content,
      linkId: post.id,
      createdAt: post.createdAt,
    }));
    const reviewResults: SearchResult[] = reviews.map((review) => ({
      type: "review",
      id: review.id,
      title: null,
      text: review.comment,
      linkId: review.spotId,
      createdAt: review.createdAt,
    }));
    const commentResults: SearchResult[] = comments.map((comment) => ({
      type: "comment",
      id: comment.id,
      title: null,
      text: comment.content,
      linkId: comment.postId,
      createdAt: comment.createdAt,
    }));

    const results: SearchResult[] = [
      ...spotResults,
      ...eventResults,
      ...postResults,
      ...reviewResults,
      ...commentResults,
    ];

    const orderResults = results.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const sliceResults = orderResults.slice((page - 1) * limit, page * limit);

    const hasMore = results.length > page * limit;

    return NextResponse.json<SearchResponse>(
      { results: sliceResults, hasMore },
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
