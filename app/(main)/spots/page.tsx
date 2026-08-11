"use client";

import Image from "next/image";
import Link from "next/link";
import { getPostImageUrl } from "@/app/_libs/storage";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { SpotsIndexResponse } from "@/app/api/spots/route";
import { SpotCategories } from "@/app/api/spot-categories/route";
import { useState } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { MeResponse } from "@/app/api/me/route";
import { FavoriteButton } from "@/app/_components/FavoriteButton";

export default function SpotPage() {
  // 一覧は未ログインでも見られるように認証なしで取得
  const { data, isLoading, mutate } = useApiSWR<SpotsIndexResponse>(
    "/api/spots",
    { requireAuth: false },
  );
  const spots = data?.spots;
  const { data: categoryData } = useApiSWR<SpotCategories>(
    "/api/spot-categories",
    { requireAuth: false },
  );
  const categories = categoryData?.categories ?? [];
  const { token } = useSupabaseSession();
  const { data: me } = useApiSWR<MeResponse>("/api/me");
  const [selected, setSelected] = useState<
    SpotsIndexResponse["spots"][number] | null
  >(null);

  const toggleFavorite = async (e: React.MouseEvent, spotId: number) => {
    e.preventDefault(); // カード全体のリンク遷移を止める
    if (!token) return; // 未ログインなら何もしない
    await fetch(`/api/spots/${spotId}/favorites`, {
      method: "POST",
      headers: { Authorization: token },
    });
    mutate();
  };
  if (isLoading)
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        読み込み中...
      </div>
    );
  if (!spots)
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        スポットの読み込みに失敗しました
      </div>
    );
  const selectedFavorites =
    spots.find((s) => s.id === selected?.id)?.favorites ??
    selected?.favorites ??
    [];

  // 選択中スポットのカード用に、表示値を組み立てる
  const reviewCount = selected?.reviews.length ?? 0;
  const averageRating =
    selected && reviewCount > 0
      ? selected.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
  const filledStars = Math.round(averageRating);
  const categoryName = selected
    ? (categories.find((c) => c.id === selected.categoryId)?.name ?? "")
    : "";

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      {/* relative: 上に検索バーやカードを重ねる基準
          h-[calc(100dvh-73px)]: 画面の高さからHeader(73px)を引いた残り全部 */}
      <div className="relative h-[calc(100dvh-73px)]">
        <Map
          defaultCenter={{ lat: 34.8216, lng: 135.4289 }}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
        >
          {spots.map((spot) => (
            <AdvancedMarker
              key={spot.id}
              position={{ lat: spot.lat, lng: spot.lng }}
              onClick={() => setSelected(spot)}
            />
          ))}
        </Map>

        {/* スポット追加ボタン（カード表示中はカードの上に逃がす） */}
        <Link
          href="/spots/new"
          aria-label="スポットを追加"
          className={`absolute right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#3a7e69] text-white shadow-lg transition-opacity hover:opacity-90 ${
            selected ? "bottom-[236px]" : "bottom-[88px]"
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </Link>

        {/* 選択中スポットの下部カード */}
        {selected && (
          <div className="absolute bottom-[80px] left-4 right-4 z-10 flex gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
            {/* 画像 */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f1f5f9]">
              {selected.images[0] && (
                <Image
                  src={getPostImageUrl(selected.images[0].imageUrl)}
                  alt={selected.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* 情報 */}
            <div className="min-w-0 flex-1">
              {categoryName && (
                <span className="inline-block rounded bg-[#eff9f5] px-2 py-0.5 text-[11px] font-medium text-[#3a7e69]">
                  {categoryName}
                </span>
              )}

              <div className="mt-1 flex items-start justify-between gap-2">
                <h3 className="truncate text-[18px] font-bold text-[#0f172a]">
                  {selected.name}
                </h3>
                {/* お気に入り（数は出さずマークのみ） */}
                <FavoriteButton
                  active={selectedFavorites.some(
                    (fav) => fav.userId === me?.user.id,
                  )}
                  onClick={(e) => toggleFavorite(e, selected.id)}
                  className="relative z-10"
                />
              </div>

              {/* 評価 */}
              <div className="mt-1 flex items-center gap-1">
                <span className="text-[12px] font-bold text-[#0f172a]">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-[12px]">
                  <span className="text-[#fbbf24]">
                    {"★".repeat(filledStars)}
                  </span>
                  <span className="text-[#e2e8f0]">
                    {"★".repeat(5 - filledStars)}
                  </span>
                </span>
                <span className="text-[12px] text-[#64748b]">
                  ({reviewCount}件)
                </span>
              </div>

              {/* 説明の抜粋（2行まで） */}
              {selected.description && (
                <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#64748b]">
                  {selected.description}
                </p>
              )}
            </div>

            {/* カード全体を詳細ページへのリンクに（透明リンクを重ねる／♡はz-10で前面） */}
            <Link
              href={`/spots/${selected.id}`}
              aria-label={`${selected.name} の詳細を見る`}
              className="absolute inset-0 z-0 rounded-2xl"
            />
          </div>
        )}
      </div>
    </APIProvider>
  );
}
