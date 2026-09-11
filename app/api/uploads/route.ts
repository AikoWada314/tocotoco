import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/_libs/createClient";

export type CreateUploadRequestBody = {
  ext: string;
};

export type CreateUploadResponse = {
  path: string;
  token: string;
};

// 画像アップロードの「許可証」を発行する。
// アップロード可否(ログイン確認)はここで判断し、ブラウザには
// この1回・このパスにしか使えない署名付きトークンだけを渡す
export const POST = async (request: NextRequest) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "ログインが必要です" }, { status: 401 });
  }

  const { ext }: CreateUploadRequestBody = await request.json();

  // 拡張子はStorageのパスに埋め込むため英数字のみに制限する
  if (!ext || !/^[a-zA-Z0-9]{1,10}$/.test(ext)) {
    return NextResponse.json(
      { message: "対応していないファイル形式です" },
      { status: 400 },
    );
  }

  const path = `${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage
    .from("post_images")
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json<CreateUploadResponse>(
    { path: data.path, token: data.token },
    { status: 200 },
  );
};
