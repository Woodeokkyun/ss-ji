import { api } from '.';
import { ICategories, IMetaData, IUnitItems, IUnits } from '../../model';

export const getCategories = async () => {
  const { data } = await api.get<ICategories>(`/sources/category/`);
  return data;
};

export const getUnits = async (id: string) => {
  const { data } = await api.get<IUnits>(`/sources/${id}/units/`);
  return data;
};

export const getUnitItems = async (sourceId: string, unitIds: string) => {
  // const query = toQueryString({
  //   unitIds: JSON.stringify(unitIds),
  // });
  const { data } = await api.get<IUnitItems>(
    `/sources/${sourceId}/items/${
      unitIds !== 'all' ? `?unitIds[]=${unitIds}` : ''
    }`
  );
  return data;
};

export const getMetadata = async () => {
  const { data } = await api.get<{ metadata: IMetaData[] }>(
    `/sources/metadata/`
  );
  return data;
};
