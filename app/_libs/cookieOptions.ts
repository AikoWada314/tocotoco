export const COOKIE_OPTIONS = {
  // 現状はブラウザ側(useSupabaseSession)がCookieを読んでログイン表示を出しているため、
  // httpOnlyにするとサーバーがCookieを書き直したタイミング(トークン更新・OAuthコールバック)で
  // ブラウザだけ未ログイン表示になる。httpOnly完全化(ログイン状態の取得元を/api/meへ移す)とセットで
  // trueに戻す
  httpOnly: false,
  // 本番環境ではHTTPS通信のみCookie送信
  secure: process.env.NODE_ENV === "production",
  // CSRF緩和
  sameSite: "lax" as const,
};
