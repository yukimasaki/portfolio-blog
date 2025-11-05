import * as E from "fp-ts/Either";
import { tryCatch } from "fp-ts/TaskEither";

// WordPress API へのフェッチのデフォルトタイムアウト (ms)
const DEFAULT_WORDPRESS_FETCH_TIMEOUT_MS = 15000;

/**
 * HTTPレスポンス型
 */
export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * HTTPエラー型
 */
export interface HttpError {
  message: string;
  status: number;
  data?: unknown;
}

/**
 * Next.jsのキャッシュタグオプション
 */
export interface NextCacheOptions {
  tags?: string[];
  revalidate?: number | false;
}

/**
 * HTTPクライアント関数
 * fetchのラッパーとして実装し、Either型でエラーハンドリングを行う
 */
export const httpClient = {
  /**
   * GETリクエストを送信
   * @param url - リクエストURL
   * @param options - fetchオプション（Next.jsのキャッシュタグを含む）
   * @returns Either<HttpError, HttpResponse<T>>
   */
  get: async <T>(
    url: string,
    options?: RequestInit & { timeoutMs?: number; next?: NextCacheOptions }
  ): Promise<E.Either<HttpError, HttpResponse<T>>> => {
    return await tryCatch(
      async () => {
        const controller = new AbortController();
        const timeoutMs =
          options?.timeoutMs ?? DEFAULT_WORDPRESS_FETCH_TIMEOUT_MS;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        // Next.jsのキャッシュオプションを抽出
        const { next, timeoutMs: _, ...fetchOptions } = options || {};

        const response = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          ...(next ? { next } : {}),
          ...fetchOptions,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          data,
          status: response.status,
          headers: response.headers,
        };
      },
      error => ({
        message:
          error instanceof Error
            ? error.name === "AbortError"
              ? `Request timed out: ${url}`
              : error.message
            : "Unknown error",
        status: 500,
      })
    )();
  },

  /**
   * POSTリクエストを送信
   * @param url - リクエストURL
   * @param body - リクエストボディ
   * @param options - fetchオプション
   * @returns Either<HttpError, HttpResponse<T>>
   */
  post: async <T>(
    url: string,
    body: unknown,
    options?: RequestInit & { timeoutMs?: number }
  ): Promise<E.Either<HttpError, HttpResponse<T>>> => {
    return await tryCatch(
      async () => {
        const controller = new AbortController();
        const timeoutMs =
          options?.timeoutMs ?? DEFAULT_WORDPRESS_FETCH_TIMEOUT_MS;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          ...options,
          method: "POST",
          headers: { "Content-Type": "application/json", ...options?.headers },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          data,
          status: response.status,
          headers: response.headers,
        };
      },
      error => ({
        message:
          error instanceof Error
            ? error.name === "AbortError"
              ? `Request timed out: ${url}`
              : error.message
            : "Unknown error",
        status: 500,
      })
    )();
  },
};
