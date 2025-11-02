import { describe, it, expect } from "vitest";
import * as O from "fp-ts/Option";
import { isSome, isNone, getOrElse, map, flatMap, some, none } from "../option";

describe("option", () => {
  describe("isSome", () => {
    it("Someの場合はtrueを返す", () => {
      const someValue = O.some(42);
      expect(isSome(someValue)).toBe(true);
    });

    it("Noneの場合はfalseを返す", () => {
      const noneValue = O.none;
      expect(isNone(noneValue)).toBe(true);
      expect(isSome(noneValue)).toBe(false);
    });
  });

  describe("isNone", () => {
    it("Noneの場合はtrueを返す", () => {
      const noneValue = O.none;
      expect(isNone(noneValue)).toBe(true);
    });

    it("Someの場合はfalseを返す", () => {
      const someValue = O.some(42);
      expect(isSome(someValue)).toBe(true);
      expect(isNone(someValue)).toBe(false);
    });
  });

  describe("getOrElse", () => {
    it("Someの場合は値を返す", () => {
      const someValue = O.some(42);
      const result = getOrElse(0)(someValue);
      expect(result).toBe(42);
    });

    it("Noneの場合はデフォルト値を返す", () => {
      const noneValue = O.none;
      const result = getOrElse(0)(noneValue);
      expect(result).toBe(0);
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", () => {
      const someValue = O.some(42);
      const result1 = getOrElse(0)(someValue);
      const result2 = getOrElse(0)(someValue);
      expect(result1).toBe(result2);
      expect(result1).toBe(42);
    });
  });

  describe("map", () => {
    it("Someの場合は値を変換して返す", () => {
      const someValue = O.some(21);
      const double = (x: number) => x * 2;
      const result = map(double)(someValue);
      expect(result).toEqual(O.some(42));
    });

    it("Noneの場合はNoneのまま返す", () => {
      const noneValue = O.none;
      const double = (x: number) => x * 2;
      const result = map(double)(noneValue);
      expect(result).toEqual(noneValue);
    });

    it("複数のmapをチェーンできる", () => {
      const someValue = O.some(21);
      const double = (x: number) => x * 2;
      const add1 = (x: number) => x + 1;
      const result = map(add1)(map(double)(someValue));
      expect(result).toEqual(O.some(43));
    });
  });

  describe("flatMap", () => {
    it("Someの場合で、flatMapの結果がSomeの場合は変換された値を返す", () => {
      const someValue = O.some(21);
      const double = (x: number) => O.some(x * 2);
      const result = flatMap(double)(someValue);
      expect(result).toEqual(O.some(42));
    });

    it("Someの場合で、flatMapの結果がNoneの場合はNoneを返す", () => {
      const someValue = O.some(21);
      const toNone = (_x: number) => O.none;
      const result = flatMap(toNone)(someValue);
      expect(result).toEqual(O.none);
    });

    it("Noneの場合はNoneのまま返す", () => {
      const noneValue = O.none;
      const double = (x: number) => O.some(x * 2);
      const result = flatMap(double)(noneValue);
      expect(result).toEqual(noneValue);
    });

    it("複数のflatMapをチェーンできる", () => {
      const someValue = O.some(21);
      const double = (x: number) => O.some(x * 2);
      const add1 = (x: number) => O.some(x + 1);
      const result = flatMap(add1)(flatMap(double)(someValue));
      expect(result).toEqual(O.some(43));
    });
  });

  describe("some", () => {
    it("値をSomeにラップする", () => {
      const result = some(42);
      expect(result).toEqual(O.some(42));
    });

    it("同じ値に対して常に同じ出力を返す", () => {
      const result1 = some(42);
      const result2 = some(42);
      expect(result1).toEqual(result2);
    });
  });

  describe("none", () => {
    it("Noneを返す", () => {
      const result = none;
      expect(result).toEqual(O.none);
    });

    it("常に同じNoneを返す", () => {
      const result1 = none;
      const result2 = none;
      expect(result1).toEqual(result2);
    });
  });
});
