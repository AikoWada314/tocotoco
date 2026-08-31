"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";

export const profileSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  nickname: z
    .string()
    .min(1, "ユーザーネームを入力してください")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "半角英数字またはアンダースコアで入力してください",
    )
    .max(20, "ユーザーネームは20文字以内で入力してください"),
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
      nickname: "",
      iconUrl: null,
      ...options?.defaultValues,
    },
  });
};
