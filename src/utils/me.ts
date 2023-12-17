import { getMe } from '@/api/account';
import { IUser } from '../../model';
import { UseQueryOptions, useQuery } from 'react-query';

export function useMe(options?: UseQueryOptions<IUser>) {
  const query = useQuery<IUser>('me', () => getMe(), {
    staleTime: 3600000,
    cacheTime: 3600000,
    suspense: false,
    ...options,
  });

  return query;
}
