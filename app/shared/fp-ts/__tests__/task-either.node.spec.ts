import { describe, it, expect } from "vitest";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { getOrElse, map, flatMap } from "../task-either";
import type { AppError } from "@/application/common/errors";

describe("task-either", () => {
  describe("getOrElse", () => {
    it("Rightの場合は値を返す", async () => {
      const right = TE.right(42);
      const result = await getOrElse(0)(right)();
      expect(result).toBe(42);
    });

    it("Leftの場合はデフォルト値を返す", async () => {
      const left: TE.TaskEither<AppError, number> = TE.left({
        _tag: "ValidationError",
        field: "test",
        message: "validation error",
      });
      const result = await getOrElse(0)(left)();
      expect(result).toBe(0);
    });

    it("同じ入力に対して常に同じ出力を返す（純粋関数）", async () => {
      const right = TE.right(42);
      const result1 = await getOrElse(0)(right)();
      const result2 = await getOrElse(0)(right)();
      expect(result1).toBe(result2);
      expect(result1).toBe(42);
    });
  });

  describe("map", () => {
    it("Rightの場合は値を変換して返す", async () => {
      const right = TE.right(21);
      const double = (x: number) => x * 2;
      const result = await map(double)(right)();
      expect(result).toEqual(E.right(42));
    });

    it("Leftの場合はLeftのまま返す", async () => {
      const left: TE.TaskEither<AppError, number> = TE.left({
        _tag: "ValidationError",
        field: "test",
        message: "validation error",
      });
      const double = (x: number) => x * 2;
      const result = await map(double)(left)();
      expect(result).toEqual(
        E.left({
          _tag: "ValidationError",
          field: "test",
          message: "validation error",
        })
      );
    });

    it("複数のmapをチェーンできる", async () => {
      const right = TE.right(21);
      const double = (x: number) => x * 2;
      const add1 = (x: number) => x + 1;
      const result = await map(add1)(map(double)(right))();
      expect(result).toEqual(E.right(43));
    });
  });

  describe("flatMap", () => {
    it("Rightの場合で、flatMapの結果がRightの場合は変換された値を返す", async () => {
      const right = TE.right(21);
      const double = (x: number) => TE.right(x * 2);
      const result = await flatMap(double)(right)();
      expect(result).toEqual(E.right(42));
    });

    it("Rightの場合で、flatMapの結果がLeftの場合はLeftを返す", async () => {
      const right = TE.right(21);
      const toError = (_x: number): TE.TaskEither<AppError, never> =>
        TE.left({
          _tag: "ValidationError",
          field: "test",
          message: "validation error",
        });
      const result = await flatMap(toError)(right)();
      expect(result).toEqual(
        E.left({
          _tag: "ValidationError",
          field: "test",
          message: "validation error",
        })
      );
    });

    it("Leftの場合はLeftのまま返す", async () => {
      const left: TE.TaskEither<AppError, number> = TE.left({
        _tag: "ValidationError",
        field: "test",
        message: "original error",
      });
      const double = (x: number) => TE.right(x * 2);
      const result = await flatMap(double)(left)();
      expect(result).toEqual(
        E.left({
          _tag: "ValidationError",
          field: "test",
          message: "original error",
        })
      );
    });

    it("複数のflatMapをチェーンできる", async () => {
      const right = TE.right(21);
      const double = (x: number) => TE.right(x * 2);
      const add1 = (x: number) => TE.right(x + 1);
      const result = await flatMap(add1)(flatMap(double)(right))();
      expect(result).toEqual(E.right(43));
    });
  });
});
