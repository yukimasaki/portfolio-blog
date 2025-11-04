# SSG + オンデマンドISR移行計画書

## 概要（背景・目的）

### 背景
現在、プロジェクトは完全なSSR（Server-Side Rendering）でビルドされており、Azure Static Web Appsがコールドスタートするため表示に10秒ほど掛かることがあり、パフォーマンスが悪い状態です。

### 目的
- **初回ビルド**: SSG（Static Site Generation）でビルド＆デプロイ
- **以後の更新**: オンデマンドISR（Incremental Static Regeneration）で記事やタグの変更・追加に対応
- Azure Static Web Appsのコールドスタート問題を解消し、初回表示を高速化

### 既存活用
- WordPress REST API連携（既存）
- ドメインモデル（既存）
- ユースケース（既存）
- UIコンポーネント（既存）

---

## 現在の状況

### 実装済み
- ✅ WordPress REST API連携
- ✅ ブログ記事一覧ページ（`/blog`）
- ✅ ブログ記事詳細ページ（`/blog/[slug]`）
- ✅ タグ一覧ページ（`/tags`）
- ✅ タグ詳細ページ（`/tags/[slug]`）
- ✅ トップページ（`/`）
- ✅ データフェッチングロジック

### 不足している機能
- ❌ `/api/revalidate` エンドポイント（チェンジログには記載されているが実装されていない可能性）
- ❌ SSG設定（全てのページが `export const dynamic = "force-dynamic";` になっている）
- ❌ ISR設定（`export const revalidate` が設定されていない、または `force-dynamic` により無効化されている）
- ❌ `generateStaticParams` の実装（動的ルート用）

---

## 実装計画（段階的フェーズ）

### フェーズ 1.1: On-Demand Revalidation APIの実装

**目的**: WordPressからのWebhookを受信し、キャッシュを無効化するAPIエンドポイントを実装

**実装内容**:
- `/app/api/revalidate/route.ts` の作成
- PUTハンドラーの実装（On-demand revalidationプラグインの仕様に合わせる）
- Bearer トークンによる認証（`Authorization: Bearer ${REVALIDATE_SECRET_KEY}`）
- `paths` と `tags` 配列を受け取り、`revalidatePath()` と `revalidateTag()` を呼び出し

**完了条件**:
- ✅ `/api/revalidate` エンドポイントが実装済み（PUTメソッド）
- ✅ Bearer トークン認証が実装済み
- ✅ `paths` と `tags` 配列を受け取り、適切に無効化できる
- ✅ 環境変数 `REVALIDATE_SECRET_KEY` が設定されている
- ✅ 型チェックエラーが0件

---

### フェーズ 1.2: ブログ記事一覧ページのSSG化

**目的**: `/blog` ページをSSGに変更し、ISRを有効化

**実装内容**:
- `export const dynamic = "force-dynamic";` を削除
- `export const revalidate = 3600;` を追加（1時間ごとに再生成）
- データフェッチングロジックの確認

**完了条件**:
- ✅ `force-dynamic` が削除されている
- ✅ `revalidate` が設定されている
- ✅ ビルド時に静的生成される
- ✅ 型チェックエラーが0件

---

### フェーズ 1.3: ブログ記事詳細ページのSSG化

**目的**: `/blog/[slug]` ページをSSGに変更し、ISRを有効化

**実装内容**:
- `export const dynamic = "force-dynamic";` を削除
- `export const revalidate = 3600;` を追加
- `generateStaticParams` 関数の実装（ビルド時に全記事のスラッグを取得）

**完了条件**:
- ✅ `force-dynamic` が削除されている
- ✅ `revalidate` が設定されている
- ✅ `generateStaticParams` が実装されている
- ✅ ビルド時に全記事ページが静的生成される
- ✅ 型チェックエラーが0件

---

### フェーズ 1.4: タグ一覧ページのSSG化

**目的**: `/tags` ページをSSGに変更し、ISRを有効化

**実装内容**:
- `export const dynamic = "force-dynamic";` を削除
- `export const revalidate = 7200;` を追加（2時間ごとに再生成）

