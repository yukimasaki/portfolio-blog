# チェンジログ: テストカバレッジ設定の実装

**日時**: 2025-11-02 16:01  
**フェーズ**: フェーズ13.6（テストカバレッジレポート生成）

## 何を (What)

### 実装した機能
- Vitestのカバレッジ測定機能を設定
  - @vitest/coverage-v8パッケージをインストール
  - vitest.config.tsにカバレッジ設定を追加
  - package.jsonにtest:coverageコマンドを追加

### 変更されたファイル
- `app/package.json` (変更: scripts追加、devDependencies追加)
- `app/vitest.config.ts` (変更: coverage設定追加)
- `app/yarn.lock` (自動生成)

## どんな目的で (Why)

### 目的
- テストカバレッジの現状把握
- カバレッジ基準（80%以上）の達成状況確認
- カバレッジレポートの自動生成
- CI/CDでの自動測定

### 背景
フェーズ13.6としてカバレッジ測定を設定。テスト未実施箇所を把握して優先順位を決める。

## どう変更したか (How)

### カバレッジプロバイダーの追加
- **@vitest/coverage-v8**: v8エンジンでの測定
- devDependenciesに追加

### vitest.config.tsの設定
- provider: "v8"
- reporter: text/json/html
- reportsDirectory: "./coverage"
- 除外:
  - config、d.ts、node_modules、__tests__、coverage、.next、dist

### package.jsonのスクリプト追加
- `yarn test:coverage`: カバレッジ付きテスト実行

### カバレッジ結果

#### 現在のカバレッジ（全体）
- Statements: 78.08%
- Branch: 76.88%
- Functions: 73.38%
- Lines: 78.79%

#### 詳細

##### カバレッジ100%のモジュール
- application/services
- application/blog (schemas, validators)
- domain/value-objects/common
- domain/value-objects/post
- infrastructure/mappers/wp-to-tag (100%)
- infrastructure/http/client (100%)
- shared/fp-ts (either, option, task-either)
- presentation/utils/prose-styles (link, list, media, quote, text)

##### 90%以上のモジュール
- domain/value-objects: 98.59%
- infrastructure/mappers: 94.54%
- presentation/utils/prose-styles/heading: 90%

##### カバレッジが低いモジュール
- infrastructure/utils: 49.12%
  - html-to-react.ts: 28.33%
  - get-language.ts: 52.38%
  - add-line-numbers.ts: 81.25%
  - transform-link-attributes.ts: 88.23%
- presentation/components/common: 0%
  - error-button.tsx: 0%
- presentation/utils: 0%
  - cn.ts: 0%

##### カバレッジ不足
- domain/value-objects/tag.ts: 96.42%
- infrastructure/mappers/wp-to-post.ts: 91.66%

### テスト実行結果
```bash
Test Files  20 passed (20)
Tests  316 passed (316)
Duration  649ms
```

## 考えられる影響と範囲

### 既存機能への影響
- なし（計測のみ）

### ユーザーエクスペリエンスへの影響
- なし（ビルド内）

### パフォーマンスへの影響
- 計測で数十ミリ秒増

## 課題

### 80%未満の対象
- application層: 100%
- domain層: 98.59%
- infrastructure層: 92.3%（マッパー）、49.12%（ユーティリティ）
- presentation層: 28.33%（utils）、0%（components）

### 優先
1. infrastructure/utils: 49.12%
2. presentation/components/common: 0%
3. presentation/utils: 0%

## 技術的な詳細

### 使用した技術
- Vitest: テストランナー・カバレッジ
- @vitest/coverage-v8: v8計測

### 設定ポイント
- v8プロバイダー
- text/json/html
- 除外設定
- coverage/.gitignoreで除外

### 計測方法
```bash
yarn test:coverage
```

出力:
- コンソール: text
- coverage/: json/html

## 次のステップ

### 80%達成に向けて
1. infrastructure/utils: html-to-react、get-language
2. presentation/components: error-button
3. presentation/utils: cn

### 推奨
- カスタムフック
- Zustandストア
- UIコンポーネント

