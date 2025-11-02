import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import {
  createTagId,
  createTagName,
  createTagSlug,
  createTagCount,
} from "../tag";

const isRight = E.isRight;
const isLeft = E.isLeft;

describe("value-objects/tag", () => {
  describe("createTagId", () => {
    it("正の整数は成功する", () => {
      const result = createTagId(42);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "TagId", value: 42 });
      }
    });

    it("0は失敗する", () => {
      const result = createTagId(0);
      expect(isLeft(result)).toBe(true);
    });

    it("負の数は失敗する", () => {
      const result = createTagId(-1);
      expect(isLeft(result)).toBe(true);
    });

    it("小数は失敗する", () => {
      const result = createTagId(3.14);
      expect(isLeft(result)).toBe(true);
    });

    it("文字列は失敗する", () => {
      const result = createTagId("42");
      expect(isLeft(result)).toBe(true);
    });
  });

  describe("createTagName", () => {
    it("1文字の名前は成功する", () => {
      const result = createTagName("A");
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "TagName", value: "A" });
      }
    });

    it("50文字の名前は成功する", () => {
      const name = "A".repeat(50);
      const result = createTagName(name);
      expect(isRight(result)).toBe(true);
    });

    it("51文字の名前は失敗する", () => {
      const name = "A".repeat(51);
      const result = createTagName(name);
      expect(isLeft(result)).toBe(true);
    });

    it("空文字列は失敗する", () => {
      const result = createTagName("");
      expect(isLeft(result)).toBe(true);
    });

    it("日本語は成功する", () => {
      const result = createTagName("テスト");
      expect(isRight(result)).toBe(true);
    });

    it("数値は失敗する", () => {
      const result = createTagName(42);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe("createTagSlug", () => {
    it("小文字英数字とハイフンのスラッグは成功する", () => {
      const result = createTagSlug("test-tag-123");
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "TagSlug", value: "test-tag-123" });
      }
    });

    it("パーセントエンコードのスラッグは成功する", () => {
      const result = createTagSlug("test%20tag");
      expect(isRight(result)).toBe(true);
    });

    it("日本語のスラッグは成功する", () => {
      const result = createTagSlug("テスト");
      expect(isRight(result)).toBe(true);
    });

    it("日本語とハイフンの混合スラッグは成功する", () => {
      const result = createTagSlug("テスト-タグ");
      expect(isRight(result)).toBe(true);
    });

    it("空白を含むスラッグは成功する（パターン3）", () => {
      const result = createTagSlug("test tag");
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.value).toBe("test tag");
      }
    });

    it("200文字のスラッグは成功する", () => {
      const slug = "a".repeat(200);
      const result = createTagSlug(slug);
      expect(isRight(result)).toBe(true);
    });

    it("201文字のスラッグは失敗する", () => {
      const slug = "a".repeat(201);
      const result = createTagSlug(slug);
      expect(isLeft(result)).toBe(true);
    });

    it("空文字列は失敗する", () => {
      const result = createTagSlug("");
      expect(isLeft(result)).toBe(true);
    });

    it("空白のみの文字列は失敗する", () => {
      const result = createTagSlug("   ");
      expect(isLeft(result)).toBe(true);
    });

    it("trim処理される", () => {
      const result = createTagSlug("  test-tag  ");
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.value).toBe("test-tag");
      }
    });

    it("数値は失敗する", () => {
      const result = createTagSlug(42);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe("createTagCount", () => {
    it("0は成功する", () => {
      const result = createTagCount(0);
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({ _tag: "TagCount", value: 0 });
      }
    });

    it("正の整数は成功する", () => {
      const result = createTagCount(42);
      expect(isRight(result)).toBe(true);
    });

    it("負の数は失敗する", () => {
      const result = createTagCount(-1);
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left).toBe("無効なTagCount: 0以上の整数である必要があります");
      }
    });

    it("小数は失敗する", () => {
      const result = createTagCount(3.14);
      expect(isLeft(result)).toBe(true);
    });

    it("文字列は失敗する", () => {
      const result = createTagCount("42");
      expect(isLeft(result)).toBe(true);
    });

    it("nullは失敗する", () => {
      const result = createTagCount(null);
      expect(isLeft(result)).toBe(true);
    });

    it("undefinedは失敗する", () => {
      const result = createTagCount(undefined);
      expect(isLeft(result)).toBe(true);
    });
  });
});
