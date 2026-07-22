"use client";

import Link from "next/link";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { SearchResponse } from "@/app/api/search/route";
import { useState } from "react";

// タイプごとの遷移先とバッジ表示（口コミ→親スポット、コメント→親投稿に飛ぶ）
const TYPE_META = {
  spot: {
    base: "/spots",
    label: "スポット",
    badge: "bg-[rgba(58,126,105,0.1)] text-[#3a7e69]",
  },
  review: {
    base: "/spots",
    label: "口コミ",
    badge: "bg-[rgba(58,126,105,0.1)] text-[#3a7e69]",
  },
  event: {
    base: "/events",
    label: "イベント",
    badge: "bg-[#fffbeb] text-[#d97706]",
  },
  post: {
    base: "/posts",
    label: "つぶやき",
    badge: "bg-[#eff6ff] text-[#2563eb]",
  },
  comment: {
    base: "/posts",
    label: "コメント",
    badge: "bg-[#eff6ff] text-[#2563eb]",
  },
} as const;

export default function SearchPage() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  const { data, isLoading } = useApiSWR<SearchResponse>(
    query ? `/api/search?query=${encodeURIComponent(query)}` : null,
    { requireAuth: false },
  );
  const results = data?.results ?? [];

  return (
    <div className="relative flex flex-col flex-1">
      {/* 検索バー */}
      <div className="bg-white border-b border-[#f1f5f9] px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault(); // ページリロードを止める(formのデフォルト動作)
            setQuery(text.trim()); // 入力中の文字を「確定」に昇格
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
              placeholder="つぶやき、スポット、イベントを検索"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-[#f1f5f9] rounded-[12px] pl-10 pr-4 py-2.5 text-[16px] text-[#0f172a] placeholder:text-[#64748b] outline-none"
            />
          </div>
        </form>
      </div>

      {/* 検索結果 */}
      <div className="flex-1 p-4 pb-32">
        {query && (
          <h2 className="text-[14px] font-medium text-[#0f172a] mb-4">
            検索結果
          </h2>
        )}
        {isLoading && (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            検索中...
          </p>
        )}
        {query && !isLoading && results.length === 0 && (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            「{query}」の検索結果はありませんでした
          </p>
        )}
        <ul className="flex flex-col gap-4">
          {results.map((result) => (
            <li key={result.type + result.id}>
              <Link
                href={`${TYPE_META[result.type].base}/${result.linkId}`}
                className="block rounded-[12px] border border-[#f1f5f9] bg-white p-[13px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:border-[#e2e8f0] hover:bg-[#f8fafc]"
              >
                <span
                  className={`inline-block rounded-[4px] px-2 py-0.5 text-[10px] font-medium ${TYPE_META[result.type].badge}`}
                >
                  {TYPE_META[result.type].label}
                </span>
                {result.title && (
                  <p className="mt-2 text-[14px] font-medium leading-[20px] text-[#0f172a]">
                    {result.title}
                  </p>
                )}
                {result.text && (
                  <p className="mt-1 line-clamp-2 text-[12px] leading-[16px] text-[#64748b]">
                    {result.text}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
