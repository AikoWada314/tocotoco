"use client";

import useSWR from "swr";
import { useSupabaseSession } from "./useSupabaseSession";

//requireAuthは認証が必要な場合はtrue、不要な場合はfalseを取りますよと意義
interface UseApiSWROptions {
  requireAuth?: boolean;
}

//Tはジェネリクス（取得するデータの型を呼び出し側が指定できる）
export const useApiSWR = <T = any>(
  url: string | null,
  options: UseApiSWROptions = { requireAuth: true },
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

    // 認証が必要な場合のみAuthorizationヘッダーを追加
    if (requireAuth && token) {
      headers.Authorization = token;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("データ取得に失敗しました");
    const data = await res.json();
    return data;
  };

  // 認証が必要な場合はtokenが存在するまで待つ、不要な場合は即座にフェッチ
  const shouldFetch = requireAuth ? url && token : url;

  const { data, error, isLoading, mutate } = useSWR<T>(
    shouldFetch ? url : null,
    fetcher,
  );

  return { data, error, isLoading, mutate };
};
