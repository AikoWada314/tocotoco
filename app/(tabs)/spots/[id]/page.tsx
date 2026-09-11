"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SpotShowResponse } from "@/app/api/spots/[id]/route";
import { SpotCategories } from "@/app/api/spot-categories/route";
import { getPostImageUrl } from "@/app/_libs/storage";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { PageHeader } from "@/app/_components/PageHeader";
import { formatTimeAgo } from "@/app/_libs/format";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useAuthStatus } from "@/app/_hooks/useAuthStatus";
import { FavoriteButton } from "@/app/_components/FavoriteButton";

export default function Page() {
  const { id } = useParams();
  // 詳細は未ログインでも閲覧できる
  const { data, isLoading, mutate } = useApiSWR<SpotShowResponse>(
    `/api/spots/${id}`,
  );
  const { data: categoryData } = useApiSWR<SpotCategories>(
    "/api/spot-categories",
  );
  const { me, isLoggedIn } = useAuthStatus();
  const spot = data?.spot;
  const categories = categoryData?.categories ?? [];

  const toggleFavorite = async () => {
    if (!isLoggedIn) return; // 未ログインなら何もしない
    await fetch(`/api/spots/${id}/favorites`, { method: "POST" });
    mutate(); // 詳細を再取得して★を更新
  };

  if (isLoading)
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        読み込み中...
      </div>
    );
  if (!spot)
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        スポットが見つかりません
      </div>
    );

  // 表示用の組み立て
  const categoryName =
    categories.find((c) => c.id === spot.categoryId)?.name ?? "";
  const reviewCount = spot.reviews.length;
  const averageRating =
    reviewCount > 0
      ? spot.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
  const filledStars = Math.round(averageRating);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="スポット詳細" />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <article className="flex flex-col gap-4 pt-4 pb-24">
          {/* 画像（あれば） */}
          {spot.images.length > 0 && (
            <div className="px-4">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[12px] border border-[#3a7e69]/10 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                <Image
                  src={getPostImageUrl(spot.images[0].imageUrl)}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* 名前・カテゴリ・評価・住所 */}
          <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
            {categoryName && (
              <span className="inline-block self-start rounded bg-[#eff9f5] px-2 py-0.5 text-[12px] font-medium text-[#3a7e69]">
                {categoryName}
              </span>
            )}
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-[24px] font-medium text-[#0f172a] leading-[30px] whitespace-pre-wrap">
                {spot.name}
              </h1>
              {/* お気に入り（数は出さずマークのみ） */}
              <FavoriteButton
                active={spot.favorites.some(
                  (fav) => fav.userId === me?.user.id,
                )}
                onClick={toggleFavorite}
                className="mt-1"
              />
            </div>

            {/* 評価 */}
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-bold text-[#0f172a]">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-[14px]">
                <span className="text-[#fbbf24]">{"★".repeat(filledStars)}</span>
                <span className="text-[#e2e8f0]">
                  {"★".repeat(5 - filledStars)}
                </span>
              </span>
              <span className="text-[13px] text-[#64748b]">
                ({reviewCount}件)
              </span>
            </div>

            {/* 住所 */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#eff9f5]">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <path
                    d="M8 0C3.58 0 0 3.58 0 8C0 13.25 7.05 19.42 7.35 19.68C7.72 20 8.28 20 8.65 19.68C8.95 19.42 16 13.25 16 8C16 3.58 12.42 0 8 0ZM8 11C6.34 11 5 9.66 5 8C5 6.34 6.34 5 8 5C9.66 5 11 6.34 11 8C11 9.66 9.66 11 8 11Z"
                    fill="#3a7e69"
                  />
                </svg>
              </div>
              <p className="text-[16px] font-medium text-[#0f172a] leading-6">
                {spot.address}
              </p>
            </div>
          </div>

          {/* 地図 */}
          <div className="px-4">
            <div className="h-[300px] overflow-hidden rounded-[12px] border border-[#3a7e69]/10">
              <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <Map
                  defaultCenter={{ lat: spot.lat, lng: spot.lng }}
                  defaultZoom={16}
                  mapId="DEMO_MAP_ID"
                >
                  <AdvancedMarker position={{ lat: spot.lat, lng: spot.lng }} />
                </Map>
              </APIProvider>
            </div>
          </div>

          {/* スポットについて */}
          {spot.description && (
            <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
              <p className="text-[14px] font-medium text-[#334155] leading-[22.75px] whitespace-pre-wrap">
                {spot.description}
              </p>
            </div>
          )}

          {/* 口コミ */}
          <div className="flex flex-col gap-4 px-4 pt-2 pb-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-[18px] font-bold text-[#0f172a] leading-[28px]">
                口コミ
              </h2>
              <p className="text-[13px] text-[#94a3b8]">{reviewCount}件の投稿</p>
            </div>

            {reviewCount === 0 ? (
              <p className="text-[14px] text-[#64748b]">
                まだ口コミはありません
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-[#3a7e69]/10">
                {spot.reviews.map((review, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 py-4 first:pt-0"
                  >
                    {/* 投稿者・評価・時間 */}
                    <div className="flex items-center gap-3">
                      <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-[#f1f5f9]">
                        <Image
                          src={review.user.iconUrl || "/user.svg"}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[14px] font-bold text-[#0f172a] leading-none">
                          {review.user.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] leading-none">
                            <span className="text-[#fbbf24]">
                              {"★".repeat(review.rating)}
                            </span>
                            <span className="text-[#e2e8f0]">
                              {"★".repeat(5 - review.rating)}
                            </span>
                          </span>
                          <span className="text-[12px] text-[#94a3b8] leading-none">
                            {formatTimeAgo(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* コメント */}
                    {review.comment && (
                      <p className="text-[14px] text-[#334155] leading-[22px] whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    )}

                    {/* 口コミ画像 */}
                    {review.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {review.images.map((img, i) => (
                          <div
                            key={i}
                            className="relative size-20 shrink-0 overflow-hidden rounded-[8px] bg-[#f1f5f9]"
                          >
                            <Image
                              src={getPostImageUrl(img.imageUrl)}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 口コミ投稿ボタン */}
          <div className="px-4">
            <Link
              href={`/spots/${id}/reviews/new`}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#3a7e69] py-4 text-[16px] font-bold text-white transition-opacity hover:opacity-90"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M13.5 3.5l3 3L7 16l-3.5.5L4 13l9.5-9.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              口コミを投稿する
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
