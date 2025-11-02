import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import { createImageUrl, createGitHubUrl, createLiveUrl } from "../common";

const isRight = E.isRight;
const isLeft = E.isLeft;

describe("value-objects/common", () => {
  describe("createImageUrl", () => {
    it("有効なhttps URLは成功する", () => {
      const result = createImageUrl("https://example.com/image.jpg");
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({
          _tag: "ImageUrl",
          value: "https://example.com/image.jpg",
        });
      }
    });

    it("有効なhttp URLは成功する", () => {
      const result = createImageUrl("http://example.com/image.jpg");
      expect(isRight(result)).toBe(true);
    });

    it("完全なURLは成功する", () => {
      const result = createImageUrl(
        "https://example.com/path/to/image.jpg?query=value#fragment"
      );
      expect(isRight(result)).toBe(true);
    });

    it("相対パスは失敗する", () => {
      const result = createImageUrl("/image.jpg");
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left).toBe(
          "無効なImageUrl: 有効なURLである必要があります"
        );
      }
    });

    it("プロトコルなしは失敗する", () => {
      const result = createImageUrl("example.com/image.jpg");
      expect(isLeft(result)).toBe(true);
    });

    it("空文字列は失敗する", () => {
      const result = createImageUrl("");
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left).toBe(
          "無効なImageUrl: 空でない文字列である必要があります"
        );
      }
    });

    it("数値は失敗する", () => {
      const result = createImageUrl(42);
      expect(isLeft(result)).toBe(true);
    });

    it("nullは失敗する", () => {
      const result = createImageUrl(null);
      expect(isLeft(result)).toBe(true);
    });

    it("undefinedは失敗する", () => {
      const result = createImageUrl(undefined);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe("createGitHubUrl", () => {
    it("https://github.comで始まるURLは成功する", () => {
      const result = createGitHubUrl("https://github.com/user/repo");
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({
          _tag: "GitHubUrl",
          value: "https://github.com/user/repo",
        });
      }
    });

    it("完全なGitHub URLは成功する", () => {
      const result = createGitHubUrl("https://github.com/user/repo/tree/main");
      expect(isRight(result)).toBe(true);
    });

    it("http://github.comで始まるURLは失敗する", () => {
      const result = createGitHubUrl("http://github.com/user/repo");
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left).toBe(
          "無効なGitHubUrl: https://github.com/ で始まる必要があります"
        );
      }
    });

    it("github.comで始まらないURLは失敗する", () => {
      const result = createGitHubUrl("https://example.com");
      expect(isLeft(result)).toBe(true);
    });

    it("空文字列は失敗する", () => {
      const result = createGitHubUrl("");
      expect(isLeft(result)).toBe(true);
    });

    it("数値は失敗する", () => {
      const result = createGitHubUrl(42);
      expect(isLeft(result)).toBe(true);
    });

    it("nullは失敗する", () => {
      const result = createGitHubUrl(null);
      expect(isLeft(result)).toBe(true);
    });

    it("undefinedは失敗する", () => {
      const result = createGitHubUrl(undefined);
      expect(isLeft(result)).toBe(true);
    });
  });

  describe("createLiveUrl", () => {
    it("https://で始まるURLは成功する", () => {
      const result = createLiveUrl("https://example.com");
      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toEqual({
          _tag: "LiveUrl",
          value: "https://example.com",
        });
      }
    });

    it("http://で始まるURLは成功する", () => {
      const result = createLiveUrl("http://example.com");
      expect(isRight(result)).toBe(true);
    });

    it("完全なURLは成功する", () => {
      const result = createLiveUrl(
        "https://example.com/path?query=value#fragment"
      );
      expect(isRight(result)).toBe(true);
    });

    it("httpsで始まらないURLは失敗する", () => {
      const result = createLiveUrl("ftp://example.com");
      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left).toBe(
          "無効なLiveUrl: http:// または https:// で始まる必要があります"
        );
      }
    });

    it("空文字列は失敗する", () => {
      const result = createLiveUrl("");
      expect(isLeft(result)).toBe(true);
    });

    it("数値は失敗する", () => {
      const result = createLiveUrl(42);
      expect(isLeft(result)).toBe(true);
    });

    it("nullは失敗する", () => {
      const result = createLiveUrl(null);
      expect(isLeft(result)).toBe(true);
    });

    it("undefinedは失敗する", () => {
      const result = createLiveUrl(undefined);
      expect(isLeft(result)).toBe(true);
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", () => {
      const url = "https://example.com";
      const result1 = createLiveUrl(url);
      const result2 = createLiveUrl(url);
      expect(isRight(result1)).toBe(true);
      expect(isRight(result2)).toBe(true);
      if (isRight(result1) && isRight(result2)) {
        expect(result1.right.value).toBe(result2.right.value);
      }
    });
  });
});
