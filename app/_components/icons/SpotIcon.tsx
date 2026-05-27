export function SpotIcon({ color = "#717171" }: { color?: string }) {
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="7" cy="5" rx="2.5" ry="3.5" fill={color} />
      <ellipse cx="13" cy="3.5" rx="2" ry="3" fill={color} />
      <ellipse cx="18" cy="6.5" rx="1.8" ry="2.5" fill={color} />
      <ellipse cx="21" cy="11" rx="1.5" ry="2" fill={color} />
      <path d="M4 12C4 9 6 7 9 8C12 9 16 12 17 15C18 18 16 21 13 20C10 19 4 18 4 12Z" fill={color} />
    </svg>
  )
}
