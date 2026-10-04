"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/app/_components/PageHeader";
import { CONTACT_CATEGORIES } from "@/app/_libs/contact";
import {
  useContactForm,
  ContactFormValues,
} from "@/app/(tabs)/contact/_hooks/useContactForm";

const inputClass =
  "w-full rounded-[12px] bg-[#f1f5f9] px-4 py-3 text-[16px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none";

export default function ContactPage() {
  const [isSent, setIsSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useContactForm();

  const onSubmit = async (values: ContactFormValues) => {
    setServerError(null);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setServerError(
        "送信できませんでした。入力内容を確認して、もう一度お試しください",
      );
      return;
    }
    setIsSent(true);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="お問い合わせ" />
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {isSent ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-[18px] font-bold text-[#0f172a]">送信しました</p>
            <p className="text-[14px] leading-6 text-[#64748b]">
              お問い合わせありがとうございます。
              <br />
              内容を確認し、必要に応じてご入力のメールアドレスにご連絡します。
            </p>
            <Link
              href="/"
              className="mt-2 rounded-full bg-[#3a7e69] px-6 py-2.5 text-[14px] font-bold text-white"
            >
              トップへ戻る
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            noValidate
          >
            <p className="text-[13px] leading-6 text-[#64748b]">
              tocotocoについてのご質問・不具合のご報告・ご要望などをお送りください。いただいたメールアドレスは、このお問い合わせへのご連絡にだけ使います。
            </p>

            <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[#334155]">
              お問い合わせの種類
              <select {...register("category")} className={inputClass}>
                {CONTACT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[#334155]">
              お名前(任意)
              <input
                {...register("name", {
                  maxLength: {
                    value: 50,
                    message: "50文字以内で入力してください",
                  },
                })}
                autoComplete="name"
                className={inputClass}
              />
              {errors.name && (
                <span className="px-1 text-xs text-red-500">
                  {errors.name.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[#334155]">
              メールアドレス
              <input
                type="email"
                {...register("email", {
                  required: "メールアドレスを入力してください",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "メールアドレスの形式が正しくありません",
                  },
                })}
                autoComplete="email"
                placeholder="example@mail.com"
                className={inputClass}
              />
              {errors.email && (
                <span className="px-1 text-xs text-red-500">
                  {errors.email.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-[14px] font-medium text-[#334155]">
              お問い合わせ内容
              <textarea
                {...register("content", {
                  required: "内容を入力してください",
                  maxLength: {
                    value: 2000,
                    message: "2000文字以内で入力してください",
                  },
                  validate: (value) =>
                    value.trim() !== "" || "内容を入力してください",
                })}
                rows={6}
                className={inputClass}
              />
              {errors.content && (
                <span className="px-1 text-xs text-red-500">
                  {errors.content.message}
                </span>
              )}
            </label>

            {/* ボット対策のおとり項目（人には見えない） */}
            <input
              {...register("website")}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            {serverError && (
              <p className="text-[13px] text-red-500">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[12px] bg-[#3a7e69] py-4 text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "送信中..." : "送信する"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
