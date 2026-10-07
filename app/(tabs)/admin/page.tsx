"use client";

import Link from "next/link";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { AdminReportsResponse } from "@/app/api/admin/reports/route";
import { REPORT_TARGET_LABELS } from "@/app/_libs/report";
import { PageHeader } from "@/app/_components/PageHeader";
import { formatDateTime } from "@/app/_libs/format";

// 管理者用ページ（権限はAPI側で確認。権限が無ければ403で何も取れない）
export default function AdminPage() {
  const { data, error, isLoading, mutate } =
    useApiSWR<AdminReportsResponse>("/api/admin/reports");
  const reports = data?.reports ?? [];
  const openCount = reports.filter((r) => r.status === "open").length;

  const updateStatus = async (id: number, status: "open" | "resolved") => {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      alert("更新に失敗しました");
      return;
    }
    mutate();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="管理" />
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {error && (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            このページを見る権限がありません
          </p>
        )}
        {isLoading && (
          <p className="py-8 text-center text-[14px] text-[#64748b]">
            読み込み中...
          </p>
        )}

        {data && (
          <section>
            <h2 className="mb-3 text-[14px] font-bold text-[#0f172a]">
              通報(未対応 {openCount}件)
            </h2>
            {reports.length === 0 && (
              <p className="py-4 text-[14px] text-[#64748b]">
                通報はまだありません
              </p>
            )}
            <ul className="flex flex-col gap-3">
              {reports.map((report) => (
                <li
                  key={report.id}
                  className={`rounded-[12px] border p-3 ${
                    report.status === "open"
                      ? "border-[#fecaca] bg-[#fffafa]"
                      : "border-[#f1f5f9] bg-white opacity-70"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="rounded bg-[#f1f5f9] px-2 py-0.5 font-medium text-[#334155]">
                      {REPORT_TARGET_LABELS[report.targetType]}
                    </span>
                    <span className="font-bold text-[#ef4444]">
                      {report.reason}
                    </span>
                    <span className="ml-auto text-[#94a3b8]">
                      {formatDateTime(report.createdAt)}
                    </span>
                  </div>

                  {report.target ? (
                    <Link
                      href={report.target.href}
                      className="mt-2 block rounded-[8px] bg-[#f8fafc] p-2 hover:bg-[#f1f5f9]"
                    >
                      <p className="text-[12px] text-[#64748b]">
                        投稿者: {report.target.author.name} (@
                        {report.target.author.nickname})
                      </p>
                      <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-[14px] text-[#0f172a]">
                        {report.target.text || "(本文なし)"}
                      </p>
                    </Link>
                  ) : (
                    <p className="mt-2 text-[12px] text-[#94a3b8]">
                      対象はすでに削除されています
                    </p>
                  )}

                  {report.detail && (
                    <p className="mt-2 whitespace-pre-wrap text-[13px] text-[#334155]">
                      詳細: {report.detail}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[12px] text-[#64748b]">
                      通報者: {report.reporter.name} (@
                      {report.reporter.nickname})
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          report.id,
                          report.status === "open" ? "resolved" : "open",
                        )
                      }
                      className="rounded-full border border-[#3a7e69] px-3 py-1 text-[12px] font-medium text-[#3a7e69]"
                    >
                      {report.status === "open"
                        ? "対応済みにする"
                        : "未対応に戻す"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
