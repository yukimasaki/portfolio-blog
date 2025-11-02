import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSearchDocuments } from "../use-search-documents";
import * as httpClient from "@/infrastructure/http/client";

// httpClientのモック
vi.mock("@/infrastructure/http/client", () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

const mockHttpGet = vi.mocked(httpClient.httpClient.get);

describe("useSearchDocuments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態では空配列を返す", () => {
    const { result } = renderHook(() => useSearchDocuments(false));
    expect(result.current.documents).toEqual([]);
  });

  it("enabledがfalseの場合、APIリクエストを送らない", () => {
    renderHook(() => useSearchDocuments(false));
    expect(mockHttpGet).not.toHaveBeenCalled();
  });

  it("enabledがtrueの場合、APIリクエストを送る", () => {
    mockHttpGet.mockResolvedValue({
      _tag: "Right",
      right: {
        data: [],
        status: 200,
        headers: new Headers(),
      },
    });
    renderHook(() => useSearchDocuments(true));
    expect(mockHttpGet).toHaveBeenCalledWith("/api/search-documents", {
      cache: "force-cache",
    });
  });

  it("APIリクエストが成功した場合、ドキュメントを取得する", async () => {
    const mockDocuments = [
      {
        id: 1,
        title: "テスト記事1",
        content: "内容1",
        excerpt: "抜粋1",
        slug: "test-1",
      },
      {
        id: 2,
        title: "テスト記事2",
        content: "内容2",
        excerpt: "抜粋2",
        slug: "test-2",
      },
    ];

    mockHttpGet.mockResolvedValue({
      _tag: "Right",
      right: {
        data: mockDocuments,
        status: 200,
        headers: new Headers(),
      },
    });

    const { result } = renderHook(() => useSearchDocuments(true));

    await waitFor(() => {
      expect(result.current.documents).toEqual(mockDocuments);
    });
  });

  it("APIリクエストが失敗した場合、空配列を返す", async () => {
    mockHttpGet.mockResolvedValue({
      _tag: "Left",
      left: {
        message: "Network error",
        status: 500,
      },
    });

    const { result } = renderHook(() => useSearchDocuments(true));

    await waitFor(() => {
      expect(result.current.documents).toEqual([]);
    });
  });

  it("複数回enabledがtrueに変更されても、リクエストは1回だけ送られる", async () => {
    mockHttpGet.mockResolvedValue({
      _tag: "Right",
      right: {
        data: [],
        status: 200,
        headers: new Headers(),
      },
    });

    const { rerender } = renderHook(
      ({ enabled }) => useSearchDocuments(enabled),
      {
        initialProps: { enabled: false },
      }
    );

    expect(mockHttpGet).not.toHaveBeenCalled();

    rerender({ enabled: true });
    expect(mockHttpGet).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });
    rerender({ enabled: true });
    expect(mockHttpGet).toHaveBeenCalledTimes(1); // 追加でリクエストが送られない
  });
});
