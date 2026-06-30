"use client";

import { useForm, UseFormReturn } from "react-hook-form";

export type PostFormValues = {
  content: string;
  thumbnailImageKey: string;
  categoryId: number | null;
};

interface UsePostFormOptions {
  defaultValues?: Partial<PostFormValues>;
}

export const usePostForm = (
  options?: UsePostFormOptions
): UseFormReturn<PostFormValues> => {
  return useForm<PostFormValues>({
    defaultValues: {
      content: "",
      thumbnailImageKey: "",
      categoryId: null,
      ...options?.defaultValues,
    },
  });
};
