"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/_libs/supabase";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { getPostImageUrl } from "@/app/_libs/storage";
import { SpotShowResponse } from "@/app/api/spots/[id]/route";
import { ReviewFormValues } from "@/app/(main)/spots/[id]/reviews/_hooks/useSpotReviewForm";
import { CreateReviewRequestBody } from "@/app/api/spots/[id]/reviews/route";
import { useSpotReviewForm } from "@/app/(main)/spots/[id]/reviews/_hooks/useSpotReviewForm";

export default function NewReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useSpotReviewForm();

  // 上部カード用に、対象スポットの情報を取得（詳細ページと同じ取得）
  const { data: spotData, mutate } = useApiSWR<SpotShowResponse>(
    `/api/spots/${id}`,
  );
  const spot = spotData?.spot;

  const rating = watch("rating");
  const images = watch("images");
  const imagePreviews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images],
  );

  const onSubmit = async (values: ReviewFormValues) => {
    try {
      // 画像が選択されていれば全部アップロードしてURLの配列を作る
      const imageUrls = await Promise.all(
        values.images.map(async (file) => {
          const ext = file.name.split(".").pop();
          const path = `${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("post_images")
            .upload(path, file);
          if (uploadError) {
            throw new Error(uploadError.message);
          }
          return path;
        }),
      );

      const body: CreateReviewRequestBody = {
        comment: values.comment,
        rating: values.rating,
        imageUrls,
      };

      const res = await fetch(`/api/spots/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error("口コミ投稿に失敗しました");
      }
      alert("口コミを投稿しました。");
      await mutate();
      router.push(`/spots/${id}`);
    } catch {
      alert("口コミ投稿に失敗しました");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    //Filelistを普通の配列に変換
    const selected = Array.from(files);

    //今ある分に追加して、先頭4枚だけ残す
    const next = [...images, ...selected].slice(0, 4);

    // フォームの images を更新すれば、プレビューは派生で自動追従する
    setValue("images", next);
  };

  const handleRemoveImage = (index: number) => {
    // index番目を除いた新しい配列を作って更新する
    setValue(
      "images",
      images.filter((_, i) => i !== index),
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 bg-[#f5f7f6]"
    >
      {/* ヘッダー */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#d1e2dc] flex items-center justify-between px-4 h-[65px] shrink-0">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 13L5 8L10 3"
              stroke="#334155"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-[18px] font-bold text-[#0f172a] tracking-[-0.45px]">
          口コミ投稿
        </h1>
        <button
          disabled={isSubmitting}
          type="submit"
          className="bg-[#3a7e69] text-white text-[14px] font-bold px-4 py-1.5 rounded-full shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "投稿中..." : "投稿する"}
        </button>
      </div>

      {/* 本体 */}
      <div className="flex-1 overflow-y-auto">
        <fieldset
          disabled={isSubmitting}
          className="flex flex-col gap-5 p-4 pb-28"
        >
          {/* 対象スポットのカード */}
          {spot && (
            <div className="flex items-center gap-3 rounded-[12px] bg-white p-3 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[8px] bg-[#f1f5f9]">
                {spot.images[0] && (
                  <Image
                    src={getPostImageUrl(spot.images[0].imageUrl)}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[16px] font-bold text-[#0f172a]">
                  {spot.name}
                </p>
                <div className="mt-0.5 flex items-center gap-1 text-[13px] text-[#64748b]">
                  <svg
                    width="12"
                    height="14"
                    viewBox="0 0 16 20"
                    fill="none"
                    className="shrink-0"
                  >
                    <path
                      d="M8 0C3.58 0 0 3.58 0 8C0 13.25 7.05 19.42 7.35 19.68C7.72 20 8.28 20 8.65 19.68C8.95 19.42 16 13.25 16 8C16 3.58 12.42 0 8 0ZM8 11C6.34 11 5 9.66 5 8C5 6.34 6.34 5 8 5C9.66 5 11 6.34 11 8C11 9.66 9.66 11 8 11Z"
                      fill="#3a7e69"
                    />
                  </svg>
                  <span className="truncate">{spot.address}</span>
                </div>
              </div>
            </div>
          )}

          {/* 満足度（★評価） */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#334155] leading-5">
              満足度を評価してください
            </p>
            <div className="flex items-center justify-center gap-3 rounded-[12px] bg-[#eff9f5] py-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setValue("rating", n, { shouldValidate: true })
                  }
                  aria-label={`${n}点`}
                  className="text-[36px] leading-none transition-transform hover:scale-110"
                >
                  <span
                    className={
                      n <= rating ? "text-[#3a7e69]" : "text-[#cbd5e1]"
                    }
                  >
                    {n <= rating ? "★" : "☆"}
                  </span>
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-[12px] text-red-500">
                {errors.rating.message}
              </p>
            )}
          </div>

          {/* 口コミの内容 */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#334155] leading-5">
              口コミの内容
            </p>
            <textarea
              {...register("comment")}
              placeholder="口コミを入力してください... スポットの雰囲気やおすすめの過ごし方を教えてください。"
              className="h-[154px] w-full resize-none rounded-[12px] border border-[#d1e2dc] bg-white p-4 text-[16px] leading-6 text-[#0f172a] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
            />
          </div>

          {/* 写真を追加 */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#334155] leading-5">
              写真を追加
            </p>
            <div className="flex flex-wrap gap-2">
              {/* 選択済みの画像プレビュー */}
              {imagePreviews.map((preview, index) => (
                <div
                  key={preview}
                  className="relative w-24 h-24 rounded-[12px] overflow-hidden"
                >
                  <Image
                    src={preview}
                    alt={`preview-${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    aria-label="画像を削除"
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M1 1l8 8M9 1l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}

              {/* 4枚未満のときだけ追加ボタンを表示 */}
              {imagePreviews.length < 4 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 bg-white border-2 border-dashed border-[rgba(58,126,105,0.3)] rounded-[12px] cursor-pointer hover:bg-[rgba(239,249,245,0.6)] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <svg width="24" height="22" viewBox="0 0 28 25" fill="none">
                    <path
                      d="M14 5.5V1.5M14 1.5L11 4.5M14 1.5L17 4.5"
                      stroke="#3a7e69"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 9.5C3 8.39543 3.89543 7.5 5 7.5H23C24.1046 7.5 25 8.39543 25 9.5V21.5C25 22.6046 24.1046 23.5 23 23.5H5C3.89543 23.5 3 22.6046 3 21.5V9.5Z"
                      stroke="#3a7e69"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="14"
                      cy="15.5"
                      r="3.5"
                      stroke="#3a7e69"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span className="text-[10px] font-medium text-[#3a7e69]">
                    追加
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* 投稿ガイドライン */}
          <div className="flex flex-col gap-2 rounded-[12px] border border-[#3a7e69]/10 bg-[#eff9f5]/50 p-4">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#3a7e69"
                  strokeWidth="1.3"
                />
                <path
                  d="M8 7.2v4M8 5.2h.01"
                  stroke="#3a7e69"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-[14px] font-bold text-[#3a7e69]">
                投稿ガイドライン
              </p>
            </div>
            <ul className="flex flex-col gap-1 text-[12px] leading-5 text-[#64748b]">
              <li>誹謗中傷や公序良俗に反する内容は控えてください。</li>
              <li>個人情報の特定につながる情報は掲載しないでください。</li>
              <li>スポットに関係のない広告等の投稿は禁止されています。</li>
            </ul>
          </div>
        </fieldset>
      </div>
    </form>
  );
}
