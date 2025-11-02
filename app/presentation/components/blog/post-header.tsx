"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar } from "lucide-react";
import type { Post } from "@/domain/blog/entities";
import { formatDate } from "@/presentation/utils/format";
import { TagList } from "@/presentation/components/common/tag-list";

interface PostHeaderProps {
  post: Post;
}

export const PostHeader = ({ post }: PostHeaderProps) => {
  return (
    <>
      {/* アイキャッチ画像 */}
      {post.featuredImage && (
        <motion.div
          layoutId={`post-image-${post.id.value}`}
          className="relative w-full aspect-1200/630 max-h-[400px] mb-8 overflow-hidden rounded-lg bg-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            layout: { duration: 0.2, ease: "easeOut" },
            opacity: { duration: 0.15 },
          }}
        >
          <Image
            src={post.featuredImage.value}
            alt={post.title.value}
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      )}

      {/* タイトル */}
      <motion.h1
        layoutId={`post-title-${post.id.value}`}
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          layout: { duration: 0.2, ease: "easeOut" },
          opacity: { duration: 0.15, delay: 0.05 },
        }}
      >
        {post.title.value}
      </motion.h1>

      {/* 日時 */}
      <div className="mb-6">
        <motion.div
          layoutId={`post-date-${post.id.value}`}
          className="flex items-center gap-2 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            layout: { duration: 0.2, ease: "easeOut" },
            opacity: { duration: 0.15, delay: 0.08 },
          }}
        >
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <time dateTime={post.createdAt.value.toISOString()}>
            {formatDate(post.createdAt.value)}
          </time>
        </motion.div>
      </div>

      <div className="mb-6">
        {/* タグ */}
        {post.tags.length > 0 && (
          <motion.div
            layoutId={`post-tags-${post.id.value}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              layout: { duration: 0.2, ease: "easeOut" },
              opacity: { duration: 0.15, delay: 0.08 },
            }}
          >
            <TagList
              tags={post.tags}
              title={undefined}
              link={true}
              showCount={false}
              filterByCount={false}
            />
          </motion.div>
        )}
      </div>
    </>
  );
};
