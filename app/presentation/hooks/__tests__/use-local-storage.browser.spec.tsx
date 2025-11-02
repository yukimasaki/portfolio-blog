import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../use-local-storage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    // 各テスト前にローカルストレージをクリア
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
  });


  it("初期値が設定される", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "initial-value")
    );
    expect(result.current[0]).toBe("initial-value");
  });

  it("ローカルストレージから既存の値を読み込む", () => {
    localStorage.setItem("test-key", JSON.stringify("stored-value"));
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "initial-value")
    );
    expect(result.current[0]).toBe("stored-value");
  });

  it("ローカルストレージに値を保存する", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "initial-value")
    );
    act(() => {
      result.current[1]("new-value");
    });
    expect(result.current[0]).toBe("new-value");
    expect(localStorage.getItem("test-key")).toBe(JSON.stringify("new-value"));
  });

  it("関数形式で値を更新できる", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0));
    act(() => {
      result.current[1](prev => prev + 1);
    });
    expect(result.current[0]).toBe(1);
    act(() => {
      result.current[1](prev => prev + 1);
    });
    expect(result.current[0]).toBe(2);
  });

  it("オブジェクトを正しく保存・取得できる", () => {
    const initialValue = { name: "test", count: 0 };
    const { result } = renderHook(() =>
      useLocalStorage("test-key", initialValue)
    );
    act(() => {
      result.current[1]({ name: "updated", count: 1 });
    });
    expect(result.current[0]).toEqual({ name: "updated", count: 1 });
    expect(localStorage.getItem("test-key")).toBe(
      JSON.stringify({ name: "updated", count: 1 })
    );
  });

  it("配列を正しく保存・取得できる", () => {
    const initialValue = [1, 2, 3];
    const { result } = renderHook(() =>
      useLocalStorage("test-key", initialValue)
    );
    act(() => {
      result.current[1]([...initialValue, 4]);
    });
    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });

  it("不正なJSONの場合は初期値を返す", () => {
    // 不正なJSONをローカルストレージに設定
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn().mockReturnValue("invalid-json"),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "initial-value")
    );
    expect(result.current[0]).toBe("initial-value");
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();

    // localStorageを復元
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it("setValueでエラーが発生してもクラッシュしない", () => {
    // ローカルストレージのsetItemでエラーを発生させる
    const originalLocalStorage = window.localStorage;
    const errorStorage = {
      getItem: () => null,
      setItem: vi.fn().mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: errorStorage,
      writable: true,
      configurable: true,
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { result } = renderHook(() =>
      useLocalStorage("test-key", "initial-value")
    );
    act(() => {
      result.current[1]("new-value");
    });
    // 状態は更新されるが、ローカルストレージには保存されない
    expect(result.current[0]).toBe("new-value");
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();

    // localStorageを復元
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it("異なるキーで独立した値を管理できる", () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage("key1", "value1")
    );
    const { result: result2 } = renderHook(() =>
      useLocalStorage("key2", "value2")
    );

    act(() => {
      result1.current[1]("updated1");
      result2.current[1]("updated2");
    });

    expect(result1.current[0]).toBe("updated1");
    expect(result2.current[0]).toBe("updated2");
    expect(localStorage.getItem("key1")).toBe(JSON.stringify("updated1"));
    expect(localStorage.getItem("key2")).toBe(JSON.stringify("updated2"));
  });
});

