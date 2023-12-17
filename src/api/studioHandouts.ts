import { toQueryString } from '@/utils/misc';
import { api } from '.';
import {
  IPagination,
  IStudioHandout,
  IStudioHandoutDetail,
  IStudioHandoutPayload,
} from '../../model';

export const getStudioHandouts = async ({
  offset = 0,
  limit = 10,
  sort = 'updatedAt',
  isOnlyForSale = false,
}: {
  offset: number;
  limit?: number;
  sort?: string;
  isOnlyForSale?: boolean;
}) => {
  const { data } = await api.get<IPagination<IStudioHandout>>(
    `/studio-handouts/${toQueryString({ offset, limit, sort, isOnlyForSale })}`
  );
  return data;
};

export const getStudioHandout = async (id: string) => {
  const { data } = await api.get<IStudioHandoutDetail>(
    `/studio-handouts/${id}/`
  );
  return data;
};

export const postStudioHandout = async ({
  originHandoutId,
  title,
  object,
  items,
}: IStudioHandoutPayload) => {
  const { data } = await api.post('/studio-handouts/', {
    originHandoutId,
    title,
    object,
    items,
  });
  return data;
};

export const patchStudioHandout = async ({
  handoutId,
  title,
  object,
  items,
}: IStudioHandoutPayload & { handoutId: string }) => {
  const { data } = await api.patch(`/studio-handouts/${handoutId}/`, {
    title,
    object,
    items,
  });
  return data;
};

export const postStudioHandoutPdf = async (id: string, html: string) => {
  const { data } = await api.post(`/studio-handouts/${id}/pdf/`, {
    html,
  });
  return data;
};

export const deleteStudioHandout = async (id: string) => {
  const { data } = await api.delete(`/studio-handouts/${id}/`);
  return data;
};
