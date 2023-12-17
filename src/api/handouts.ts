import { api } from '.';
import { IStudioHandoutDetail } from '../../model';

export const getHandout = async (id: string) => {
  const { data } = await api.get<IStudioHandoutDetail>(`/handouts/${id}/`);
  return data;
};
