"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const spotSchema = z.object({
  name: z.string().min(1, "スポット名を入力してください"),
  categoryId: z.number().nullable(),
  description: z.string().min(1, "説明を入力してください"),
  address: z.string().min(1, "住所を入力してください"),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
});

// この1行で「フォームの値の型」も自動生成される
export type SpotFormValues = z.infer<typeof spotSchema>;

interface UseSpotFormOptions {
  defaultValues?: Partial<SpotFormValues>;
}

export const useSpotForm = (
  options?: UseSpotFormOptions,
): UseFormReturn<SpotFormValues> => {
  return useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      name: "",
      categoryId: null,
      description: "",
      address: "",
      lat: null,
      lng: null,
      ...options?.defaultValues,
    },
  });
};
