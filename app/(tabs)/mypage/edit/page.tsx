"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { MeResponse, UpdateMeRequestBody } from "@/app/api/me/route";
import { supabase } from "@/app/_libs/supabase";
import { getPostImageUrl } from "@/app/_libs/storage";
import { PageHeader } from "@/app/_components/PageHeader";

import {
  useProfileForm,
  ProfileFormValues,
} from "@/app/(tabs)/mypage/edit/_hooks/useProfileForm";

export default function Page() {
  ///api/meからかえってきたdataをmeとよぶ（名前決め）
  const { data: me, mutate } = useApiSWR<MeResponse>("/api/me");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useProfileForm();
  const [file, setFile] = useState<File | null>(null);

  // 取得した今の値をフォームに反映（prefill）
  useEffect(() => {
    if (me) {
      reset({
        name: me.user.name,
        nickname: me.user.nickname ?? "",
        iconUrl: me.user.iconUrl ?? "",
      });
    }
  }, [me, reset]);

  // アバターのプレビュー（新しく選んだ画像があればそれ、無ければ今のアイコン）
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : me?.user.iconUrl || "/user.svg"),
    [file, me],
  );

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // 新しい画像があればアップロードして公開URLを作る。無ければ今のURLを維持
      let iconUrl = me?.user.iconUrl ?? null;
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("post_images")
          .upload(path, file);
        if (error) throw new Error(error.message);
        iconUrl = getPostImageUrl(path);
      }

      const body: UpdateMeRequestBody = {
        name: values.name,
        nickname: values.nickname,
        iconUrl,
      };

      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("更新に失敗しました");

      await mutate(); // /api/me のキャッシュを最新に（マイページに反映）
      router.push("/mypage"); // 戻る
    } catch {
      alert("更新に失敗しました");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="プロフィール編集" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pb-24"
      >
        {/* アバター */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative size-24 overflow-hidden rounded-full border border-[#f1f5f9] bg-[#e2e8f0]">
            <Image
              src={preview}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <label className="cursor-pointer text-[14px] font-medium text-[#3a7e69]">
            画像を変更
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
              disabled={isSubmitting}
            />
          </label>
        </div>

        {/* 名前 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#64748b]">名前</label>
          <input
            disabled={isSubmitting}
            {...register("name")}
            className="rounded-[10px] border border-[#e2e8f0] px-3 py-2.5 text-[15px] text-[#0f172a] outline-none focus:border-[#3a7e69]"
          />
          {errors.name && (
            <p className="text-[12px] text-[#ef4444]">{errors.name.message}</p>
          )}
        </div>

        {/* ユーザーネーム */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#64748b]">
            ユーザーネーム（半角英数字またはアンダースコア）
          </label>
          <input
            disabled={isSubmitting}
            {...register("nickname")}
            className="rounded-[10px] border border-[#e2e8f0] px-3 py-2.5 text-[15px] text-[#0f172a] outline-none focus:border-[#3a7e69]"
          />
          {errors.nickname && (
            <p className="text-[12px] text-[#ef4444]">
              {errors.nickname.message}
            </p>
          )}
        </div>

        {/* 保存 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-[12px] bg-[#3a7e69] py-3.5 text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "保存中..." : "保存する"}
        </button>
      </form>
    </div>
  );
}
