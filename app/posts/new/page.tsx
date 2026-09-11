"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { useAuthStatus } from "@/app/_hooks/useAuthStatus";
import { uploadImage } from "@/app/_libs/storage";
import { usePostForm } from "@/app/posts/_hooks/usePostForm";
import { PostCategories } from "@/app/api/post-categories/route";
import { PostFormValues } from "@/app/posts/_hooks/usePostForm";
import { CreatePostRequestBody } from "@/app/api/posts/route";

export default function NewPostPage() {
  const router = useRouter();
  const { me } = useAuthStatus();
  const { data: categoryData } = useApiSWR<PostCategories>(
    "/api/post-categories",
  );
  const categories = categoryData?.categories ?? [];

  const { register, setValue, watch, handleSubmit } = usePostForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (values: PostFormValues) => {
    if (!values.categoryId) {
      alert("カテゴリーを選択してください");
      return;
    }
    if (!values.content) {
      alert("内容を入力してください");
      return;
    }
    setIsLoading(true);
    try {
      // 画像が選択されていればStorageにアップロードして公開URLを取得
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const body = {
        content: values.content,
        categoryId: values.categoryId,
        imageUrls: imageUrl ? [imageUrl] : [],
      } satisfies CreatePostRequestBody;

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error("投稿に失敗しました");
      }
      alert("投稿を作成しました。");
      router.push("/posts");
    } catch {
      alert("投稿に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
      <div className="sticky top-0 z-40 bg-white border-b border-[rgba(58,126,105,0.1)] flex items-center justify-between px-4 h-[73px] shrink-0">
        <button
          type="button"
          aria-label="戻る"
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
        <h1 className="text-[18px] font-medium text-[#0f172a] tracking-[-0.45px]">
          つぶやきを投稿
        </h1>
        <button
          type="submit"
          className="bg-[#3a7e69] text-white text-[14px] font-medium px-5 py-2 rounded-full shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "投稿中..." : "投稿する"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ユーザー情報 */}
        <div className="bg-white flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-[rgba(58,126,105,0.1)]">
            <Image
              src={me?.user?.iconUrl || "/user.svg"}
              alt={me?.user?.name || ""}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[14px] font-medium text-[#0f172a]">
              {me?.user?.nickname}
            </p>
          </div>
        </div>

        {/* テキストエリア */}
        <div className="mx-4">
          <textarea
            {...register("content", { required: "内容は必須です" })}
            placeholder={"いま、何してる？\n地域のみんなに共有しよう"}
            className="w-full h-[180px] bg-[rgba(239,249,245,0.3)] rounded-[12px] p-4 text-[16px] text-[#334155] placeholder:text-[#94a3b8] placeholder:font-medium resize-none outline-none"
          />
        </div>

        {/* 写真追加 */}
        <div className="p-4">
          <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 bg-[rgba(239,249,245,0.2)] border-2 border-dashed border-[rgba(58,126,105,0.3)] rounded-[12px] cursor-pointer hover:bg-[rgba(239,249,245,0.4)] transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="preview"
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-[10px]"
              />
            ) : (
              <>
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
                  写真を追加
                </span>
              </>
            )}
          </label>
        </div>

        {/* カテゴリー選択 */}
        <div className="px-4 pt-4 pb-8 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 1.5H7.5L13.5 7.5L7.5 13.5L1.5 7.5V1.5Z"
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="4.5" cy="4.5" r="1" fill="#0f172a" />
            </svg>
            <span className="text-[14px] font-medium text-[#0f172a]">
              カテゴリーを選択
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setValue("categoryId", cat.id)}
                className={
                  watch("categoryId") === cat.id
                    ? "bg-[#3a7e69] text-white text-[12px] font-medium px-4 py-2 rounded-full"
                    : "bg-[#eff9f5] border border-[rgba(58,126,105,0.2)] text-[#3a7e69] text-[12px] font-medium px-4 py-2 rounded-full"
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
