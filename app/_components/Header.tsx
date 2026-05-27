'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useSupabaseSession } from '../_hooks/useSupabaseSession'
import { useApiSWR } from '../_hooks/useApiSWR'
import { MeResponse } from '@/app/api/me/route'

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 2C7.686 2 5 4.686 5 8V13L3 15V16H19V15L17 13V8C17 4.686 14.314 2 11 2Z" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 16V17C9 18.105 9.895 19 11 19C12.105 19 13 18.105 13 17V16" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2L16 16M16 2L2 16" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export const Header: React.FC = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const { session, isLoading } = useSupabaseSession()
  const { data: me } = useApiSWR<MeResponse>('/api/me')

  return (
    <>
      <header className="p-6 font-bold flex justify-between items-center">
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
                <Link href="/profile">
                  <Image
                    src={me?.user?.iconUrl || '/user.svg'}
                    alt="user icon"
                    width={32}
                    height={32}
                    className="rounded-full"
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

      {/* 通知モーダル */}
      {isNotificationOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex justify-end items-start"
          onClick={() => setIsNotificationOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm mt-16 mr-4 rounded-[12px] shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
              <h2 className="text-[#334155] text-[16px] font-bold">通知</h2>
              <button
                onClick={() => setIsNotificationOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* 通知リスト */}
            <div className="max-h-[400px] overflow-y-auto">
              {/* 通知がない場合 */}
              <div className="flex flex-col items-center justify-center py-12 text-[#94a3b8] text-sm gap-2">
                <BellIcon />
                <p>通知はありません</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
