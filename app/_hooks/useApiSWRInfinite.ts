"use client";

import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";
import { useSupabaseSession } from "./useSupabaseSession";

//requireAuthは認証が必要な場合はtrue、不要な場合はfalse（useApiSWRと同じ）
interface UseApiSWRInfiniteOptions {
  requireAuth?: boolean;
}

//ページネーション取得用。getKeyは「各ページのURL(次が無ければnull)」を返す関数
//Tは1ページ分のレスポンス型（例: SearchResponse）。dataはそのTの配列になる
export const useApiSWRInfinite = <T = any>(
  getKey: SWRInfiniteKeyLoader<T>,
  options: UseApiSWRInfiniteOptions = { requireAuth: true },
) => {
  const { token } = useSupabaseSession();
  const { requireAuth = true } = options;

  const fetcher = async (url: string): Promise<T> => {
    //認証が必要な場合はtokenを付与
    if (requireAuth && !token) {
      throw new Error("認証トークンがありません");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (requireAuth && token) {
      headers.Authorization = token;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("データ取得に失敗しました");
    const data = await res.json();
    return data;
  };

  //認証が必要なのにtokenがまだ無い間は、全ページfetchしない
  const keyLoader: SWRInfiniteKeyLoader<T> = (pageIndex, previousPageData) => {
    if (requireAuth && !token) return null;
    return getKey(pageIndex, previousPageData);
  };

  const { data, error, isLoading, isValidating, size, setSize } =
    useSWRInfinite<T>(keyLoader, fetcher);

  return { data, error, isLoading, isValidating, size, setSize };
};
