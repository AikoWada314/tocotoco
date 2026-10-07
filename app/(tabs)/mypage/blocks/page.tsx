"use client";

import Image from "next/image";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { BlocksIndexResponse } from "@/app/api/blocks/route";
import { PageHeader } from "@/app/_components/PageHeader";

export default function BlocksPage() {
  const { data, isLoading, mutate } =
    useApiSWR<BlocksIndexResponse>("/api/blocks");
  const blocks = data?.blocks ?? [];

  const unblock = async (userId: number, name: string) => {
    if (!confirm(`${name}さんのブロックを解除しますか？`)) return;
    const res = await fetch(`/api/blocks/${userId}`, { method: "DELETE" });
    if (!res.ok) {
      alert("解除できませんでした");
      return;
    }
    mutate();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="ブロック中のユーザー" />
      <div className="flex-1 overflow-y-auto pb-20">
        <p className="px-4 pt-4 text-[12px] text-[#64748b]">
          ブロックした人のつぶやき・コメント・口コミは表示されません。相手にブロックしたことは知らされません。
        </p>
        {isLoading && (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            読み込み中...
          </p>
        )}
        {!isLoading && blocks.length === 0 && (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            ブロックしているユーザーはいません
          </p>
        )}
        <ul className="mt-2">
          {blocks.map(({ id, blocked }) => (
            <li
              key={id}
              className="flex items-center gap-3 border-b border-[#f1f5f9] px-4 py-3"
            >
              <div className="size-10 shrink-0 overflow-hidden rounded-full bg-[#e2e8f0]">
                <Image
                  src={blocked.iconUrl || "/user.svg"}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-[#0f172a]">
                  {blocked.name}
                </p>
                <p className="truncate text-[12px] text-[#64748b]">
                  @{blocked.nickname}
                </p>
              </div>
              <button
                type="button"
                onClick={() => unblock(blocked.id, blocked.name)}
                className="shrink-0 rounded-full border border-[#cbd5e1] px-3 py-1.5 text-[12px] font-medium text-[#334155] hover:bg-[#f8fafc]"
              >
                解除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
