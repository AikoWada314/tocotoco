"use client";

import { useForm, UseFormReturn } from "react-hook-form";

export type EventFormValues = {
  title: string;
  eventDate: string;
  eventEndDate: string;
  place: string;
  organizerName: string;
  organizerLink: string;
  description: string;
  lat: number | null;
  lng: number | null;
};

interface UseEventFormOptions {
  defaultValues?: Partial<EventFormValues>;
}

export const useEventForm = (
  options?: UseEventFormOptions
): UseFormReturn<EventFormValues> => {
  return useForm<EventFormValues>({
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
