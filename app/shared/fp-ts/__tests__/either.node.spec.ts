import { describe, it, expect } from "vitest";
import * as E from "fp-ts/Either";
import { isRight, isLeft, getOrElse, map, flatMap } from "../either";

describe("either", () => {
  describe("isRight", () => {
    it("Rightの場合はtrueを返す", () => {
      const right = E.right(42);
      expect(isRight(right)).toBe(true);
    });

    it("Leftの場合はfalseを返す", () => {
      const left = E.left("error");
      expect(isRight(left)).toBe(false);
    });
  });

  describe("isLeft", () => {
    it("Leftの場合はtrueを返す", () => {
      const left = E.left("error");
      expect(isLeft(left)).toBe(true);
    });

    it("Rightの場合はfalseを返す", () => {
      const right = E.right(42);
      expect(isLeft(right)).toBe(false);
    });
  });

  describe("getOrElse", () => {
    it("Rightの場合は値を返す", () => {
      const right = E.right(42);
      const result = getOrElse(0)(right);
      expect(result).toBe(42);
    });

    it("Leftの場合はデフォルト値を返す", () => {
      const left = E.left("error");
      const result = getOrElse(0)(left);
      expect(result).toBe(0);
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", () => {
      const right = E.right(42);
      const result1 = getOrElse(0)(right);
      const result2 = getOrElse(0)(right);
      expect(result1).toBe(result2);
      expect(result1).toBe(42);
    });
  });

  describe("map", () => {
    it("Rightの場合は値を変換して返す", () => {
      const right = E.right(21);
      const double = (x: number) => x * 2;
      const result = map(double)(right);
      expect(result).toEqual(E.right(42));
    });

    it("Leftの場合はLeftのまま返す", () => {
      const left = E.left("error");
      const double = (x: number) => x * 2;
      const result = map(double)(left);
      expect(result).toEqual(left);
    });

    it("複数のmapをチェーンできる", () => {
      const right = E.right(21);
      const double = (x: number) => x * 2;
      const add1 = (x: number) => x + 1;
      const result = map(add1)(map(double)(right));
      expect(result).toEqual(E.right(43));
    });
  });

  describe("flatMap", () => {
    it("Rightの場合で、flatMapの結果がRightの場合は変換された値を返す", () => {
      const right = E.right(21);
      const double = (x: number) => E.right(x * 2);
      const result = flatMap(double)(right);
      expect(result).toEqual(E.right(42));
    });

    it("Rightの場合で、flatMapの結果がLeftの場合はLeftを返す", () => {
      const right = E.right(21);
      const toError = () => E.left("error");
      const result = flatMap(toError)(right);
      expect(result).toEqual(E.left("error"));
    });

    it("Leftの場合はLeftのまま返す", () => {
      const left = E.left("original error");
      const double = (x: number) => E.right(x * 2);
      const result = flatMap(double)(left);
      expect(result).toEqual(left);
    });

    it("複数のflatMapをチェーンできる", () => {
      const right = E.right(21);
      const double = (x: number) => E.right(x * 2);
      const add1 = (x: number) => E.right(x + 1);
      const result = flatMap(add1)(flatMap(double)(right));
      expect(result).toEqual(E.right(43));
    });
  });
});
