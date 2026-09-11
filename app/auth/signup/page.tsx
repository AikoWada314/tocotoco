"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SubmitButton } from "@/app/_components/SubmitButton";
import { GoogleAuthButton } from "@/app/_components/GoogleAuthButton";
import { UserIcon } from "@/app/_components/icons/UserIcon";
import { EmailIcon } from "@/app/_components/icons/EmailIcon";
import { LockIcon } from "@/app/_components/icons/LockIcon";
import { EyeIcon } from "@/app/_components/icons/EyeIcon";

type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirm: string;
  nickname: string;
};

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

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name,
        nickname: data.nickname,
      }),
    });

    if (!res.ok) {
      setServerError("登録に失敗しました。もう一度お試しください。");
      return;
    }

    router.replace("/auth/verify-email");
  };

  return (
    <div className="bg-[#eff9f5] flex flex-col flex-1 items-center px-4 py-16 gap-6">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="tocotoco logo"
          width={147}
          height={28}
          priority
        />
      </Link>

      <p className="text-[#334155] text-[16px] font-bold text-center">
        あなたも池田市のコミュニティに
        <br />
        参加しませんか？
      </p>

      <div className="bg-white border border-[rgba(58,126,105,0.1)] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-[12px] p-[33px] w-full max-w-[420px] flex flex-col gap-10">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* お名前 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-[#334155] text-[14px] font-medium px-1"
            >
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
            {errors.name && (
              <p className="text-red-500 text-xs px-1">{errors.name.message}</p>
            )}
          </div>

          {/* ユーザーネーム */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="nickname"
              className="text-[#334155] text-[14px] font-medium px-1"
            >
              ユーザーネーム
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <UserIcon />
              </div>
              <input
                id="nickname"
                type="text"
                placeholder="ikeda_1234"
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] pl-12 pr-4 py-4 w-full text-[16px] text-[#6b7280] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
                {...register("nickname", {
                  required: "ユーザーネームは必須です",
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "半角英数字またはアンダースコアで入力してください",
                  },
                  maxLength: {
                    value: 20,
                    message: "ユーザーネームは20文字以内で入力してください",
                  },
                })}
              />
            </div>
            {errors.nickname && (
              <p className="text-red-500 text-xs px-1">
                {errors.nickname.message}
              </p>
            )}
          </div>

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
            {errors.email && (
              <p className="text-red-500 text-xs px-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* パスワード */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-[#334155] text-[14px] font-medium px-1"
            >
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
                  minLength: {
                    value: 8,
                    message: "8文字以上で入力してください",
                  },
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
            {errors.password && (
              <p className="text-red-500 text-xs px-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* パスワード再入力 */}
          <div className="flex flex-col gap-2 pb-4">
            <label
              htmlFor="confirm"
              className="text-[#334155] text-[14px] font-medium px-1"
            >
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
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {errors.confirm && (
              <p className="text-red-500 text-xs px-1">
                {errors.confirm.message}
              </p>
            )}
          </div>

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          <SubmitButton
            label="会員登録"
            pendingLabel="登録中..."
            isSubmitting={isSubmitting}
          />
        </form>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#f1f5f9]" />
            <span className="text-[12px] text-[#94a3b8]">または</span>
            <div className="h-px flex-1 bg-[#f1f5f9]" />
          </div>
          <GoogleAuthButton label="Googleで登録" />
        </div>

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
