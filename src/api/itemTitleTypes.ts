import { api } from '.';
import { IAnswerType } from '../../model';

export const getItemTitleTypes = async (subject: string = 'en') => {
  const { data } = await api.get<{ answerTypes: IAnswerType[] }>(
    `/item-title-types/${subject}/`
  );
  return data;
};
