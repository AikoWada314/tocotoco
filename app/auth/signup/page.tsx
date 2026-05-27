"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/_libs/supabase";
import Link from "next/link";
import Image from "next/image";

function EmailIcon() {
  return (
    <svg width="17" height="13" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="16" height="12" rx="1.5" stroke="#94a3b8" />
      <path d="M1 1.5L8.5 7.5L16 1.5" stroke="#94a3b8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="7.5" width="13" height="10" rx="1.5" stroke="#94a3b8" />
      <path d="M3.5 7.5V5C3.5 3.067 5.067 1.5 7 1.5C8.933 1.5 10.5 3.067 10.5 5V7.5" stroke="#94a3b8" strokeLinecap="round" />
      <circle cx="7" cy="12.5" r="1.5" fill="#94a3b8" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="5.5" r="3.5" stroke="#94a3b8" />
      <path d="M1 15.5C1 12.186 4.134 9.5 8 9.5C11.866 9.5 15 12.186 15 15.5" stroke="#94a3b8" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="19" height="13" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 6.5C1 6.5 4 1 9.5 1C15 1 18 6.5 18 6.5C18 6.5 15 12 9.5 12C4 12 1 6.5 1 6.5Z" stroke="#94a3b8" strokeLinecap="round" />
      <circle cx="9.5" cy="6.5" r="2.5" stroke="#94a3b8" />
    </svg>
  ) : (
    <svg width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L18 14M7.5 3.5C8.1 3.2 8.8 3 9.5 3C15 3 18 8.5 18 8.5C17.5 9.4 16.8 10.3 16 11M3 5.5C1.9 6.5 1 8.5 1 8.5C1 8.5 4 14 9.5 14C10.9 14 12.2 13.6 13.3 13" stroke="#94a3b8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="bg-[#3a7e69] text-white rounded-[8px] py-4 w-full flex items-center justify-center gap-2 font-bold text-[16px] shadow-[0px_10px_15px_-3px_rgba(58,126,105,0.2),0px_4px_6px_-4px_rgba(58,126,105,0.2)] disabled:opacity-50"
    >
      {isSubmitting ? "登録中..." : (
        <>
          会員登録
          <ArrowIcon />
        </>
      )}
    </button>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>();

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
      },
    });

    if (error) {
      setServerError("登録に失敗しました。もう一度お試しください。");
      return;
    }

    router.replace("/auth/verify-email");
  };

  return (
    <div className="bg-[#eff9f5] flex flex-col flex-1 items-center px-4 py-16 gap-6">
      <Image src="/logo.svg" alt="tocotoco logo" width={147} height={28} priority />

      <p className="text-[#334155] text-[16px] font-bold text-center">
        あなたも池田市のコミュニティに<br />参加しませんか？
      </p>

      <div className="bg-white border border-[rgba(58,126,105,0.1)] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-[12px] p-[33px] w-full max-w-[420px] flex flex-col gap-10">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* お名前 */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-[#334155] text-[14px] font-medium px-1">
              お名前
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <UserIcon />
              </div>
              <input
                id="name"
                type="text"
                placeholder="池田 花子"
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] pl-12 pr-4 py-4 w-full text-[16px] text-[#6b7280] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
                {...register("name", { required: "お名前は必須です" })}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs px-1">{errors.name.message}</p>}
          </div>

          {/* メールアドレス */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[#334155] text-[14px] font-medium px-1">
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
            {errors.email && <p className="text-red-500 text-xs px-1">{errors.email.message}</p>}
          </div>

          {/* パスワード */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[#334155] text-[14px] font-medium px-1">
              パスワード
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <LockIcon />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="8文字以上"
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] pl-12 pr-12 py-4 w-full text-[16px] text-[#6b7280] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
                {...register("password", {
                  required: "パスワードは必須です",
                  minLength: { value: 8, message: "8文字以上で入力してください" },
                })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs px-1">{errors.password.message}</p>}
          </div>

          {/* パスワード再入力 */}
          <div className="flex flex-col gap-2 pb-4">
            <label htmlFor="confirm" className="text-[#334155] text-[14px] font-medium px-1">
              パスワードを再入力
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <LockIcon />
              </div>
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="8文字以上"
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] pl-12 pr-12 py-4 w-full text-[16px] text-[#6b7280] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
                {...register("confirm", {
                  required: "パスワードを再入力してください",
                  validate: (v) => v === password || "パスワードが一致しません",
                })}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2">
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {errors.confirm && <p className="text-red-500 text-xs px-1">{errors.confirm.message}</p>}
          </div>

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          <SubmitButton isSubmitting={isSubmitting} />
        </form>

        <div className="border-t border-[#f1f5f9] pt-6 text-center text-[14px] text-[#475569]">
          既にアカウントをお持ちの方は{" "}
          <Link href="/auth/login" className="text-[#3a7e69] font-bold">
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
