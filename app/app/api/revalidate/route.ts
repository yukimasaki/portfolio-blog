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

  const authorizationHeader = request.headers.get("authorization");

  console.log("Authorization header:", authorizationHeader);

  // 認証: Bearer トークンの検証
  if (authorizationHeader !== `Bearer ${serverEnv.REVALIDATE_SECRET_KEY}`) {
    console.error(`Invalid token: ${authorizationHeader}`);
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
    correctTags.forEach(tag => {
      revalidateTag(tag, "");
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
