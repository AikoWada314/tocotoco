// 相談投稿の状態（受付中／解決済み）
export function ResolvedBadge({ isResolved }: { isResolved: boolean }) {
  return isResolved ? (
    <span className="text-[10px] font-bold text-[#64748b] bg-[#f1f5f9] rounded-full px-2 py-0.5">
      解決済み
    </span>
  ) : (
    <span className="text-[10px] font-bold text-[#d97706] bg-[#fffbeb] rounded-full px-2 py-0.5">
      受付中
    </span>
  );
}
