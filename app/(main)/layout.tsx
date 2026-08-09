import { Header } from "@/app/_components/Header";
import { Footer } from "@/app/_components/Footer";

// Header + Footer付きレイアウト（ホーム・一覧など上位ページ用のグループ）
// アプリ画面はスマホアプリ風に max-w-3xl の中央カラムに収める（トップページだけは対象外）
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col flex-1">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
