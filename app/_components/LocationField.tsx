"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { AddressAutocomplete } from "@/app/_components/AddressAutocomplete";

// 場所の入力まとめ（検索欄＋地図）。
// 「今の値」を受け取り、変わったら address・lat・lng を丸ごと親に返す。
type LocationValue = {
  address: string;
  lat: number | null;
  lng: number | null;
};

// 地図の初期表示位置（池町周辺）
const DEFAULT_CENTER = { lat: 34.8216, lng: 135.4289 };

export function LocationField({
  address,
  lat,
  lng,
  onChange,
  error,
  placeholder,
  showPin = false,
}: {
  address: string;
  lat: number | null;
  lng: number | null;
  onChange: (next: LocationValue) => void;
  error?: string;
  placeholder?: string;
  showPin?: boolean; // 入力欄の左にピンアイコンを出すか
}) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      {/* 場所名で検索 → 選ぶと住所・座標・ピンが自動で入る */}
      <AddressAutocomplete
        value={address}
        placeholder={placeholder}
        icon={showPin ? <LocationPinIcon /> : undefined}
        // 手入力：住所だけ更新し、座標はそのまま
        onChange={(text) => onChange({ address: text, lat, lng })}
        // 候補を選択：住所も座標もまとめて更新
        onPlaceSelect={(place) =>
          onChange({ address: place.address, lat: place.lat, lng: place.lng })
        }
      />
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <div className="mt-2 h-[300px] overflow-hidden rounded-[12px] border border-[#d1e2dc]">
        <Map
          defaultCenter={
            lat != null && lng != null ? { lat, lng } : DEFAULT_CENTER
          }
          defaultZoom={15}
          mapId="DEMO_MAP_ID"
          onClick={(e) => {
            const pos = e.detail.latLng; // クリック地点の座標
            // 地図クリック：座標だけ更新し、住所はそのまま
            if (pos) onChange({ address, lat: pos.lat, lng: pos.lng });
          }}
        >
          {lat != null && lng != null && (
            <AdvancedMarker position={{ lat, lng }} />
          )}
        </Map>
      </div>
    </APIProvider>
  );
}

// 入力欄の左に出す場所ピンのアイコン
function LocationPinIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
      <path
        d="M8 0C3.58 0 0 3.58 0 8C0 13.25 7.05 19.42 7.35 19.68C7.72 20 8.28 20 8.65 19.68C8.95 19.42 16 13.25 16 8C16 3.58 12.42 0 8 0ZM8 11C6.34 11 5 9.66 5 8C5 6.34 6.34 5 8 5C9.66 5 11 6.34 11 8C11 9.66 9.66 11 8 11Z"
        fill="#3a7e69"
      />
    </svg>
  );
}
