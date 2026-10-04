import { prisma } from "@/app/_libs/prisma";
import { getAuthUser } from "@/app/_libs/auth";

//ログイン中ユーザーのDB上のレコード（未ログイン・未登録ならnull）
export const getCurrentUser = async (request: Request) => {
  const authUser = await getAuthUser(request);
  if (!authUser) return null;
  return prisma.user.findUnique({
    where: { supabaseUserId: authUser.id },
    select: { id: true, name: true, nickname: true, role: true },
  });
};

export const isAdmin = (user: { role: string } | null) =>
  user?.role === "admin";

//自分がブロックしているユーザーのID一覧（未ログインなら空）
export const getBlockedUserIds = async (userId: number | undefined) => {
  if (!userId) return [];
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: userId },
    select: { blockedId: true },
  });
  return blocks.map((block) => block.blockedId);
};
