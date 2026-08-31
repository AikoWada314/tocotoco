"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { PostShowResponse } from "@/app/api/posts/[id]/route";
import { getPostImageUrl } from "@/app/_libs/storage";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { PageHeader } from "@/app/_components/PageHeader";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { MeResponse } from "@/app/api/me/route";
import { useState } from "react";
import {
  useCommentForm,
  CommentFormValues,
} from "@/app/posts/_hooks/useCommentForm";
import { formatDateTime, formatTimeAgo } from "@/app/_libs/format";
import { FavoriteButton } from "@/app/_components/FavoriteButton";

export default function Page() {
  const { id } = useParams();
  // 詳細も未ログインで見られるように認証なしで取得
  const { data, isLoading, mutate } = useApiSWR<PostShowResponse>(
    `/api/posts/${id}`,
    { requireAuth: false },
  );
  const post = data?.post;
  const { token } = useSupabaseSession();
  const { data: me } = useApiSWR<MeResponse>("/api/me");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useCommentForm();
  const onSubmit = async (values: CommentFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ?? "",
        },
        body: JSON.stringify({ content: values.content }),
      });
      if (!res.ok) {
        alert("コメントの投稿に失敗しました");
        return;
      }

      reset(); // 入力クリア（setCommentContent("") の代わり）
      mutate();
    } finally {
      setIsSubmitting(false);
    }
  };
  const toggleLike = async () => {
    if (!token) return;
    await fetch(`/api/posts/${id}/likes`, {
      method: "POST",
      headers: { Authorization: token },
    });
    mutate();
  };
  const toggleFavorite = async () => {
    if (!token) return;
    await fetch(`/api/posts/${id}/favorites`, {
      method: "POST",
      headers: { Authorization: token },
    });
    mutate();
  };

  if (isLoading)
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        読み込み中...
      </div>
    );
  if (!post)
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        記事が見つかりません
      </div>
    );

  return (
    // ログイン時は固定Footer(下部ナビ)の高さぶん下に余白を取り、コメント入力バーをナビの上に置く
    <div
      className={`flex flex-col flex-1 min-h-0 bg-white ${token ? "pb-16" : ""}`}
    >
      <PageHeader title="つぶやき詳細" />

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* 投稿本体 */}
        <article className="flex flex-col">
          {/* ユーザー情報 */}
          <div className="flex gap-3 items-center p-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#f1f5f9] shrink-0">
              <Image
                src={post.user.iconUrl || "/user.svg"}
                alt={post.user.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-medium text-[#0f172a]">
                {post.user.nickname || post.user.name}
              </p>
              <p className="text-[12px] text-[#64748b] mt-1">
                {formatDateTime(post.createdAt)}
              </p>
            </div>
            <button
              className="shrink-0 px-1 self-start pt-1"
              aria-label="メニュー"
            >
              <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
                <circle cx="2" cy="2" r="1.5" fill="#94a3b8" />
                <circle cx="8" cy="2" r="1.5" fill="#94a3b8" />
                <circle cx="14" cy="2" r="1.5" fill="#94a3b8" />
              </svg>
            </button>
          </div>

          {/* 本文 */}
          <div className="px-4">
            <p className="text-[16px] text-[#1e293b] leading-[26px] whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* 画像（あれば） */}
          {post.images.length > 0 && (
            <div className="px-4 py-4">
              <div className="relative aspect-[3/2] overflow-hidden rounded-[12px]">
                <Image
                  src={getPostImageUrl(post.images[0].imageUrl)}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* いいね・コメント数 */}
          <div className="border-t border-b border-[#f8fafc] flex gap-6 items-center px-4 py-[13px]">
            <button
              className="flex items-center gap-1.5"
              onClick={toggleLike}
            >
              <svg width="18" height="17" viewBox="0 0 18 17" fill="none">
                <path
                  d="M9 15.5C9 15.5 1.5 11 1.5 5.75C1.5 4.55653 1.97411 3.41193 2.81802 2.56802C3.66193 1.72411 4.80653 1.25 6 1.25C7.19347 1.25 8.33807 1.72411 9.18198 2.56802L9 2.75L8.81802 2.56802C9.66193 1.72411 10.8065 1.25 12 1.25C13.1935 1.25 14.3381 1.72411 15.182 2.56802C16.0259 3.41193 16.5 4.55653 16.5 5.75C16.5 11 9 15.5 9 15.5Z"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={
                    post.likes.some((like) => like.userId === me?.user.id)
                      ? "#ef4444"
                      : "none"
                  }
                />
              </svg>
              <span className="text-[14px] text-[#ef4444]">
                {post.likes.length}
              </span>
            </button>
            <div className="flex gap-1.5 items-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
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
            </div>

            {/* お気に入り（数は出さずマークのみ） */}
            <FavoriteButton
              active={post.favorites.some((fav) => fav.userId === me?.user.id)}
              onClick={toggleFavorite}
            />
          </div>
        </article>

        {/* コメントセクション */}
        <section className="bg-[rgba(239,249,245,0.3)]">
          <h2 className="px-4 pt-5 pb-2 text-[12px] font-bold text-[#64748b] tracking-[0.6px] uppercase">
            コメント ({post.comments.length})
          </h2>

          {post.comments.length === 0 ? (
            <p className="text-center text-[13px] text-[#94a3b8] py-10">
              まだコメントはありません
            </p>
          ) : (
            post.comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white border-b border-[#f1f5f9] flex gap-3 items-start px-4 py-4"
              >
                {/* アバター */}
                <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={comment.user.iconUrl || "/user.svg"}
                    alt={comment.user.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 本文カラム */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px] font-medium text-[#0f172a]">
                      {comment.user.nickname || comment.user.name}
                    </p>
                    <span className="text-[10px] text-[#94a3b8] shrink-0 mt-0.5">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#334155] leading-[21px] mt-1 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  {comment.imageUrl && (
                    <div className="mt-2 rounded-[10px] overflow-hidden">
                      <Image
                        src={getPostImageUrl(comment.imageUrl)}
                        alt=""
                        width={300}
                        height={200}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border-t border-[#f1f5f9] flex gap-3 items-center px-4 pt-[13px] pb-4 shrink-0"
      >
        {/* 自分のアバター */}
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
          <Image
            src={me?.user.iconUrl || "/user.svg"}
            alt=""
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 入力欄 + 送信ボタン */}
        <div className="flex-1 relative">
          <input
            {...register("content", { required: true })}
            type="text"
            placeholder="コメントを入力..."
            className="w-full bg-[#f1f5f9] rounded-full pl-4 pr-12 py-2.5 text-[14px] text-[#334155] placeholder:text-[#6b7280] outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
            aria-label="送信"
            disabled={isSubmitting}
          >
            {/* 紙飛行機アイコン */}
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
              <path
                d="M19 1L9 11M19 1L13 18L9 11L1 7L19 1Z"
                stroke="#3a7e69"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
