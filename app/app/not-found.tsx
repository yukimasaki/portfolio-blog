"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FileQuestion } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { GlassCard } from "@/presentation/components/ui/glass-card";
import { COMMON_ROUTES } from "@/shared/constants/routes";
import { cn } from "@/presentation/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: [0.4, 0, 0.6, 1] as const,
  },
};

/**
 * 404 Not Found ページ
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <motion.div
        className="w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* メインコンテンツ */}
        <GlassCard className="p-8 md:p-12 text-center">
          {/* 404アイコン */}
          <motion.div
            variants={itemVariants}
            className="mb-6 flex justify-center"
          >
            <motion.div
              animate={floatingAnimation.animate}
              transition={floatingAnimation.transition}
              className="relative"
            >
              <div className="relative h-32 w-32 md:h-40 md:w-40">
                <FileQuestion
                  className={cn(
                    "h-full w-full text-primary/80",
                    "drop-shadow-lg"
                  )}
                />
              </div>
              {/* 装飾用のグラデーション */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full",
                  "bg-primary/20 blur-2xl",
                  "-z-10"
                )}
              />
            </motion.div>
          </motion.div>

          {/* 404テキスト */}
          <motion.h1
            variants={itemVariants}
            className={cn(
              "mb-4 text-6xl md:text-8xl font-bold",
              "bg-linear-to-r from-primary to-primary/60",
              "bg-clip-text text-transparent",
              "drop-shadow-lg"
            )}
          >
            404
          </motion.h1>

          {/* タイトル */}
          <motion.h2
            variants={itemVariants}
            className="mb-4 text-2xl md:text-3xl font-semibold text-foreground"
          >
            ページが見つかりません
          </motion.h2>

          {/* 説明文 */}
          <motion.p
            variants={itemVariants}
            className="mb-8 text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            お探しのページは存在しないか、
            <br className="md:hidden" />
            移動または削除された可能性があります。
          </motion.p>

          {/* アクションボタン */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" variant="default">
              <Link href={COMMON_ROUTES.HOME}>
                <Home className="mr-2 h-4 w-4" />
                ホームに戻る
              </Link>
            </Button>
          </motion.div>
        </GlassCard>

        {/* 装飾的な背景要素 */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className={cn(
              "absolute -top-1/4 -left-1/4 h-96 w-96 rounded-full",
              "bg-primary/10 blur-3xl"
            )}
          />
          <div
            className={cn(
              "absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full",
              "bg-primary/10 blur-3xl"
            )}
          />
        </div>
      </motion.div>
    </div>
  );
}
