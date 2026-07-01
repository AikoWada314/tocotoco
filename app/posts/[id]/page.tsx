"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { PostShowResponse } from "@/app/api/posts/[id]/route";
import { getPostImageUrl } from "@/app/_libs/storage";
import { useApiSWR } from "@/app/_hooks/useApiSWR";

export default function Page() {
  // react-routerのuseParamsを使うと、URLのパラメータを取得できます。
  const { id } = useParams();
  const { data, isLoading } = useApiSWR<PostShowResponse>(`/api/posts/${id}`);
  const post = data?.post;

  // 記事取得中は、読み込み中であることを表示します。
  if (isLoading) return <div>読み込み中...</div>;

  // 記事が見つからなかった場合は、記事が見つからないことを表示します。
  if (!post) return <div>記事が見つかりません</div>;

  return (
    <div>
      <div>
        {post.images.length > 0 && (
          <div>
            <Image
              src={getPostImageUrl(post.images[0].imageUrl)}
              alt="thumbnail"
              height={1000}
              width={1000}
            />
          </div>
        )}
        <div>
          <div>
            <div>{new Date(post.createdAt).toLocaleDateString()}</div>
            <div>{post.category.name}</div>
          </div>
          <div>{post.content}</div>
        </div>
      </div>
    </div>
  );
}
