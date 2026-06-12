export function CloseIcon({ color = "#64748b" }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2L16 16M16 2L2 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
