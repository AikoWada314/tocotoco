"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const spotReviewSchema = z.object({
  rating: z.number().min(1, "評価を選択してください").max(5),
  comment: z.string().optional(),
  images: z.array(z.instanceof(File)).max(4, "画像は4枚までです"),
});

// この1行で「フォームの値の型」も自動生成される
export type ReviewFormValues = z.infer<typeof spotReviewSchema>;

interface UseSpotReviewFormOptions {
  defaultValues?: Partial<ReviewFormValues>;
}

export const useSpotReviewForm = (
  options?: UseSpotReviewFormOptions,
): UseFormReturn<ReviewFormValues> => {
  return useForm<ReviewFormValues>({
    resolver: zodResolver(spotReviewSchema),
    defaultValues: {
      rating: 0,
      comment:"",
      images: [],
      ...options?.defaultValues,
    },
  });
};
