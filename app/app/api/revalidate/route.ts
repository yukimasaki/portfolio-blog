import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
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
 * 公式ドキュメント: https://github.com/Dexerto/on-demand-revalidation
 */
export async function PUT(request: NextRequest) {
  const { paths, tags }: { paths?: string[]; tags?: string[] } =
    await request.json();

  console.log("Received paths:", paths);
  console.log("Received tags:", tags);

  const headersList = await headers();
  const authorizationHeader = headersList.get("authorization");

  console.log("Authorization header:", authorizationHeader);

  if (authorizationHeader !== `Bearer ${serverEnv.REVALIDATE_SECRET}`) {
    console.error(`Invalid token: ${authorizationHeader}`);
    return new Response(`Invalid token`, {
      status: STATUS_CODES.UNAUTHORIZED,
    });
  }

  if (!paths && !tags) {
    console.error(`Precondition Failed: Missing paths and tags`);
    return new Response(`Precondition Failed: Missing paths and tags`, {
      status: STATUS_CODES.PRECONDITION_FAILED,
    });
  }

  let revalidatePaths: string[] = [];
  let correctTags: string[] = [];

  if (paths) {
    revalidatePaths = paths.filter(path => path.startsWith("/"));

    console.log("Filtered correct paths:", revalidatePaths);
  }

  if (tags) {
    correctTags = tags.filter(tag => typeof tag === "string");
    console.log("Filtered correct tags:", correctTags);
  }

  try {
    // 指定されたパスを無効化（新規追加・更新・削除時の反映に必要）
    revalidatePaths.forEach(path => {
      revalidatePath(path, "page");
      console.log(`Revalidated path: ${path}`);
    });

    // 指定されたタグを無効化
    correctTags.forEach(tag => {
      revalidateTag(tag, "");
      console.log(`Revalidated tag: ${tag}`);
    });

    // ブログ関連のページを常に無効化
    // 新規追加・更新・削除時に確実に反映させるため
    // プラグインから送られてくる paths に含まれていなくても、
    // ブログ一覧やトップページに影響がある可能性があるため
    const alwaysRevalidatePaths = ["/blog", "/"];

    // プラグインから送られてくる paths に含まれていない場合のみ追加
    alwaysRevalidatePaths.forEach(path => {
      if (!revalidatePaths.includes(path)) {
        revalidatePath(path, "page");
        console.log(`Revalidated always path: ${path}`);
      }
    });

    // ブログ関連のタグを常に無効化
    // 新規追加・更新・削除時に確実に反映させるため
    const alwaysRevalidateTags = ["posts", "search-index"];

    // プラグインから送られてくる tags に含まれていない場合のみ追加
    alwaysRevalidateTags.forEach(tag => {
      if (!correctTags.includes(tag)) {
        revalidateTag(tag, "");
        console.log(`Revalidated always tag: ${tag}`);
      }
    });

    // パスに /blog/ が含まれている場合、/blog/[slug] も明示的に無効化
    // これは新規追加・更新・削除された記事の個別ページを確実に無効化するため
    const blogSlugPaths = revalidatePaths.filter(
      path => path.startsWith("/blog/") && path !== "/blog"
    );

    if (blogSlugPaths.length > 0) {
      // 各ブログ記事ページを無効化
      // これにより、generateStaticParamsに含まれていない新規記事も動的に生成される
      blogSlugPaths.forEach(path => {
        revalidatePath(path, "page");
        console.log(`Revalidated blog slug path: ${path}`);
      });
    }

    const allRevalidatedPaths = [
      ...revalidatePaths,
      ...alwaysRevalidatePaths.filter(path => !revalidatePaths.includes(path)),
    ];
    const allRevalidatedTags = [
      ...correctTags,
      ...alwaysRevalidateTags.filter(tag => !correctTags.includes(tag)),
    ];

    console.log(
      `${new Date().toJSON()} - Paths and tags revalidated: ${allRevalidatedPaths.join(
        ", "
      )} and ${allRevalidatedTags.join(", ")}`
    );

    return new Response(
      JSON.stringify({
        revalidated: true,
        message: `Paths and tags revalidated: ${allRevalidatedPaths.join(
          ", "
        )} and ${allRevalidatedTags.join(", ")}`,
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
