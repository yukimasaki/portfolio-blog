import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import {
  WordPressPostSchema,
  type WordPressPost,
} from "@/application/blog/schemas";
import type { ValidationError } from "@/application/common/errors";

/**
 * WordPress APIレスポンスをバリデーションする関数
 *
 * @param data - バリデーション対象のデータ
 * @returns Either<ValidationError, WordPressPost>
 */
export const validateWordPressPost = (
  data: unknown
): E.Either<ValidationError, WordPressPost> => {
  const result = WordPressPostSchema.safeParse(data);

  if (result.success) {
    return E.right(result.data);
  }

  return E.left({
    _tag: "ValidationError",
    field: "post",
    message: result.error.message,
  });
};

/**
 * WordPress APIレスポンスの配列をバリデーションする関数
 *
 * @param data - バリデーション対象のデータ配列
 * @returns Either<ValidationError, WordPressPost[]>
 */
export const validateWordPressPosts = (
  data: unknown
): E.Either<ValidationError, WordPressPost[]> => {
  if (!Array.isArray(data)) {
    return E.left({
      _tag: "ValidationError",
      field: "posts",
      message: "Posts must be an array",
    });
  }

  const schema = WordPressPostSchema.array();
  const result = schema.safeParse(data);

  if (result.success) {
    return E.right(result.data);
  }

  return E.left({
    _tag: "ValidationError",
    field: "posts",
    message: result.error.issues.map(issue => issue.message).join(", "),
  });
};

/**
 * WordPress APIレスポンスに必須フィールドが含まれているかチェックする関数
 *
 * @param data - チェック対象のデータ
 * @param requiredFields - 必須フィールドの配列
 * @returns Either<ValidationError, WordPressPost>
 */
export const validateWordPressPostFields = (
  data: WordPressPost,
  requiredFields: (keyof WordPressPost)[]
): E.Either<ValidationError, WordPressPost> => {
  const missingFields = requiredFields.filter(field => !(field in data));

  return pipe(
    missingFields.length === 0,
    E.fromPredicate(
      isValid => isValid,
      (): ValidationError => ({
        _tag: "ValidationError",
        field: "post",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      })
    ),
    E.map(() => data)
  );
};
