# チェンジログ: SSG + オンデマンドISR移行

**日時**: 2025-11-04 23:30  
**フェーズ**: フェーズ 1.1〜1.7（SSG + オンデマンドISR移行）

## 何を (What)

### 実装した機能

1. **On-Demand Revalidation API** (`app/app/api/revalidate/route.ts`)
   - WordPress On-Demand RevalidationプラグインからのWebhookを受信するAPIエンドポイント
   - PUTメソッドで実装
   - Bearer トークンによる認証機能
   - パスベース・タグベースのリアバリデーション機能

2. **ブログ記事一覧ページのSSG化** (`app/app/blog/page.tsx`)
   - `force-dynamic` を削除し、ISR設定を追加（1時間ごとに再生成）

3. **ブログ記事詳細ページのSSG化** (`app/app/blog/[slug]/page.tsx`)
   - `force-dynamic` を削除し、ISR設定を追加（1時間ごとに再生成）
   - `generateStaticParams` 関数を実装（ビルド時に全記事のスラッグを取得）

4. **タグ一覧ページのSSG化** (`app/app/tags/page.tsx`)
   - `force-dynamic` を削除し、ISR設定を追加（2時間ごとに再生成）

5. **タグ詳細ページのSSG化** (`app/app/tags/[slug]/page.tsx`)
   - `force-dynamic` を削除し、ISR設定を追加（1時間ごとに再生成）
   - `generateStaticParams` 関数を実装（ビルド時に全タグのスラッグを取得）

6. **トップページのSSG化** (`app/app/page.tsx`)
   - `force-dynamic` を削除し、ISR設定を追加（1時間ごとに再生成）

### 変更されたファイル

- `app/app/api/revalidate/route.ts` (新規作成)
- `app/app/blog/page.tsx` (SSG化)
- `app/app/blog/[slug]/page.tsx` (SSG化 + generateStaticParams)
- `app/app/tags/page.tsx` (SSG化)
- `app/app/tags/[slug]/page.tsx` (SSG化 + generateStaticParams)
- `app/app/page.tsx` (SSG化)

## どんな目的で (Why)

このフェーズの目的は、SSR（Server-Side Rendering）からSSG（Static Site Generation）とISR（Incremental Static Regeneration）に移行し、パフォーマンスを向上させることでした。

具体的には：
- **初回ビルド**: SSGでビルド＆デプロイ
- **以後の更新**: オンデマンドISRで記事やタグの変更・追加に対応
- **初回表示の高速化**: 静的ページの事前生成により、初回表示時間を大幅に短縮
- **自動更新**: WordPress更新時にほぼリアルタイムでページを再生成

## どう変更したか (How)

### 1. On-Demand Revalidation APIの実装

`app/app/api/revalidate/route.ts` にPUTハンドラーを実装しました。

#### Bearer トークンによる認証

`NextRequest` の `headers` から `Authorization` ヘッダーを取得し、環境変数 `REVALIDATE_SECRET_KEY` と比較して認証を行います。トークンが一致しない場合は401エラーを返します。

#### パスベース・タグベースのリアバリデーション

リクエストボディから `paths` と `tags` 配列を取得し、それぞれに応じたリアバリデーションを実行します。

- `paths` が指定された場合: `revalidatePath(path, 'page')` で指定パスを無効化
- `tags` が指定された場合: `revalidateTag(tag, '')` で指定タグを無効化

パスは '/' で始まる必要があり、タグは文字列である必要があります。不正な値はフィルタリングされます。

### 2. 各ページのSSG化

全てのページから `export const dynamic = "force-dynamic";` を削除し、代わりに `export const revalidate` を設定しました。

#### ブログ記事一覧・詳細ページ

- `revalidate = 3600` (1時間ごとに再生成)
- ブログ記事詳細ページには `generateStaticParams` 関数を追加し、ビルド時に全記事のスラッグを取得して静的ページを生成

#### タグ一覧・詳細ページ

- タグ一覧ページ: `revalidate = 7200` (2時間ごとに再生成)
- タグ詳細ページ: `revalidate = 3600` (1時間ごとに再生成)
- タグ詳細ページには `generateStaticParams` 関数を追加し、ビルド時に全タグのスラッグを取得して静的ページを生成

#### トップページ

- `revalidate = 3600` (1時間ごとに再生成)

### 3. generateStaticParams の実装

動的ルート（`/blog/[slug]` と `/tags/[slug]`）に `generateStaticParams` 関数を実装しました。

この関数はビルド時に実行され、WordPress APIから全記事/全タグを取得して、各スラッグの静的ページを事前生成します。エラーが発生した場合は空配列を返し、ビルドを継続します。

## 考えられる影響と範囲

### 既存機能への影響

- 今回の変更は、レンダリング方式の変更のみで、既存の機能やUIには影響しません
- データフェッチングロジックは変更していないため、既存の動作は維持されます
- WordPress APIとの連携は既存のままです

### ユーザーエクスペリエンスへの影響

- **初回表示の高速化**: 静的ページの事前生成により、初回表示時間が大幅に短縮されます
- **CDN経由の配信**: 静的ページはCDN経由で配信されるため、世界中どこからでも高速にアクセスできます
- **自動更新**: WordPress更新時にほぼリアルタイムでページが再生成されるため、最新のコンテンツが常に提供されます

### パフォーマンスへの影響

- **ビルド時間の増加**: ビルド時に全記事・全タグの静的ページを生成するため、ビルド時間が増加する可能性があります
- **サーバー負荷の軽減**: 静的ページの配信により、サーバー負荷が大幅に軽減されます
- **ISRによる最適化**: 定期的な再生成（1時間または2時間）により、最新性とパフォーマンスのバランスを取ります

### 環境変数の設定が必要

本番環境（Vercel）では、環境変数 `REVALIDATE_SECRET_KEY` を設定する必要があります。

**開発環境（.env.local）**:
```env
REVALIDATE_SECRET_KEY=your-secret-token-here
```

**本番環境（Vercel）**:
- Vercelダッシュボードの「Settings」→「Environment Variables」から環境変数を追加
- WordPressプラグイン側の設定でも同じ値を `Authorization: Bearer` ヘッダーに使用

## 課題

### 今後の改善点

- **ビルド時間の最適化**: 記事数が増えた場合、ビルド時間が長くなる可能性があるため、最適化が必要かもしれません
- **エラーハンドリングの強化**: `generateStaticParams` でエラーが発生した場合の処理をより堅牢にする必要があるかもしれません

### 未解決の問題

- なし

### 追加で必要な作業

- **WordPressプラグイン設定**: WordPress管理画面で「On-demand revalidation」プラグインを設定し、以下のWebhookを設定する必要があります：
  - **Webhook URL**: `https://your-domain.com/api/revalidate`
  - **HTTP Method**: PUT
  - **Authorization Header**: `Bearer ${REVALIDATE_SECRET_KEY}`
  - **リクエストボディ形式**: 
    ```json
    {
      "paths": ["/blog", "/blog/[slug]", "/", "/tags"],
      "tags": ["posts"]
    }
    ```
  - **トリガー**: 投稿の公開/更新/削除時、タグの更新時

## 型チェック結果

✅ 型エラー0件

## リント結果

✅ リントエラー0件

