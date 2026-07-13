"use client";

import Image from "next/image";
import Link from "next/link";
import { getPostImageUrl } from "@/app/_libs/storage";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { formatDateTime } from "@/app/_libs/format";
import { EventsIndexResponse } from "@/app/api/events/route";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";
import { useState } from "react";

// Date → "2026-07-01" 形式の文字列に変換
const formatYmd = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function EventPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // カレンダーが表示している月（月初の日付で持つ）
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  // ① 直近のイベント一覧用（今日以降・近い順・最大10件）
  const { data, isLoading } = useApiSWR<EventsIndexResponse>(`/api/events`);
  const events = data?.events;

  // ② カレンダー用（表示中の月のイベント。タイムゾーンのずれ対策で前後1日広めに取る）
  const from = formatYmd(
    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 0),
  );
  const to = formatYmd(
    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
  );
  const { data: monthData } = useApiSWR<EventsIndexResponse>(
    `/api/events?from=${from}&to=${to}`,
  );
  const monthEvents = monthData?.events ?? [];

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

  // 同じ日付かどうかを判定する関数
  const isSameDay = (a: Date, b: Date) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  // カレンダーにイベントがある日付をハイライトするための関数（表示中の月のデータを使う）
  const hasEvent = (date: Date) => {
    return monthEvents.some((event) =>
      isSameDay(new Date(event.eventDate), date),
    );
  };

  // 日付選択中はその日のイベント（カレンダー用データから）、未選択なら直近のイベント
  const filteredEvents = selectedDate
    ? monthEvents.filter((event) =>
        isSameDay(new Date(event.eventDate), selectedDate),
      )
    : events;

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
          //イベントがあればドットを表示する
          tileContent={({ date, view }) =>
            view === "month" && hasEvent(date) ? (
              <div className="event-dot" />
            ) : null
          }
          onClickDay={(date) => {
            if (selectedDate && isSameDay(selectedDate, date)) {
              setSelectedDate(null); // クリックした日付がすでに選択されている場合は選択解除
            } else {
              setSelectedDate(date); // クリックした日付を選択
            }
          }}
          // 月送りしたら、その月のイベントを取得し直す（日付選択は解除）
          onActiveStartDateChange={({ activeStartDate }) => {
            if (activeStartDate) {
              setCalendarMonth(activeStartDate);
              setSelectedDate(null);
            }
          }}
          value={selectedDate}
        />

        <h2 className="mb-3 mt-6 text-[16px] font-bold text-[#0f172a]">
          {selectedDate ? `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 のイベント` : "直近のイベント"}
        </h2>

        {filteredEvents.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            {selectedDate ? "選択した日付にイベントはありません" : "イベントはまだありません"}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredEvents.map((event) => (
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
