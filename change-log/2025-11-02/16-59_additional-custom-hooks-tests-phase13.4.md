# 追加カスタムフックのテスト実装（フェーズ13.4）

## 何を

カスタムフック`useIntersection`、`useSearchDocuments`、`useTheme`のユニットテストを実装。

## どんな目的で

フェーズ13.4のカスタムフックテストを完了し、主要なフックをカバー。

## どう変更したか

### useIntersectionのテスト

3テストケースを実装。初期状態、戻り値、refの動作を検証。`IntersectionObserver`はDOM要素が割り当てられた後に初期化されるため、基本動作のみをテスト。

### useSearchDocumentsのテスト

6テストケースを実装。以下を検証:
- 初期状態: 空配列を返す
- enabledによる制御: falseでAPI非実行
- 成功時の取得
- 失敗時の空配列
- 初回のみリクエスト

`httpClient.get`をモックしてHTTP処理を確認。

### useThemeのテスト

6テストケースを実装。以下を検証:
- `next-themes`の`useTheme`呼び出し
- 戻り値の確認
- `setTheme`の実行
- `changeTheme`の実行
- `resolvedTheme`と`systemTheme`の返却

外部依存のため`next-themes`の`useTheme`をモックして動作を確認。

### テストの実装方法

- Intersection Observer: グローバルのモッククラスで機能を確認
- Search Documents: `httpClient.get`をモックして非同期を検証
- Theme: `next-themes.useTheme`をモックしてトグル機能を確認

### 実装内容

- `app/presentation/hooks/__tests__/use-intersection.browser.spec.tsx`: useIntersectionの3テストケース
- `app/presentation/hooks/__tests__/use-search-documents.browser.spec.tsx`: useSearchDocumentsの6テストケース
- `app/presentation/hooks/__tests__/use-theme.browser.spec.tsx`: useThemeの6テストケース

## 考えられる影響と範囲

### テストカバレッジ
- 追加15テストケース
- 計24テストケース（useLocalStorageの9 + 追加15）
- 4フックの正常系・異常系をカバー

### テスト実行時間
- 全体340テストが約1秒で完了
- フック追加で約40ms増

## 課題

- IntersectionObserverのDOM連動テストが未実装

## コミットメッセージ

```
test: 追加カスタムフックのテスト実装

- useIntersectionの3テストケースを実装
- useSearchDocumentsの6テストケースを実装
- useThemeの6テストケースを実装
- httpClientとnext-themesをモックして検証
```

