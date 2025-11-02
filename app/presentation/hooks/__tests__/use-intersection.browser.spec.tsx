import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIntersection } from "../use-intersection";

// IntersectionObserverのモック
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {
      // コンストラクタの引数は無視
    }
    observe = mockObserve;
    disconnect = mockDisconnect;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
});

describe("useIntersection", () => {
  it("初期状態ではisIntersectingがfalseである", () => {
    const { result } = renderHook(() => useIntersection());
    expect(result.current[1]).toBe(false);
  });

  it("refとisIntersectingを返す", () => {
    const { result } = renderHook(() => useIntersection());
    expect(result.current[0]).toBeDefined();
    expect(result.current[1]).toBe(false);
  });

  it("ref.currentは初期状態でnullである", () => {
    const { result } = renderHook(() => useIntersection());
    expect(result.current[0].current).toBeNull();
  });
});
