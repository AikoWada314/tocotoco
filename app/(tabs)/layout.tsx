import { Footer } from "@/app/_components/Footer";

// ロゴヘッダーなし・下部ナビ(Footer)ありのグループ（マイページ系・利用規約など）
// アプリ画面と同じく max-w-3xl の中央カラムに収める
export default function TabsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col flex-1">
      {children}
      <Footer />
    </div>
  );
}
