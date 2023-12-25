import { choiceNumbers } from '@/quiz';
import { css, Theme, useTheme } from '@emotion/react';
import { Spacing, Typography, Sizes, Radius } from 'solvook-design-system';
import { Textarea } from 'solvook-design-system/form';
import { Icon, Edit, Delete } from 'solvook-design-system/icon';

import { IQuiz } from '../../../model';
import { RefObject } from 'react';
import SelectionViewer, {
  SelectionStatus,
  SelectionType,
} from './SelectionViewer';
import Image from './Image';
import { useMutation } from 'react-query';
import { postBoardItem } from '@/api/boardItems';
import { Mixpanel } from '@/utils/mixpanel';
import classNames from 'classnames';

const Quiz = ({
  ref,
  quiz,
  index,
  isSimplified = false,
  showAnswer = true,
  removeQuiz,
  openEditQuiz,
  showSaveBoard = false,
}: {
  ref?: RefObject<HTMLDivElement>;
  quiz: IQuiz;
  index?: number;
  isSimplified?: boolean;
  showAnswer?: boolean;
  removeQuiz?: (quiz: IQuiz) => void;
  openEditQuiz?: (quiz: IQuiz) => void;
  showSaveBoard?: boolean;
}) => {
  const theme = useTheme();

  const { mutate: saveBoard } = useMutation(
    (quiz: IQuiz) => postBoardItem({ ...quiz }),
    {
      onSuccess: () => {
        window.showActionBar({
          title: '보드에 문제를 복사했어요.',
          status: 'success',
        });
        Mixpanel.track('Add Board', {
          source: quiz.source,
          unit: quiz.unit,
          paragraph: quiz.paragraph,
        });
      },
    }
  );

  const renderSquareChoice = (choice: string) => {
    const splitChoice = choice.split('/');
    return (
      <div className="square-choice">
        <span>{splitChoice[0]}</span>
        <span>{splitChoice[1]}</span>
        <span>{splitChoice[2]}</span>
      </div>
    );
  };

  const isUnderline =
    quiz.category.includes('grammar-underline') ||
    quiz.category.includes('vocabulary-underline');
  const isSquare =
    quiz.category.includes('grammar-choice') ||
    quiz.category.includes('vocabulary-choice');
  console.log(quiz);
  return (
    <div
      css={quizCSS}
      onClick={() => {
        openEditQuiz && !isSimplified && openEditQuiz(quiz);
      }}
    >
      {isSimplified ? (
        <div css={simplifiedQuizCSS}>
          {index ? <h3 className="quiz-index">{index}</h3> : null}
          <h4 className="title--simplified">{quiz.title}</h4>
        </div>
      ) : (
        <>
          {index ? (
            <div className="quiz-header">
              {showSaveBoard && (
                <div className="quiz-header__btn-wrap">
                  <button
                    className="icon-btn save-board-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveBoard(quiz);
                    }}
                  >
                    <Image
                      src="/assets/ic_save_board.png"
                      alt="save board"
                      width={18}
                      height={17}
                    />
                  </button>
                  {removeQuiz && (
                    <button
                      className="icon-btn remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuiz(quiz);
                      }}
                    >
                      <Icon
                        icon={Delete}
                        size={Sizes.small}
                        color={theme.var.gray600}
                      />
                    </button>
                  )}
                </div>
              )}

              <div className="quiz-header__metadata">
                <h3>{index}</h3>
                <div className="ellipsis">
                  <p className="ellipsis">
                    <span>{quiz.source}</span>
                    {quiz.unit && <span>ㆍ{quiz.unit}</span>}
                    {quiz.paragraph && <span>ㆍ{quiz.paragraph}</span>}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <h4 className="title">{quiz.title}</h4>
          <div className="passage-wrapper">
            {quiz.selectionPositions ? (
              <SelectionViewer
                status={SelectionStatus.readOnly}
                passage={quiz.passage}
                selectionPositions={quiz.selectionPositions}
                type={
                  quiz.selectionPositions.length === 3
                    ? SelectionType.square
                    : SelectionType.underline
                }
              />
            ) : (
              <p className="passage">{quiz.passage}</p>
            )}
          </div>
          {quiz.footnote && <p className="footnote">{quiz.footnote}</p>}
          {quiz.description && (
            <div className="description">
              <p className="description__title">{quiz.description.title}</p>
              <ul className="description__contents">
                {quiz.description.contents.map((content, i) => (
                  <li key={`description-content-${i}`}>{content}</li>
                ))}
              </ul>
            </div>
          )}
          {showAnswer && quiz.answerType === 'choice' && quiz.choices && (
            <div
              className={classNames({
                choices: true,
                horizontal: isUnderline,
              })}
            >
              {quiz.choices.map((choice, i) => {
                return (
                  <p key={`choice-${choice.title}`}>
                    <span className="choice-number">{choiceNumbers[i]}</span>
                    {quiz.selectionPositions && isSquare ? (
                      renderSquareChoice(choice.title)
                    ) : (
                      <span>{choice.title}</span>
                    )}
                  </p>
                );
              })}
            </div>
          )}
          {showAnswer && quiz.answerType === 'essay' && (
            <div className="essay-field">
              <div></div>
              <div></div>
              <div></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;

const quizCSS = (theme: Theme) => css`
  .title {
    margin-bottom: ${Spacing.medium}px;
    word-break: break-word;

    &--simplified {
      margin: 0;
    }
  }

  .passage-wrapper {
  }
  .passage {
    ${Typography.body16}
    line-height: 1.5;

    textarea {
      color: ${theme.var.black} !important;
      -webkit-text-fill-color: ${theme.var.black} !important;
    }
  }
  .footnote {
    ${Typography.body14}
    margin-top: ${Spacing.small}px;
    text-align: right;
  }

  .description {
    border: 1px solid ${theme.var.sol_gray_300};
    padding: ${Spacing.small}px;

    &__title {
      text-align: center;
    }

    &__contents {
      line-height: 1.5;
      
      li {
        list-style: disc;
        margin-left: ${Spacing.small}px;
        margin-top: ${Spacing.small}px;
      }
    }
  }

  .essay-field {
    margin-top: ${Spacing.large}px;

    > div {
      border-bottom: 1px solid ${theme.var.sol_gray_900};
      height: 32px;
    }
  }
  .choices {
    margin-top: ${Spacing.large}px;

    &.horizontal {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      justify-content: space-between;
    }

    .square-choice {
      display: flex;
      align-items: center;
      width: 100%;

      > span {
        width: 100%;
      }
    }

    > p {
      display: flex;
      align-items: center;
      margin-top: ${Spacing.xsmall}px;
      ${Typography.body14}

      .choice-number {
        margin-right: ${Spacing.xsmall}px;
      }
    }
  }

  .quiz-header {
    margin-bottom: ${Spacing.medium}px;

    &__btn-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: ${Spacing.medium}px;
    }

    &__metadata {
      display: flex;
      gap: ${Spacing.xsmall}px;
      color: ${theme.var.gray600};
      align-items: center;

      h3 {
        color: ${theme.colors.mint400};
      }
      p {
        ${Typography.body12}
        color: ${theme.var.sol_gray_500};
      }
    }

    .remove-btn {
      padding: ${Spacing.xsmall}px ${Spacing.small}px;
      border: 1px solid ${theme.border.light};
      border-radius: ${Radius.small}px;
      margin-left: ${Spacing.xsmall}px;
    }

    .save-board-btn {
      width: 40px;
      height: 40px;
      border-radius: ${Radius.small}px;

      &:hover {
        background-color: ${theme.var.sol_gray_0};
      }
  }
`;

const simplifiedQuizCSS = (theme: Theme) => css`
  display: flex;
  align-items: center;

  > h4 {
    ${Typography.h5}
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .quiz-index {
    margin-bottom: 0;
    margin-right: ${Spacing.small}px;
    color: ${theme.colors.mint400};
  }
`;
