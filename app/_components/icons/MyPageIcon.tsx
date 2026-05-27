export function MyPageIcon({ color = "#717171" }: { color?: string }) {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="6" r="4.5" stroke={color} strokeWidth="1.5" />
      <path d="M1 19C1 15.134 4.582 12 9 12C13.418 12 17 15.134 17 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
