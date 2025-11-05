import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { httpClient, type HttpError } from "@/infrastructure/http/client";
import { joinUrl } from "@/infrastructure/utils/url";
import type {
  WordPressPost,
  WordPressTag,
} from "@/infrastructure/external/types";
import { debugWordPressApi } from "@/infrastructure/utils/debug";

/**
 * WordPress APIエラー型
 */
export interface WordPressApiError {
  readonly message: string;
  readonly status: number;
}

/**
 * 記事一覧を取得する関数
 *
 * @param baseUrl - WordPressのベースURL
 * @param page - ページ番号
 * @param perPage - 1ページあたりの記事数
 * @returns WordPress記事の配列
 */
export const getWordPressPosts = async (
  baseUrl: string,
  page: number = 1,
  perPage: number = 10
): Promise<E.Either<WordPressApiError, WordPressPost[]>> => {
  const url = joinUrl(
    baseUrl,
    `/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}&_embed=true`
  );

  const result = pipe(
    await httpClient.get<WordPressPost[]>(url, {
      next: { tags: ["posts"] },
    }),
    E.map(response => response.data),
    E.mapLeft(
      (httpError: HttpError): WordPressApiError => ({
        message: httpError.message,
        status: httpError.status,
      })
    )
  );

  // デバッグ出力
  if (E.isRight(result)) {
    debugWordPressApi(
      `getWordPressPosts (page: ${page}, perPage: ${perPage})`,
      {
        url,
        count: result.right.length,
        posts: result.right,
      }
    );
  } else {
    debugWordPressApi(
      `getWordPressPosts (page: ${page}, perPage: ${perPage}) - ERROR`,
      {
        url,
        error: result.left,
      }
    );
  }

  return result;
};

/**
 * タグIDで記事一覧を取得する関数
 *
 * @param baseUrl - WordPressのベースURL
 * @param tagId - タグID（数値）
 * @param page - ページ番号
 * @param perPage - 1ページあたりの記事数
 */
export const getWordPressPostsByTagId = async (
  baseUrl: string,
  tagId: number,
  page: number = 1,
  perPage: number = 10
): Promise<E.Either<WordPressApiError, WordPressPost[]>> => {
  const url = joinUrl(
    baseUrl,
    `/wp-json/wp/v2/posts?tags=${encodeURIComponent(
      String(tagId)
    )}&page=${page}&per_page=${perPage}&_embed=true`
  );

  const result = pipe(
    await httpClient.get<WordPressPost[]>(url, {
      next: { tags: ["posts", "tags"] },
    }),
    E.map(response => response.data),
    E.mapLeft(
      (httpError: HttpError): WordPressApiError => ({
        message: httpError.message,
        status: httpError.status,
      })
    )
  );

  // デバッグ出力
  if (E.isRight(result)) {
    debugWordPressApi(`getWordPressPostsByTagId (tagId: ${tagId})`, {
      url,
      count: result.right.length,
    });
  } else {
    debugWordPressApi(`getWordPressPostsByTagId (tagId: ${tagId}) - ERROR`, {
      url,
      error: result.left,
    });
  }

  return result;
};

/**
 * スラッグで記事を取得する関数
 *
 * @param baseUrl - WordPressのベースURL
 * @param slug - 記事のスラッグ
 * @returns WordPress記事
 */
export const getWordPressPostBySlug = async (
  baseUrl: string,
  slug: string
): Promise<E.Either<WordPressApiError, WordPressPost>> => {
  const url = joinUrl(baseUrl, `/wp-json/wp/v2/posts?slug=${slug}&_embed=true`);

  const result = pipe(
    await httpClient.get<WordPressPost[]>(url, {
      next: { tags: ["posts"] },
    }),
    E.map(response => response.data),
    E.chain(posts => {
      if (posts.length === 0) {
        return E.left<WordPressApiError, WordPressPost>({
          message: "Post not found",
          status: 404,
        });
      }
      return E.right(posts[0]);
    }),
    E.mapLeft(
      (httpError: HttpError): WordPressApiError => ({
        message: httpError.message,
        status: httpError.status,
      })
    )
  );

  // デバッグ出力
  if (E.isRight(result)) {
    debugWordPressApi(`getWordPressPostBySlug (slug: ${slug})`, {
      url,
      post: result.right,
    });
  } else {
    debugWordPressApi(`getWordPressPostBySlug (slug: ${slug}) - ERROR`, {
      url,
      error: result.left,
    });
  }

  return result;
};

/**
 * タグ一覧を取得する関数
 *
 * @param baseUrl - WordPressのベースURL
 * @param perPage - 1ページあたりのタグ数
 * @returns WordPressタグの配列
 */
export const getWordPressTags = async (
  baseUrl: string,
  perPage: number = 100
): Promise<E.Either<WordPressApiError, WordPressTag[]>> => {
  const url = joinUrl(
    baseUrl,
    `/wp-json/wp/v2/tags?per_page=${perPage}&_embed=true`
  );

  return pipe(
    await httpClient.get<WordPressTag[]>(url, {
      next: { tags: ["tags"] },
    }),
    E.map(response => response.data),
    E.mapLeft(
      (httpError: HttpError): WordPressApiError => ({
        message: httpError.message,
        status: httpError.status,
      })
    )
  );
};

/**
 * スラッグでタグを取得する関数
 *
 * @param baseUrl - WordPressのベースURL
 * @param slug - タグのスラッグ
 * @returns WordPressタグ
 */
export const getWordPressTagBySlug = async (
  baseUrl: string,
  slug: string
): Promise<E.Either<WordPressApiError, WordPressTag>> => {
  // WordPress REST APIはスラッグパラメータを自動的にデコードして検索するため、
  // エンコードされた形式と日本語のままの形式の両方を試す
  // まず、エンコードされた形式で試す（WordPress側のスラッグがパーセントエンコード済みの場合）
  const encodedSlug = encodeURIComponent(slug);
  const encodedUrl = joinUrl(
    baseUrl,
    `/wp-json/wp/v2/tags?slug=${encodedSlug}`
  );

  // エンコードされた形式で試す
  const encodedResult = await pipe(
    await httpClient.get<WordPressTag[]>(encodedUrl, {
      next: { tags: ["tags"] },
    }),
    E.map(response => response.data),
    E.mapLeft(
      (httpError: HttpError): WordPressApiError => ({
        message: httpError.message,
        status: httpError.status,
      })
    )
  );

  // エンコードされた形式で見つかった場合
  if (E.isRight(encodedResult)) {
    const tags = encodedResult.right;
    if (tags.length > 0) {
      return E.right(tags[0]);
    }
  }

  // エンコードされた形式で見つからなかった場合、日本語のままの形式で試す
  const rawUrl = joinUrl(baseUrl, `/wp-json/wp/v2/tags?slug=${slug}`);

  return pipe(
    await httpClient.get<WordPressTag[]>(rawUrl, {
      next: { tags: ["tags"] },
    }),
    E.map(response => response.data),
    E.chain(tags => {
      if (tags.length === 0) {
        return E.left<WordPressApiError, WordPressTag>({
          message: "Tag not found",
          status: 404,
        });
      }
      return E.right(tags[0]);
    }),
    E.mapLeft(
      (httpError: HttpError): WordPressApiError => ({
        message: httpError.message,
        status: httpError.status,
      })
    )
  );
};
