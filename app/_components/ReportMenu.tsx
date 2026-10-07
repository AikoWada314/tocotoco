"use client";

import { useState } from "react";
import { useAuthStatus } from "@/app/_hooks/useAuthStatus";
import {
  REPORT_REASONS,
  REPORT_TARGET_LABELS,
  ReportTargetType,
} from "@/app/_libs/report";

type ReportMenuProps = {
  targetType: ReportTargetType;
  targetId: number;
  author: { id: number; name: string };
  onBlocked?: () => void; // ブロック後に一覧の取り直しや画面移動をする
};

// 他人の投稿・コメント・口コミに付ける「⋯」メニュー（通報／ブロック）
// 未ログイン・自分の投稿には何も出さない
export const ReportMenu = ({
  targetType,
  targetId,
  author,
  onBlocked,
}: ReportMenuProps) => {
  const { me, isLoggedIn } = useAuthStatus();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isLoggedIn || me?.user.id === author.id) return null;

  const sendReport = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason, detail }),
      });
      if (!res.ok) {
        alert("通報できませんでした。時間をおいてもう一度お試しください");
        return;
      }
      setIsReportOpen(false);
      setDetail("");
      alert("通報を受け付けました。ご協力ありがとうございます");
    } finally {
      setIsSending(false);
    }
  };

  const block = async () => {
    setIsMenuOpen(false);
    const ok = confirm(
      `${author.name}さんをブロックしますか？\nこの人のつぶやき・コメント・口コミが表示されなくなります。\nブロックはマイページからいつでも解除できます。`,
    );
    if (!ok) return;
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: author.id }),
    });
    if (!res.ok) {
      alert("ブロックできませんでした");
      return;
    }
    onBlocked?.();
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault(); // 親がLinkでも遷移させない
          setIsMenuOpen((open) => !open);
        }}
        className="px-1 py-1"
        aria-label="メニュー"
        aria-expanded={isMenuOpen}
      >
        <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
          <circle cx="2" cy="2" r="1.5" fill="#94a3b8" />
          <circle cx="8" cy="2" r="1.5" fill="#94a3b8" />
          <circle cx="14" cy="2" r="1.5" fill="#94a3b8" />
        </svg>
      </button>

      {isMenuOpen && (
        <>
          {/* メニューの外を押したら閉じる */}
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-[12px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setIsReportOpen(true);
              }}
              className="block w-full px-4 py-3 text-left text-[14px] text-[#0f172a] hover:bg-[#f8fafc]"
            >
              {REPORT_TARGET_LABELS[targetType]}を通報する
            </button>
            <button
              type="button"
              onClick={block}
              className="block w-full border-t border-[#f1f5f9] px-4 py-3 text-left text-[14px] text-[#ef4444] hover:bg-[#fef2f2]"
            >
              {author.name}さんをブロック
            </button>
          </div>
        </>
      )}

      {/* 通報フォーム（モーダル） */}
      {isReportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setIsReportOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="report-title"
              className="text-[16px] font-bold text-[#0f172a]"
            >
              {REPORT_TARGET_LABELS[targetType]}を通報する
            </h2>
            <p className="mt-1 text-[12px] text-[#64748b]">
              運営が内容を確認します。通報したことは相手に知らされません。
            </p>

            <fieldset className="mt-4 flex flex-col gap-2">
              <legend className="mb-1 text-[13px] font-medium text-[#334155]">
                理由
              </legend>
              {REPORT_REASONS.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 text-[14px] text-[#0f172a]"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={item}
                    checked={reason === item}
                    onChange={() => setReason(item)}
                    className="accent-[#3a7e69]"
                  />
                  {item}
                </label>
              ))}
            </fieldset>

            <label className="mt-4 block text-[13px] font-medium text-[#334155]">
              詳しく(任意)
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                maxLength={1000}
                rows={3}
                className="mt-1 w-full rounded-[12px] bg-[#f1f5f9] px-3 py-2 text-[16px] text-[#0f172a] outline-none"
              />
            </label>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="flex-1 rounded-[12px] bg-[#f1f5f9] py-3 text-[14px] font-bold text-[#334155]"
              >
                やめる
              </button>
              <button
                type="button"
                onClick={sendReport}
                disabled={isSending}
                className="flex-1 rounded-[12px] bg-[#ef4444] py-3 text-[14px] font-bold text-white disabled:opacity-50"
              >
                {isSending ? "送信中..." : "通報する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
