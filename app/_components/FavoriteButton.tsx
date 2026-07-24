"use client";

const FILLED_PATH = "M5 21V5q0-.825.588-1.413T7 3h10q.825 0 1.413.588T19 5v16l-7-3z";
const OUTLINE_PATH =
  "M5 21V5q0-.825.588-1.413T7 3h10q.825 0 1.413.588T19 5v16l-7-3zm2-3.05l5-2.15l5 2.15V5H7z";

interface FavoriteButtonProps {
  active: boolean; // お気に入り済みか
  onClick: (e: React.MouseEvent) => void; // 押したときの処理（親Linkの遷移抑止も呼び出し側で行う）
  className?: string;
}

export const FavoriteButton = ({
  active,
  onClick,
  className,
}: FavoriteButtonProps) => {
  return (
    <button
      type="button"
      aria-label="お気に入り"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 ${className ?? ""}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path
          d={active ? FILLED_PATH : OUTLINE_PATH}
          fill={active ? "#3a7e69" : "#94a3b8"}
        />
      </svg>
    </button>
  );
};
