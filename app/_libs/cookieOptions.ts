export const COOKIE_OPTIONS = {
  // JSからCookieを読めなくする(XSSでトークンを盗まれない)。
  // ログイン状態の表示はブラウザがCookieを読むのではなく、
  // サーバー(/api/me)に問い合わせる方式(useAuthStatus)なので成立する
  httpOnly: true,
  // 本番環境ではHTTPS通信のみCookie送信
  secure: process.env.NODE_ENV === "production",
  // CSRF緩和
  sameSite: "lax" as const,
};
