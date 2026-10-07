//管理者への通知（Discordのウェブフック）。設定が無い・送信に失敗しても、呼び出し元の処理は止めない
//必要な環境変数: DISCORD_WEBHOOK_URL（通知を送るチャンネルのウェブフックURL）
const DISCORD_MAX_LENGTH = 2000; // Discordの1メッセージの上限

export const notifyAdmin = async (subject: string, text: string) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(
      "[notifyAdmin] DISCORD_WEBHOOK_URL が未設定のため通知は送りません",
    );
    return;
  }

  const content = `**[tocotoco] ${subject}**\n${text}`;
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content:
          content.length > DISCORD_MAX_LENGTH
            ? `${content.slice(0, DISCORD_MAX_LENGTH - 1)}…`
            : content,
        // 利用者が書いた本文に @everyone などがあってもメンションさせない
        allowed_mentions: { parse: [] },
      }),
    });
    if (!res.ok) {
      console.error(
        "[notifyAdmin] Discordへの通知に失敗しました",
        res.status,
        await res.text(),
      );
    }
  } catch (error) {
    console.error("[notifyAdmin] Discordへの通知に失敗しました", error);
  }
};
