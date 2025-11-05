import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { serverEnv } from "@/config/env";

/**
 * Constants for HTTP Status codes.
 */
const STATUS_CODES = {
  UNAUTHORIZED: 401,
  PRECONDITION_FAILED: 412,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * WordPress On-Demand RevalidationプラグインからのWebhookを受信
 * 記事の追加・更新・削除時にNext.jsのキャッシュを無効化
 *
 * リクエスト形式:
 * - Method: PUT
 * - Headers: Authorization: Bearer ${REVALIDATE_SECRET_KEY}
 * - Body: { paths?: string[], tags?: string[] }
 *
 * ブログ記事更新時の推奨パス:
 * - paths: ['/blog', '/blog/[slug]', '/', '/tags']
 * - tags: ['posts']
 *
 * タグ更新時の推奨パス:
 * - paths: ['/tags', '/tags/[slug]', '/blog']
 * - tags: ['tags']
 */
export async function PUT(request: NextRequest) {
  const { paths, tags }: { paths?: string[]; tags?: string[] } =
    await request.json();

  console.log("Received paths:", paths);
  console.log("Received tags:", tags);

  // Authorizationヘッダーを取得（大文字小文字を考慮）
  const authorizationHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  console.log("Authorization header received:", authorizationHeader);
  console.log("Expected token:", serverEnv.REVALIDATE_SECRET_KEY);
  console.log(
    "Expected full header:",
    `Bearer ${serverEnv.REVALIDATE_SECRET_KEY}`
  );

  // 環境変数が設定されているか確認
  if (!serverEnv.REVALIDATE_SECRET_KEY) {
    console.error("REVALIDATE_SECRET_KEY is not set in environment variables");
    return new Response(`Server configuration error`, {
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  // 認証: Bearer トークンの検証
  const expectedHeader = `Bearer ${serverEnv.REVALIDATE_SECRET_KEY}`;
  if (authorizationHeader !== expectedHeader) {
    console.error(`Token mismatch:`);
    console.error(`  Received: "${authorizationHeader}"`);
    console.error(`  Expected: "${expectedHeader}"`);
    console.error(`  Length received: ${authorizationHeader?.length ?? 0}`);
    console.error(`  Length expected: ${expectedHeader.length}`);
    return new Response(`Invalid token`, {
      status: STATUS_CODES.UNAUTHORIZED,
    });
  }

  // paths と tags のどちらかは必須
  if (!paths && !tags) {
    console.error(`Precondition Failed: Missing paths and tags`);
    return new Response(`Precondition Failed: Missing paths and tags`, {
      status: STATUS_CODES.PRECONDITION_FAILED,
    });
  }

  // パスの検証とフィルタリング
  let revalidatePaths: string[] = [];
  let correctTags: string[] = [];

  if (paths) {
    // パスは '/' で始まる必要がある
    revalidatePaths = paths.filter(path => path.startsWith("/"));
    console.log("Filtered correct paths:", revalidatePaths);
  }

  if (tags) {
    // タグは文字列である必要がある
    correctTags = tags.filter(tag => typeof tag === "string");
    console.log("Filtered correct tags:", correctTags);
  }

  try {
    // パスの無効化
    revalidatePaths.forEach(path => {
      revalidatePath(path, "page");
    });

    // タグの無効化
    // Webhookからのリクエストのため、即座に無効化する必要がある
    correctTags.forEach(tag => {
      revalidateTag(tag, { expire: 0 });
    });

    console.log(
      `${new Date().toJSON()} - Paths and tags revalidated: ${revalidatePaths.join(
        ", "
      )} and ${correctTags.join(", ")}`
    );

    return new Response(
      JSON.stringify({
        revalidated: true,
        message: `Paths and tags revalidated: ${revalidatePaths.join(
          ", "
        )} and ${correctTags.join(", ")}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: unknown) {
    let message: string;
    if (err instanceof Error) {
      message = err.message;
    } else {
      message = "An error occurred";
    }

    console.error("Revalidation error:", message);
    return new Response(message, {
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
