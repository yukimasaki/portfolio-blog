# コードベースアーキテクチャ詳細

## アーキテクチャ概要

このプロジェクトは**クリーンアーキテクチャ**と**関数型ドメインモデリング**に基づいて構築されています。
レイヤーは外側から内側への依存関係を持ち、ビジネスロジックがフレームワークや外部依存から独立しています。

## レイヤー構造

### 1. Domain Layer (最内側 - ビジネスロジック)

**パス**: `app/domain/`

ドメイン層は最も内側のレイヤーで、ビジネスロジックとドメインエンティティを定義します。

#### 構成
```
domain/
├── blog/                    # ブログドメイン
│   ├── entities.ts         # Post エンティティ（値オブジェクトを使用）
│   └── ports.ts            # PostRepository インターフェース
├── tags/                    # タグドメイン
│   ├── entities.ts         # Tag エンティティ
│   └── ports.ts            # TagRepository インターフェース
└── value-objects/           # 値オブジェクト（ドメイン概念の型安全な表現）
    ├── index.ts            # 一括エクスポート
    ├── post.ts             # PostId, PostTitle, PostSlug, PostExcerpt, PostDate
    ├── tag.ts              # TagId, TagName, TagSlug, TagCount
    ├── common.ts           # ImageUrl, GitHubUrl, LiveUrl, Email, AuthorName
    └── validation.ts       # バリデーション関数（Either型を使用）
```

#### 主要な特徴
- **値オブジェクト**: すべてのドメイン概念は値オブジェクトとして表現（例: `PostId`, `PostTitle`）
- **不変性**: すべてのエンティティと値オブジェクトは `readonly` で定義
- **ポート（インターフェース）**: 依存性の逆転パターンで、リポジトリのインターフェースを定義
- **関数型プログラミング**: fp-tsのEither型を使用した型安全なバリデーション

#### 主要なエンティティ
- `Post`: ブログ記事エンティティ（値オブジェクトを使用）
- `Tag`: タグエンティティ（値オブジェクトを使用）

#### 主要なポート
- `PostRepository`: ブログ記事リポジトリのインターフェース
  - `findAll()`, `findBySlug()`, `findByTagSlug()`, `findByTagId()`, `search()`
- `TagRepository`: タグリポジトリのインターフェース
  - `findAll()`, `findBySlug()`

---

### 2. Application Layer (ユースケース層)

**パス**: `app/application/`

アプリケーション層はユースケースとビジネスロジックの調整を行います。

#### 構成
```
application/
├── blog/                    # ブログ機能
│   ├── schemas.ts          # Zodスキーマ（WordPress APIレスポンス用）
│   ├── validators.ts       # バリデーション関数（Either型）
│   └── usecases.ts         # ユースケース（関数ファクトリパターン）
├── tags/                    # タグ機能
│   ├── schemas.ts          # Zodスキーマ
│   └── usecases.ts         # ユースケース
├── common/                  # 共通
│   └── errors.ts           # エラー型定義（NetworkError, ApiError, etc.）
├── services.ts              # ドメインサービス（関連記事抽出など）
└── di/                      # 依存性注入
    ├── di-container.ts     # DIコンテナ設定（tsyringe）
    └── usecases.ts         # 注入済みユースケース（実行可能な関数）
```

#### 主要な特徴
- **関数ファクトリパターン**: ユースケースはリポジトリを受け取り、実行可能な関数を返す
- **Zodスキーマ**: WordPress APIレスポンスの型安全性を確保
- **エラーハンドリング**: Either型とAppError型による型安全なエラー処理
- **DI**: tsyringeを使用した依存性注入（DIコンテナ設定あり）

#### 主要なユースケース
- `createGetPostsUseCase`: 全ての投稿を取得
- `createGetPostBySlugUseCase`: スラッグで投稿を取得
- `createGetPostsByTagUseCase`: タグで投稿を取得
- `createSearchPostsUseCase`: キーワードで投稿を検索
- `createGetTagsUseCase`: 全てのタグを取得
- `createGetTagBySlugUseCase`: スラッグでタグを取得

#### ドメインサービス
- `extractRelatedPosts`: 関連記事抽出（同じタグを持つ記事を最大5件）

#### エラー型
- `NetworkError`: ネットワークエラー
- `ApiError`: APIエラー（ステータスコード付き）
- `NotFoundError`: リソース未找到
- `ValidationError`: バリデーションエラー
- `UnknownError`: 不明なエラー

---

### 3. Infrastructure Layer (インフラ層)

