import { z } from "zod";

// 共通: 文字列（空は不可）
const nonEmptyString = z.string().min(1);

// サーバー専用環境変数
const ServerEnvSchema = z.object({
  WORDPRESS_URL: nonEmptyString,
  DEBUG_WORDPRESS_API: z.enum(["0", "1"]).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

// クライアントへ公開される環境変数（NEXT_PUBLIC_*）
const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: nonEmptyString,
  NEXT_PUBLIC_SITE_NAME: nonEmptyString,
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type PublicEnv = z.infer<typeof PublicEnvSchema>;

export interface AppEnv extends ServerEnv, PublicEnv {}

/**
 * 環境変数の検証。欠落時はZodErrorをthrow。
 */
export function validateEnv(): AppEnv {
  const server = ServerEnvSchema.parse(process.env);
  const pub = PublicEnvSchema.parse(process.env);
  return { ...server, ...pub } as AppEnv;
}

/**
 * アプリ内で使用する型付きenv。利用側はこのモジュールから参照する。
 * 直接 process.env にアクセスしないこと。
 */
const __parsed = ((): { server: ServerEnv; pub: PublicEnv } => {
  const server = ServerEnvSchema.parse(process.env);
  const pub = PublicEnvSchema.parse(process.env);
  return { server, pub };
})();

export const serverEnv: ServerEnv = __parsed.server;
export const publicEnv: PublicEnv = __parsed.pub;
export const env: AppEnv = { ...__parsed.server, ...__parsed.pub };
