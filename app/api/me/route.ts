import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_libs/supabase";

export type MeResponse = {
  user: {
    id: number;
    name: string;
    iconUrl: string | null;
  };
};

//ログイン中のユーザー情報の取得
export const GET = async (request: NextRequest) => {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if(!token){
    return NextResponse.json({message:"ログインが必要です"}, {status:401})
  }

  const {data:{user}} = await supabase.auth.getUser(token);
  if(!user){
    return NextResponse.json({message:"ログインが必要です"}, {status:401})
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where:{supabaseUserId: user.id},
      select:{id:true, name:true, iconUrl:true},
    });
    if (!dbUser){
      return NextResponse.json({ message: "ユーザーが見つかりません" }, { status: 404 });
    }
    return NextResponse.json<MeResponse>({user: dbUser}, {status:200});
  } catch (error) {
    if (error instanceof Error){
      return NextResponse.json({ message: error.message}, { status:400});
    }
    return NextResponse.json({ message: "予期せぬエラーが発生しました"}, { status:500});
  }
};