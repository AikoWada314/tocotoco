'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSupabaseSession } from '../_hooks/useSupabaseSession'
import { supabase } from '../_libs/supabase'
import { useRouter } from 'next/navigation'
import  React, { useState, useEffect } from 'react'

export const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut()
    await router.replace('/')
  }

  const { session, isLoading } = useSupabaseSession()
  const [iconUrl, setIconUrl] = useState<string | null>(null)

  useEffect(() => {
    if(!session) return
    const fetchIcon = async () =>{
        const res = await fetch('/api/me', {
            headers:{ Authorization: `Bearer ${session.access_token}`}
        })
        const data = await res.json()
        setIconUrl(data.user.iconUrl)
    }
    fetchIcon()
  }, [session])

  return (
    <header className="p-6 font-bold flex justify-between items-center">
      <Link href="/" className="header-link">
      <Image src="/logo.svg" alt="tocotoco logo" width={147} height={28} priority />
      </Link>
      {!isLoading && (
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/profile" className="header-link">
              <Image src={iconUrl || '/user.svg'} alt="user icon" width={24} height={24} priority />
              </Link>
              <button onClick={handleLogout}>ログアウト</button>
            </>
          ) : (
            <>
              <Link href="/contact" className="header-link">
                お問い合わせ
              </Link>
              <Link href="/sign_in" className="header-link">
                ログイン
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}