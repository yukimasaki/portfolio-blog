# On-Demand ISR: revalidateTagとキャッシュタグサポートの実装

## 何を (What)

### 実装した機能・修正した内容

1. **`revalidateTag` の使用方法を修正**
   - 空文字列 `""` から `{ expire: 0 }` に変更
   - Next.js 16の公式ドキュメントに準拠した実装に修正

2. **HTTPクライアントでキャッシュタグをサポート**
   - `httpClient.get` に `next: { tags: [...] }` オプションを追加
   - Next.jsのキャッシュタグ機能をサポート

3. **WordPress API呼び出しにキャッシュタグを設定**
   - `getWordPressPosts`: `posts` タグを設定
   - `getWordPressPostBySlug`: `posts` タグを設定
   - `getWordPressPostsByTagId`: `posts` と `tags` タグを設定
   - `getWordPressTags`: `tags` タグを設定
   - `getWordPressTagBySlug`: `tags` タグを設定

### 変更されたファイル

- `app/app/api/revalidate/route.ts` - `revalidateTag` の使用方法を修正
- `app/infrastructure/http/client.ts` - キャッシュタグサポートを追加
- `app/infrastructure/external/wordpress-api.ts` - すべてのWordPress API呼び出しにキャッシュタグを設定

## どんな目的で (Why)

### 変更を行った理由

記事詳細ページに追加したタグが反映されない問題を解決するため。

**問題の原因:**
1. `revalidateTag` の使用方法が誤っていた（空文字列を渡していた）
2. HTTPクライアントでキャッシュタグがサポートされていなかった
3. WordPress API呼び出し時にキャッシュタグが設定されていなかった

**解決したい課題:**
- WordPressで記事を更新（タグを追加）した際に、記事詳細ページにタグが反映されない
- `revalidateTag` が正しく機能していない
- パスベースの無効化（`revalidatePath`）のみに依存していた

## どう変更したか (How)

### 1. `revalidateTag` の使用方法を修正

Next.js 16の公式ドキュメント（https://nextjs.org/docs/app/api-reference/functions/revalidateTag#parameters）に基づき、Webhookからのリクエストのため即座に無効化する必要があるため、`{ expire: 0 }` を使用するように修正しました。

**変更前:**
```typescript
revalidateTag(tag, "");
```

**変更後:**
```typescript
revalidateTag(tag, { expire: 0 });
```

### 2. HTTPクライアントでキャッシュタグをサポート

`httpClient.get` メソッドに `next: { tags: [...] }` オプションを追加し、Next.jsのキャッシュタグ機能をサポートするようにしました。

**追加内容:**
- `NextCacheOptions` インターフェースを定義
- `httpClient.get` の `options` パラメータに `next?: NextCacheOptions` を追加
- `fetch` 呼び出し時に `next` オプションを渡すように修正

### 3. WordPress API呼び出しにキャッシュタグを設定

すべてのWordPress API呼び出しに適切なキャッシュタグを設定しました。

**設定内容:**
- 記事取得API: `posts` タグ
- タグIDで記事取得API: `posts` と `tags` タグ
- タグ取得API: `tags` タグ

これにより、`revalidateTag("posts")` または `revalidateTag("tags")` を呼び出すと、該当するキャッシュが無効化され、次回アクセス時に最新データが取得されます。

### 動作の流れ

1. WordPressで記事を更新（タグを追加）
2. WordPressプラグインが `/api/revalidate` にリクエストを送信
   - `paths: ["/blog", "/blog/actual-slug", "/", "/tags"]`
   - `tags: ["posts"]`
3. `/api/revalidate` が以下を実行：
   - `revalidatePath("/blog/actual-slug", "page")` - パスベースの無効化
   - `revalidateTag("posts", { expire: 0 })` - タグベースの無効化
4. 次回アクセス時に：
   - パスが無効化されているため、記事詳細ページが再生成される
   - タグが無効化されているため、`posts` タグを持つキャッシュが無効化される
   - WordPress APIから最新データ（追加されたタグを含む）を取得

## 考えられる影響と範囲

### 既存機能への影響

- **良い影響:**
  - 記事更新時にタグが正しく反映されるようになる
  - `revalidateTag` が正しく機能するようになる
  - パスベースとタグベースの両方の無効化が機能する

- **注意点:**
  - キャッシュタグが設定されたことで、キャッシュの動作が変更される
  - 初回アクセス時は従来通り、次回以降はキャッシュが使用される

### ユーザーエクスペリエンスへの影響

- WordPressで記事を更新（タグを追加）した際に、記事詳細ページにタグが正しく表示されるようになる
- 記事一覧ページと記事詳細ページでタグの表示が一致するようになる

### パフォーマンスへの影響

- キャッシュタグを使用することで、より効率的なキャッシュ無効化が可能になる
- パスベースとタグベースの両方の無効化が機能するため、より確実なキャッシュ更新が可能になる

## 課題

### 今後の改善点

- キャッシュタグの動作確認（実際の環境でテスト）
- パスベースとタグベースの無効化の優先順位の検討
- キャッシュタグの命名規則の統一

### 未解決の問題

- なし（今回の修正で問題が解決される見込み）

### 追加で必要な作業

- 実際の環境での動作確認
- パフォーマンステスト（キャッシュタグの効果測定）

## 参考資料

- [Next.js公式ドキュメント: revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag#parameters)
- [Next.js公式ドキュメント: Data Fetching, Caching, and Revalidating](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)

