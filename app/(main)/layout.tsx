import { Header } from "@/app/_components/Header";
import { Footer } from "@/app/_components/Footer";

// Header + Footer付きレイアウト（ホーム・一覧など上位ページ用のグループ）
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
