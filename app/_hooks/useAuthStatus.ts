"use client";

import useSWR from "swr";
import type { MeResponse } from "@/app/api/me/route";

// 401(未ログイン)はエラーではなく「null」という正常な答えとして扱う
const fetcher = async (url: string): Promise<MeResponse | null> => {
  const res = await fetch(url);
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("ログイン状態の取得に失敗しました");
  return res.json();
};

// ログイン状態とログイン中ユーザーの取得元。
// CookieはhttpOnlyでJSから読めないため、サーバー(/api/me)に問い合わせて判定する。
// ログイン・ログアウト直後は mutate("/api/me") で再取得させる
export const useAuthStatus = () => {
  const { data, isLoading, mutate } = useSWR("/api/me", fetcher);

  return {
    // undefined: ロード中, null: 未ログイン, MeResponse: ログイン中
    me: data,
    isLoggedIn: !!data,
    isLoading,
    mutate,
  };
};
