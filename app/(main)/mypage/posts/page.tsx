import { PageHeader } from "@/app/_components/PageHeader";

// 自分の投稿一覧
// TODO: GET /api/me/posts を作り、自分の投稿だけを一覧表示する
export default function Page() {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="自分の投稿" />
      <div className="flex-1 flex items-center justify-center text-[#94a3b8]">
        準備中
      </div>
    </div>
  );
}
