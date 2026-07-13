export type Pagination = {
  page: number;
  limit: number;
};

export function normalizePagination(page: number, limit: number): Pagination {
  return {
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 500) : 1,
    limit: Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, 100) : 20,
  };
}
