"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSupabaseSession } from "../_hooks/useSupabaseSession";
import { useApiSWR } from "../_hooks/useApiSWR";
import { MeResponse } from "@/app/api/me/route";
import { BellIcon } from "./icons/BellIcon";
import { NotificationModal } from "./NotificationModal";
import { MyNotificationsResponse } from "@/app/api/me/notifications/route";

export const Header: React.FC = () => {
  const { session, isLoading } = useSupabaseSession();
  const { data: me } = useApiSWR<MeResponse>("/api/me");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { data } = useApiSWR<MyNotificationsResponse>("/api/me/notifications");
  const unreadCount = data?.notifications.filter((n) => !n.isRead).length ?? 0;

  return (
    <>
      <header className="px-6 h-[73px] font-bold flex justify-between items-center">
        {/* ログイン済みはタイムライン、未ログインはトップページへ */}
        <Link href={session ? "/posts" : "/"}>
          <Image
            src="/logo.svg"
            alt="tocotoco logo"
            width={147}
            height={28}
            priority
          />
        </Link>

        {!isLoading && (
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
                <Link href="/mypage">

                  <Image
                    src={me?.user?.iconUrl || "/user.svg"}
                    alt="user icon"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                    priority
                  />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-[#334155] transition-colors hover:text-[#3a7e69]"
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#3a7e69] text-white rounded-full px-4 py-2 text-sm transition-colors hover:bg-[#2f6655]"
                >
                  会員登録
                </Link>
              </>
            )}
          </div>
        )}
      </header>
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
};
