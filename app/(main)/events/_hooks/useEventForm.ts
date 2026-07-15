"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "イベント名を入力してください"),
  eventDate: z.string().min(1, "開催日時を選択してください"),
  place: z.string().min(1, "開催場所を入力してください"),
  organizerName: z.string().min(1, "主催者名を入力してください"),
  description: z.string().min(1, "説明を入力してください"),
  organizerLink: z
    .string()
    .url("正しいURLを入力してください")
    .or(z.literal("")),
  lat: z.number().nullable(),
  lng: z.number().nullable(),

  eventEndDate: z.string(),
});

// この1行で「フォームの値の型」も自動生成される
export type EventFormValues = z.infer<typeof eventSchema>;

interface UseEventFormOptions {
  defaultValues?: Partial<EventFormValues>;
}

export const useEventForm = (
  options?: UseEventFormOptions,
): UseFormReturn<EventFormValues> => {
  return useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      eventDate: "",
      eventEndDate: "",
      place: "",
      organizerName: "",
      organizerLink: "",
      description: "",
      lat: null,
      lng: null,
      ...options?.defaultValues,
    },
  });
};
