"use client";

import Image from "next/image";
import Link from "next/link";
import { getPostImageUrl } from "@/app/_libs/storage";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { formatDateTime } from "@/app/_libs/format";
import { EventsIndexResponse } from "@/app/api/events/route";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css"; // 標準スタイルの上書き（後に読み込む方が勝つ）

export default function EventPage() {
  const { data, isLoading } = useApiSWR<EventsIndexResponse>(`/api/events`);
  const events = data?.events;

  if (isLoading)
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        読み込み中...
      </div>
    );
  if (!events)
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        イベントが見つかりません
      </div>
    );

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
        <h1 className="py-4 text-center text-[18px] font-bold text-[#0f172a]">
          イベントカレンダー
        </h1>

        {/* カレンダー */}
        <Calendar
          locale="ja-JP" // 曜日を「日月火水木金土」に
          formatDay={(_, date) => String(date.getDate())} // 「15日」→「15」にする
          />

        <h2 className="mb-3 mt-6 text-[16px] font-bold text-[#0f172a]">
          直近のイベント
        </h2>

        {events.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            イベントはまだありません
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="overflow-hidden rounded-[12px] border border-[#f1f5f9] bg-white transition-colors hover:border-[#e2e8f0] hover:bg-[#f8fafc]"
              >
                <Link href={`/events/${event.id}`} className="flex gap-3">
                  {/* 画像（なければグレーのプレースホルダー） */}
                  <div className="relative h-[100px] w-[100px] shrink-0 bg-[#f1f5f9]">
                    {event.images.length > 0 && (
                      <Image
                        src={getPostImageUrl(event.images[0].imageUrl)}
                        alt=""
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* テキスト部分 */}
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-2 pr-3">
                    <p className="line-clamp-2 text-[15px] font-medium leading-[22px] text-[#0f172a]">
                      {event.title}
                    </p>
                    <p className="flex items-center gap-1.5 text-[12px] text-[#64748b]">
                      {/* カレンダーアイコン */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="shrink-0"
                      >
                        <rect
                          x="1.5"
                          y="2.5"
                          width="11"
                          height="10"
                          rx="1.5"
                          stroke="#64748b"
                        />
                        <path
                          d="M1.5 5.5h11M4.5 1v3M9.5 1v3"
                          stroke="#64748b"
                        />
                      </svg>
                      {formatDateTime(event.eventDate)}
                    </p>
                    <p className="flex items-center gap-1.5 text-[12px] text-[#64748b]">
                      {/* ピンアイコン */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="shrink-0"
                      >
                        <path
                          d="M7 13s4.5-3.6 4.5-7A4.5 4.5 0 1 0 2.5 6c0 3.4 4.5 7 4.5 7Z"
                          stroke="#64748b"
                        />
                        <circle cx="7" cy="6" r="1.5" stroke="#64748b" />
                      </svg>
                      <span className="truncate">{event.place}</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
