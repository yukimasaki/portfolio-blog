"use client";

import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";
import { COMMON_ROUTES, BLOG_ROUTES } from "@/shared/constants/routes";

/**
 * トップページのヒーローセクションコンポーネント
 */
export function HomeHero() {
  return (
    <section className="mb-16 text-center">
      <p className="mb-8 text-lg md:text-xl text-muted-foreground leading-relaxed">
        Webアプリケーション開発に関する技術記事を発信しています。
        <br className="hidden sm:block" />
        フロントエンド・バックエンドの両方を扱います。
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button asChild size="lg" variant="default">
          <Link href={BLOG_ROUTES.INDEX}>ブログを読む</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={COMMON_ROUTES.ABOUT}>自己紹介を見る</Link>
        </Button>
      </div>
    </section>
  );
}
