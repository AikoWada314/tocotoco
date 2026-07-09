"use client";

import { useForm, UseFormReturn } from "react-hook-form";

export type CommentFormValues = {
  content: string;
};

interface UseCommentFormOptions {
  defaultValues?: Partial<CommentFormValues>;
}

export const useCommentForm = (
  options?: UseCommentFormOptions,
): UseFormReturn<CommentFormValues> => {
  return useForm<CommentFormValues>({
    defaultValues: {
      content: "",
      ...options?.defaultValues,
    },
  });
};
