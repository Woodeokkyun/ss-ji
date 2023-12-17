import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import SyncLoader from 'react-spinners/SyncLoader';

import { UsePaginationQueryResult } from '../../utils/query';
import { IPagination } from '../../../model';
import { css, useTheme } from '@emotion/react';

type Props<T> = {
  query: UsePaginationQueryResult<T>;
};

export const Pagination = <T extends IPagination<unknown>>({
  query,
}: Props<T>) => {
  const { ref, inView } = useInView();
  const theme = useTheme();

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    if (!isFetchingNextPage && hasNextPage && inView) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, inView, fetchNextPage]);

  return hasNextPage ? (
    <div
      ref={ref}
      onClick={isFetchingNextPage ? undefined : () => fetchNextPage()}
      css={LoadingCSS}
    >
      <SyncLoader color={theme.colors.primary} size={10} />
    </div>
  ) : null;
};

export default Pagination;

const LoadingCSS = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
`;
