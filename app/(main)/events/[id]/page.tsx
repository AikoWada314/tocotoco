"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { EventShowResponse } from "@/app/api/events/[id]/route";
import { getPostImageUrl } from "@/app/_libs/storage";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { PageHeader } from "@/app/_components/PageHeader";
import { formatDateTime, formatTime } from "@/app/_libs/format";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

export default function Page() {
  const { id } = useParams();
  const { data, isLoading } = useApiSWR<EventShowResponse>(`/api/events/${id}`);
  const event = data?.event;

  if (isLoading)
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        読み込み中...
      </div>
    );
  if (!event)
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        イベントが見つかりません
      </div>
    );

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="イベント詳細" />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <article className="flex flex-col gap-4 pt-4 pb-10">
          {/* 画像（あれば） */}
          {event.images.length > 0 && (
            <div className="px-4">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[12px] border border-[#3a7e69]/10 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                <Image
                  src={getPostImageUrl(event.images[0].imageUrl)}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* タイトル・基本情報 */}
          <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
            <h1 className="text-[24px] font-medium text-[#0f172a] leading-[30px] whitespace-pre-wrap">
              {event.title}
            </h1>
            <div className="flex flex-col gap-4 pt-1">
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#eff9f5]">
                  <svg width="18" height="20" viewBox="0 0 20 22" fill="none">
                    <path
                      d="M2.16667 21.6667C1.57083 21.6667 1.06076 21.4545 0.636458 21.0302C0.212153 20.6059 0 20.0958 0 19.5V4.33333C0 3.7375 0.212153 3.22743 0.636458 2.80312C1.06076 2.37882 1.57083 2.16667 2.16667 2.16667H3.25V0H5.41667V2.16667H14.0833V0H16.25V2.16667H17.3333C17.9292 2.16667 18.4392 2.37882 18.8635 2.80312C19.2878 3.22743 19.5 3.7375 19.5 4.33333V19.5C19.5 20.0958 19.2878 20.6059 18.8635 21.0302C18.4392 21.4545 17.9292 21.6667 17.3333 21.6667H2.16667ZM2.16667 19.5H17.3333V8.66667H2.16667V19.5ZM2.16667 6.5H17.3333V4.33333H2.16667V6.5Z"
                      fill="#3a7e69"
                    />
                  </svg>
                </div>
                <p className="text-[16px] text-[#0f172a] leading-6">
                  {event.eventEndDate
                    ? new Date(event.eventDate).toDateString() ===
                      new Date(event.eventEndDate).toDateString()
                      ? `${formatDateTime(event.eventDate)} 〜 ${formatTime(event.eventEndDate)}` // 同日: 時刻だけ
                      : `${formatDateTime(event.eventDate)} 〜 ${formatDateTime(event.eventEndDate)}` // 別日: 日付も
                    : formatDateTime(event.eventDate)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#eff9f5]">
                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                    <path
                      d="M8 0C3.58 0 0 3.58 0 8C0 13.25 7.05 19.42 7.35 19.68C7.72 20 8.28 20 8.65 19.68C8.95 19.42 16 13.25 16 8C16 3.58 12.42 0 8 0ZM8 11C6.34 11 5 9.66 5 8C5 6.34 6.34 5 8 5C9.66 5 11 6.34 11 8C11 9.66 9.66 11 8 11Z"
                      fill="#3a7e69"
                    />
                  </svg>
                </div>
                <p className="text-[16px] font-medium text-[#0f172a] leading-6">
                  {event.place}
                </p>
              </div>
            </div>
          </div>

          {/* 地図 */}
          <div className="px-4">
            <div className="h-[300px] overflow-hidden rounded-[12px] border border-[#3a7e69]/10">
              <APIProvider
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
              >
                <Map
                  defaultCenter={{ lat: event.lat, lng: event.lng }}
                  defaultZoom={16}
                  mapId="DEMO_MAP_ID"
                >
                  <AdvancedMarker
                    position={{ lat: event.lat, lng: event.lng }}
                  />
                </Map>
              </APIProvider>
            </div>
          </div>

          {/* イベントについて */}
          <div className="flex flex-col gap-3 px-4 pt-2 pb-6">
            <h2 className="border-l-4 border-[#3a7e69] pl-4 text-[18px] font-medium text-[#0f172a] leading-[28px]">
              イベントについて
            </h2>
            <p className="text-[14px] font-medium text-[#334155] leading-[22.75px] whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* 主催者 */}
          <div className="mx-4 flex flex-col gap-4 rounded-[12px] border border-[#3a7e69]/10 bg-[#eff9f5]/20 px-4 py-6">
            <p className="text-[14px] font-medium text-[#3a7e69] leading-5">
              主催者
            </p>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[16px] font-medium text-[#0f172a] leading-6">
                {event.organizerName}
              </p>
              {event.organizerLink && (
                <a
                  href={event.organizerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#3a7e69] px-[13px] py-[5px] text-[14px] font-medium text-[#3a7e69] leading-5 transition-colors hover:bg-[#3a7e69] hover:text-white"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="shrink-0"
                  >
                    <path
                      d="M8.5 1.5h4v4M12.5 1.5l-6 6M6 2.5H2.5A1 1 0 0 0 1.5 3.5v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  リンクを開く
                </a>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
