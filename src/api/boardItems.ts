import { api } from '.';
import { IQuiz } from '../../model';

export const postBoardItem = async ({
  id,
  title,
  passage,
  passageId,
  choices,
  answer,
  selectionPositions,
  explanation,
  type,
  category,
  source,
  unit,
  paragraph,
  footnote,
}: IQuiz) => {
  const { data } = await api.post('/board-items/', {
    id,
    title,
    passage,
    passageId,
    choices,
    answer,
    selectionPositions,
    explanation,
    type,
    category,
    source,
    unit,
    paragraph,
    footnote,
  });
  return data;
};

export const deleteBoardItem = async (id: string) => {
  const { data } = await api.delete(`/board-items/${id}/`);
  return data;
};
