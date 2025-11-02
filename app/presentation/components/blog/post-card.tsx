"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { Image as ImageIcon, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/presentation/components/ui/card";
import type { Post } from "@/domain/blog/entities";
import { formatDate } from "@/presentation/utils/format";
import { BLOG_ROUTES } from "@/shared/constants/routes";
import { TagList } from "@/presentation/components/common/tag-list";

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  useEffect(() => {
    // Debug: 各カードのタグ情報を出力
    try {
      // 最小限の情報のみ表示

      console.debug("[PostCard] tags", {
        postSlug: post.slug.value,
        tagCount: post.tags.length,
        tags: post.tags.map(t => ({
          id: t.id.value,
          slug: t.slug.value,
          name: t.name.value,
        })),
      });
    } catch {
      // no-op
    }
  }, [post]);

  return (
    <Link
      href={BLOG_ROUTES.POST(post.slug.value)}
      className="block h-full"
    >
      <motion.article
        layoutId={`post-${post.id.value}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="h-full"
      >
        <Card className="h-full min-h-[420px] flex flex-col overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow">
          <div className="relative w-full aspect-video overflow-hidden bg-muted">
            {post.featuredImage ? (
              <motion.img
                layoutId={`post-image-${post.id.value}`}
                src={post.featuredImage.value}
                alt={post.title.value}
                transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon
                  className="w-16 h-16 text-muted-foreground/50"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
          <CardHeader className="flex flex-col shrink-0">
            <motion.h3
              layoutId={`post-title-${post.id.value}`}
              transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
              className="text-lg font-semibold line-clamp-2"
            >
              {post.title.value}
            </motion.h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <motion.time
                layoutId={`post-date-${post.id.value}`}
                dateTime={post.createdAt.value.toISOString()}
                transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
              >
                {formatDate(post.createdAt.value)}
              </motion.time>
            </div>
            <motion.div
              layoutId={`post-tags-${post.id.value}`}
              className="mt-2 min-h-[24px]"
              transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
            >
              {post.tags.length > 0 ? (
                <TagList
                  tags={post.tags}
                  showCount={false}
                  link={false}
                  filterByCount={false}
                />
              ) : null}
            </motion.div>
          </CardHeader>
          <CardContent className="shrink-0 pb-6">
            <motion.p
              layoutId={`post-excerpt-${post.id.value}`}
              transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
              className="text-sm text-muted-foreground line-clamp-3 h-[60px]"
            >
              {post.excerpt.value}
            </motion.p>
          </CardContent>
        </Card>
      </motion.article>
    </Link>
  );
};
