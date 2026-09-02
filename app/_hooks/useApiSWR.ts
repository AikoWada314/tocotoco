"use client";

import useSWR from "swr";

//Tはジェネリクス（取得するデータの型を呼び出し側が指定できる）
//認証はCookieで自動的に送られるため、呼び出し側で認証の要否を指定する必要はない
export const useApiSWR = <T = any>(url: string | null) => {
  const fetcher = async (url: string): Promise<T> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("データ取得に失敗しました");
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher);

  return { data, error, isLoading, mutate };
};
