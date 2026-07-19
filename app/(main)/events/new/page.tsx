"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/_libs/supabase";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { EventFormValues } from "@/app/(main)/events/_hooks/useEventForm";
import { CreateEventRequestBody } from "@/app/api/events/route";
import { useEventForm } from "@/app/(main)/events/_hooks/useEventForm";
import { LocationField } from "@/app/_components/LocationField";

export default function NewEventPage() {
  const router = useRouter();
  const { token } = useSupabaseSession();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useEventForm();

  const lat = watch("lat");
  const lng = watch("lng");

  // 画像はフォームで一元管理。プレビューは images から都度作る（派生）
  const images = watch("images");
  const imagePreviews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images],
  );

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

  const onSubmit = async (values: EventFormValues) => {
    if (values.lat == null || values.lng == null) {
      alert("地図をタップして場所を指定してください");
      return;
    }

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

      const body: CreateEventRequestBody = {
        title: values.title,
        eventDate: new Date(values.eventDate).toISOString(),
        eventEndDate: values.eventEndDate
          ? new Date(values.eventEndDate).toISOString()
          : undefined,
        place: values.place,
        organizerName: values.organizerName,
        organizerLink: values.organizerLink || undefined,
        description: values.description || undefined,
        lat: values.lat,
        lng: values.lng,
        imageUrls,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ?? "",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error("イベント作成に失敗しました");
      }
      alert("イベントを作成しました。");
      router.push("/events");
    } catch {
      alert("イベント作成に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
      <div className="bg-white border-b border-[#d1e2dc] flex items-center justify-between px-4 h-[65px] shrink-0">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
          イベントを登録
        </h1>
        <button
          disabled={isSubmitting}
          type="submit"
          className="bg-[#3a7e69] text-white text-[14px] font-bold px-4 py-1.5 rounded-full shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "登録中..." : "登録する"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <fieldset
          disabled={isSubmitting}
          className="flex flex-col gap-4 p-4 pb-28"
        >
          {/* タイトル */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#334155] leading-5">
              イベント名
            </p>
            <input
              {...register("title")}
              placeholder={"例：⚪︎⚪︎祭り"}
              className="h-12 w-full rounded-[12px] border border-[#d1e2dc] bg-white px-4 text-[16px] text-[#0f172a] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
            />
            {errors.title && (
              <p className="text-[12px] text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* 開催日時 */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#334155] leading-5">
              開催日時
            </p>
            <input
              type="datetime-local"
              {...register("eventDate")}
              className="h-12 w-full rounded-[12px] border border-[#d1e2dc] bg-white px-4 text-[16px] text-[#0f172a] outline-none focus:border-[#3a7e69]"
            />
            {errors.eventDate && (
              <p className="text-[12px] text-red-500">
                {errors.eventDate.message}
              </p>
            )}
          </div>

          {/* 終了日時 */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#334155] leading-5">
              終了日時（任意）
            </p>
            <input
              type="datetime-local"
              {...register("eventEndDate")}
              className="h-12 w-full rounded-[12px] border border-[#d1e2dc] bg-white px-4 text-[16px] text-[#0f172a] outline-none focus:border-[#3a7e69]"
            />
            {errors.eventEndDate && (
              <p className="text-[12px] text-red-500">
                {errors.eventEndDate.message}
              </p>
            )}
          </div>

          {/* 開催場所 */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#334155] leading-5">
              開催場所
            </p>
            <LocationField
              address={watch("place")}
              lat={lat}
              lng={lng}
              placeholder="場所を入力"
              showPin
              error={errors.place?.message}
              onChange={(next) => {
                setValue("place", next.address, { shouldValidate: true });
                setValue("lat", next.lat);
                setValue("lng", next.lng);
              }}
            />
          </div>

          {/* テキストエリア */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#334155] leading-5">
              イベントについて
            </p>
            <textarea
              {...register("description")}
              placeholder={
                "イベントの内容、持ち物、参加条件などを入力してください"
              }
              className="h-[154px] w-full resize-none rounded-[12px] border border-[#d1e2dc] bg-white p-4 text-[16px] leading-6 text-[#0f172a] placeholder:text-[#6b7280] outline-none focus:border-[#3a7e69]"
            />
            {errors.description && (
              <p className="text-[12px] text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* 写真追加 */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#334155] leading-5">
              写真を追加（4枚まで）
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
                <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 bg-[rgba(239,249,245,0.2)] border-2 border-dashed border-[rgba(58,126,105,0.3)] rounded-[12px] cursor-pointer hover:bg-[rgba(239,249,245,0.4)] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <svg
                    width="28"
                    height="25"
                    viewBox="0 0 28 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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

          {/* 主催者情報 */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-bold text-[#334155] leading-5">
              主催者情報
            </p>
            <div className="flex flex-col gap-4 pl-4">
              <div className="flex flex-col gap-2">
                <p className="text-[14px] font-bold text-[#334155] leading-5">
                  主催者名前
                </p>
                <input
                  {...register("organizerName")}
                  className="h-12 w-full rounded-[12px] border border-[#d1e2dc] bg-white px-4 text-[16px] text-[#0f172a] outline-none focus:border-[#3a7e69]"
                />
                {errors.organizerName && (
                  <p className="text-[12px] text-red-500">
                    {errors.organizerName.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[14px] font-bold text-[#334155] leading-5">
                  主催者情報リンク（WebサイトやInstagramなど）
                </p>
                <input
                  type="url"
                  {...register("organizerLink")}
                  className="h-12 w-full rounded-[12px] border border-[#d1e2dc] bg-white px-4 text-[16px] text-[#0f172a] outline-none focus:border-[#3a7e69]"
                />
                {errors.organizerLink && (
                  <p className="text-[12px] text-red-500">
                    {errors.organizerLink.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </fieldset>
      </div>
    </form>
  );
}
