export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T | null;
  errors?: Record<string, string[]>;
}

export interface Pagination {
  numPerPage: number;
  currPage: number;
  totalEntries: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: Pagination;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortParams<T extends string = string> {
  sort?: T;
  order?: SortDirection;
}

export const EMPTY_PAGINATION: Pagination = {
  numPerPage: 10,
  currPage: 1,
  totalEntries: 0,
  totalPages: 0,
};

export function emptyPaginatedData<T>(): PaginatedData<T> {
  return {
    items: [],
    pagination: { ...EMPTY_PAGINATION },
  };
}
