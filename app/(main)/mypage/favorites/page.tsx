import { PageHeader } from "@/app/_components/PageHeader";

// お気に入り一覧（スポット/イベント/つぶやきをタブ切替）
// TODO: GET /api/me/favorites を作り、タブUIと一覧表示を実装する
export default function Page() {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <PageHeader title="お気に入り" />
      <div className="flex-1 flex items-center justify-center text-[#94a3b8]">
        準備中
      </div>
    </div>
  );
}
