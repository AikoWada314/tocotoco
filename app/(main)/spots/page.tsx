"use client";

import Image from "next/image";
import Link from "next/link";
import { getPostImageUrl } from "@/app/_libs/storage";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { SpotsIndexResponse } from "@/app/api/spots/route";
import { SpotCategories } from "@/app/api/spot-categories/route";
import { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { useAuthStatus } from "@/app/_hooks/useAuthStatus";
import { FavoriteButton } from "@/app/_components/FavoriteButton";

type Spot = SpotsIndexResponse["spots"][number];

// 全角/半角・大文字/小文字の違いを無視して比べるための正規化
const normalize = (text: string) => text.normalize("NFKC").toLowerCase();

// 地図の上に重ねる検索バー（スポット名・住所で絞り込む）
// useMapでピン位置へ移動させるため、APIProviderの内側で使う
function SpotSearchBar({
  query,
  onQueryChange,
  results,
  onSelect,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  results: Spot[];
  onSelect: (spot: Spot) => void;
}) {
  const map = useMap();
  const [isOpen, setIsOpen] = useState(false);
  const showList = isOpen && query.trim() !== "";

  const handleSelect = (spot: Spot) => {
    onSelect(spot);
    map?.panTo({ lat: spot.lat, lng: spot.lng });
    setIsOpen(false);
  };

  return (
    <div className="absolute left-4 right-4 top-3 z-20">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          // Enterで候補が1件だけならそのスポットを開く
          if (results.length === 1) handleSelect(results[0]);
        }}
      >
        <div className="relative">
          <svg
            className="absolute left-[14.5px] top-1/2 -translate-y-1/2 pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
          >
            <circle cx="6" cy="6" r="5" stroke="#64748b" strokeWidth="1.5" />
            <path
              d="M10 10L13 13"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="スポット名・住所で検索"
            aria-label="スポット名・住所で検索"
            className="w-full rounded-[12px] bg-white py-2.5 pl-10 pr-4 text-[16px] text-[#0f172a] shadow-[0_4px_20px_rgba(0,0,0,0.12)] outline-none placeholder:text-[#64748b]"
          />
        </div>
      </form>

      {/* 候補リスト */}
      {showList && (
        <div className="mt-2 max-h-[50dvh] overflow-y-auto rounded-[12px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-[14px] text-[#64748b]">
              「{query.trim()}」に当てはまるスポットはありません
            </p>
          ) : (
            <ul>
              {results.map((spot) => (
                <li
                  key={spot.id}
                  className="border-b border-[#f1f5f9] last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(spot)}
                    className="block w-full px-4 py-2.5 text-left hover:bg-[#f8fafc]"
                  >
                    <p className="truncate text-[14px] font-medium text-[#0f172a]">
                      {spot.name}
                    </p>
                    <p className="truncate text-[12px] text-[#64748b]">
                      {spot.address}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function SpotPage() {
  // 一覧は未ログインでも閲覧できる
  const { data, isLoading, mutate } =
    useApiSWR<SpotsIndexResponse>("/api/spots");
  const spots = data?.spots;
  const { data: categoryData } = useApiSWR<SpotCategories>(
    "/api/spot-categories",
  );
  const categories = categoryData?.categories ?? [];
  const { me, isLoggedIn } = useAuthStatus();
  const [selected, setSelected] = useState<Spot | null>(null);
  const [query, setQuery] = useState("");

  const toggleFavorite = async (e: React.MouseEvent, spotId: number) => {
    e.preventDefault(); // カード全体のリンク遷移を止める
    if (!isLoggedIn) return; // 未ログインなら何もしない
    await fetch(`/api/spots/${spotId}/favorites`, { method: "POST" });
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
  // 検索語があれば、名前か住所に含むスポットだけに絞る（ピンも同じ結果に合わせる）
  const keyword = normalize(query.trim());
  const filteredSpots = keyword
    ? spots.filter(
        (spot) =>
          normalize(spot.name).includes(keyword) ||
          normalize(spot.address).includes(keyword),
      )
    : spots;

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
          // 上部の検索バーと重ならないよう、地図/航空写真・全画面ボタンは出さない
          mapTypeControl={false}
          fullscreenControl={false}
        >
          {filteredSpots.map((spot) => (
            <AdvancedMarker
              key={spot.id}
              position={{ lat: spot.lat, lng: spot.lng }}
              onClick={() => setSelected(spot)}
            />
          ))}
        </Map>

        <SpotSearchBar
          query={query}
          onQueryChange={setQuery}
          results={filteredSpots}
          onSelect={setSelected}
        />

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
