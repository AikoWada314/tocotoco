"use client";

import { useForm, UseFormReturn } from "react-hook-form";

export type SearchFormValues = {
  query: string;
};

interface UseSearchFormOptions {
  defaultValues?: Partial<SearchFormValues>;
}

export const useSearchForm = (
  options?: UseSearchFormOptions,
): UseFormReturn<SearchFormValues> => {
  return useForm<SearchFormValues>({
    defaultValues: {
      query: "",
      ...options?.defaultValues,
    },
  });
};
