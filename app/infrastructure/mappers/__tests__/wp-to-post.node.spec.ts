import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import {
  mapWordPressPostToDomain,
  mapWordPressPostsToDomain,
} from "../wp-to-post";
import type { WordPressPost } from "@/infrastructure/external/types";

const isRight = E.isRight;
const isLeft = E.isLeft;

describe("wp-to-post", () => {
  describe("mapWordPressPostToDomain", () => {
    const createValidWpPost = (): WordPressPost => ({
      id: 1,
      slug: "test-post",
      title: {
        rendered: "テスト記事",
      },
      content: {
        rendered: "<p>本文</p>",
      },
      excerpt: {
        rendered: "<p>要約</p>",
      },
      date: "2024-01-01T00:00:00",
      modified: "2024-01-02T00:00:00",
      featured_media: 1,
      tags: [1, 2],
      _embedded: {
        "wp:featuredmedia": [
          {
            source_url: "https://example.com/image.jpg",
          },
        ],
        "wp:term": [
          [
            {
              id: 1,
              name: "タグ1",
              slug: "tag-1",
              taxonomy: "post_tag",
              count: 5,
            },
            {
              id: 2,
              name: "タグ2",
              slug: "tag-2",
              taxonomy: "post_tag",
              count: 3,
            },
          ],
        ],
      },
    });

    it("有効なWordPressPostは正常にマッピングされる", () => {
      const wpPost = createValidWpPost();
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        const post = result.right;
        expect(post.id.value).toBe(1);
        expect(post.title.value).toBe("テスト記事");
        expect(post.slug.value).toBe("test-post");
        expect(post.excerpt.value).toBe("要約");
        expect(post.content).toBe("<p>本文</p>");
        expect(post.featuredImage?.value).toBe("https://example.com/image.jpg");
        expect(post.tags).toHaveLength(2);
        expect(post.tags[0].name.value).toBe("タグ1");
        expect(post.tags[1].name.value).toBe("タグ2");
      }
    });

    it("HTMLタグが除外されたtitleがマッピングされる", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        title: {
          rendered: "<h1>テスト記事</h1>",
        },
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.title.value).toBe("テスト記事");
      }
    });

    it("HTMLタグが除外されたexcerptがマッピングされる", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        excerpt: {
          rendered: "<p>要約テキスト</p>",
        },
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.excerpt.value).toBe("要約テキスト");
      }
    });

    it("要約が空文字列でも正常にマッピングされる", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        excerpt: {
          rendered: "",
        },
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.excerpt.value).toBe("");
      }
    });

    it("featuredImageがない場合はundefinedがマッピングされる", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        _embedded: {},
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.featuredImage).toBeUndefined();
      }
    });

    it("_embeddedがない場合はtagsが空配列でマッピングされる", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        _embedded: undefined,
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.tags).toHaveLength(0);
        expect(result.right.featuredImage).toBeUndefined();
      }
    });

    it("wp:termにpost_tag以外のタクソノミーが含まれていても無視される", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        _embedded: {
          ...createValidWpPost()._embedded,
          "wp:term": [
            [
              {
                id: 1,
                name: "タグ1",
                slug: "tag-1",
                taxonomy: "post_tag",
                count: 5,
              },
              {
                id: 2,
                name: "カテゴリ1",
                slug: "category-1",
                taxonomy: "category",
                count: 10,
              },
            ],
          ],
        },
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.tags).toHaveLength(1);
        expect(result.right.tags[0].name.value).toBe("タグ1");
      }
    });

    it("複数のwp:termグループが存在する場合はflattenされる", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        _embedded: {
          ...createValidWpPost()._embedded,
          "wp:term": [
            [
              {
                id: 1,
                name: "タグ1",
                slug: "tag-1",
                taxonomy: "post_tag",
                count: 5,
              },
            ],
            [
              {
                id: 2,
                name: "タグ2",
                slug: "tag-2",
                taxonomy: "post_tag",
                count: 3,
              },
            ],
          ],
        },
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.tags).toHaveLength(2);
      }
    });

    it("無効なタグが含まれていても有効なタグのみマッピングされる", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        _embedded: {
          ...createValidWpPost()._embedded,
          "wp:term": [
            [
              {
                id: 1,
                name: "タグ1",
                slug: "tag-1",
                taxonomy: "post_tag",
                count: 5,
              },
              {
                id: 0, // 無効なID
                name: "タグ2",
                slug: "tag-2",
                taxonomy: "post_tag",
                count: 3,
              },
              {
                id: 3,
                name: "タグ3",
                slug: "tag-3",
                taxonomy: "post_tag",
                count: 10,
              },
            ],
          ],
        },
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.tags).toHaveLength(2);
        expect(result.right.tags[0].name.value).toBe("タグ1");
        expect(result.right.tags[1].name.value).toBe("タグ3");
      }
    });

    it("タグにcountがない場合は0が設定される", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        _embedded: {
          ...createValidWpPost()._embedded,
          "wp:term": [
            [
              {
                id: 1,
                name: "タグ1",
                slug: "tag-1",
                taxonomy: "post_tag",
              },
            ],
          ],
        },
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.tags).toHaveLength(1);
        expect(result.right.tags[0].count.value).toBe(0);
      }
    });

    it("無効なIDはマッピングに失敗する", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        id: 0,
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isLeft(result)).toBe(true);
    });

    it("無効な日付はマッピングに失敗する", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        date: "invalid date",
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isLeft(result)).toBe(true);
    });

    it("無効なmodified日付はマッピングに失敗する", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        modified: "invalid date",
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isLeft(result)).toBe(true);
    });

    it("無効なfeaturedImage URLはfeaturedImageがundefinedになる", () => {
      const wpPost: WordPressPost = {
        ...createValidWpPost(),
        _embedded: {
          "wp:featuredmedia": [
            {
              source_url: "invalid url",
            },
          ],
        },
      };
      const result = mapWordPressPostToDomain(wpPost);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.featuredImage).toBeUndefined();
      }
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", () => {
      const wpPost = createValidWpPost();
      const result1 = mapWordPressPostToDomain(wpPost);
      const result2 = mapWordPressPostToDomain(wpPost);

      expect(isRight(result1)).toBe(true);
      expect(isRight(result2)).toBe(true);
      if (isRight(result1) && isRight(result2)) {
        expect(result1.right.id.value).toBe(result2.right.id.value);
        expect(result1.right.title.value).toBe(result2.right.title.value);
        expect(result1.right.slug.value).toBe(result2.right.slug.value);
      }
    });
  });

  describe("mapWordPressPostsToDomain", () => {
    const createValidWpPosts = (): WordPressPost[] => [
      {
        id: 1,
        slug: "test-post-1",
        title: { rendered: "テスト記事1" },
        content: { rendered: "<p>本文1</p>" },
        excerpt: { rendered: "要約1" },
        date: "2024-01-01T00:00:00",
        modified: "2024-01-02T00:00:00",
        featured_media: 1,
        tags: [1],
      },
      {
        id: 2,
        slug: "test-post-2",
        title: { rendered: "テスト記事2" },
        content: { rendered: "<p>本文2</p>" },
        excerpt: { rendered: "要約2" },
        date: "2024-02-01T00:00:00",
        modified: "2024-02-02T00:00:00",
        featured_media: 2,
        tags: [2],
      },
    ];

    it("全て有効な記事の配列は正常にマッピングされる", () => {
      const wpPosts = createValidWpPosts();
      const result = mapWordPressPostsToDomain(wpPosts);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toHaveLength(2);
        expect(result.right[0].title.value).toBe("テスト記事1");
        expect(result.right[1].title.value).toBe("テスト記事2");
      }
    });

    it("空の配列は正常にマッピングされる", () => {
      const wpPosts: WordPressPost[] = [];
      const result = mapWordPressPostsToDomain(wpPosts);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toHaveLength(0);
      }
    });

    it("1件のみの配列は正常にマッピングされる", () => {
      const wpPosts: WordPressPost[] = [createValidWpPosts()[0]];
      const result = mapWordPressPostsToDomain(wpPosts);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right).toHaveLength(1);
        expect(result.right[0].title.value).toBe("テスト記事1");
      }
    });

    it("無効な記事が1件でも含まれていればマッピングに失敗する", () => {
      const wpPosts: WordPressPost[] = [
        createValidWpPosts()[0],
        {
          ...createValidWpPosts()[1],
          id: 0, // 無効なID
        },
      ];
      const result = mapWordPressPostsToDomain(wpPosts);

      expect(isLeft(result)).toBe(true);
    });

    it("全て無効な記事の配列はマッピングに失敗する", () => {
      const wpPosts: WordPressPost[] = [
        {
          ...createValidWpPosts()[0],
          id: 0,
        },
        {
          ...createValidWpPosts()[1],
          id: -1,
        },
      ];
      const result = mapWordPressPostsToDomain(wpPosts);

      expect(isLeft(result)).toBe(true);
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", () => {
      const wpPosts = createValidWpPosts();
      const result1 = mapWordPressPostsToDomain(wpPosts);
      const result2 = mapWordPressPostsToDomain(wpPosts);

      expect(isRight(result1)).toBe(true);
      expect(isRight(result2)).toBe(true);
      if (isRight(result1) && isRight(result2)) {
        expect(result1.right).toHaveLength(result2.right.length);
        for (let i = 0; i < result1.right.length; i++) {
          expect(result1.right[i].id.value).toBe(result2.right[i].id.value);
          expect(result1.right[i].title.value).toBe(
            result2.right[i].title.value
          );
        }
      }
    });
  });
});
