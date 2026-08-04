'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useSupabaseSession } from '../_hooks/useSupabaseSession'
import { useApiSWR } from '../_hooks/useApiSWR'
import { MeResponse } from '@/app/api/me/route'
import { BellIcon } from './icons/BellIcon'
import { NotificationModal } from './NotificationModal'

export const Header: React.FC = () => {

  const { session, isLoading } = useSupabaseSession()
  const { data: me } = useApiSWR<MeResponse>('/api/me')
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  return (
    <>
      <header className="px-6 h-[73px] font-bold flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.svg" alt="tocotoco logo" width={147} height={28} priority />
        </Link>

        {!isLoading && (
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <BellIcon />
                </button>
                <Link href="/mypage">
                  <Image
                    src={me?.user?.iconUrl || '/user.svg'}
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
                <Link href="/contact" className="text-sm text-[#334155]">
                  お問い合わせ
                </Link>
                <Link href="/auth/login" className="text-sm text-[#334155]">
                  ログイン
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
  )
}
