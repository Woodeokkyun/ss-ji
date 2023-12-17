import {
  QueryFunction,
  QueryKey,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from 'react-query';
import { IPagination } from '../../model';

export const getRouterQuery = (value: string | string[] | undefined) => {
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return parseInt(value as string);
  }

  return value;
};

export type UsePaginationQueryResult<T> = UseInfiniteQueryResult<T, unknown> & {
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
};

export const usePaginationQuery = <T extends IPagination<unknown>>(
  key: QueryKey,
  fetcher: QueryFunction<T>,
  options?: Partial<UseInfiniteQueryOptions<T, unknown, T, T, QueryKey>>
): UsePaginationQueryResult<T> => {
  const query = useInfiniteQuery(key, fetcher, {
    getNextPageParam: (lastPage) =>
      lastPage.pagination
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
    staleTime: 900000,
    cacheTime: 900000,
    ...options,
  });

  const pages = query.data?.pages;

  return {
    ...query,
    pagination: {
      offset: pages ? pages.length * pages[0].pagination.limit : 0,
      limit: pages ? pages[0].pagination.limit : 0,
      total: pages ? pages[0].pagination.total : 0,
    },
  };
};
