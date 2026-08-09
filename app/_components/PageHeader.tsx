"use client";

import { useRouter } from "next/navigation";

type PageHeaderProps = {
  title: string;
};

export const PageHeader = ({ title }: PageHeaderProps) => {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-[#f1f5f9] flex items-center px-4 h-[73px] shrink-0">
      <button
        type="button"
        onClick={() => router.back()}
        className="p-1 -ml-1"
        aria-label="戻る"
      >
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
          <path
            d="M10 3L3 10L10 17"
            stroke="#334155"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1 className="flex-1 text-center pr-6 text-[18px] font-medium text-[#0f172a]">
        {title}
      </h1>
    </header>
  );
};
