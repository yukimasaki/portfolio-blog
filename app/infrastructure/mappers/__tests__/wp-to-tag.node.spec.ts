import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import {
  mapWordPressTagToDomain,
  mapWordPressTagsToDomain,
} from "../wp-to-tag";
import type { WordPressTag } from "@/infrastructure/external/types";

const isRight = E.isRight;
const isLeft = E.isLeft;

describe("wp-to-tag", () => {
  describe("mapWordPressTagToDomain", () => {
    const createValidWpTag = (): WordPressTag => ({
      id: 1,
      name: "テスト",
      slug: "test",
      taxonomy: "post_tag",
      count: 5,
    });

    it("有効なWordPressTagは正常にマッピングされる", () => {
      const wpTag = createValidWpTag();
      const result = mapWordPressTagToDomain(wpTag);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        const tag = result.right;
        expect(tag.id.value).toBe(1);
        expect(tag.name.value).toBe("テスト");
        expect(tag.slug.value).toBe("test");
        expect(tag.count.value).toBe(5);
      }
    });

    it("countが0のタグも正常にマッピングされる", () => {
      const wpTag: WordPressTag = {
        ...createValidWpTag(),
        count: 0,
      };
      const result = mapWordPressTagToDomain(wpTag);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.count.value).toBe(0);
      }
    });

    it("無効なID（0）はマッピングに失敗する", () => {
      const wpTag: WordPressTag = {
        ...createValidWpTag(),
        id: 0,
      };
      const result = mapWordPressTagToDomain(wpTag);

      expect(isLeft(result)).toBe(true);
    });

    it("無効なID（負の数）はマッピングに失敗する", () => {
      const wpTag: WordPressTag = {
        ...createValidWpTag(),
        id: -1,
      };
      const result = mapWordPressTagToDomain(wpTag);

      expect(isLeft(result)).toBe(true);
    });

    it("無効なID（小数）はマッピングに失敗する", () => {
      const wpTag: WordPressTag = {
        ...createValidWpTag(),
        id: 1.5,
      };
      const result = mapWordPressTagToDomain(wpTag);

      expect(isLeft(result)).toBe(true);
    });

    it("空の名前はマッピングに失敗する", () => {
      const wpTag: WordPressTag = {
        ...createValidWpTag(),
        name: "",
      };
      const result = mapWordPressTagToDomain(wpTag);

      expect(isLeft(result)).toBe(true);
    });

    it("51文字の名前はマッピングに失敗する", () => {
      const wpTag: WordPressTag = {
        ...createValidWpTag(),
        name: "A".repeat(51),
      };
      const result = mapWordPressTagToDomain(wpTag);

      expect(isLeft(result)).toBe(true);
    });

    it("無効なスラッグはマッピングに失敗する", () => {
      const wpTag: WordPressTag = {
        ...createValidWpTag(),
        slug: "",
      };
      const result = mapWordPressTagToDomain(wpTag);

      expect(isLeft(result)).toBe(true);
    });

    it("日本語スラッグは正常にマッピングされる", () => {
      const wpTag: WordPressTag = {
        ...createValidWpTag(),
        slug: "テスト",
      };
      const result = mapWordPressTagToDomain(wpTag);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.slug.value).toBe("テスト");
      }
    });

    it("無効なcount（負の数）はマッピングに失敗する", () => {
      const wpTag: WordPressTag = {
        ...createValidWpTag(),
        count: -1,
      };
      const result = mapWordPressTagToDomain(wpTag);

      expect(isLeft(result)).toBe(true);
    });

    it("小数のcountはマッピングに失敗する", () => {
      const wpTag: WordPressTag = {
        ...createValidWpTag(),
        count: 1.5,
      };
      const result = mapWordPressTagToDomain(wpTag);

      expect(isLeft(result)).toBe(true);
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", () => {
      const wpTag = createValidWpTag();
      const result1 = mapWordPressTagToDomain(wpTag);
      const result2 = mapWordPressTagToDomain(wpTag);

      expect(isRight(result1)).toBe(true);
      expect(isRight(result2)).toBe(true);
      if (isRight(result1) && isRight(result2)) {
        expect(result1.right.id.value).toBe(result2.right.id.value);
        expect(result1.right.name.value).toBe(result2.right.name.value);
        expect(result1.right.slug.value).toBe(result2.right.slug.value);
        expect(result1.right.count.value).toBe(result2.right.count.value);
      }
    });
  });

  describe("mapWordPressTagsToDomain", () => {
    const createValidWpTags = (): WordPressTag[] => [
      {
        id: 1,
        name: "テスト1",
        slug: "test-1",
        taxonomy: "post_tag",
        count: 5,
      },
      {
        id: 2,
        name: "テスト2",
        slug: "test-2",
        taxonomy: "post_tag",
        count: 3,
      },
      {
        id: 3,
        name: "テスト3",
        slug: "test-3",
        taxonomy: "post_tag",
        count: 10,
      },
    ];

    it("全て有効なタグの配列は正常にマッピングされる", () => {
      const wpTags = createValidWpTags();
      const result = mapWordPressTagsToDomain(wpTags);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toHaveLength(3);
        expect(result.right[0].name.value).toBe("テスト1");
        expect(result.right[1].name.value).toBe("テスト2");
        expect(result.right[2].name.value).toBe("テスト3");
      }
    });

    it("空の配列は正常にマッピングされる", () => {
      const wpTags: WordPressTag[] = [];
      const result = mapWordPressTagsToDomain(wpTags);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toHaveLength(0);
      }
    });

    it("1件のみの配列は正常にマッピングされる", () => {
      const wpTags: WordPressTag[] = [
        {
          id: 1,
          name: "テスト1",
          slug: "test-1",
          taxonomy: "post_tag",
          count: 5,
        },
      ];
      const result = mapWordPressTagsToDomain(wpTags);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toHaveLength(1);
        expect(result.right[0].name.value).toBe("テスト1");
      }
    });

    it("無効なタグが1件でも含まれていればマッピングに失敗する", () => {
      const wpTags: WordPressTag[] = [
        {
          id: 1,
          name: "テスト1",
          slug: "test-1",
          taxonomy: "post_tag",
          count: 5,
        },
        {
          id: 0,
          name: "テスト2",
          slug: "test-2",
          taxonomy: "post_tag",
          count: 3,
        }, // 無効なID
        {
          id: 3,
          name: "テスト3",
          slug: "test-3",
          taxonomy: "post_tag",
          count: 10,
        },
      ];
      const result = mapWordPressTagsToDomain(wpTags);

      expect(isLeft(result)).toBe(true);
    });

    it("全て無効なタグの配列はマッピングに失敗する", () => {
      const wpTags: WordPressTag[] = [
        {
          id: 0,
          name: "テスト1",
          slug: "test-1",
          taxonomy: "post_tag",
          count: 5,
        },
        {
          id: -1,
          name: "テスト2",
          slug: "test-2",
          taxonomy: "post_tag",
          count: 3,
        },
      ];
      const result = mapWordPressTagsToDomain(wpTags);

      expect(isLeft(result)).toBe(true);
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", () => {
      const wpTags = createValidWpTags();
      const result1 = mapWordPressTagsToDomain(wpTags);
      const result2 = mapWordPressTagsToDomain(wpTags);

      expect(isRight(result1)).toBe(true);
      expect(isRight(result2)).toBe(true);
      if (isRight(result1) && isRight(result2)) {
        expect(result1.right).toHaveLength(result2.right.length);
        for (let i = 0; i < result1.right.length; i++) {
          expect(result1.right[i].id.value).toBe(result2.right[i].id.value);
          expect(result1.right[i].name.value).toBe(result2.right[i].name.value);
        }
      }
    });
  });
});
