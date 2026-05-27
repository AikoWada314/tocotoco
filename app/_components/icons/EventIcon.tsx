export function EventIcon({ color = "#717171" }: { color?: string }) {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M1 8H19" stroke={color} strokeWidth="1.5" />
      <path d="M6 1V5M14 1V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="5" y="12" width="3" height="3" rx="0.5" fill={color} />
      <rect x="11" y="12" width="3" height="3" rx="0.5" fill={color} />
    </svg>
  )
}
