import { notFound } from "next/navigation";
import {
  getPosts,
  getTagBySlug,
  getPostsByTagId,
} from "@/application/di/usecases";
import type { Post } from "@/domain/blog/entities";
import type { Tag } from "@/domain/tags/entities";
import { PostList } from "@/presentation/components/blog/post-list";

// ISR設定: 1時間ごとに再生成
export const revalidate = 3600;

// ビルド時に全タグのスラッグを取得
export async function generateStaticParams() {
  try {
    const { getTags } = await import("@/application/di/usecases");
    const result = await getTags()();

    if (result._tag === "Left") {
      console.error(
        "Failed to fetch tags for generateStaticParams:",
        result.left
      );
      return [];
    }

    // Next.jsは自動的にエンコード/デコードを処理するため、元のスラッグを返す
    return result.right.map(tag => ({
      slug: tag.slug.value,
    }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

interface PageProps {
  readonly params: Promise<{ slug: string }>;
}

export default async function TagDetailPage({ params }: PageProps) {
  const resolved = await params;
  const slugParam = resolved?.slug;
  if (!slugParam || typeof slugParam !== "string") {
    return notFound();
  }

  // デバッグ: 受け取ったスラッグを確認
  console.log("[TagDetailPage] Received slug:", slugParam);
  console.log("[TagDetailPage] Encoded slug:", encodeURIComponent(slugParam));

  const tagResult = await getTagBySlug(slugParam)();
  if (tagResult._tag === "Left") {
    if (tagResult.left._tag === "NetworkError") {
      const msg = tagResult.left.error.message || "";
      if (msg.toLowerCase().startsWith("tag not found")) {
        return notFound();
      }
      throw new Error(msg || "Failed to fetch tag");
    }
    return notFound();
  }

  const tag: Tag = tagResult.right;

  const postsResult = await getPostsByTagId(tag.id.value)();
  if (postsResult._tag === "Left") {
    if (postsResult.left._tag === "NetworkError") {
      throw new Error(postsResult.left.error.message);
    }
    return notFound();
  }

  let posts: Post[] = postsResult.right;
  // Fallback: まれに0件となる場合、全件からタグID/スラッグでフィルタ
  if (posts.length === 0) {
    const allPostsResult = await getPosts()();
    if (allPostsResult._tag === "Right") {
      console.error(
        "[TagDetailPage] fallback all posts tags:",
        allPostsResult.right.map(p => ({
          post: p.slug.value,
          tagIds: p.tags.map(t => t.id.value),
          tagSlugs: p.tags.map(t => t.slug.value),
        }))
      );
      posts = allPostsResult.right.filter(p =>
        p.tags.some(
          t => t.slug.value === tag.slug.value || t.id.value === tag.id.value
        )
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{tag.name.value}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {posts.length} 件の記事
      </p>

      <PostList posts={posts} postsPerPage={12} />
    </div>
  );
}
