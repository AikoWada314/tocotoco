"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/app/_libs/supabase";
import Link from "next/link";
import Image from "next/image";
import { SubmitButton } from "@/app/_components/SubmitButton";
import { LockIcon } from "@/app/_components/icons/LockIcon";
import { EyeIcon } from "@/app/_components/icons/EyeIcon";
import { useRouter } from "next/navigation";

type ResetPasswordFormData = {
  password: string;
};

export default function ResetPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>();

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setServerError(
        "パスワードのリセットに失敗しました。時間をおいて再度お試しください。",
      );
      return;
    }
    router.push("/auth/login");
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
          {/* パスワード */}
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex items-center justify-between px-1">
              <label
                htmlFor="password"
                className="text-[#334155] text-[14px] font-medium"
              >
                新しいパスワード
              </label>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <LockIcon />
              </div>
              <input
                id="password"
                disabled={isSubmitting}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] pl-12 pr-12 py-4 w-full text-[16px] text-[#6b7280] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
                {...register("password", {
                  required: "パスワードは必須です",
                  minLength: {
                    value: 6,
                    message: "6文字以上で入力してください",
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

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          <SubmitButton
            label="パスワードを変更する"
            pendingLabel="変更中..."
            isSubmitting={isSubmitting}
          />
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
