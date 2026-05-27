'use client'

import { HomeIcon } from './icons/HomeIcon'
import { SpotIcon } from './icons/SpotIcon'
import { SearchIcon } from './icons/SearchIcon'
import { EventIcon } from './icons/EventIcon'
import { MyPageIcon } from './icons/MyPageIcon'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/',       label: 'ホーム',     Icon: HomeIcon   },
  { href: '/spots',  label: 'スポット',   Icon: SpotIcon   },
  { href: '/search', label: '検索',       Icon: SearchIcon },
  { href: '/events', label: 'イベント',   Icon: EventIcon  },
  { href: '/mypage', label: 'マイページ', Icon: MyPageIcon },
]

export const Footer = () => {
  const pathname = usePathname()

  return (
    <footer className="fixed bottom-0 left-0 right-0 backdrop-blur-[6px] bg-[rgba(255,255,255,0.95)] border-t border-[#f1f5f9] h-16">
      <nav className="h-full">
        <ul className="flex justify-around items-center h-full px-4 max-w-3xl mx-auto">
          {navItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href
            const color = isActive ? '#3A7E69' : '#717171'
            return (
              <li key={href} className="flex-1">
                <Link href={href} className="flex flex-col items-center gap-1">
                  <Icon color={color} />
                  <span
                    className={`text-[10px] ${isActive ? 'text-[#3A7E69] font-bold' : 'text-[#717171] font-medium'}`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </footer>
  )
}
