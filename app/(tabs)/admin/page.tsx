"use client";

import Link from "next/link";
import { useState } from "react";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { AdminReportsResponse } from "@/app/api/admin/reports/route";
import { AdminContactsResponse } from "@/app/api/admin/contacts/route";
import { REPORT_TARGET_LABELS } from "@/app/_libs/report";
import { PageHeader } from "@/app/_components/PageHeader";
import { formatDateTime } from "@/app/_libs/format";

type Status = "open" | "resolved";

// 対応状況の切り替え（通報・お問い合わせ共通）
const patchStatus = async (path: string, status: Status) => {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) alert("更新に失敗しました");
};

const TABS = [
  { key: "reports", label: "通報" },
  { key: "contacts", label: "お問い合わせ" },
] as const;

// 管理者用ページ（権限はAPI側で確認。権限が無ければ403で何も取れない）
export default function AdminPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["key"]>("reports");
  const { data, error, isLoading, mutate } =
    useApiSWR<AdminReportsResponse>("/api/admin/reports");
  const { data: contactData, mutate: mutateContacts } =
    useApiSWR<AdminContactsResponse>("/api/admin/contacts");
  const reports = data?.reports ?? [];
  const contacts = contactData?.contacts ?? [];
  const openCount = reports.filter((r) => r.status === "open").length;
  const openContactCount = contacts.filter((c) => c.status === "open").length;

  const updateStatus = async (id: number, status: Status) => {
    await patchStatus(`/api/admin/reports/${id}`, status);
    mutate();
  };
  const updateContactStatus = async (id: number, status: Status) => {
    await patchStatus(`/api/admin/contacts/${id}`, status);
    mutateContacts();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="管理" />
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
            {tab.key === "reports" && openCount > 0 && ` (${openCount})`}
            {tab.key === "contacts" &&
              openContactCount > 0 &&
              ` (${openContactCount})`}
          </button>
        ))}
      </div>
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

        {data && activeTab === "reports" && (
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

        {contactData && activeTab === "contacts" && (
          <section>
            <h2 className="mb-3 text-[14px] font-bold text-[#0f172a]">
              お問い合わせ(未対応 {openContactCount}件)
            </h2>
            {contacts.length === 0 && (
              <p className="py-4 text-[14px] text-[#64748b]">
                お問い合わせはまだありません
              </p>
            )}
            <ul className="flex flex-col gap-3">
              {contacts.map((contact) => (
                <li
                  key={contact.id}
                  className={`rounded-[12px] border p-3 ${
                    contact.status === "open"
                      ? "border-[#bfdbfe] bg-[#f8fbff]"
                      : "border-[#f1f5f9] bg-white opacity-70"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="rounded bg-[#eff6ff] px-2 py-0.5 font-medium text-[#2563eb]">
                      {contact.category}
                    </span>
                    <span className="ml-auto text-[#94a3b8]">
                      {formatDateTime(contact.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-[14px] text-[#0f172a]">
                    {contact.content}
                  </p>
                  <div className="mt-2 text-[12px] text-[#64748b]">
                    <p>
                      {contact.name ?? "(名前なし)"} /{" "}
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-[#3a7e69] underline"
                      >
                        {contact.email}
                      </a>
                    </p>
                    <p>
                      {contact.user
                        ? `ユーザー: ${contact.user.name} (@${contact.user.nickname})`
                        : "未ログインで送信"}
                    </p>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        updateContactStatus(
                          contact.id,
                          contact.status === "open" ? "resolved" : "open",
                        )
                      }
                      className="rounded-full border border-[#3a7e69] px-3 py-1 text-[12px] font-medium text-[#3a7e69]"
                    >
                      {contact.status === "open"
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
