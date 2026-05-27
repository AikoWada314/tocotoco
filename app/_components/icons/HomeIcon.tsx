export function HomeIcon({ color = "#717171" }: { color?: string }) {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 7.5L9 1L17 7.5V18C17 18.552 16.552 19 16 19H12V14H6V19H2C1.448 19 1 18.552 1 18V7.5Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
