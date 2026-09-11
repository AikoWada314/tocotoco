"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import Link from "next/link";
import Image from "next/image";
import { SubmitButton } from "@/app/_components/SubmitButton";
import { GoogleAuthButton } from "@/app/_components/GoogleAuthButton";
import { EmailIcon } from "@/app/_components/icons/EmailIcon";
import { LockIcon } from "@/app/_components/icons/LockIcon";
import { EyeIcon } from "@/app/_components/icons/EyeIcon";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    if (!res.ok) {
      setServerError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    // ログイン状態のキャッシュ(/api/me)を取り直してヘッダー等の表示を切り替える
    await mutate("/api/me");
    router.replace("/posts");
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] pl-12 pr-12 py-4 w-full text-[16px] text-[#6b7280] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
                {...register("password", {
                  required: "パスワードは必須です",
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs px-1">{errors.password.message}</p>}
          </div>

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          <SubmitButton label="ログイン" pendingLabel="ログイン中..." isSubmitting={isSubmitting} />
        </form>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#f1f5f9]" />
            <span className="text-[12px] text-[#94a3b8]">または</span>
            <div className="h-px flex-1 bg-[#f1f5f9]" />
          </div>
          <GoogleAuthButton label="Googleでログイン" />
        </div>

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
