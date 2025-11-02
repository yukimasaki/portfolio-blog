# フェーズ9: トップページ実装

## 概要
ヒーローセクション、最新記事5件の表示機能を実装。

## サブフェーズ構成
- **フェーズ9.1**: トップページの基本実装
- **フェーズ9.2**: 最新記事5件の表示実装
- **フェーズ9.3**: オンデマンドISR対応

---

## フェーズ9.1: トップページの基本実装

### 目的
トップページの基本構造とヒーローセクションの実装

### 実装内容
- ヒーローセクション
- 自己紹介ページへのリンク
- ブログ一覧ページへのリンク

### 主要ファイル

**トップページ (`app/page.tsx`)**
```typescript
import { Link } from "@/presentation/components/common/navigation";
import { Button } from "@/presentation/components/ui/button";
import { Card } from "@/presentation/components/ui/card";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* ヒーローセクション */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">ポートフォリオブログ</h1>
        <p className="text-xl text-muted-foreground mb-8">
          スキルと実績を紹介するブログサイト
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/about">自己紹介を見る</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/blog">ブログを見る</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
```

### 完了条件
- [ ] トップページが実装済み
- [ ] ヒーローセクションが表示される
- [ ] リンクが正常に動作
- [ ] 型チェックエラーが0件

---

## フェーズ9.2: 最新記事3件の表示実装

### 目的
最新記事3件を表示する機能の実装

### 実装内容
- 最新記事の取得
- 記事カードの表示
- 記事一覧ページへのリンク

### 主要ファイル

**最新記事セクション (`presentation/components/home/recent-posts.tsx`)**
```typescript
import { Link } from "@/presentation/components/common/navigation";
import { Card } from "@/presentation/components/ui/card";
import { usePosts } from "@/infrastructure/query/hooks/use-posts";
import { formatDate } from "@/presentation/utils/format";

export const RecentPosts = () => {
  const { data } = usePosts({ perPage: 5 });
  
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">最新記事</h2>
        <Link href="/blog" className="text-primary hover:underline">
          すべて見る →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <Link href={`/blog/${post.slug}`}>
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm">
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatDate(post.createdAt)}
                  </time>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-primary hover:underline"
                  >
                    続きを読む →
                  </Link>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
};
```

### 完了条件
- [ ] 最新記事3件が表示される
- [ ] 記事カードが正常に表示
- [ ] リンクが正常に動作
- [ ] 型チェックエラーが0件

---

## フェーズ9.3: オンデマンドISR対応

### 目的
トップページでISR（Incremental Static Regeneration）を有効化し、最新記事5件の表示をリアルタイムで更新

### 実装内容
- トップページ（`/`）でのISR設定
- 最新記事5件のキャッシュ更新

### 主要ファイル

**トップページ (`app/page.tsx`)**
```typescript
import { RecentPosts } from '@/presentation/components/home/recent-posts';

// ISR設定
export const revalidate = 3600; // 1時間ごとに再生成

export default async function HomePage() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* ヒーローセクション */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">ポートフォリオブログ</h1>
        <p className="text-xl text-muted-foreground mb-8">
          スキルと実績を紹介するブログサイト
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/about">自己紹介を見る</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/blog">ブログを見る</Link>
          </Button>
        </div>
      </section>

      {/* 最新記事3件 */}
      <RecentPosts />
    </main>
  );
}
```

**最新記事セクション (`presentation/components/home/recent-posts.tsx`)**
```typescript
import { getPosts } from '@/application/di/usecases';
import { PostCard } from '@/presentation/components/blog/post-card';
import Link from 'next/link';

export async function RecentPosts() {
  // 最新3件を取得
  const result = await getPosts()();
  
  if (result._tag === 'left') {
    console.error('Failed to fetch posts:', result.left);
    return null;
  }

  const posts = result.right.slice(0, 3);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">最新記事</h2>
        <Link href="/blog" className="text-primary hover:underline">
          すべて見る →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
```

### On-Demand Revalidation APIとの連携

フェーズ2.7で実装した `/api/revalidate` エンドポイントが、以下の場合にトップページを再生成します：
- `type: 'post'` が送信された場合: `/` が再生成され、最新記事3件が更新される

### 完了条件
- ✅ トップページでISRが有効化
- ✅ WordPress更新時に自動再生成される
- ✅ 型チェックエラーが0件

---

## フェーズ9全体の完了条件

### 技術指標
- [ ] 型チェックエラーが0件
- [ ] トップページが実装済み
- [ ] 最新記事が表示される
- [ ] ISRが適切に設定済み

### 機能指標
- [ ] ヒーローセクションが正常に表示
- [ ] リンクが正常に動作
- [ ] 最新記事が正常に表示
- [ ] WordPress更新時に自動再生成される

### 次のフェーズ
**フェーズ10: 最適化とSEO実装** に進む
