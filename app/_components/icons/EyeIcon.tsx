export function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="19" height="13" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 6.5C1 6.5 4 1 9.5 1C15 1 18 6.5 18 6.5C18 6.5 15 12 9.5 12C4 12 1 6.5 1 6.5Z" stroke="#94a3b8" strokeLinecap="round" />
      <circle cx="9.5" cy="6.5" r="2.5" stroke="#94a3b8" />
    </svg>
  ) : (
    <svg width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L18 14M7.5 3.5C8.1 3.2 8.8 3 9.5 3C15 3 18 8.5 18 8.5C17.5 9.4 16.8 10.3 16 11M3 5.5C1.9 6.5 1 8.5 1 8.5C1 8.5 4 14 9.5 14C10.9 14 12.2 13.6 13.3 13" stroke="#94a3b8" strokeLinecap="round" />
    </svg>
  )
}
