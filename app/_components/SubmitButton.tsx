"use client";

import { ArrowIcon } from "@/app/_components/icons/ArrowIcon";

type Props = {
  label: string;
  pendingLabel: string;
  isSubmitting: boolean;
};

export function SubmitButton({ label, pendingLabel, isSubmitting }: Props) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="bg-[#3a7e69] text-white rounded-[8px] py-4 w-full flex items-center justify-center gap-2 font-bold text-[16px] shadow-[0px_10px_15px_-3px_rgba(58,126,105,0.2),0px_4px_6px_-4px_rgba(58,126,105,0.2)] disabled:opacity-50"
    >
      {isSubmitting ? pendingLabel : (
        <>
          {label}
          <ArrowIcon />
        </>
      )}
    </button>
  );
}
