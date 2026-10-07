//管理者へのメール通知（Resend）。設定が無い・送信に失敗しても、呼び出し元の処理は止めない
//必要な環境変数: RESEND_API_KEY, ADMIN_NOTIFY_EMAIL（宛先）, NOTIFY_FROM_EMAIL（送信元。未設定ならResendのテスト用アドレス）
export const notifyAdmin = async (subject: string, text: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!apiKey || !to) {
    console.warn(
      "[notifyAdmin] RESEND_API_KEY / ADMIN_NOTIFY_EMAIL が未設定のためメールは送りません",
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.NOTIFY_FROM_EMAIL ?? "tocotoco <onboarding@resend.dev>",
        to: to.split(",").map((address) => address.trim()),
        subject: `[tocotoco] ${subject}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error(
        "[notifyAdmin] メール送信に失敗しました",
        res.status,
        await res.text(),
      );
    }
  } catch (error) {
    console.error("[notifyAdmin] メール送信に失敗しました", error);
  }
};
