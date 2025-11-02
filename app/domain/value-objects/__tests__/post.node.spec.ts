import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import {
  createPostId,
  createPostTitle,
  createPostSlug,
  createPostExcerpt,
  createPostDate,
} from "../post";

const isRight = E.isRight;
const isLeft = E.isLeft;

describe("value-objects/post", () => {
  describe("createPostId", () => {
    it("正の整数は成功する", () => {
      const result = createPostId(42);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "PostId", value: 42 });
      }
    });

    it("1は成功する", () => {
      const result = createPostId(1);
      expect(isRight(result)).toBe(true);
    });

    it("0は失敗する", () => {
      const result = createPostId(0);
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left).toBe("無効なPostId: 正の整数である必要があります");
      }
    });

    it("負の数は失敗する", () => {
      const result = createPostId(-1);
      expect(isLeft(result)).toBe(true);
    });

    it("小数は失敗する", () => {
      const result = createPostId(3.14);
      expect(isLeft(result)).toBe(true);
    });

    it("文字列は失敗する", () => {
      const result = createPostId("42");
      expect(isLeft(result)).toBe(true);
    });

    it("nullは失敗する", () => {
      const result = createPostId(null);
      expect(isLeft(result)).toBe(true);
    });

    it("undefinedは失敗する", () => {
      const result = createPostId(undefined);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe("createPostTitle", () => {
    it("1文字のタイトルは成功する", () => {
      const result = createPostTitle("A");
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "PostTitle", value: "A" });
      }
    });

    it("200文字のタイトルは成功する", () => {
      const title = "A".repeat(200);
      const result = createPostTitle(title);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "PostTitle", value: title });
      }
    });

    it("201文字のタイトルは失敗する", () => {
      const title = "A".repeat(201);
      const result = createPostTitle(title);
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left).toBe("無効なPostTitle: 1-200文字である必要があります");
      }
    });

    it("空文字列は失敗する", () => {
      const result = createPostTitle("");
      expect(isLeft(result)).toBe(true);
    });

    it("数値は失敗する", () => {
      const result = createPostTitle(42);
      expect(isLeft(result)).toBe(true);
    });

    it("nullは失敗する", () => {
      const result = createPostTitle(null);
      expect(isLeft(result)).toBe(true);
    });

    it("undefinedは失敗する", () => {
      const result = createPostTitle(undefined);
      expect(isLeft(result)).toBe(true);
    });

    it("普通のタイトルは成功する", () => {
      const result = createPostTitle("これはテストタイトルです");
      expect(isRight(result)).toBe(true);
    });
  });

  describe("createPostSlug", () => {
    it("小文字英数字とハイフンのみのスラッグは成功する", () => {
      const result = createPostSlug("test-post-123");
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "PostSlug", value: "test-post-123" });
      }
    });

    it("小文字のみのスラッグは成功する", () => {
      const result = createPostSlug("testpost");
      expect(isRight(result)).toBe(true);
    });

    it("数字のみのスラッグは成功する", () => {
      const result = createPostSlug("123");
      expect(isRight(result)).toBe(true);
    });

    it("大文字を含むスラッグは失敗する", () => {
      const result = createPostSlug("Test-Post");
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left).toBe(
          "無効なPostSlug: 1-100文字で、小文字英数字とハイフンのみ使用可能です"
        );
      }
    });

    it("空白を含むスラッグは失敗する", () => {
      const result = createPostSlug("test post");
      expect(isLeft(result)).toBe(true);
    });

    it("日本語を含むスラッグは失敗する", () => {
      const result = createPostSlug("テスト投稿");
      expect(isLeft(result)).toBe(true);
    });

    it("アンダースコアを含むスラッグは失敗する", () => {
      const result = createPostSlug("test_post");
      expect(isLeft(result)).toBe(true);
    });

    it("100文字のスラッグは成功する", () => {
      const slug = "a".repeat(100);
      const result = createPostSlug(slug);
      expect(isRight(result)).toBe(true);
    });

    it("101文字のスラッグは失敗する", () => {
      const slug = "a".repeat(101);
      const result = createPostSlug(slug);
      expect(isLeft(result)).toBe(true);
    });

    it("空文字列は失敗する", () => {
      const result = createPostSlug("");
      expect(isLeft(result)).toBe(true);
    });

    it("数値は失敗する", () => {
      const result = createPostSlug(42);
      expect(isLeft(result)).toBe(true);
    });

    it("nullは失敗する", () => {
      const result = createPostSlug(null);
      expect(isLeft(result)).toBe(true);
    });

    it("undefinedは失敗する", () => {
      const result = createPostSlug(undefined);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe("createPostExcerpt", () => {
    it("空文字列は成功する", () => {
      const result = createPostExcerpt("");
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "PostExcerpt", value: "" });
      }
    });

    it("500文字の要約は成功する", () => {
      const excerpt = "A".repeat(500);
      const result = createPostExcerpt(excerpt);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "PostExcerpt", value: excerpt });
      }
    });

    it("501文字の要約は失敗する", () => {
      const excerpt = "A".repeat(501);
      const result = createPostExcerpt(excerpt);
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left).toBe("無効なPostExcerpt: 0-500文字である必要があります");
      }
    });

    it("数値は失敗する", () => {
      const result = createPostExcerpt(42);
      expect(isLeft(result)).toBe(true);
    });

    it("nullは失敗する", () => {
      const result = createPostExcerpt(null);
      expect(isLeft(result)).toBe(true);
    });

    it("undefinedは失敗する", () => {
      const result = createPostExcerpt(undefined);
      expect(isLeft(result)).toBe(true);
    });

    it("普通の要約は成功する", () => {
      const result = createPostExcerpt("これはテスト要約です");
      expect(isRight(result)).toBe(true);
    });
  });

  describe("createPostDate", () => {
    it("有効なDateオブジェクトは成功する", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const result = createPostDate(date);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "PostDate", value: date });
      }
    });

    it("有効な日付文字列は成功する", () => {
      const dateStr = "2024-01-01T00:00:00Z";
      const result = createPostDate(dateStr);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.value).toEqual(new Date(dateStr));
      }
    });

    it("ISO 8601形式の文字列は成功する", () => {
      const result = createPostDate("2024-01-01");
      expect(isRight(result)).toBe(true);
    });

    it("無効なDateオブジェクトは失敗する", () => {
      const date = new Date("invalid");
      const result = createPostDate(date);
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left).toBe("無効なPostDate: 有効な日付である必要があります");
      }
    });

    it("無効な日付文字列は失敗する", () => {
      const result = createPostDate("invalid date");
      expect(isLeft(result)).toBe(true);
    });

    it("数値は失敗する", () => {
      const result = createPostDate(42);
      expect(isLeft(result)).toBe(true);
    });

    it("nullは失敗する", () => {
      const result = createPostDate(null);
      expect(isLeft(result)).toBe(true);
    });

    it("undefinedは失敗する", () => {
      const result = createPostDate(undefined);
      expect(isLeft(result)).toBe(true);
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const result1 = createPostDate(date);
      const result2 = createPostDate(date);
      expect(isRight(result1)).toBe(true);
      expect(isRight(result2)).toBe(true);
      if (isRight(result1) && isRight(result2)) {
        expect(result1.right.value.getTime()).toBe(result2.right.value.getTime());
      }
    });
  });
});