**完了条件**:
- ✅ `force-dynamic` が削除されている
- ✅ `revalidate` が設定されている
- ✅ ビルド時に静的生成される
- ✅ 型チェックエラーが0件

---

### フェーズ 1.5: タグ詳細ページのSSG化

**目的**: `/tags/[slug]` ページをSSGに変更し、ISRを有効化

**実装内容**:
- `export const dynamic = "force-dynamic";` を削除
- `export const revalidate = 3600;` を追加
- `generateStaticParams` 関数の実装（ビルド時に全タグのスラッグを取得）

**完了条件**:
- ✅ `force-dynamic` が削除されている
- ✅ `revalidate` が設定されている
- ✅ `generateStaticParams` が実装されている
- ✅ ビルド時に全タグページが静的生成される
- ✅ 型チェックエラーが0件

---

### フェーズ 1.6: トップページのSSG化

**目的**: `/` ページをSSGに変更し、ISRを有効化

**実装内容**:
- `export const dynamic = "force-dynamic";` を削除
- `export const revalidate = 3600;` を追加

**完了条件**:
- ✅ `force-dynamic` が削除されている
- ✅ `revalidate` が設定されている
- ✅ ビルド時に静的生成される
- ✅ 型チェックエラーが0件

---

### フェーズ 1.7: 動作確認とテスト

**目的**: SSG + オンデマンドISRの動作確認

**実装内容**:
- ビルド時の静的生成確認
- `/api/revalidate` の動作確認
- WordPress更新時の再生成確認
- パフォーマンステスト

**完了条件**:
- ✅ ビルド時に全ページが静的生成される
- ✅ `/api/revalidate` が正常に動作する
- ✅ WordPress更新時にページが再生成される
- ✅ 初回表示が高速化されている
- ✅ 型チェックエラーが0件

---

## 実装詳細

### フェーズ 1.1: On-Demand Revalidation API

**ファイル**: `app/app/api/revalidate/route.ts`

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Constants for HTTP Status codes.
 */
