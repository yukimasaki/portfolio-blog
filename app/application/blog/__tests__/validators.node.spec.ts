import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import {
  validateWordPressPost,
  validateWordPressPosts,
  validateWordPressPostFields,
} from "../validators";
import type { WordPressPost } from "../schemas";

const isRight = E.isRight;
const isLeft = E.isLeft;

describe("blog/validators", () => {
  describe("validateWordPressPost", () => {
    const createValidPost = (): WordPressPost => ({
      id: 1,
      slug: "test-post",
      title: { rendered: "テスト記事" },
      content: { rendered: "<p>本文</p>" },
      excerpt: { rendered: "要約" },
      date: "2024-01-01T00:00:00",
      modified: "2024-01-01T00:00:00",
      featured_media: 1,
      tags: [1, 2],
    });

    it("有効なWordPressPostは正常にバリデーションされる", () => {
      const validPost = createValidPost();
      const result = validateWordPressPost(validPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual(validPost);
      }
    });

    it("optionalフィールドがない場合でもバリデーション成功する", () => {
      const minimalPost: WordPressPost = {
        id: 1,
        slug: "test-post",
        title: { rendered: "テスト記事" },
        content: { rendered: "<p>本文</p>" },
        excerpt: { rendered: "要約" },
        date: "2024-01-01T00:00:00",
        modified: "2024-01-01T00:00:00",
      };
      const result = validateWordPressPost(minimalPost);

      expect(isRight(result)).toBe(true);
    });

    it("idがnumberでない場合はバリデーション失敗する", () => {
      const invalidPost = {
        ...createValidPost(),
        id: "1",
      };
      const result = validateWordPressPost(invalidPost);

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left._tag).toBe("ValidationError");
        expect(result.left.field).toBe("post");
      }
    });

    it("slugがstringでない場合はバリデーション失敗する", () => {
      const invalidPost = {
        ...createValidPost(),
        slug: 123,
      };
      const result = validateWordPressPost(invalidPost);

      expect(isLeft(result)).toBe(true);
    });

    it("title.renderedがstringでない場合はバリデーション失敗する", () => {
      const invalidPost = {
        ...createValidPost(),
        title: { rendered: 123 },
      };
      const result = validateWordPressPost(invalidPost);

      expect(isLeft(result)).toBe(true);
    });

    it("dateがstringでない場合はバリデーション失敗する", () => {
      const invalidPost = {
        ...createValidPost(),
        date: new Date(),
      };
      const result = validateWordPressPost(invalidPost);

      expect(isLeft(result)).toBe(true);
    });

    it("requiredフィールドが欠損している場合はバリデーション失敗する", () => {
      const invalidPost = {
        id: 1,
        slug: "test-post",
        // title欠損
        content: { rendered: "<p>本文</p>" },
        excerpt: { rendered: "要約" },
        date: "2024-01-01T00:00:00",
        modified: "2024-01-01T00:00:00",
      };
      const result = validateWordPressPost(invalidPost);

      expect(isLeft(result)).toBe(true);
    });

    it("nullはバリデーション失敗する", () => {
      const result = validateWordPressPost(null);

      expect(isLeft(result)).toBe(true);
    });

    it("undefinedはバリデーション失敗する", () => {
      const result = validateWordPressPost(undefined);

      expect(isLeft(result)).toBe(true);
    });

    it("空オブジェクトはバリデーション失敗する", () => {
      const result = validateWordPressPost({});

      expect(isLeft(result)).toBe(true);
    });
  });

  describe("validateWordPressPosts", () => {
    const createValidPosts = (): WordPressPost[] => [
      {
        id: 1,
        slug: "test-post-1",
        title: { rendered: "テスト記事1" },
        content: { rendered: "<p>本文1</p>" },
        excerpt: { rendered: "要約1" },
        date: "2024-01-01T00:00:00",
        modified: "2024-01-01T00:00:00",
      },
      {
        id: 2,
        slug: "test-post-2",
        title: { rendered: "テスト記事2" },
        content: { rendered: "<p>本文2</p>" },
        excerpt: { rendered: "要約2" },
        date: "2024-01-01T00:00:00",
        modified: "2024-01-01T00:00:00",
      },
    ];

    it("有効なWordPressPost配列は正常にバリデーションされる", () => {
      const validPosts = createValidPosts();
      const result = validateWordPressPosts(validPosts);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toHaveLength(2);
        expect(result.right[0].slug).toBe("test-post-1");
        expect(result.right[1].slug).toBe("test-post-2");
      }
    });

    it("空の配列は正常にバリデーションされる", () => {
      const result = validateWordPressPosts([]);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toHaveLength(0);
      }
    });

    it("1件のみの配列は正常にバリデーションされる", () => {
      const posts: WordPressPost[] = [createValidPosts()[0]];
      const result = validateWordPressPosts(posts);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toHaveLength(1);
      }
    });

    it("配列でない場合はバリデーション失敗する", () => {
      const result = validateWordPressPosts({});

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.field).toBe("posts");
        expect(result.left.message).toBe("Posts must be an array");
      }
    });

    it("文字列は配列でないためバリデーション失敗する", () => {
      const result = validateWordPressPosts("string");

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toBe("Posts must be an array");
      }
    });

    it("数値は配列でないためバリデーション失敗する", () => {
      const result = validateWordPressPosts(123);

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toBe("Posts must be an array");
      }
    });

    it("nullは配列でないためバリデーション失敗する", () => {
      const result = validateWordPressPosts(null);

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toBe("Posts must be an array");
      }
    });

    it("undefinedは配列でないためバリデーション失敗する", () => {
      const result = validateWordPressPosts(undefined);

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toBe("Posts must be an array");
      }
    });

    it("無効な要素が1件でも含まれていればバリデーション失敗する", () => {
      const invalidPosts = [
        createValidPosts()[0],
        {
          id: "invalid",
          slug: "test",
          title: { rendered: "test" },
          content: { rendered: "test" },
          excerpt: { rendered: "test" },
          date: "2024-01-01T00:00:00",
          modified: "2024-01-01T00:00:00",
        },
      ];
      const result = validateWordPressPosts(invalidPosts);

      expect(isLeft(result)).toBe(true);
    });

    it("全て無効な要素の配列はバリデーション失敗する", () => {
      const invalidPosts = [{ id: "invalid1" }, { id: "invalid2" }];
      const result = validateWordPressPosts(invalidPosts);

      expect(isLeft(result)).toBe(true);
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", () => {
      const validPosts = createValidPosts();
      const result1 = validateWordPressPosts(validPosts);
      const result2 = validateWordPressPosts(validPosts);

      expect(isRight(result1)).toBe(true);
      expect(isRight(result2)).toBe(true);
      if (isRight(result1) && isRight(result2)) {
        expect(result1.right).toHaveLength(result2.right.length);
        for (let i = 0; i < result1.right.length; i++) {
          expect(result1.right[i].slug).toBe(result2.right[i].slug);
        }
      }
    });
  });

  describe("validateWordPressPostFields", () => {
    const createValidPost = (): WordPressPost => ({
      id: 1,
      slug: "test-post",
      title: { rendered: "テスト記事" },
      content: { rendered: "<p>本文</p>" },
      excerpt: { rendered: "要約" },
      date: "2024-01-01T00:00:00",
      modified: "2024-01-01T00:00:00",
      featured_media: 1,
      tags: [1, 2],
    });

    it("必須フィールドが全て存在する場合は成功する", () => {
      const validPost = createValidPost();
      const requiredFields: (keyof WordPressPost)[] = ["id", "slug", "title"];
      const result = validateWordPressPostFields(validPost, requiredFields);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual(validPost);
      }
    });

    it("必須フィールドが空配列の場合は成功する", () => {
      const validPost = createValidPost();
      const requiredFields: (keyof WordPressPost)[] = [];
      const result = validateWordPressPostFields(validPost, requiredFields);

      expect(isRight(result)).toBe(true);
    });

    it("必須フィールドが1件欠損している場合は失敗する", () => {
      const validPost = createValidPost();
      const requiredFields: (keyof WordPressPost)[] = [
        "id",
        "slug",
        "_embedded",
      ];
      const result = validateWordPressPostFields(validPost, requiredFields);

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.field).toBe("post");
        expect(result.left.message).toContain("Missing required fields");
        expect(result.left.message).toContain("_embedded");
      }
    });

    it("必須フィールドが複数欠損している場合は失敗する", () => {
      const validPost = createValidPost();
      const requiredFields: (keyof WordPressPost)[] = ["tags", "_embedded"];
      const result = validateWordPressPostFields(validPost, requiredFields);

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toContain("Missing required fields");
        expect(result.left.message).toContain("_embedded");
      }
    });

    it("全ての必須フィールドが欠損している場合は失敗する", () => {
      const validPost = createValidPost();
      const requiredFields: (keyof WordPressPost)[] = ["_embedded"];
      const result = validateWordPressPostFields(validPost, requiredFields);

      expect(isLeft(result)).toBe(true);
    });

    it("optionalフィールドを必須として指定しても欠損で失敗しない", () => {
      const validPost = createValidPost();
      const requiredFields: (keyof WordPressPost)[] = ["featured_media"];
      const result = validateWordPressPostFields(validPost, requiredFields);

      expect(isRight(result)).toBe(true);
    });

    it("optionalフィールドが欠損している場合は失敗する", () => {
      const validPost = createValidPost();
      delete (validPost as any).featured_media;
      const requiredFields: (keyof WordPressPost)[] = ["featured_media"];
      const result = validateWordPressPostFields(validPost, requiredFields);

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toContain("featured_media");
      }
    });
  });
});
