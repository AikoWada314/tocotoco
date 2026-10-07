"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { CONTACT_CATEGORIES } from "@/app/_libs/contact";

export type ContactFormValues = {
  name: string;
  email: string;
  category: string;
  content: string;
  website: string; // ボット対策のおとり項目（画面には見えない）
};

interface UseContactFormOptions {
  defaultValues?: Partial<ContactFormValues>;
}

export const useContactForm = (
  options?: UseContactFormOptions,
): UseFormReturn<ContactFormValues> => {
  return useForm<ContactFormValues>({
    defaultValues: {
      name: "",
      email: "",
      category: CONTACT_CATEGORIES[0],
      content: "",
      website: "",
      ...options?.defaultValues,
    },
  });
};
