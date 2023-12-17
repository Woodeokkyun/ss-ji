import { AxiosError } from 'axios';
import { QuizCategory, QuizTypes } from './constants';

export interface IPagination<T> {
  data: T[];
  resource: string;
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

export interface ISolvookAPIError extends AxiosError {
  response: {
    status: number;
    data: {
      code: number;
      errors: { [key: string]: string[] };
      message?: string;
    };
  };
}

export interface IDragItem {
  index: number;
  id: string;
  type: string;
}

export const ItemTypes = {
  CARD: 'card',
};

export interface ISelectItem {
  value: any;
  label: any;
}

export interface ISelectionPosition {
  start: number;
  end: number;
  changeText?: string;
  originText?: string;
  isSwitched?: boolean;
}

export interface IUnitPassage {
  id: string;
  title: string;
  source: string;
  unit: string;
  paragraph: string;
  content: string;
  footnote?: string;
  handoutItems: IQuiz[];
  boardItems: IQuiz[];
}

export interface IQuiz {
  id: string;
  title: string;
  passage: string;
  passageId?: string;
  choices?: IChoice[];
  answer?: string[];
  selectionPositions?: ISelectionPosition[];
  explanation?: string;
  type?: QuizTypes;
  category: string;
  source?: string;
  unit?: string;
  paragraph?: string;
  footnote?: string;
}

export interface IChoice {
  title: string;
  isAnswer: boolean;
}

export interface IQuizCategory {
  label: string;
  value: QuizCategory;
  typesWithTitle?: IQuizTypes[];
}

export interface IQuizCategories {
  title?: string | null;
  categories: IQuizCategory[];
}

export interface IQuizTypes {
  title?: string;
  types: {
    label: string;
    value: QuizTypes;
  }[];
}

export interface IStudioHandout {
  id: string;
  licenseId: string;
  title: string;
  subTitle?: string;
  object: IStudioHandoutObject;
  isForSale: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IStudioHandoutDetail {
  id: string;
  title: string;
  object: IStudioHandoutObject;
  pdfInfo: IPdfInfo;
  items: IQuiz[];
  createAt: string;
  updateAt: string;
  licenseId: string;
}

export interface IStudioHandoutPayload {
  originHandoutId?: string;
  title?: string;
  object?: IStudioHandoutObject;
  items?: IQuiz[];
}

export interface IStudioHandoutObject {
  logoUrl?: string;
  subTitle?: string;
}

export interface IPdfInfo {
  url: string;
  jobStatus: 'ready' | 'started' | 'completed';
}

export interface IUser {
  user: {
    id: string;
  };
}

export interface ICategory {
  title: string;
  typeCategories: {
    title: string;
    seriesCategories: {
      title: string;
      sourceCategories: {
        id: string;
        title: string;
      }[];
    }[];
  }[];
}

export interface ICategories {
  categories: ICategory[];
}

export interface IUnit {
  title: string;
  id: string;
}

export interface IHasPassagesUnit extends IUnit {
  passages?: IUnitPassage[];
}

export interface IUnits {
  id: string;
  title: string;
  units: IUnit[];
}

export interface IUnitItems {
  id: string;
  title: string;
  units: IHasPassagesUnit[];
}

export interface IMetaData {
  title: string;
  units: {
    id: string;
    title: string;
    paragraphs: {
      id: string;
      title: string;
      content?: string;
    }[];
  }[];
}

export interface IAnswerType {
  value: string;
  label: string;
  itemTypes: IItemType[];
}

export interface IItemType {
  value: string;
  label: string;
  titleTypes: ITitleType[];
}

export interface ITitleType {
  value: string;
  label: string;
  defaultTitle: string;
  exampleItemObject: JSON;
}
