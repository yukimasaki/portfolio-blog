# チェンジログ: ドメインサービスのテスト実装とバグ修正

**日時**: 2025-11-02 15:38  
**フェーズ**: フェーズ13.1（ユニットテスト実装 - ドメイン層）

## 何を (What)

### 実装した機能
- ドメインサービスのユニットテストを追加
  - `extractRelatedPosts`: 関連記事抽出機能のテスト

### バグ修正
- `extractRelatedPosts`関数の比較ロジックを修正
  - 値オブジェクトの参照比較ではなく、値比較に変更

### 変更されたファイル
- `app/application/__tests__/services.node.spec.ts` (新規作成)
- `app/application/services.ts` (バグ修正)

## どんな目的で (Why)

### 目的
- 関連記事抽出ロジックをテスト
- バグを検出し修正
- ドメイン層のテストカバレッジを向上

### 背景
実装計画書フェーズ13.1のドメインサービステスト。
テスト中に値オブジェクトの参照比較による誤判定を発見し修正。

## どう変更したか (How)

### バグ修正の詳細

#### 問題のあったコード
```typescript
export const extractRelatedPosts = (
  targetPost: Post,
  allPosts: Post[],
  maxCount: number = 5
): Post[] => {
  return pipe(
    allPosts,
    A.filter(post => post.id !== targetPost.id), // ❌ 参照比較
    A.filter(post => {
      const targetTags = targetPost.tags.map(t => t.id); // ❌ 値オブジェクトを配列に
      const postTags = post.tags.map(t => t.id);
      return targetTags.some(tag => postTags.includes(tag)); // ❌ 参照比較
    }),
    A.takeLeft(maxCount)
  );
};
```

#### 修正後のコード
```typescript
export const extractRelatedPosts = (
  targetPost: Post,
  allPosts: Post[],
  maxCount: number = 5
): Post[] => {
  return pipe(
    allPosts,
    A.filter(post => post.id.value !== targetPost.id.value), // ✅ 値比較
    A.filter(post => {
      const targetTagIds = targetPost.tags.map(t => t.id.value); // ✅ 値を配列に
      const postTagIds = post.tags.map(t => t.id.value);
      return targetTagIds.some(tagId => postTagIds.includes(tagId)); // ✅ 値比較
    }),
    A.takeLeft(maxCount)
  );
};
```

### 修正内容
- 21行目: `post.id !== targetPost.id` → `post.id.value !== targetPost.id.value`
- 23-24行目: 値オブジェクトから値を抽出するように修正
- 25行目: `includes(tag)` → `includes(tagId)`

### テスト実装の方針
1. 基本的な抽出機能: 同じタグを持つ記事を最大5件まで抽出
2. フィルタリング: targetPost自体を除外
3. エッジケース: maxCount、空配列、タグなし
4. 複雑なシナリオ: 複数タグマッチ、大量データ
5. 純粋関数性: 同じ入力で同じ出力

### テストケース
- 同じタグを持つ記事を最大5件まで抽出する
- targetPost自体は除外される
- 同じタグがない記事は抽出されない
- maxCountを指定できる
- maxCountが0の場合は空配列を返す
- 複数のタグを持つ場合はいずれかのタグでマッチすれば抽出される
- 空のタグ配列を持つtargetPostの場合、何も抽出されない
- allPostsが空の場合、空配列を返す
- allPostsがtargetPostのみの場合、空配列を返す
- 同じ入力に対して常に同じ出力を返す（純粋関数）
- maxCount未指定の場合は5件まで返す
- マッチする記事がmaxCountより少ない場合は、マッチする記事数だけ返す

### テスト実行結果
```bash
Test Files  18 passed (18)
Tests  264 passed (264)
Duration  567ms
```

- 新規追加した1つのテストファイルが全てパス
- ドメインサービスのテスト: 12テスト
- 型エラー0件、リントエラー0件

## 考えられる影響と範囲

### 既存機能への影響
- 実運用への影響: 記事詳細ページの関連記事表示が正常動作

### ユーザーエクスペリエンスへの影響
- 関連記事の抽出が正確になる

### パフォーマンスへの影響
- 値比較に変更し、計算量は同等
- 実行時間への影響: 最小限

## 課題

### 今後の改善点
- リポジトリのテスト実装
- ユースケースのテスト実装
- コンポーネントテスト実装

### 未解決の問題
- なし

### 追加で必要な作業
- フェーズ13.2、13.3の残りのテスト実装

## 技術的な詳細

### 使用した技術
- **Vitest**: テストランナー
- **fp-ts Array**: 関数型配列操作

### 学んだこと
- 値オブジェクトは参照比較ではなく値比較が必要
- 値オブジェクトの配列化時は`.value`で値を展開
- テストがバグ検出に有効
- 関数型プログラミングでの純粋関数の重要性

### バグ発見のプロセス
1. 正常系テストが失敗
2. 実装コードを詳細に確認
3. 参照比較が原因と特定
4. 値比較へ修正
5. 全テストがパス

