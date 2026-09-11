"use client";

import { useState } from "react";
import { supabase } from "@/app/_libs/supabase";
import { GoogleIcon } from "@/app/_components/icons/GoogleIcon";

type Props = {
  label: string;
};

export function GoogleAuthButton({ label }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setErrorMessage(null);

    // 成功時はGoogleの同意画面へリダイレクトされるため、この後ろに進むのはエラー時のみ
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage("Google認証を開始できませんでした。もう一度お試しください。");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        className="bg-white border border-[#e2e8f0] rounded-[8px] py-4 w-full flex items-center justify-center gap-3 font-medium text-[16px] text-[#334155] hover:bg-[#f8fafc]"
      >
        <GoogleIcon />
        {label}
      </button>
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
    </div>
  );
}
