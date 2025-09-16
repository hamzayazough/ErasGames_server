import {QueryFunctionContext} from '@tanstack/react-query';

// Common query configuration
export const defaultQueryOptions = {
  staleTime: 30_000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime in v5)
  retry: 1,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper for creating paginated query keys
export function createPaginationQueryKey(
  baseKey: string[],
  params: PaginationParams,
): string[] {
  return [...baseKey, 'paginated', JSON.stringify(params)];
}

// Helper for query function context typing
export type QueryContext<TParams = unknown> = QueryFunctionContext<
  (string | TParams)[]
>;
