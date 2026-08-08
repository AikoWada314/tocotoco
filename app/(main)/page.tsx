import { redirect } from "next/navigation";

// トップページは投稿一覧へリダイレクト（サービスLP公開時にここをLPへ差し替える）
export default function HomePage() {
  redirect("/posts");
}
