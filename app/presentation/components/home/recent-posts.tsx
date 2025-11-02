import Link from "next/link";
import type { Post } from "@/domain/blog/entities";
import { PostCard } from "@/presentation/components/blog/post-card";
import { BLOG_ROUTES } from "@/shared/constants/routes";
import { ArrowRight } from "lucide-react";

interface RecentPostsProps {
  readonly posts: readonly Post[];
}

/**
 * トップページの最新記事セクションコンポーネント
 */
export function RecentPosts({ posts }: RecentPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">最新記事</h2>
        <Link
          href={BLOG_ROUTES.INDEX}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          すべての記事を見る
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id.value} post={post} />
        ))}
      </div>
    </section>
  );
}

