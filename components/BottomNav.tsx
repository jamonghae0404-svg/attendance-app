'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarCheck, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { href: '/attendance', label: '출석부', icon: CalendarCheck },
  { href: '/dashboard', label: '통계', icon: BarChart2 },
  { href: '/management', label: '관리', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50
      safe-area-inset-bottom">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors
                ${active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-xs font-medium ${active ? 'text-indigo-600' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
