import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const siteTitle = "tocotoco | 池田市の情報共有アプリ";
const siteDescription =
  "地域のつぶやき・スポット・イベントを共有するコミュニティ";

export const metadata: Metadata = {
  // og:image などURL系メタデータを絶対URLにするための基準（相対パス指定時に必須）
  metadataBase: new URL("https://tocotoco-ikeda.vercel.app"),
  title: siteTitle,
  description: siteDescription,
  // OGP画像は app/opengraph-image.png（1200×630）をNext.jsのファイル規約で自動出力
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "tocotoco",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
