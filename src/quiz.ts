import { QuizCategory, QuizTypes } from '../constants';

export const MOCK_QUIZZES = [
  {
    id: '0',
    explanation:
      '(b) slender->full: 피지에서는 체중을 줄이는 방법에 관한 책들이 베스트셀러가 될 가능성이 희박하다는 내용에 이어지는 문장이며, 과체중이 되는 것에 대한 염려가 다른 사회만큼 강하지 않다는 내용이 이어지므로 full로 고쳐야 적절하다. ',
    footnote: '',
    paragraph: '1번',
    source: '빠른독해 바른독해 유형독해',
    passage:
      'Unlike in many other parts of the world, books about how to lose weight have a slim chance of becoming bestsellers in Fiji. This is because Fijian culture traditionally prizes a full figure, so fear of being overweight is not as strong as it is in other societies. This particular Fijian standard for beauty is due in part to the culture’s emphasis on community. In a nation where affection for friends is often demonstrated through the offering and serving of food, being on a diet is considered to be somewhat socially unacceptable. Consequently, the pressure to be thin, present in many other societies, is largely absent in Fiji.',
    unit: '미니테스트 2',
    selectionPositions: [
      {
        originText:
          'books about how to lose weight have a slim chance of becoming bestsellers in Fiji',
        start: 9,
        end: 23,
      },
      {
        changeText:
          'This is because Fijian culture traditionally prizes a slender figure',
        originText:
          'This is because Fijian culture traditionally prizes a full figure',
        start: 25,
        end: 34,
      },
      {
        start: 52,
        originText:
          'This particular Fijian standard for beauty is due in part to the culture’s emphasis on community',
        end: 69,
      },
      {
        originText:
          'being on a diet is considered to be somewhat socially unacceptable',
        start: 89,
        end: 99,
      },
      {
        originText:
          'the pressure to be thin, present in many other societies, is largely absent in Fiji',
        end: 119,
        start: 103,
      },
    ],
    choices: [
      {
        isAnswer: false,
        title: '(a)',
      },
      {
        title: '(b)',
        isAnswer: true,
      },
      {
        title: '(c)',
        isAnswer: false,
      },
      {
        isAnswer: false,
        title: '(d)',
      },
      {
        isAnswer: false,
        title: '(e)',
      },
    ],
    title: '밑줄 친 (a)～(e) 중에서 문맥상 내용의 쓰임이 적절하지 않은 것은?',
    category: 'vocabulary-underline',
  },
];

export const choiceNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
export const choiceLargeAlphabets = [
  '(A)',
  '(B)',
  '(C)',
  '(D)',
  '(E)',
  '(G)',
  '(H)',
];
export const choiceSmallAlphabets = [
  '(a)',
  '(b)',
  '(c)',
  '(d)',
  '(e)',
  '(g)',
  '(h)',
];
