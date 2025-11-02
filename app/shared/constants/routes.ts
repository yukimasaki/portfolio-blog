/**
 * アプリケーション全体のページルート定数
 * 型安全なルート定義と、リンク生成ヘルパー関数を提供
 */

/**
 * ブログページルート
 */
export const BLOG_ROUTES = {
  INDEX: "/blog",
  POST: (slug: string) => `/blog/${slug}`,
  SEARCH: (query?: string) =>
    query ? `/blog/search?q=${query}` : "/blog/search",
  TAG: (slug: string) => `/tags/${slug}`,
} as const;

/**
 * タグページルート
 */
export const TAG_ROUTES = {
  INDEX: "/tags",
  DETAIL: (slug: string) => `/tags/${slug}`,
} as const;

/**
 * 共通ページルート
 */
export const COMMON_ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  NOT_FOUND: "/404",
} as const;

/**
 * APIルート
 */
export const API_ROUTES = {
  WEBHOOK: "/api/webhook",
  SITEMAP: "/sitemap.xml",
  ROBOTS: "/robots.txt",
} as const;
