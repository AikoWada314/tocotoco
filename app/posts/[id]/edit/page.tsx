"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApiSWR } from "@/app/_hooks/useApiSWR";
import { useAuthStatus } from "@/app/_hooks/useAuthStatus";
import { usePostForm, PostFormValues } from "@/app/posts/_hooks/usePostForm";
import { PostCategories } from "@/app/api/post-categories/route";
import {
  PostShowResponse,
  UpdatePostRequestBody,
} from "@/app/api/posts/[id]/route";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data, mutate } = useApiSWR<PostShowResponse>(`/api/posts/${id}`);
  const post = data?.post;
  const { me } = useAuthStatus();
  const { data: categoryData } = useApiSWR<PostCategories>(
    "/api/post-categories",
  );
  const categories = categoryData?.categories ?? [];

  const { register, setValue, watch, handleSubmit, reset } = usePostForm();
  const [isLoading, setIsLoading] = useState(false);

  // 投稿が読み込めたら今の内容をフォームに流し込む
  useEffect(() => {
    if (post) {
      reset({
        content: post.content,
        categoryId: post.category.id,
        thumbnailImageKey: "",
      });
    }
  }, [post, reset]);

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
      const body = {
        content: values.content,
        categoryId: values.categoryId,
      } satisfies UpdatePostRequestBody;

      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error("更新に失敗しました");
      }
      mutate(); // 詳細のキャッシュを取り直して編集後の内容を表示する
      router.push(`/posts/${id}`);
    } catch {
      alert("更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 他人の投稿は編集させない(サーバー側でも所有者チェックあり)
  if (post && me && post.userId !== me.user.id) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#64748b]">
        編集できるのは自分の投稿だけです
      </div>
    );
  }

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
          つぶやきを編集
        </h1>
        <button
          type="submit"
          className="bg-[#3a7e69] text-white text-[14px] font-medium px-5 py-2 rounded-full shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "保存中..." : "保存する"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* テキストエリア */}
        <div className="m-4">
          <textarea
            {...register("content", { required: "内容は必須です" })}
            placeholder={"いま、何してる？\n地域のみんなに共有しよう"}
            className="w-full h-[180px] bg-[rgba(239,249,245,0.3)] rounded-[12px] p-4 text-[16px] text-[#334155] placeholder:text-[#94a3b8] placeholder:font-medium resize-none outline-none"
          />
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
