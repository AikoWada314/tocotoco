"use client";

import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";

//ページネーション取得用。getKeyは「各ページのURL(次が無ければnull)」を返す関数
//Tは1ページ分のレスポンス型（例: SearchResponse）。dataはそのTの配列になる
//認証はCookieで自動的に送られるため、呼び出し側で認証の要否を指定する必要はない
export const useApiSWRInfinite = <T = any>(getKey: SWRInfiniteKeyLoader<T>) => {
  const fetcher = async (url: string): Promise<T> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("データ取得に失敗しました");
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, isValidating, size, setSize } =
    useSWRInfinite<T>(getKey, fetcher);

  return { data, error, isLoading, isValidating, size, setSize };
};
