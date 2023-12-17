import { apiMarket } from '.';
import { IUser } from '../../model';

export const getMe = async () => {
  const { data } = await apiMarket.post<IUser>(`/accounts/me/`);
  return data;
};
