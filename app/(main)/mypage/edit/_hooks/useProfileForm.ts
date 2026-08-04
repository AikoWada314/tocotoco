"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"; // ← これ
import { useForm, UseFormReturn } from "react-hook-form";

export const profileSchema = z.object({
  name: z.string().min(2, "名前を入力してください"),
  nickname: z
    .string()
    .max(20, "ニックネームは20文字以内で入力してください")
    .nullable(),
  iconUrl: z.string().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface UseProfileFormOptions {
  defaultValues?: Partial<ProfileFormValues>;
}

export const useProfileForm = (
  options?: UseProfileFormOptions,
): UseFormReturn<ProfileFormValues> => {
  return useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      nickname: null,
      iconUrl: null,
      ...options?.defaultValues,
    },
  });
};