**パス**: `app/infrastructure/`

インフラ層は外部サービス（WordPress API）との通信やデータ変換を行います。

#### 構成
```
infrastructure/
├── repositories/            # リポジトリ実装
│   ├── WpApiPostRepository.ts  # WordPress記事リポジトリ
│   └── WpApiTagRepository.ts   # WordPressタグリポジトリ
├── http/                    # HTTPクライアント
│   └── client.ts           # fetchラッパー（Either型でエラーハンドリング）
├── external/                # 外部サービス
│   ├── types.ts            # WordPress API型定義
│   └── wordpress-api.ts    # WordPress APIクライアント関数
├── mappers/                 # データマッパー
│   ├── wp-to-post.ts       # WordPress → Post 変換
│   └── wp-to-tag.ts        # WordPress → Tag 変換
├── query/                   # React Query設定
│   ├── client.ts           # QueryClient設定
│   ├── keys.ts             # Query Keys定義
│   └── index.ts            # エクスポート
├── search/                  # 全文検索
│   └── search-index.ts     # FlexSearchインデックス
└── utils/                   # ユーティリティ
    ├── debug.ts            # デバッグユーティリティ
    ├── code-highlight.ts   # コードハイライト
    ├── extract-toc.ts      # 目次抽出
    ├── html-to-react.ts    # HTML → React変換
    └── ...
```

#### 主要な特徴
- **リポジトリ実装**: ドメイン層のポートインターフェースを実装
- **TaskEither**: 非同期処理の型安全なエラーハンドリング
- **データマッピング**: WordPress APIレスポンスをドメインエンティティに変換
- **HTTPクライアント**: fetch APIをラップした型安全なHTTPクライアント
- **React Query**: データフェッチングとキャッシュ管理

#### 主要なリポジトリ
- `wpApiPostRepository`: WordPress APIを使用したPostRepository実装
- `wpApiTagRepository`: WordPress APIを使用したTagRepository実装

#### HTTPクライアント
- `httpClient.get()`: GETリクエスト（Either型でエラーハンドリング）
- `httpClient.post()`: POSTリクエスト（Either型でエラーハンドリング）
- タイムアウト対応（デフォルト15秒）

---

### 4. Presentation Layer (プレゼンテーション層)

**パス**: `app/presentation/`

プレゼンテーション層はUIコンポーネント、ページ、状態管理を担当します。

#### 構成
```
presentation/
├── components/              # UIコンポーネント
│   ├── ui/                 # 基本UIコンポーネント（shadcn/ui）
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── glass-card.tsx  # グラスモーフィズムカード
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── blog/               # ブログ固有コンポーネント
│   ├── home/               # ホームページコンポーネント
│   ├── common/             # 共通コンポーネント
│   │   └── theme-toggle.tsx
│   └── providers/          # プロバイダーコンポーネント
├── hooks/                   # カスタムフック
│   ├── use-theme.ts        # テーマ管理
│   ├── use-intersection.ts # IntersectionObserver
│   ├── use-local-storage.ts # ローカルストレージ
│   └── use-search-documents.ts # 検索ドキュメント取得
├── store/                   # Zustand状態管理
│   ├── theme-store.ts      # テーマ状態
│   └── ui-store.ts         # UI状態（モーダル、メニュー）
└── utils/                   # ユーティリティ
    ├── cn.ts               # クラス名マージ（clsx + tailwind-merge）
    ├── format.ts           # 日付フォーマット
    └── seo.ts              # SEOユーティリティ
```

#### 主要な特徴
- **Next.js App Router**: `app/`ディレクトリ内にページを配置
- **Server Components優先**: 必要時のみ`"use client"`を使用
- **shadcn/ui**: Radix UIベースのUIコンポーネント
- **Zustand**: 軽量な状態管理（テーマ、UI状態）
- **TanStack Query**: データフェッチング（infrastructure層で設定）

#### ページ構成（`app/app/`）
```
app/
├── page.tsx                # ホームページ
├── layout.tsx              # ルートレイアウト
├── not-found.tsx           # 404ページ
├── blog/                   # ブログページ
│   ├── page.tsx           # 記事一覧
│   └── [slug]/page.tsx    # 記事詳細
├── tags/                   # タグページ
│   ├── page.tsx           # タグ一覧
│   └── [slug]/page.tsx    # タグ詳細
├── about/                  # 自己紹介ページ
│   └── page.tsx
└── api/                    # API Routes
    └── search-documents/   # 検索ドキュメントAPI
        └── route.ts
```

