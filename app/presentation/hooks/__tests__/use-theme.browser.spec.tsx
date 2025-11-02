import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTheme } from "../use-theme";
import * as nextThemes from "next-themes";

// next-themesのモック
vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

const mockUseNextTheme = vi.mocked(nextThemes.useTheme);

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("next-themesのuseThemeを呼び出す", () => {
    mockUseNextTheme.mockReturnValue({
      theme: undefined,
      setTheme: vi.fn(),
      resolvedTheme: undefined,
      systemTheme: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderHook(() => useTheme());
    expect(mockUseNextTheme).toHaveBeenCalledTimes(1);
  });

  it("themeを型安全な形式で返す", () => {
    mockUseNextTheme.mockReturnValue({
      theme: "dark",
      setTheme: vi.fn(),
      resolvedTheme: "dark",
      systemTheme: "dark",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("setTheme関数を返す", () => {
    const mockSetTheme = vi.fn();
    mockUseNextTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
      systemTheme: "light",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useTheme());
    expect(typeof result.current.setTheme).toBe("function");
  });

  it("setThemeを呼び出すとnext-themesのsetThemeが実行される", () => {
    const mockSetTheme = vi.fn();
    mockUseNextTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
      systemTheme: "light",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useTheme());
    result.current.setTheme("dark");
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("changeThemeを呼び出すとnext-themesのsetThemeが実行される", () => {
    const mockSetTheme = vi.fn();
    mockUseNextTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
      systemTheme: "light",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useTheme());
    result.current.changeTheme("dark");
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("resolvedThemeとsystemThemeを返す", () => {
    mockUseNextTheme.mockReturnValue({
      theme: "system",
      setTheme: vi.fn(),
      resolvedTheme: "dark",
      systemTheme: "dark",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useTheme());
    expect(result.current.resolvedTheme).toBe("dark");
    expect(result.current.systemTheme).toBe("dark");
  });
});
