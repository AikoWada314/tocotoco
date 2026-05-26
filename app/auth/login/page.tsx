"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/_libs/supabase";
import Link from "next/link";
import Image from "next/image";

function EmailIcon() {
  return (
    <svg
      width="17"
      height="13"
      viewBox="0 0 17 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="16" height="12" rx="1.5" stroke="#94a3b8" />
      <path d="M1 1.5L8.5 7.5L16 1.5" stroke="#94a3b8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="18"
      viewBox="0 0 14 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="7.5" width="13" height="10" rx="1.5" stroke="#94a3b8" />
      <path
        d="M3.5 7.5V5C3.5 3.067 5.067 1.5 7 1.5C8.933 1.5 10.5 3.067 10.5 5V7.5"
        stroke="#94a3b8"
        strokeLinecap="round"
      />
      <circle cx="7" cy="12.5" r="1.5" fill="#94a3b8" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="19"
      height="13"
      viewBox="0 0 19 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 6.5C1 6.5 4 1 9.5 1C15 1 18 6.5 18 6.5C18 6.5 15 12 9.5 12C4 12 1 6.5 1 6.5Z"
        stroke="#94a3b8"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="6.5" r="2.5" stroke="#94a3b8" />
    </svg>
  ) : (
    <svg
      width="19"
      height="15"
      viewBox="0 0 19 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L18 14M7.5 3.5C8.1 3.2 8.8 3 9.5 3C15 3 18 8.5 18 8.5C17.5 9.4 16.8 10.3 16 11M3 5.5C1.9 6.5 1 8.5 1 8.5C1 8.5 4 14 9.5 14C10.9 14 12.2 13.6 13.3 13"
        stroke="#94a3b8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[#3a7e69] text-white rounded-[8px] py-4 w-full flex items-center justify-center gap-2 font-bold text-[16px] shadow-[0px_10px_15px_-3px_rgba(58,126,105,0.2),0px_4px_6px_-4px_rgba(58,126,105,0.2)] disabled:opacity-50"
    >
      {pending ? (
        "ログイン中..."
      ) : (
        <>
          ログイン
          <ArrowIcon />
        </>
      )}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(_: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return "メールアドレスまたはパスワードが正しくありません";
    }

    router.replace("/");
    return null;
  }

  const [error, formAction] = useActionState(handleLogin, null);

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
        <form action={formAction} className="flex flex-col gap-5">
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
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] pl-12 pr-4 py-4 w-full text-[16px] text-[#6b7280] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
              />
            </div>
          </div>

          {/* パスワード */}
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex items-center justify-between px-1">
              <label
                htmlFor="password"
                className="text-[#334155] text-[14px] font-medium"
              >
                パスワード
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[#3a7e69] text-[12px]"
              >
                パスワードを忘れた方はこちら
              </Link>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <LockIcon />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] pl-12 pr-12 py-4 w-full text-[16px] text-[#6b7280] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <SubmitButton />
        </form>

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
