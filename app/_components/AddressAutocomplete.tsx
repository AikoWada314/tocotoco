"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

// 場所名や住所で検索できる入力欄。
// 候補を選ぶと、住所文字列と緯度・経度を親コンポーネントに渡す。
export type PlaceSelectResult = {
  address: string;
  lat: number;
  lng: number;
};

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "場所名や住所で検索",
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceSelectResult) => void;
  placeholder?: string;
  icon?: ReactNode; // 入力欄の左に表示するアイコン（省略可）
}) {
  // places ライブラリ（オートコンプリート機能）を読み込む。
  // 読み込み前は null なので、下の useEffect で null チェックしている。
  const places = useMapsLibrary("places");
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  // ① places が読み込まれたら、実際の <input> にオートコンプリートを結び付ける
  useEffect(() => {
    if (!places || !inputRef.current) return;
    const ac = new places.Autocomplete(inputRef.current, {
      fields: ["name", "formatted_address", "geometry"], // 必要な情報だけ取得（課金・通信の節約）
      componentRestrictions: { country: "jp" }, // 日本の場所に限定
    });
    setAutocomplete(ac);
  }, [places]);

  // ② 候補が選ばれたタイミング（place_changed）で、住所と座標を親に渡す
  useEffect(() => {
    if (!autocomplete) return;
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const loc = place.geometry?.location;
      if (!loc) return; // 座標が取れない候補（曖昧な検索など）は無視
      onPlaceSelect({
        // 場所名（店名など）があればそれを、無ければ住所を使う
        address: place.name || place.formatted_address || "",
        lat: loc.lat(),
        lng: loc.lng(),
      });
    });
    // コンポーネントが消えるときにリスナーを外す（メモリリーク防止）
    return () => listener.remove();
  }, [autocomplete, onPlaceSelect]);

  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          {icon}
        </div>
      )}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-12 w-full rounded-[12px] border border-[#d1e2dc] bg-white ${
          icon ? "pl-10 pr-4" : "px-4"
        } text-[16px] text-[#0f172a] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]`}
      />
    </div>
  );
}
