import {
  IChoice,
  IHasPassagesUnit,
  IQuiz,
  ISelectionPosition,
  IUnitItems,
} from '../../model';
import { MOCK_QUIZZES } from '@/quiz';
import { EditorState } from 'draft-js';
import { temporal, TemporalState } from 'zundo';
import { create, useStore } from 'zustand';
import { SelectOption } from 'solvook-design-system/form';
import { SelectionStatus } from '@/components/common/SelectionViewer';

export type ThemeType = 'dark' | 'light';

interface ThemeStore {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const isDarkMode =
  typeof window !== 'undefined'
    ? window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: isDarkMode ? 'dark' : 'light',
  setTheme: (theme) => set({ theme }),
}));

interface QuizzesStore {
  quizzes: IQuiz[];
  setQuizzes: (quiz: IQuiz[]) => void;
}

export const useQuizzesStore = create<QuizzesStore>()(
  temporal((set) => ({
    quizzes: [],
    setQuizzes: (quizzes: IQuiz[]) => set({ quizzes }),
  }))
);

interface InfoStore {
  title?: string;
  setTitle: (title: string) => void;
  subTitle?: string;
  setSubTitle: (subtitle: string) => void;
  logo?: string;
  setLogo: (logo?: string) => void;
}

export const useInfoStore = create<InfoStore>((set) => ({
  title: undefined,
  setTitle: (title) => set({ title }),
  subTitle: undefined,
  setSubTitle: (subTitle) => set({ subTitle }),
  logo: undefined,
  setLogo: (logo) => set({ logo }),
}));

export const useQuizzesHistory = <T extends unknown>(
  selector: (state: TemporalState<QuizzesStore>) => T,
  equality?: (a: T, b: T) => boolean
) => useStore(useQuizzesStore.temporal, selector, equality);

export interface QuizStore {
  data: {
    selectionPositions: ISelectionPosition[];
    passageState: EditorState;
    selectedCategory: SelectOption | undefined;
    selectedTitle: SelectOption | undefined;
    quizStatus: SelectionStatus;
    explanation: string | undefined;
    hasFootnote: boolean;
    footnote: string | undefined;
    choices: IChoice[];
  };
  setData: (data: QuizStore['data']) => void;
  // selectionPositions: ISelectionPosition[];
  // setSelectionPositions: (selectionPositions: ISelectionPosition[]) => void;
  // passageState: EditorState;
  // setPassageState: (passageState: EditorState) => void;
  // selectedCategory: SelectOption;
  // setSelectedCategory: (selectedCategory: SelectOption) => void;
  // quizStatus: SelectionStatus;
  // setQuizStatus: (quizStatus: SelectionStatus) => void;
  // explanation: string;
  // setExplanation: (explanation: string) => void;
  // hasFootnote: boolean;
  // setHasFootnote: (hasFootnote: boolean) => void;
  // footnote: string | undefined;
  // setFootnote: (footnote: string | undefined) => void;
  // choices: IChoice[];
  // setChoices: (choices: IChoice[]) => void;
}

export const useQuizStore = create<QuizStore>()(
  temporal((set) => ({
    data: {
      selectionPositions: [],
      passageState: EditorState.createEmpty(),
      selectedCategory: undefined,
      selectedTitle: undefined,
      quizStatus: SelectionStatus.makeSelection,
      explanation: undefined,
      hasFootnote: false,
      footnote: undefined,
      choices: [],
    },
    setData: (data: QuizStore['data']) => set({ data }),
  }))
);

export const useQuizHistory = <T extends unknown>(
  selector: (state: TemporalState<QuizStore>) => T,
  equality?: (a: T, b: T) => boolean
) => useStore(useQuizStore.temporal, selector, equality);

interface LoadControlState {
  selectedCategoryId?: string;
  selectedUnitId?: string;
  itemCount?: number;
  selectedItems?: IHasPassagesUnit[];
  setSelectedCategoryId: (id: string) => void;
  setSelectedUnitId: (id: string) => void;
  setItemCount: (count: number) => void;
  setSelectedItems: (items: IHasPassagesUnit[]) => void;
}

export const useLoadControlStore = create<LoadControlState>((set) => ({
  selectedCategoryId: undefined,
  selectedUnitId: undefined,
  itemCount: undefined,
  selectedItems: undefined,
  setSelectedCategoryId: (id: string) => {
    set({ selectedCategoryId: id });
  },
  setSelectedUnitId: (id: string) => {
    set({ selectedUnitId: id });
  },
  setItemCount: (count: number) => {
    set({ itemCount: count });
  },
  setSelectedItems: (items: IHasPassagesUnit[]) => {
    set({ selectedItems: items });
  },
}));

interface EditorStatusState {
  status: 'update' | 'notUpdate';
  setStatus: (status: 'update' | 'notUpdate') => void;
}

export const useEditorStatusState = create<EditorStatusState>((set) => ({
  status: 'notUpdate',
  setStatus: (status) => {
    set({ status });
  },
}));
