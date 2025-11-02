import { notFound } from "next/navigation";
import {
  getPosts,
  getTagBySlug,
  getPostsByTagId,
} from "@/application/di/usecases";
import type { Post } from "@/domain/blog/entities";
import type { Tag } from "@/domain/tags/entities";
import { PostList } from "@/presentation/components/blog/post-list";

// SSR設定: 常に動的に取得
export const dynamic = "force-dynamic";

interface PageProps {
  readonly params: Promise<{ slug: string }>;
}

export default async function TagDetailPage({ params }: PageProps) {
  const resolved = await params;
  const slugParam = resolved?.slug;
  if (!slugParam || typeof slugParam !== "string") {
    return notFound();
  }

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
