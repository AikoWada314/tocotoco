"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { MeResponse } from "@/app/api/me/route";
import { supabase } from "@/app/_libs/supabase";

const MENU = [
  {
    href: "/mypage/posts",
    label: "自分の投稿",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v6h6M8 13h8M8 17h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/mypage/favorites",
    label: "お気に入り",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path
          d="M5 21V5q0-.825.588-1.413T7 3h10q.825 0 1.413.588T19 5v16l-7-3zm2-3.05l5-2.15l5 2.15V5H7z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: "/terms",
    label: "利用規約",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9 3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V5H9V3.5zM8 11h8M8 15h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function MyPage() {
  const router = useRouter();
  const { session, token } = useSupabaseSession();
  const { data: me } = useApiSWR<MeResponse>("/api/me");
  const user = me?.user;

  const handleLogout = async () => {
    await supabase.auth.signOut(); // セッションを破棄
    router.push("/");
  };

  return (
    <div className="relative flex flex-col flex-1">
      {/* ヘッダー（タブpageなので戻るボタンなし・中央タイトル＋通知ベル） */}
      <header className="relative flex h-[73px] shrink-0 items-center justify-center border-b border-[#f1f5f9] bg-white px-4">
        <h1 className="text-[18px] font-medium text-[#0f172a]">マイページ</h1>
        {/* 通知ベル（機能は通知実装時。今は飾り） */}
        <button className="absolute right-4 p-1" aria-label="通知">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
              stroke="#3a7e69"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      {/* プロフィール */}
      <div className="flex flex-col items-center gap-3 px-4 pt-6 pb-5">
        {/* アバター＋編集ペン */}
        <div className="relative">
          <div className="size-24 overflow-hidden rounded-full border-4 border-white bg-[#e2e8f0] shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
            <Image
              src={user?.iconUrl || "/user.svg"}
              alt={user?.name ?? ""}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>
          {/* 編集ペンのバッジ（プロフィール編集へ） */}
          <Link
            href="/mypage/edit"
            aria-label="プロフィール編集"
            className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#3a7e69] text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* 名前・ハンドル */}
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-[22px] font-bold text-[#0f172a]">{user?.name}</p>
          {user?.nickname && (
            <p className="text-[14px] text-[#64748b]">@{user.nickname}</p>
          )}
        </div>

        {/* プロフィール編集ボタン */}
        <Link
          href="/mypage/edit"
          className="rounded-full bg-[#3a7e69] px-6 py-2.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
        >
          プロフィール編集
        </Link>
      </div>

      {/* メニュー（同じ形の行を配列から生成） */}
      <nav className="mt-2 flex flex-col">
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 border-b border-[#f1f5f9] px-4 py-4 transition-colors hover:bg-[#f8fafc]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#eff9f5] text-[#3a7e69]">
              {item.icon}
            </div>
            <span className="flex-1 text-[16px] font-medium text-[#0f172a]">
              {item.label}
            </span>
            {/* 右シェブロン */}
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path
                d="M1 1l6 6-6 6"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ))}
      </nav>

      {/* ログアウト（下寄せ。footer(h-16)にかぶらないよう下余白を確保） */}
      <div className="mt-auto px-4 pt-4 pb-20">
        <button
          onClick={handleLogout}
          className="w-full rounded-[12px] bg-[#fef2f2] py-4 text-[16px] font-bold text-[#ef4444] transition-colors hover:bg-[#fee2e2]"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
