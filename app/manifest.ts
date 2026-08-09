import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tocotoco | 池田市の情報共有アプリ",
    short_name: "tocotoco",        // ホーム画面のアイコン下に出る短い名前
    description: "地域のつぶやき・スポット・イベントを共有するコミュニティ",
    start_url: "/posts",           // アプリとして起動した時に開くページ
    display: "standalone",         // ブラウザのUIを消してアプリらしく見せる
    background_color: "#eff9f5",   // 起動時のスプラッシュ背景
    theme_color: "#ffffff",        // ステータスバーの色(ヘッダーが白なので白推奨)
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
