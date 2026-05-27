'use client'

import { useSupabaseSession } from '../_hooks/useSupabaseSession'
import { Footer } from './Footer'

export const FooterWrapper = () => {
  const { session, isLoading } = useSupabaseSession()

  if (isLoading || !session) return null

  return <Footer />
}
