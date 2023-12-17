import DragItem from '../common/DragItem';
import { Typography, Radius, Spacing, Toggle } from 'solvook-design-system';
import { css, Theme } from '@emotion/react';
import { useCallback, useRef, useState } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import Quiz from '../common/Quiz';
import { IQuiz } from '../../../model';
import Card from '../common/Card';
import classNames from 'classnames';

interface QuizzesProps {
  quizzes: IQuiz[];
  onClick?: (quiz: IQuiz) => void;
  selectedQuiz?: IQuiz;
  moveItem: (result: DropResult) => void;
  removeQuiz: (quiz: IQuiz) => void;
  openEditQuiz: (quiz: IQuiz) => void;
}

const QuizCardList = ({
  quizzes,
  onClick,
  selectedQuiz,
  moveItem,
  removeQuiz,
  openEditQuiz,
}: QuizzesProps) => {
  const quizzesRef = useRef<null | HTMLDivElement>(null);
  const [isSimplified, setIsSimplified] = useState(false);

  const renderQuiz = useCallback(
    (quiz: IQuiz, index: number) => {
      if (!isSimplified) {
        return (
          <Card
            key={`quiz-card-${index}-${isSimplified ? 'simplified' : ''}`}
            id={quiz.id}
            className={classNames(
              'quiz-card',
              quiz.id === selectedQuiz?.id ? 'selected' : ''
            )}
          >
            <Quiz
              quiz={quiz}
              index={index + 1}
              isSimplified={isSimplified}
              removeQuiz={removeQuiz}
              openEditQuiz={openEditQuiz}
              showSaveBoard
            />
          </Card>
        );
      }
      return (
        <DragItem
          name="left-quiz"
          id={quiz.id}
          index={index}
          moveItem={moveItem}
          key={`dragable-quiz-${index}`}
        >
          <Card
            id={quiz.id}
            className={classNames(
              'quiz-card',
              quiz.id === selectedQuiz?.id ? 'selected' : ''
            )}
          >
            <Quiz
              quiz={quiz}
              index={index + 1}
              isSimplified={isSimplified}
              removeQuiz={removeQuiz}
              openEditQuiz={openEditQuiz}
              showSaveBoard
            />
          </Card>
        </DragItem>
      );
    },
    [moveItem, onClick, selectedQuiz, isSimplified, removeQuiz, openEditQuiz]
  );

  return (
    <div ref={quizzesRef} css={quizSidePeekCSS}>
      <div className="quiz-side-peek-scroll-wrapper">
        <DragDropContext onDragEnd={moveItem}>
          <Droppable droppableId="left-drag-quiz">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {quizzes.map((quiz, index) => {
                  return renderQuiz(quiz, index);
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <div className="quiz-sidepeek-footer">
        <div className="show-simplified">
          <p>지시문만 보기</p>
          <Toggle
            name="simplified"
            onChange={(e) => setIsSimplified(e.target.checked)}
            checked={isSimplified}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizCardList;

const quizSidePeekCSS = (theme: Theme) => css`
  width: 480px;
  height: calc(100vh - 88px);
  margin-right: ${Spacing.xlarge}px;
  background-color: ${theme.var.sol_gray_100};
  overflow: hidden;
  padding: ${Spacing.medium}px ${Spacing.medium}px ${Spacing.xxxlarge}px;
  flex: none;

  .quiz-side-peek-scroll-wrapper {
    height: calc(100vh - 164px);
    overflow: scroll;
  }

  .quiz-card {
    margin-bottom: ${Spacing.medium}px;
    box-shadow: 0px 2px 8px 0px #00000026;
  }

  .quiz-sidepeek-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 1;
    width: 480px;
    background-color: ${theme.var.white};
    border-top: 1px solid ${theme.border.light};
    padding: 0 ${Spacing.medium}px;
    margin-left: -${Spacing.medium}px;

    .show-simplified {
      display: flex;
      margin-left: auto;
      align-items: center;
      padding: ${Spacing.medium}px 0;

      p {
        ${Typography.body14}
        color: ${theme.var.gray400};
        margin-right: ${Spacing.small}px;
      }
    }
  }

  .created {
    animation: target-fade 2s ease-in-out;
  }

  @keyframes target-fade {
    0% {
      background-color: rgba(173, 216, 230, 0.8);
    }
    100% {
      background-color: rgba(173, 216, 230, 0);
    }
  }
`;
