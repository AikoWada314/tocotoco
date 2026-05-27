'use client'

import { HomeIcon } from './icons/HomeIcon'
import { SpotIcon } from './icons/SpotIcon'
import { SearchIcon } from './icons/SearchIcon'
import { EventIcon } from './icons/EventIcon'
import { MyPageIcon } from './icons/MyPageIcon'
import Link from 'next/link'
import { usePathname } from 'next/navigation'


export const Footer = () => {
    const pathname = usePathname()


return(
        <footer>
            <nav>
                <ul>
                    <li>
                        <Link href="/">
                            <HomeIcon color={pathname === '/' ? '#3A7E69' : '#717171'}/>
                        </Link>
                    </li>
                    <li>
                        <Link href="/spots">
                            <SpotIcon color={pathname === '/spots' ? '#3A7E69' : '#717171'}/>
                        </Link>
                    </li>
                    <li>
                        <Link href="/search">
                            <SearchIcon color={pathname === '/search' ? '#3A7E69' : '#717171'}/>
                        </Link>
                    </li>
                    <li>
                        <Link href="/events">
                            <EventIcon color={pathname === '/events' ? '#3A7E69' : '#717171'}/>
                        </Link>
                    </li>
                    <li>
                        <Link href="/mypage">
                            <MyPageIcon color={pathname === '/mypage' ? '#3A7E69' : '#717171'}/>
                        </Link>
                    </li>
                </ul>
            </nav>
        </footer>
    )
}

