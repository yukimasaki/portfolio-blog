import { describe, it, expect } from "vitest";
import { extractRelatedPosts } from "../services";
import type { Post } from "@/domain/blog/entities";

describe("services", () => {
  describe("extractRelatedPosts", () => {
    // テスト用のダミーポストを作成するヘルパー関数
    const createPost = (
      id: number,
      tagIds: number[] = []
    ): Post => ({
      id: { _tag: "PostId", value: id },
      title: { _tag: "PostTitle", value: `記事${id}` },
      slug: { _tag: "PostSlug", value: `post-${id}` },
      excerpt: { _tag: "PostExcerpt", value: "要約" },
      content: "<p>本文</p>",
      createdAt: { _tag: "PostDate", value: new Date() },
      updatedAt: { _tag: "PostDate", value: new Date() },
      tags: tagIds.map(tagId => ({
        id: { _tag: "TagId", value: tagId },
        name: { _tag: "TagName", value: `タグ${tagId}` },
        slug: { _tag: "TagSlug", value: `tag-${tagId}` },
        count: { _tag: "TagCount", value: 1 },
      })),
    });

    it("同じタグを持つ記事を最大5件まで抽出する", () => {
      const targetPost = createPost(1, [1, 2]);
      const allPosts = [
        targetPost,
        createPost(2, [1]), // タグ1でマッチ
        createPost(3, [2]), // タグ2でマッチ
        createPost(4, [1, 3]), // タグ1でマッチ
        createPost(5, [2]), // タグ2でマッチ
        createPost(6, [1]), // タグ1でマッチ
        createPost(7, [1]), // タグ1でマッチ（6件目だがmax=5なので除外）
      ];

      const result = extractRelatedPosts(targetPost, allPosts);

      expect(result).toHaveLength(5);
      expect(result.map(p => p.id.value)).toEqual([2, 3, 4, 5, 6]);
    });

    it("targetPost自体は除外される", () => {
      const targetPost = createPost(1, [1, 2]);
      const allPosts = [
        targetPost,
        createPost(2, [1]),
        createPost(3, [3]),
      ];

      const result = extractRelatedPosts(targetPost, allPosts);

      expect(result).toHaveLength(1);
      expect(result[0].id.value).toBe(2);
      expect(result.some(p => p.id.value === 1)).toBe(false);
    });

    it("同じタグがない記事は抽出されない", () => {
      const targetPost = createPost(1, [1, 2]);
      const allPosts = [
        targetPost,
        createPost(2, [3]), // マッチしない
        createPost(3, [4]), // マッチしない
      ];

      const result = extractRelatedPosts(targetPost, allPosts);

      expect(result).toHaveLength(0);
    });

    it("maxCountを指定できる", () => {
      const targetPost = createPost(1, [1]);
      const allPosts = [
        targetPost,
        createPost(2, [1]),
        createPost(3, [1]),
        createPost(4, [1]),
        createPost(5, [1]),
        createPost(6, [1]),
      ];

      const result = extractRelatedPosts(targetPost, allPosts, 3);

      expect(result).toHaveLength(3);
      expect(result.map(p => p.id.value)).toEqual([2, 3, 4]);
    });

    it("maxCountが0の場合は空配列を返す", () => {
      const targetPost = createPost(1, [1]);
      const allPosts = [
        targetPost,
        createPost(2, [1]),
        createPost(3, [1]),
      ];

      const result = extractRelatedPosts(targetPost, allPosts, 0);

      expect(result).toHaveLength(0);
    });

    it("複数のタグを持つ場合はいずれかのタグでマッチすれば抽出される", () => {
      const targetPost = createPost(1, [1, 2, 3]);
      const allPosts = [
        targetPost,
        createPost(2, [1]), // タグ1でマッチ
        createPost(3, [2]), // タグ2でマッチ
        createPost(4, [3]), // タグ3でマッチ
        createPost(5, [4]), // マッチしない
      ];

      const result = extractRelatedPosts(targetPost, allPosts);

      expect(result).toHaveLength(3);
      expect(result.map(p => p.id.value)).toEqual([2, 3, 4]);
    });

    it("空のタグ配列を持つtargetPostの場合、何も抽出されない", () => {
      const targetPost = createPost(1, []); // タグなし
      const allPosts = [
        targetPost,
        createPost(2, [1]),
        createPost(3, [2]),
      ];

      const result = extractRelatedPosts(targetPost, allPosts);

      expect(result).toHaveLength(0);
    });

    it("allPostsが空の場合、空配列を返す", () => {
      const targetPost = createPost(1, [1]);
      const allPosts: Post[] = [];

      const result = extractRelatedPosts(targetPost, allPosts);

      expect(result).toHaveLength(0);
    });

    it("allPostsがtargetPostのみの場合、空配列を返す", () => {
      const targetPost = createPost(1, [1]);
      const allPosts = [targetPost];

      const result = extractRelatedPosts(targetPost, allPosts);

      expect(result).toHaveLength(0);
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", () => {
      const targetPost = createPost(1, [1, 2]);
      const allPosts = [
        targetPost,
        createPost(2, [1]),
        createPost(3, [2]),
      ];

      const result1 = extractRelatedPosts(targetPost, allPosts);
      const result2 = extractRelatedPosts(targetPost, allPosts);

      expect(result1).toHaveLength(result2.length);
      for (let i = 0; i < result1.length; i++) {
        expect(result1[i].id.value).toBe(result2[i].id.value);
        expect(result1[i].title.value).toBe(result2[i].title.value);
      }
    });

    it("maxCount未指定の場合は5件まで返す", () => {
      const targetPost = createPost(1, [1]);
      const allPosts = [
        targetPost,
        ...Array.from({ length: 10 }, (_, i) => createPost(i + 2, [1])),
      ];

      const result = extractRelatedPosts(targetPost, allPosts); // maxCount未指定

      expect(result).toHaveLength(5);
    });

    it("マッチする記事がmaxCountより少ない場合は、マッチする記事数だけ返す", () => {
      const targetPost = createPost(1, [1]);
      const allPosts = [
        targetPost,
        createPost(2, [1]),
        createPost(3, [1]),
        createPost(4, [2]),
      ];

      const result = extractRelatedPosts(targetPost, allPosts, 10);

      expect(result).toHaveLength(2);
      expect(result.map(p => p.id.value)).toEqual([2, 3]);
    });
  });
});
