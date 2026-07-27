import { PageHeader } from "@/app/_components/PageHeader";

// プロフィール編集
// TODO: PATCH /api/me を作り、名前・ニックネーム・アイコン画像を編集するフォームを実装する
export default function Page() {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="プロフィール編集" />
      <div className="flex-1 flex items-center justify-center text-[#94a3b8]">
        準備中
      </div>
    </div>
  );
}
