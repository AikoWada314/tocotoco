'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/_libs/supabase'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-black text-white rounded py-2 text-sm font-medium disabled:opacity-50"
    >
      {pending ? 'ログイン中...' : 'ログイン'}
    </button>
  )
}

export default function LoginPage() {
  const router = useRouter()

  async function handleLogin(_: unknown, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return 'メールアドレスまたはパスワードが正しくありません'
    }

    router.replace('/')
    return null
  }

  const [error, formAction] = useActionState(handleLogin, null)

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">メールアドレス</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">パスワード</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <SubmitButton />
        </form>
        <p className="text-sm text-center mt-4">
          アカウントがない方は{' '}
          <Link href="/auth/signup" className="underline">新規登録</Link>
        </p>
      </div>
    </div>
  )
}
