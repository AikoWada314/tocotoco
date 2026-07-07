"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { PostsIndexResponse } from "@/app/api/posts/route";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { getPostImageUrl } from "@/app/_libs/storage";

function formatTimeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

export default function PostPage() {
  const router = useRouter();
  const { data } = useApiSWR<PostsIndexResponse>("/api/posts");
  const posts = data?.posts ?? [];
  const { session } = useSupabaseSession();

  return (
    <div className="relative flex flex-col flex-1">
      {/* 検索バー */}
      <div className="bg-white border-b border-[#f8fafc] px-4 py-3">
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
          <div className="bg-[#f8fafc] rounded-2xl pl-10 pr-4 py-2.5 text-[14px] text-[#64748b]">
            つぶやき、スポット、イベントを検索
          </div>
        </div>
      </div>

      {/* 投稿一覧 */}
      <div className="flex-1 pb-32">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="block">
            <article className="border-b border-[#f1f5f9] px-4 py-4">
              <div className="flex gap-3">
                {/* アバター */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#e2e8f0] overflow-hidden">
                  <Image
                    src={post.user.iconUrl || "/user.svg"}
                    alt={post.user.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 右カラム */}
                <div className="flex-1 min-w-0 flex flex-col gap-[3.3px]">
                  {/* 名前・時刻・カテゴリバッジ */}
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#1e293b]">
                      {post.user.nickname ?? post.user.name}
                    </span>
                    <span className="text-[12px] text-[#94a3b8]">
                      {formatTimeAgo(post.createdAt)}
                    </span>
                    <div className="ml-auto shrink-0">
                      <span className="text-[10px] font-bold text-[#3a7e69] bg-[rgba(58,126,105,0.1)] rounded-full px-2 py-0.5">
                        {post.category.name}
                      </span>
                    </div>
                  </div>

                  {/* 本文 */}
                  <p className="text-[14px] text-[#334155] leading-[22.75px]">
                    {post.content}
                  </p>

                  {/* 画像（あれば） */}
                  {post.images.length > 0 && (
                    <div className="border border-[#f1f5f9] rounded-2xl overflow-hidden mt-1 pt-2.5 px-px pb-px">
                      <Image
                        src={getPostImageUrl(post.images[0].imageUrl)}
                        alt=""
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover rounded-[14px]"
                      />
                    </div>
                  )}

                  {/* いいね・コメント数 */}
                  <div className="flex items-center gap-6 mt-1">
                    <button className="flex items-center gap-1.5">
                      <svg
                        width="18"
                        height="17"
                        viewBox="0 0 18 17"
                        fill="none"
                      >
                        <path
                          d="M9 15.5C9 15.5 1.5 11 1.5 5.75C1.5 4.55653 1.97411 3.41193 2.81802 2.56802C3.66193 1.72411 4.80653 1.25 6 1.25C7.19347 1.25 8.33807 1.72411 9.18198 2.56802L9 2.75L8.81802 2.56802C9.66193 1.72411 10.8065 1.25 12 1.25C13.1935 1.25 14.3381 1.72411 15.182 2.56802C16.0259 3.41193 16.5 4.55653 16.5 5.75C16.5 11 9 15.5 9 15.5Z"
                          stroke="#3a7e69"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-[14px] text-[#3a7e69]">
                        {post.likes.length}
                      </span>
                    </button>

                    <button className="flex items-center gap-1.5">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          d="M15.75 8.625C15.7526 9.61459 15.5173 10.5903 15.0638 11.4713C14.5275 12.5236 13.7063 13.4071 12.6939 14.0235C11.6816 14.6399 10.5176 14.9653 9.33127 14.9625C8.34168 14.965 7.36595 14.7297 6.48502 14.2763L2.25 15.75L3.72375 11.515C3.27026 10.634 3.03498 9.65832 3.03752 8.66873C3.03471 7.48239 3.36012 6.31838 3.97651 5.30608C4.59291 4.29378 5.47637 3.4725 6.52877 2.93624C7.40969 2.4827 8.38542 2.24742 9.37502 2.25H9.75002C11.3123 2.33625 12.787 2.99925 13.8985 4.10148C15.0101 5.20371 15.6638 6.67772 15.75 8.24998V8.625Z"
                          stroke="#64748b"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-[14px] text-[#64748b]">
                        {post.comments.length}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* 新規投稿ボタン（フローティング） */}
      {session && (
        <button
          onClick={() => router.push("/posts/new")}
          className="fixed bottom-[88px] right-6 bg-[#3a7e69] rounded-full w-14 h-14 flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(58,126,105,0.3),0px_4px_6px_-4px_rgba(58,126,105,0.3)]"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
