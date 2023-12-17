import { css, Theme } from '@emotion/react';
import { Spacing, Typography } from 'solvook-design-system';
import { Input } from 'solvook-design-system/form';
import Quiz from '../common/Quiz';
import { QuizTypes } from '../../../constants';
import { IQuiz } from '../../../model';

const QuizEditor = ({
  quiz,
  quizType,
}: {
  quiz: IQuiz;
  quizType: QuizTypes;
}) => {
  return (
    <>
      <Quiz quiz={quiz} showAnswer={false} />
      {quizType === QuizTypes.hMultipleChoice && (
        <div css={multipleChoiceWrapCSS}>
          <div css={blankAnswerCSS}>
            <span>1. </span> <Input />
          </div>
          <div css={blankAnswerCSS}>
            <span>2. </span> <Input />
          </div>
          <div css={blankAnswerCSS}>
            <span>3. </span> <Input />
          </div>
          <div css={blankAnswerCSS}>
            <span>4. </span> <Input />
          </div>
          <div css={blankAnswerCSS}>
            <span>5. </span> <Input />
          </div>
        </div>
      )}
    </>
  );
};

export default QuizEditor;

const blankAnswerCSS = css`
  display: flex;
  align-items: center;
  margin-top: ${Spacing.small}px;
  justify-content: center;

  input {
    width: 350px !important;
  }

  span {
    margin-right: ${Spacing.small}px;
  }
`;

const multipleChoiceWrapCSS = css`
  margin: ${Spacing.medium}px auto;
`;
