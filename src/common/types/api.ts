export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  code: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = ApiSuccess<{ items: T[]; meta: PaginationMeta }> | ApiFailure;
