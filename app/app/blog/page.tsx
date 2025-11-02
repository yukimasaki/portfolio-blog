import { getPosts, getTags } from "@/application/di/usecases";
import { PostList } from "@/presentation/components/blog/post-list";
import type { Post } from "@/domain/blog/entities";
import type { Tag } from "@/domain/tags/entities";
import { TagList } from "@/presentation/components/common/tag-list";
import { debugDomainEntity } from "@/infrastructure/utils/debug";

// SSR設定: 常に動的に取得
export const dynamic = "force-dynamic";

export const metadata = {
  title: "ブログ",
  description: "ブログ記事一覧",
};

export default async function BlogPage() {
  // 常に動的にデータ取得
  const postsResult = await getPosts()();
  const tagsResult = await getTags()();

  if (postsResult._tag === "Left") {
    const errorMsg =
      postsResult.left._tag === "NetworkError"
        ? postsResult.left.error.message
        : postsResult.left._tag === "ValidationError"
        ? postsResult.left.message
        : "Unknown error";
    throw new Error(errorMsg);
  }

  const posts: Post[] = postsResult.right;
  const tags: Tag[] = tagsResult._tag === "Right" ? tagsResult.right : [];

  // デバッグ出力: 記事一覧データ
  debugDomainEntity("Post List", {
    totalPosts: posts.length,
    posts: posts.map(post => ({
      id: post.id.value,
      title: post.title.value,
      slug: post.slug.value,
      excerpt: post.excerpt.value,
      contentLength: post.content.length,
      createdAt: post.createdAt.value.toISOString(),
      featuredImage: post.featuredImage?.value,
      tags: post.tags.map(tag => ({
        id: tag.id.value,
        name: tag.name.value,
        slug: tag.slug.value,
      })),
    })),
  });

  // デバッグ出力: タグ一覧データ
  debugDomainEntity("Tag List", {
    totalTags: tags.length,
    tags: tags.map(tag => ({
      id: tag.id.value,
      name: tag.name.value,
      slug: tag.slug.value,
      count: tag.count.value,
    })),
  });

  // よく使われるタグを取得（使用回数でソート、上位10件）
  const popularTags = [...tags]
    .sort((a, b) => b.count.value - a.count.value)
    .slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ブログ</h1>

      {/* タグ一覧 */}
      <TagList tags={popularTags} title="タグ" className="mb-8" />

      {/* 記事一覧とページネーション */}
      <PostList posts={posts} postsPerPage={12} />
    </div>
  );
}
