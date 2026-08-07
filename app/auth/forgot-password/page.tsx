"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/app/_libs/supabase";
import Link from "next/link";
import Image from "next/image";
import { SubmitButton } from "@/app/_components/SubmitButton";
import { EmailIcon } from "@/app/_components/icons/EmailIcon";

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [sentMessage, setSentMessage] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>();

  const resetPasswordForEmail = async (data: ForgotPasswordFormData) => {
    setServerError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setServerError(
        "メールの送信に失敗しました。時間をおいて再度お試しください。",
      );
      return;
    }

    setSentMessage(true);
  };

  return (
    <div className="bg-[#eff9f5] flex flex-col flex-1 items-center px-4 py-16">
      <div className="flex items-center gap-2 mb-6">
        <Image
          src="/logo.svg"
          alt="tocotoco logo"
          width={147}
          height={28}
          priority
        />
      </div>

      <div className="bg-white border border-[rgba(58,126,105,0.1)] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-[12px] p-[33px] w-full max-w-[420px] flex flex-col gap-10">
        {sentMessage ? (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-[14px] text-[#334155]">
              入力したメールアドレス宛に、パスワード再設定用のリンクを送信しました。
              メールをご確認ください。
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(resetPasswordForEmail)}
            className="flex flex-col gap-5"
          >
            {/* メールアドレス */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-[#334155] text-[14px] font-medium px-1"
              >
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <EmailIcon />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="ikedacity@email.com"
                  disabled={isSubmitting}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] pl-12 pr-4 py-4 w-full text-[16px] text-[#6b7280] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
                  {...register("email", {
                    required: "メールアドレスは必須です",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "正しいメールアドレスを入力してください",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs px-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-red-500 text-sm">{serverError}</p>
            )}
            <SubmitButton
              label="メールを送信する"
              pendingLabel="メール送信中..."
              isSubmitting={isSubmitting}
            />
          </form>
        )}

        <div className="border-t border-[#f1f5f9] pt-6 text-center text-[14px] text-[#475569]">
          新規会員登録は{" "}
          <Link href="/auth/signup" className="text-[#3a7e69] font-bold">
            こちら
          </Link>
        </div>
      </div>
    </div>
  );
}