const STATUS_CODES = {
  UNAUTHORIZED: 401,
  PRECONDITION_FAILED: 412,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const { REVALIDATE_SECRET_KEY } = process.env;

if (!REVALIDATE_SECRET_KEY) {
  throw new Error('Missing REVALIDATE_SECRET_KEY environment variable');
}

/**
 * WordPress On-Demand RevalidationプラグインからのWebhookを受信
 * 記事の追加・更新・削除時にNext.jsのキャッシュを無効化
 * 
 * リクエスト形式:
 * - Method: PUT
 * - Headers: Authorization: Bearer ${REVALIDATE_SECRET_KEY}
 * - Body: { paths?: string[], tags?: string[] }
 * 
 * ブログ記事更新時の推奨パス:
 * - paths: ['/blog', '/blog/[slug]', '/', '/tags']
 * - tags: ['posts']
 * 
 * タグ更新時の推奨パス:
 * - paths: ['/tags', '/tags/[slug]', '/blog']
 * - tags: ['tags']
 */
export async function PUT(request: NextRequest) {
  const { paths, tags }: { paths?: string[]; tags?: string[] } =
    await request.json();

  console.log('Received paths:', paths);
  console.log('Received tags:', tags);

  const headersList = headers();
  const authorizationHeader = headersList.get('authorization');

  console.log('Authorization header:', authorizationHeader);

  // 認証: Bearer トークンの検証
  if (authorizationHeader !== `Bearer ${REVALIDATE_SECRET_KEY}`) {
    console.error(`Invalid token: ${authorizationHeader}`);
    return new Response(`Invalid token`, {
      status: STATUS_CODES.UNAUTHORIZED,
    });
  }

  // paths と tags のどちらかは必須
  if (!paths && !tags) {
    console.error(`Precondition Failed: Missing paths and tags`);
    return new Response(`Precondition Failed: Missing paths and tags`, {
      status: STATUS_CODES.PRECONDITION_FAILED,
    });
  }

  // パスの検証とフィルタリング
  let revalidatePaths: string[] = [];
  let correctTags: string[] = [];

  if (paths) {
    // パスは '/' で始まる必要がある
    revalidatePaths = paths.filter((path) => path.startsWith('/'));
    console.log('Filtered correct paths:', revalidatePaths);
  }

  if (tags) {
    // タグは文字列である必要がある
    correctTags = tags.filter((tag) => typeof tag === 'string');
    console.log('Filtered correct tags:', correctTags);
  }

  try {
    // パスの無効化
    revalidatePaths.forEach((path) => {
      revalidatePath(path, 'page');
    });

    // タグの無効化
    correctTags.forEach((tag) => {
      revalidateTag(tag);
    });

    console.log(
      `${new Date().toJSON()} - Paths and tags revalidated: ${revalidatePaths.join(
        ', '
      )} and ${correctTags.join(', ')}`
    );

    return new Response(
      JSON.stringify({
        revalidated: true,
        message: `Paths and tags revalidated: ${revalidatePaths.join(
          ', '
        )} and ${correctTags.join(', ')}`,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err: unknown) {
    let message: string;
    if (err instanceof Error) {
      message = err.message;
    } else {
      message = 'An error occurred';
    }

    console.error('Revalidation error:', message);
    return new Response(message, {
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
```

### フェーズ 1.3: ブログ記事詳細ページのSSG化

**ファイル**: `app/app/blog/[slug]/page.tsx`

```typescript
// SSR設定を削除
// export const dynamic = "force-dynamic";

// ISR設定: 1時間ごとに再生成
export const revalidate = 3600;

// ビルド時に全記事のスラッグを取得
export async function generateStaticParams() {
  try {
    const { getPosts } = await import("@/application/di/usecases");
    const result = await getPosts()();
    
    if (result._tag === "Left") {
      console.error("Failed to fetch posts for generateStaticParams:", result.left);
      return [];
    }
    
    return result.right.map((post) => ({
      slug: post.slug.value,
    }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}
```

### フェーズ 1.5: タグ詳細ページのSSG化

**ファイル**: `app/app/tags/[slug]/page.tsx`

```typescript
// SSR設定を削除
// export const dynamic = "force-dynamic";

// ISR設定: 1時間ごとに再生成
export const revalidate = 3600;

// ビルド時に全タグのスラッグを取得
export async function generateStaticParams() {
  try {
    const { getTags } = await import("@/application/di/usecases");
    const result = await getTags()();
    
    if (result._tag === "Left") {
      console.error("Failed to fetch tags for generateStaticParams:", result.left);
      return [];
    }
    
    return result.right.map((tag) => ({
      slug: tag.slug.value,
    }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}
```

---

## ファイル構成

### 新規作成ファイル
- `app/app/api/revalidate/route.ts` - On-Demand Revalidation API

### 変更ファイル
- `app/app/blog/page.tsx` - SSG化
- `app/app/blog/[slug]/page.tsx` - SSG化 + generateStaticParams
- `app/app/tags/page.tsx` - SSG化
- `app/app/tags/[slug]/page.tsx` - SSG化 + generateStaticParams
- `app/app/page.tsx` - SSG化

### 環境変数
- `.env.local` に `REVALIDATE_SECRET_KEY` を追加
- 本番環境（Azure Static Web Apps）でも同じ環境変数を設定する必要がある

---

## 成功指標

### 技術指標
- ✅ 全てのページがSSGでビルドされる
- ✅ ビルド時に全ページが静的生成される
- ✅ `/api/revalidate` が正常に動作する
- ✅ 型チェックエラーが0件
- ✅ リントエラーが0件

### パフォーマンス指標
- ✅ 初回表示時間が10秒以内（Azure Static Web Appsのコールドスタート問題の解消）
- ✅ 静的ページの配信が高速（CDN経由）

### 機能指標
- ✅ WordPress更新時にページが再生成される
- ✅ オンデマンドISRが正常に動作する
- ✅ 既存機能が正常に動作する

### タグ変更時の更新動作

**記事詳細ページでのタグ表示の更新**:
- WordPressで記事のタグを変更（タグAを削除、タグDを追加など）した場合
- WordPressプラグイン「On-demand revalidation」が `/api/revalidate` にPUTリクエストを送信:
  ```json
  {
    "paths": [
      "/blog",
      "/blog/article-slug",  // 実際の記事スラッグ
      "/",
      "/tags",
      "/tags/tag-a",  // 削除されたタグ
      "/tags/tag-d"   // 追加されたタグ
    ],
    "tags": ["posts", "tags"]
  }
  ```
- `/api/revalidate` が指定されたパスを無効化
- 次回アクセス時に記事詳細ページが再生成され、WordPress APIから最新のデータ（更新されたタグ情報を含む）を取得
- 記事詳細ページに表示されているタグ（`PostHeader`コンポーネント内の`TagList`）が更新される

**タグ詳細ページでの記事数の更新**:
- WordPressプラグインが `/api/revalidate` にPUTリクエストを送信（削除されたタグと追加されたタグのスラッグを含む）
- `/api/revalidate` が `/tags/${tagSlug}` を無効化（該当する各タグの詳細ページ）
- 次回アクセス時にタグ詳細ページが再生成され、記事数（count）が更新される

**注意**: WordPressプラグイン側で適切なパス（`/blog/[slug]` を実際の記事スラッグに置き換えたパス）を送信する必要があります。

---

## 注意事項

### Azure Static Web Appsでの動作

Azure Static Web Appsは静的サイトホスティングサービスですが、Next.jsのAPI Routesもサポートしています。`/api/revalidate` はAPI Routesとして動作するため、Azure Static Web Apps上で正常に動作します。

### ビルド時のデータ取得

`generateStaticParams` やページコンポーネント内でのデータ取得は、ビルド時に実行されます。WordPress APIが利用可能であることを確認してください。

### 環境変数の設定

本番環境（Azure Static Web Apps）では、環境変数 `REVALIDATE_SECRET_KEY` を設定する必要があります。

**開発環境（.env.local）**:
```env
REVALIDATE_SECRET_KEY=your-secret-token-here
```

**本番環境（Azure Static Web Apps）**:
- Azure PortalのStatic Web Apps設定から環境変数を追加
- WordPressプラグイン側の設定でも同じ値を `Authorization: Bearer` ヘッダーに使用

### WordPressプラグイン設定

WordPress管理画面で「On-demand revalidation」プラグインを設定し、以下のWebhookを設定する必要があります：

- **Webhook URL**: `https://your-domain.com/api/revalidate`
- **HTTP Method**: PUT
- **Authorization Header**: `Bearer ${REVALIDATE_SECRET_KEY}` (環境変数 `REVALIDATE_SECRET_KEY` と同じ値)
- **リクエストボディ形式**: 
  ```json
  {
    "paths": ["/blog", "/blog/[slug]", "/", "/tags"],
    "tags": ["posts"]
  }
  ```
- **トリガー**: 投稿の公開/更新/削除時、タグの更新時

#### ブログ記事更新時の推奨設定

**WordPressプラグイン側での設定例**:
```json
{
  "paths": [
    "/blog",
    "/blog/[slug]",  // [slug] は実際の記事スラッグに置き換える
    "/",
    "/tags"
  ],
  "tags": ["posts"]
}
```

**記事のタグを変更した場合**:
```json
{
  "paths": [
    "/blog",
    "/blog/[slug]",
    "/",
    "/tags",
    "/tags/[tag-slug-1]",  // 削除されたタグのスラッグ
    "/tags/[tag-slug-2]"   // 追加されたタグのスラッグ
  ],
  "tags": ["posts", "tags"]
}
```

#### タグ更新時の推奨設定

```json
{
  "paths": [
    "/tags",
    "/tags/[slug]",  // [slug] は実際のタグスラッグに置き換える
    "/blog"
  ],
  "tags": ["tags"]
}
```

---

## 参考資料

- [Next.js公式ドキュメント: Data Fetching, Caching, and Revalidating](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Next.js公式ドキュメント: On-Demand Revalidation](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- [Next.js公式ドキュメント: generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Azure Static Web Apps: Next.js サポート](https://learn.microsoft.com/ja-jp/azure/static-web-apps/nextjs)
