import type { Metadata } from "next";
import { getPosts, getTags } from "@/application/di/usecases";
import { HomeHero, RecentPosts, PopularTags } from "@/presentation/components/home";
import type { Post } from "@/domain/blog/entities";
import type { Tag } from "@/domain/tags/entities";
import { debugDomainEntity } from "@/infrastructure/utils/debug";

// SSR設定: 常に動的に取得
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio Blog",
  description: "Webアプリケーション開発に関する技術記事を発信しています。フロントエンド・バックエンドの両方を扱います。",
};

export default async function HomePage() {
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
  debugDomainEntity("Home Page Posts", {
    totalPosts: posts.length,
    recentPosts: posts.slice(0, 3).map((post) => ({
      id: post.id.value,
      title: post.title.value,
      slug: post.slug.value,
    })),
  });

  // 最新記事3件を取得
  const recentPosts = posts.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* ヒーローセクション */}
      <HomeHero />

      {/* 人気タグ（上位10件） */}
      <PopularTags tags={tags} />

      {/* 最新記事（3件） */}
      <RecentPosts posts={recentPosts} />
    </div>
  );
}
