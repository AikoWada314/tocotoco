"use client";

import Image from "next/image";
import Link from "next/link";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { Header } from "@/app/_components/Header";
import { Footer } from "@/app/_components/Footer";
import { PostsIndexResponse } from "@/app/api/posts/route";
import { EventsIndexResponse } from "@/app/api/events/route";
import { SpotsIndexResponse } from "@/app/api/spots/route";
import { getPostImageUrl } from "@/app/_libs/storage";
import { formatDateTime, formatTimeAgo } from "@/app/_libs/format";
import { EventIcon } from "@/app/_components/icons/EventIcon";
import { SpotIcon } from "@/app/_components/icons/SpotIcon";

// セクション見出し＋「もっと見る」リンク
const SectionHeader = ({ title, href }: { title: string; href: string }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-[16px] md:text-[18px] font-bold text-[#1e293b]">
      {title}
    </h2>
    <Link
      href={href}
      className="text-[13px] font-bold text-[#3a7e69] hover:underline"
    >
      もっと見る →
    </Link>
  </div>
);

// データ取得中に出すプレースホルダー
const SkeletonCards = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse bg-[#e2e8f0] rounded-[12px] h-32" />
    ))}
  </>
);

export default function HomePage() {
  const { session, isLoading } = useSupabaseSession();

  // トップページは未ログインでも見せたいので requireAuth: false で取得する
  const { data: postsData } = useApiSWR<PostsIndexResponse>("/api/posts", {
    requireAuth: false,
  });
  const { data: eventsData } = useApiSWR<EventsIndexResponse>("/api/events", {
    requireAuth: false,
  });
  const { data: spotsData } = useApiSWR<SpotsIndexResponse>("/api/spots", {
    requireAuth: false,
  });

  const posts = (postsData?.posts ?? []).slice(0, 6);
  // /api/events は「今日以降・近い順」で返してくるので先頭3件が直近の開催予定
  const events = (eventsData?.events ?? []).slice(0, 3);
  // スポットは口コミが多い順に4件
  const spots = [...(spotsData?.spots ?? [])]
    .sort((a, b) => b.reviews.length - a.reviews.length)
    .slice(0, 4);

  // トップページだけは max-w-3xl の中央カラムに入れず、フル幅のPC向けデザインにする
  return (
    <>
      {/* スクロールしても付いてくる追従ヘッダー */}
      <div className="sticky top-0 z-50 bg-[rgba(255,255,255,0.95)] backdrop-blur-[6px] border-b border-[#f1f5f9]">
        <Header />
      </div>
      {/* 下部の余白は固定Footer(ログイン時のみ表示)との重なり防止用 */}
      <div className={`flex-1 bg-[#eff9f5] ${session ? "pb-24" : ""}`}>
        {/* ヒーロー */}
        <section className="bg-white border-b border-[#f1f5f9]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24 flex flex-col items-center gap-4 text-center">
            <h1 className="text-[24px] md:text-[40px] font-bold text-[#1e293b] leading-snug">
              池田市の「いま」が集まるSNS
            </h1>
            <p className="text-[13px] md:text-[15px] text-[#64748b] leading-relaxed">
              つぶやき・イベント・お店の情報を、池田市のみんなでシェアするコミュニティです。
            </p>
            {!isLoading && (
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                {session ? (
                  <Link
                    href="/posts"
                    className="bg-[#3a7e69] text-white rounded-full px-8 py-3 text-[14px] font-bold transition-colors hover:bg-[#2f6655]"
                  >
                    タイムラインを見る
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signup"
                      className="min-w-60 text-center bg-[#3a7e69] text-white rounded-full px-8 py-3 text-[14px] font-bold transition-colors hover:bg-[#2f6655]"
                    >
                      無料ではじめる
                    </Link>
                    <Link
                      href="/posts"
                      className="min-w-60 text-center bg-white text-[#3a7e69] border border-[#3a7e69] rounded-full px-8 py-3 text-[14px] font-bold transition-colors hover:bg-[#eff9f5]"
                    >
                      つぶやきをのぞいてみる
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 flex flex-col gap-12 md:gap-16">
          {/* 新着のつぶやき */}
          <section>
            <SectionHeader title="新着のつぶやき" href="/posts" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {!postsData ? (
                <SkeletonCards count={6} />
              ) : (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="bg-white border border-[#f1f5f9] rounded-[12px] p-4 flex flex-col gap-2 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-[#e2e8f0] overflow-hidden">
                        <Image
                          src={post.user.iconUrl || "/user.svg"}
                          alt={post.user.nickname ?? post.user.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[13px] font-bold text-[#1e293b] truncate">
                        {post.user.nickname ?? post.user.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-[#94a3b8]">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#334155] leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                    <div className="mt-auto flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[#3a7e69] bg-[rgba(58,126,105,0.1)] rounded-full px-2 py-0.5">
                        {post.category.name}
                      </span>
                      <span className="text-[11px] text-[#94a3b8]">
                        ♥ {post.likes.length}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            {postsData && posts.length === 0 && (
              <p className="text-[13px] text-[#64748b]">
                つぶやきはまだありません。
              </p>
            )}
          </section>

          {/* 開催予定のイベント */}
          <section>
            <SectionHeader title="開催予定のイベント" href="/events" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {!eventsData ? (
                <SkeletonCards count={3} />
              ) : (
                events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="bg-white border border-[#f1f5f9] rounded-[12px] overflow-hidden flex flex-col transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {event.images.length > 0 ? (
                      <Image
                        src={getPostImageUrl(event.images[0].imageUrl)}
                        alt=""
                        width={400}
                        height={128}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-[#f1f5f9] flex items-center justify-center">
                        <EventIcon color="#94a3b8" />
                      </div>
                    )}
                    <div className="p-3 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-[#3a7e69]">
                        {formatDateTime(event.eventDate)}
                      </span>
                      <span className="text-[13px] font-bold text-[#1e293b] line-clamp-1">
                        {event.title}
                      </span>
                      <span className="text-[11px] text-[#64748b] line-clamp-1">
                        {event.place}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            {eventsData && events.length === 0 && (
              <p className="text-[13px] text-[#64748b]">
                開催予定のイベントはまだありません。
              </p>
            )}
          </section>

          {/* 人気のスポット */}
          <section>
            <SectionHeader title="人気のスポット" href="/spots" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {!spotsData ? (
                <SkeletonCards count={4} />
              ) : (
                spots.map((spot) => {
                  const reviewCount = spot.reviews.length;
                  const rating =
                    reviewCount > 0
                      ? (
                          spot.reviews.reduce((sum, r) => sum + r.rating, 0) /
                          reviewCount
                        ).toFixed(1)
                      : null;
                  return (
                    <Link
                      key={spot.id}
                      href={`/spots/${spot.id}`}
                      className="bg-white border border-[#f1f5f9] rounded-[12px] overflow-hidden flex flex-col transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {spot.images.length > 0 ? (
                        <Image
                          src={getPostImageUrl(spot.images[0].imageUrl)}
                          alt=""
                          width={300}
                          height={96}
                          className="w-full h-24 md:h-28 object-cover"
                        />
                      ) : (
                        <div className="w-full h-24 md:h-28 bg-[#f1f5f9] flex items-center justify-center">
                          <SpotIcon color="#94a3b8" />
                        </div>
                      )}
                      <div className="p-3 flex flex-col gap-1">
                        <span className="text-[13px] font-bold text-[#1e293b] line-clamp-1">
                          {spot.name}
                        </span>
                        {rating && (
                          <span className="text-[11px] text-[#64748b]">
                            ★ {rating}（{reviewCount}件）
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* 未ログインの人向け: 会員登録を促すセクション */}
        {!isLoading && !session && (
          <section className="bg-[#3a7e69]">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 flex flex-col items-center gap-4 text-center">
              <h2 className="text-[20px] md:text-[28px] font-bold text-white leading-snug">
                あなたも池田市の「いま」をシェアしませんか？
              </h2>
              <p className="text-[13px] md:text-[15px] text-[rgba(255,255,255,0.85)] leading-relaxed">
                会員登録すると、つぶやきの投稿・いいね・お気に入り登録ができるようになります。
              </p>
              <Link
                href="/auth/signup"
                className="bg-white text-[#3a7e69] rounded-full px-8 py-3 text-[14px] font-bold mt-2 transition-colors hover:bg-[#eff9f5]"
              >
                無料で会員登録する
              </Link>
              <p className="text-[12px] text-[rgba(255,255,255,0.85)]">
                アカウントをお持ちの方は{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-white underline transition-opacity hover:opacity-80"
                >
                  ログイン
                </Link>
              </p>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
