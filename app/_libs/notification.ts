import { prisma } from "./prisma";

type CreateNotificationParams = {
  recipientUserId: number; // 受け取る人（DBのユーザーid）
  actorUserId: number;     // アクションした人（自分宛防止の判定用）
  title: string;
  content: string;
  type: string;  
};

export const createNotification = async ({
  recipientUserId,
  actorUserId,
  title,
  content,
  type,
}: CreateNotificationParams) => {
  // 自分の投稿に自分でアクション → 通知しない
  if (recipientUserId === actorUserId) return;

  await prisma.notification.create({
    data: {
      title,
      content,
      type,
      userNotifications: {
        create: { userId: recipientUserId, isRead: false }, // ← 子を同時作成
      },
    },
  });
};
