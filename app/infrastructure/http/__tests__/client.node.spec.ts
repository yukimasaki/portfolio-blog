import { describe, it, expect, vi, beforeEach } from "vitest";
import * as E from "fp-ts/Either";
import { httpClient } from "../client";

const isRight = E.isRight;
const isLeft = E.isLeft;

// Mock fetch globally
global.fetch = vi.fn();

describe("http/client", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("httpClient.get", () => {
    it("正常なGETリクエストは成功する", async () => {
      const url = "https://example.com/api/data";
      const mockData = { id: 1, name: "test" };
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => mockData,
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await httpClient.get(url);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.data).toEqual(mockData);
        expect(result.right.status).toBe(200);
      }
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    it("200ステータスのレスポンスは成功する", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        json: async () => ({ success: true }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await httpClient.get("https://example.com/api/data");

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.status).toBe(200);
        expect(result.right.data).toEqual({ success: true });
      }
    });

    it("404ステータスのレスポンスは失敗する", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers(),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await httpClient.get("https://example.com/api/data");

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.status).toBe(500);
        expect(result.left.message).toContain("404");
      }
    });

    it("500ステータスのレスポンスは失敗する", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers(),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await httpClient.get("https://example.com/api/data");

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.status).toBe(500);
      }
    });

    it("ネットワークエラーは失敗する", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Network error"));

      const result = await httpClient.get("https://example.com/api/data");

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toBe("Network error");
        expect(result.left.status).toBe(500);
      }
    });

    it("タイムアウトは失敗する", async () => {
      const abortError = new Error("Request timed out");
      abortError.name = "AbortError";
      (global.fetch as any).mockRejectedValue(abortError);

      const result = await httpClient.get("https://example.com/api/data");

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toContain("Request timed out");
        expect(result.left.status).toBe(500);
      }
    });

    it("デフォルトタイムアウトを適用する", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await httpClient.get("https://example.com/api/data");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/api/data",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it("カスタムタイムアウトを適用できる", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await httpClient.get("https://example.com/api/data", {
        timeoutMs: 5000,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/api/data",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it("カスタムヘッダーを設定できる", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await httpClient.get("https://example.com/api/data", {
        headers: {
          Authorization: "Bearer token",
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/api/data",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token",
          }),
        })
      );
    });

    it("レスポンスヘッダーが正しく返される", async () => {
      const mockHeaders = new Headers();
      mockHeaders.set("Content-Type", "application/json");
      const mockResponse = {
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: async () => ({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await httpClient.get("https://example.com/api/data");

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.headers.get("Content-Type")).toBe(
          "application/json"
        );
      }
    });

    it("Unknown型のエラーは失敗する", async () => {
      (global.fetch as any).mockRejectedValue("Unknown error");

      const result = await httpClient.get("https://example.com/api/data");

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toBe("Unknown error");
        expect(result.left.status).toBe(500);
      }
    });
  });

  describe("httpClient.post", () => {
    it("正常なPOSTリクエストは成功する", async () => {
      const url = "https://example.com/api/data";
      const requestBody = { name: "test", value: 123 };
      const mockData = { id: 1, ...requestBody };
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => mockData,
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await httpClient.post(url, requestBody);

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.data).toEqual(mockData);
        expect(result.right.status).toBe(200);
      }
      expect(global.fetch).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(requestBody),
        })
      );
    });

    it("201ステータスのレスポンスは成功する", async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: "Created",
        headers: new Headers(),
        json: async () => ({ success: true }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await httpClient.post("https://example.com/api/data", {});

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.status).toBe(201);
      }
    });

    it("404ステータスのレスポンスは失敗する", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers(),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await httpClient.post("https://example.com/api/data", {});

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.status).toBe(500);
      }
    });

    it("500ステータスのレスポンスは失敗する", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers(),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await httpClient.post("https://example.com/api/data", {});

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.status).toBe(500);
      }
    });

    it("ネットワークエラーは失敗する", async () => {
      (global.fetch as any).mockRejectedValue(new Error("Network error"));

      const result = await httpClient.post("https://example.com/api/data", {});

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toBe("Network error");
        expect(result.left.status).toBe(500);
      }
    });

    it("タイムアウトは失敗する", async () => {
      const abortError = new Error("Request timed out");
      abortError.name = "AbortError";
      (global.fetch as any).mockRejectedValue(abortError);

      const result = await httpClient.post("https://example.com/api/data", {});

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toContain("Request timed out");
        expect(result.left.status).toBe(500);
      }
    });

    it("デフォルトタイムアウトを適用する", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await httpClient.post("https://example.com/api/data", {});

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/api/data",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it("カスタムタイムアウトを適用できる", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await httpClient.post(
        "https://example.com/api/data",
        {},
        {
          timeoutMs: 5000,
        }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/api/data",
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it("カスタムヘッダーを設定できる", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await httpClient.post(
        "https://example.com/api/data",
        {},
        {
          headers: {
            Authorization: "Bearer token",
          },
        }
      );

      const calls = (global.fetch as any).mock.calls[0];
      const headers = calls[1]?.headers;
      expect(headers["Authorization"]).toBe("Bearer token");
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("リクエストボディがJSON化される", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const requestBody = { name: "test", items: [1, 2, 3] };
      await httpClient.post("https://example.com/api/data", requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/api/data",
        expect.objectContaining({
          body: JSON.stringify(requestBody),
        })
      );
    });

    it("コンテンツタイプがapplication/jsonに設定される", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await httpClient.post("https://example.com/api/data", {});

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/api/data",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("レスポンスヘッダーが正しく返される", async () => {
      const mockHeaders = new Headers();
      mockHeaders.set("Content-Type", "application/json");
      const mockResponse = {
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: async () => ({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await httpClient.post("https://example.com/api/data", {});

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.headers.get("Content-Type")).toBe(
          "application/json"
        );
      }
    });

    it("Unknown型のエラーは失敗する", async () => {
      (global.fetch as any).mockRejectedValue("Unknown error");

      const result = await httpClient.post("https://example.com/api/data", {});

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.message).toBe("Unknown error");
        expect(result.left.status).toBe(500);
      }
    });
  });
});