---

### 5. Shared Layer (共有層)

**パス**: `app/shared/`

共有層は複数のレイヤーで共通して使用されるユーティリティと型定義を提供します。

#### 構成
```
shared/
├── fp-ts/                  # fp-ts拡張
│   ├── either.ts          # Either拡張
│   ├── task-either.ts     # TaskEither拡張
│   └── option.ts          # Option拡張
├── constants/              # 定数
│   ├── routes.ts          # ページルート定数
│   └── profile.ts         # プロフィール情報
├── types/                  # 共通型定義
└── utils/                  # 共通ユーティリティ
    └── github-avatar.ts   # GitHubアバター取得
```

#### 主要な特徴
- **fp-ts拡張**: Either、TaskEither、Optionの拡張関数
- **定数**: ルート定義、プロフィール情報など
- **共通型**: 複数レイヤーで使用される型定義

---

## データフロー

### 典型的なデータフロー例（記事一覧取得）

```
1. Presentation Layer (app/app/blog/page.tsx)
   ↓ ユースケース呼び出し
2. Application Layer (application/di/usecases.ts)
   ↓ DIで注入されたユースケース実行
3. Domain Layer (domain/blog/ports.ts)
   ↓ ポートインターフェース経由で呼び出し
4. Infrastructure Layer (infrastructure/repositories/WpApiPostRepository.ts)
   ↓ WordPress API呼び出し
5. External Service (WordPress REST API)
   ↓ JSONレスポンス
6. Infrastructure Layer (infrastructure/mappers/wp-to-post.ts)
   ↓ ドメインエンティティに変換
7. Domain Layer (domain/blog/entities.ts)
   ↓ エンティティ返却
8. Application Layer
   ↓ ユースケース結果返却
9. Presentation Layer
   ↓ コンポーネントレンダリング
```

## 依存関係の方向

```
Presentation → Application → Domain ← Infrastructure
                                      ↑
                               (ポート実装)
```

- **内側への依存**: 外側のレイヤーは内側のレイヤーに依存
- **依存性の逆転**: Infrastructure層はDomain層のポート（インターフェース）を実装
- **Shared層**: すべてのレイヤーから使用可能

## 主要な設計パターン

### 1. 関数ファクトリパターン
ユースケースは関数ファクトリとして実装され、DIが容易になります。

```typescript
export const createGetPostsUseCase = (repo: PostRepository) => repo.findAll;
```

### 2. Either型によるエラーハンドリング
すべてのエラーはEither型で扱われ、型安全性が保証されます。

```typescript
TaskEither<AppError, Post[]>
```

### 3. 値オブジェクトパターン
ドメイン概念は値オブジェクトとして表現され、型安全性とバリデーションが提供されます。

```typescript
interface PostId {
  readonly _tag: "PostId";
  readonly value: number;
}
```

### 4. ポート・アダプターパターン
Domain層はポート（インターフェース）を定義し、Infrastructure層が実装します。

---

## テスト構成

### テストファイルの配置
各ディレクトリ内の`__tests__/`ディレクトリに配置

### テスト環境
- **Vitest**: テストランナー
- **Testing Library**: Reactコンポーネントテスト
- **ブラウザ環境**: `*.browser.spec.tsx`（jsdom）
- **Node環境**: `*.node.spec.ts`

### テストカバレッジ
- Domain層: 値オブジェクト、エンティティ
- Application層: ユースケース、バリデーション
- Infrastructure層: リポジトリ、HTTPクライアント、マッパー

---

## 設定ファイル

### TypeScript設定
- **パスエイリアス**: `@/*` → `app/` ルート
- **厳密な型チェック**: `strict: true`
- **モジュール解決**: `bundler`

### Next.js設定
- **App Router**: Next.js 16 App Routerを使用
- **Output**: `standalone`
- **画像最適化**: WordPressドメインを許可

### Tailwind CSS設定
- **Tailwind CSS 4**: 最新版を使用
- **カスタムカラー**: CSS変数で定義
- **ダークモード対応**: `next-themes`と統合

---

## 重要な注意事項

1. **依存関係の方向**: 外側から内側への依存のみ許可
2. **値オブジェクトの使用**: プリミティブ型ではなく値オブジェクトを使用
3. **Either型**: エラーハンドリングはEither型を使用
4. **不変性**: すべてのエンティティと値オブジェクトは不変
5. **関数型プログラミング**: 純粋関数と関数の合成を優先
6. **型安全性**: `any`型の使用を禁止
