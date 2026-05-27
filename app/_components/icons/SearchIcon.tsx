export function SearchIcon({ color = "#717171" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8.5" cy="8.5" r="6.5" stroke={color} strokeWidth="1.5" />
      <path d="M13.5 13.5L18.5 18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
