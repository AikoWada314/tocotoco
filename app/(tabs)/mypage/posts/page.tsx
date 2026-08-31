"use client";

import Link from "next/link";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { PostsIndexResponse } from "@/app/api/posts/route";
import Image from "next/image";
import { getPostImageUrl } from "@/app/_libs/storage";
import { PageHeader } from "@/app/_components/PageHeader";
import { formatTimeAgo } from "@/app/_libs/format";

export default function MyPostsPage() {
  const { data, isLoading } = useApiSWR<PostsIndexResponse>("/api/me/posts");
  const posts = data?.posts ?? [];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="自分の投稿" />

      {/* 一覧本体 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            読み込み中...
          </p>
        )}
        {!isLoading && posts.length === 0 && (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            まだ投稿がありません
          </p>
        )}

        {/* 投稿一覧 */}
        {!isLoading && posts.length > 0 && (
          <div className="pb-32">
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
                        {post.user.nickname || post.user.name}
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
                  </div>
                </div>
              </article>
            </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
