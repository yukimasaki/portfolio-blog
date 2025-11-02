/* eslint-disable @typescript-eslint/no-require-imports */
// 環境変数の事前検証スクリプト（dev/build/type-check前に実行）
// - .env.* を読み込むため dotenv を使用
// - zodスキーマはアプリの config/env.ts と同等の要件でバリデーション

const dotenv = require("dotenv");
const { z } = require("zod");
const path = require("path");

// dotenvのロード（.env.local を最優先、次に .env）
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const nonEmptyString = z.string().min(1);

const ServerEnvSchema = z.object({
  WORDPRESS_URL: nonEmptyString,
  DEBUG_WORDPRESS_API: z.enum(["0", "1"]).optional(),
});

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: nonEmptyString,
  NEXT_PUBLIC_SITE_NAME: nonEmptyString,
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

try {
  const server = ServerEnvSchema.parse(process.env);
  const pub = PublicEnvSchema.parse(process.env);
  // 追加のヒント出力
  console.log("[env] OK: 必須の環境変数が設定されています.");
  console.log("[env", { server, pub });
  process.exit(0);
} catch (e) {
  if (e && e.issues) {
    console.error("[env] NG: 必須の環境変数が不足しています.");
    for (const issue of e.issues) {
      console.error(` - ${issue.path.join(".")}: ${issue.message}`);
    }
  } else {
    console.error(
      "[env] Unexpected error:",
      e instanceof Error ? e.message : String(e)
    );
  }
  process.exit(1);
}
