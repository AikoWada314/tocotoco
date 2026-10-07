//通報の対象と理由（画面とAPIで共通）
export const REPORT_TARGET_TYPES = ["post", "comment", "review"] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  post: "つぶやき",
  comment: "コメント",
  review: "口コミ",
};

export const REPORT_REASONS = [
  "スパム・宣伝",
  "攻撃的・不快な内容",
  "個人情報が書かれている",
  "うその情報",
  "その他",
] as const;
