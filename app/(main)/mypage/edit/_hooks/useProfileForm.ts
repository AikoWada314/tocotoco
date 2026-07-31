"use client";

import { useForm, UseFormReturn } from "react-hook-form";

export type ProfileFormValues = {
  name: string;
  nickname: string | null;
  iconUrl: string | null;
};

interface UseProfileFormOptions {
  defaultValues?: Partial<ProfileFormValues>;
}

export const useProfileForm = (
  options?: UseProfileFormOptions,
): UseFormReturn<ProfileFormValues> => {
  return useForm<ProfileFormValues>({
    defaultValues: {
      name: "",
      nickname: "",
      iconUrl: "",
      ...options?.defaultValues,
    },
  });
};
