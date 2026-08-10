// スポットの登録・口コミ投稿ページもアプリ画面と同じく max-w-3xl の中央カラムに収める
export default function SpotsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col flex-1">
      {children}
    </div>
  );
}
