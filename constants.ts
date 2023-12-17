import { IQuizCategories } from './model';
import { SelectOption } from 'solvook-design-system/form';

export const enum StudioTabs {
  info = 'info',
  twins = 'twins',
  bookmark = 'bookmark',
  editor = 'editor',
  addConcept = 'add-concept',
  salsVerification = 'sals-verification',
}

export const enum QuizTypes {
  hMultipleChoice = 'h-multiple-choice',
  vMultipleChoice = 'v-multiple-choice',
  essay = 'essay',
  shortEssay = 'short-essay',
  underline = 'underline',
}

export const enum QuizCategory {
  language = 'language',
  grammar = 'grammar',
  vocabulary = 'vocabulary',
}

export const EngQuizItems: IQuizCategories[] = [
  {
    categories: [
      {
        label: '어법',
        value: QuizCategory.language,
        typesWithTitle: [
          {
            title: '객관식',
            types: [
              {
                label: '가로형',
                value: QuizTypes.hMultipleChoice,
              },
              {
                label: '세로형',
                value: QuizTypes.vMultipleChoice,
              },
              {
                label: '밑줄',
                value: QuizTypes.underline,
              },
              // {
              //   label: '(A), (B)',
              //   value: QuizTypes.multipleChoice,
              // },
              // {
              //   label: '(A), (B), (C)',
              //   value: QuizTypes.multipleChoice,
              // },
            ],
          },
          {
            title: '서술형',
            types: [
              {
                label: '단답형',
                value: QuizTypes.shortEssay,
              },
              {
                label: '서술형',
                value: QuizTypes.essay,
              },
            ],
          },
        ],
      },
      {
        label: '문법',
        value: QuizCategory.grammar,
        typesWithTitle: [
          {
            title: '객관식',
            types: [
              {
                label: '가로형',
                value: QuizTypes.hMultipleChoice,
              },
              {
                label: '세로형',
                value: QuizTypes.vMultipleChoice,
              },
            ],
          },
          {
            title: '서술형',
            types: [
              {
                label: '단답형',
                value: QuizTypes.shortEssay,
              },
            ],
          },
        ],
      },
      // {
      //   label: '제목',
      //   value: 'title',
      // },
      // {
      //   label: '주장',
      //   value: 'claim',
      // },
      // {
      //   label: '요지',
      //   value: 'main-idea',
      // },
    ],
  },
  // {
  //   title: '어법',
  //   categories: [
  //     {
  //       label: '어법1',
  //       value: 'grammar-1',
  //     },
  //     {
  //       label: '어법2',
  //       value: 'grammar-2',
  //     },
  //     {
  //       label: '어법3',
  //       value: 'grammar-3',
  //     },
  //   ],
  // },
  // {
  //   title: '어휘',
  //   categories: [
  //     {
  //       label: '어휘1',
  //       value: 'grammar-1',
  //     },
  //     {
  //       label: '어휘2',
  //       value: 'grammar-2',
  //     },
  //     {
  //       label: '어휘3',
  //       value: 'grammar-3',
  //     },
  //   ],
  // },
  // {
  //   title: '어법',
  //   categories: [
  //     {
  //       label: '어법1',
  //       value: 'grammar-1',
  //     },
  //     {
  //       label: '어법2',
  //       value: 'grammar-2',
  //     },
  //     {
  //       label: '어법3',
  //       value: 'grammar-3',
  //     },
  //   ],
  // },
  // {
  //   title: '어휘',
  //   categories: [
  //     {
  //       label: '어휘1',
  //       value: 'grammar-1',
  //     },
  //     {
  //       label: '어휘2',
  //       value: 'grammar-2',
  //     },
  //     {
  //       label: '어휘3',
  //       value: 'grammar-3',
  //     },
  //   ],
  // },
  // {
  //   title: '어법',
  //   categories: [
  //     {
  //       label: '어법1',
  //       value: 'grammar-1',
  //     },
  //     {
  //       label: '어법2',
  //       value: 'grammar-2',
  //     },
  //     {
  //       label: '어법3',
  //       value: 'grammar-3',
  //     },
  //   ],
  // },
  // {
  //   title: '어휘',
  //   categories: [
  //     {
  //       label: '어휘1',
  //       value: 'grammar-1',
  //     },
  //     {
  //       label: '어휘2',
  //       value: 'grammar-2',
  //     },
  //     {
  //       label: '어휘3',
  //       value: 'grammar-3',
  //     },
  //   ],
  // },
];

export const QuizCategories: SelectOption[] = [
  {
    label: '어법 (밑줄형)',
    value: 'grammar-underline',
  },
  {
    label: '어법 (선택형)',
    value: 'grammar-choice',
  },
  {
    label: '어휘 (밑줄형)',
    value: 'vocabulary-underline',
  },
  {
    label: '어휘 (선택형)',
    value: 'vocabulary-choice',
  },
  // {
  //   label: '주제 (객관식)',
  //   value: 'subject-choice',
  // },
  // {
  //   label: '제목 (객관식)',
  //   value: 'title-choice',
  // },
  // {
  //   label: '주장 (객관식)',
  //   value: 'opinion-choice',
  // },
  // {
  //   label: '목적 (객관식)',
  //   value: 'purpose-choice',
  // },
  // {
  //   label: '일치 (객관식)',
  //   value: 'match-choice',
  // },
  // {
  //   label: '불일치 (객관식)',
  //   value: 'mismatch-choice',
  // },
];

export const DefaultCategoryQuizTitles: { [key: string]: string } = {
  'grammar-underline':
    '밑줄 친 (a)～(e) 중에서 어법상 내용의 쓰임이 적절하지 않은 것은?',
  'grammar-choice':
    '(A), (B), (C)의 각 네모 안에서 어법에 맞는 내용으로 가장 적절한 것은?',
  'vocabulary-underline':
    '밑줄 친 (a)～(e) 중에서 문맥상 내용의 쓰임이 적절하지 않은 것은?',
  'vocabulary-choice':
    '(A), (B), (C)의 각 네모 안에서 문맥에 맞는 내용으로 가장 적절한 것은?',
  'subject-choice': '글의 주제로 가장 적절한 것은?',
  'title-choice': '글의 제목으로 가장 적절한 것은?',
  'opinion-choice': '글의 주장으로 가장 적절한 것은?',
  'purpose-choice': '글의 목적으로 가장 적절한 것은?',
  'match-choice': '글의 내용과 일치하는 것은?',
  'mismatch-choice': '글의 내용과 일치하지 않는 것은?',
};
