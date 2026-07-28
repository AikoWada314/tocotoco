"use client";

import Link from "next/link";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { MyFavoritesResponse } from "@/app/api/me/favorites/route";
import { useState } from "react";
import Image from "next/image";
import { getPostImageUrl } from "@/app/_libs/storage";
import { PageHeader } from "@/app/_components/PageHeader";

const TABS = [
  { key: "spots", label: "スポット" },
  { key: "events", label: "イベント" },
  { key: "posts", label: "つぶやき" },
] as const;

export default function FavoritePage() {
  const { data, isLoading } =
    useApiSWR<MyFavoritesResponse>("/api/me/favorites");
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["key"]>("spots");
  const spots = data?.spots ?? [];
  const events = data?.events ?? [];
  const posts = data?.posts ?? [];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="お気に入り" />
      {/* タブバー */}
      <div className="flex border-b border-[#f1f5f9]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-[14px] font-medium ${
              activeTab === tab.key
                ? "border-b-2 border-[#3a7e69] text-[#3a7e69]"
                : "text-[#64748b]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 一覧本体 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            読み込み中...
          </p>
        )}

        {/* スポット */}
        {!isLoading &&
          activeTab === "spots" &&
          (spots.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-[#64748b]">
              お気に入りがありません
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {spots.map((spot) => (
                <li key={spot.id}>
                  <Link
                    href={`/spots/${spot.id}`}
                    className="flex gap-3 overflow-hidden rounded-[12px] border border-[#f1f5f9] bg-white transition-colors hover:border-[#e2e8f0] hover:bg-[#f8fafc]"
                  >
                    <div className="relative h-[88px] w-[88px] shrink-0 bg-[#f1f5f9]">
                      {spot.images[0] && (
                        <Image
                          src={getPostImageUrl(spot.images[0].imageUrl)}
                          alt=""
                          fill
                          sizes="88px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center py-2 pr-3">
                      <p className="line-clamp-2 text-[15px] font-medium text-[#0f172a]">
                        {spot.name}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ))}

        {/* イベント */}
        {!isLoading &&
          activeTab === "events" &&
          (events.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-[#64748b]">
              お気に入りがありません
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex gap-3 overflow-hidden rounded-[12px] border border-[#f1f5f9] bg-white transition-colors hover:border-[#e2e8f0] hover:bg-[#f8fafc]"
                  >
                    <div className="relative h-[88px] w-[88px] shrink-0 bg-[#f1f5f9]">
                      {event.images[0] && (
                        <Image
                          src={getPostImageUrl(event.images[0].imageUrl)}
                          alt=""
                          fill
                          sizes="88px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center py-2 pr-3">
                      <p className="line-clamp-2 text-[15px] font-medium text-[#0f172a]">
                        {event.title}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ))}

        {/* つぶやき */}
        {!isLoading &&
          activeTab === "posts" &&
          (posts.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-[#64748b]">
              お気に入りがありません
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}`}
                    className="flex gap-3 overflow-hidden rounded-[12px] border border-[#f1f5f9] bg-white transition-colors hover:border-[#e2e8f0] hover:bg-[#f8fafc]"
                  >
                    <div className="relative h-[88px] w-[88px] shrink-0 bg-[#f1f5f9]">
                      {post.images[0] && (
                        <Image
                          src={getPostImageUrl(post.images[0].imageUrl)}
                          alt=""
                          fill
                          sizes="88px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center py-2 pr-3">
                      <p className="line-clamp-2 text-[15px] font-medium text-[#0f172a]">
                        {post.content}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  );
}
