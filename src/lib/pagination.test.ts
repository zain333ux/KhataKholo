import { describe, expect, it } from "vitest";

import { normalizePagination } from "./pagination";

describe("normalizePagination", () => {
  it("falls back for invalid pages and limits", () => {
    expect(normalizePagination(Number.NaN, -1)).toEqual({ page: 1, limit: 20 });
    expect(normalizePagination(0, 0)).toEqual({ page: 1, limit: 20 });
  });

  it("caps oversized page sizes", () => {
    expect(normalizePagination(3, 500)).toEqual({ page: 3, limit: 100 });
    expect(normalizePagination(999_999, 20)).toEqual({ page: 500, limit: 20 });
  });
});
