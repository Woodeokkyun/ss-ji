import { css, Theme, useTheme } from '@emotion/react';
import { IQuiz } from '../../../model';
import { Spacing, Typography, Sizes, Radius } from 'solvook-design-system';
import { Icon, Copy, Delete } from 'solvook-design-system/icon';
import { QuizCategories, QuizTypes } from '../../../constants';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import DragItem from '../common/DragItem';
import Image from '../common/Image';
import { useRouter } from 'next/router';
import { getRouterQuery } from '@/utils/query';
const StudioInfoList = ({
  quizzes,
  moveItem,
  moveQuizzesScroll,
  copyQuiz,
  removeQuiz,
}: {
  quizzes: IQuiz[];
  moveItem: (result: DropResult) => void;
  moveQuizzesScroll: (quizId: string) => void;
  copyQuiz: (quiz: IQuiz, index: number) => void;
  removeQuiz: (quiz: IQuiz) => void;
}) => {
  const router = useRouter();
  const userId = getRouterQuery(router.query.userId);

  const renderQuiz = (quiz: IQuiz, index: number) => {
    return (
      <DragItem
        name="quiz-info"
        id={quiz.id}
        index={index}
        moveItem={moveItem}
        onClick={() => moveQuizzesScroll(quiz.id)}
        handle
      >
        <StudioInfoListItem
          quiz={quiz}
          index={index}
          copyQuiz={copyQuiz}
          removeQuiz={removeQuiz}
        />
      </DragItem>
    );
  };

  return (
    <div css={StudioInfoListWrapperCSS}>
      <div css={StudioInfoListCSS}>
        <div css={StudioInfoListHeaderCSS}>
          <p>#</p>
          <p>문제 유형</p>
          <p>지문 출처</p>
          <p></p>
          <p></p>
        </div>
        <DragDropContext onDragEnd={moveItem}>
          <Droppable droppableId="quiz-info">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {quizzes.map((quiz, index) => {
                  return (
                    <div
                      key={`dragable-quiz-list-${index}`}
                      id={`quiz-info-${quiz.id}`}
                    >
                      {renderQuiz(quiz, index)}
                    </div>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default StudioInfoList;

const StudioInfoListHeaderCSS = (theme: Theme) => css`
  display: flex;
  text-align: center;
  align-items: center;
  border-bottom: 1px solid ${theme.var.sol_gray_50};
  padding: ${Spacing.small}px 0;
  gap: ${Spacing.xsmall}px;
  ${Typography.body14};
  position: sticky;
  top: 0;
  background-color: ${theme.var.white};
  z-index: 1;

  *:first-of-type {
    width: 60px;
  }
  *:nth-of-type(2) {
    width: 80px;
    text-align: left;
  }

  *:nth-of-type(3) {
    flex: 4;
    text-align: left;
  }
  *:nth-of-type(4) {
    width: 24px;
  }
  *:nth-of-type(5) {
    width: 24px;
  }
`;

const StudioInfoListWrapperCSS = css`
  overflow: scroll;
  width: 650px;
  margin-left: -16px;
`;
const StudioInfoListCSS = (theme: Theme) => css`
  height: calc(100vh - 154px);
  padding-left: 16px;
`;

const StudioInfoListItemWrapperCSS = (theme: Theme) => css`
  position: relative;

  &:hover {
    .drag-handle {
      display: block;
    }
  }

  .drag-handle {
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translate(0, -50%);
    display: none;
    padding: ${Spacing.xxsmall}px;
    border-radius: ${Radius.small}px;
    border: 1px solid ${theme.border.light};
    background-color: ${theme.var.white};
  }
`;
const StudioInfoListItemCSS = (theme: Theme) => css`
  display: flex;
  text-align: center;
  align-items: center;
  padding: ${Spacing.small}px ${Spacing.small}px ${Spacing.small}px 0;
  gap: ${Spacing.xsmall}px;
  ${Typography.body14};
  cursor: pointer;
  background-color: ${theme.var.white};

  > *:first-of-type {
    width: 60px;
    color: ${theme.colors.mint400};
    font-weight: bold;
  }
  > *:nth-of-type(2) {
    width: 80px;
    text-align: left;
  }
  > *:nth-of-type(3) {
    flex: 4;
    text-align: left;
  }
  > *:nth-of-type(4) {
    width: 24px;
  }
  > *:nth-of-type(5) {
    cursor: move;
    width: 24px;
  }
`;

const StudioInfoListItem = ({
  quiz,
  index,
  copyQuiz,
  removeQuiz,
  dragHandleProps,
}: {
  quiz: IQuiz;
  index: number;
  copyQuiz: (quiz: IQuiz, index: number) => void;
  removeQuiz: (quiz: IQuiz) => void;
  dragHandleProps?: any;
}) => {
  const theme = useTheme();
  const renderType = (type?: string) => {
    switch (type) {
      case QuizTypes.vMultipleChoice:
      case QuizTypes.hMultipleChoice:
        return '객관식';
      case QuizTypes.essay:
        return '주관식';
      default:
        return type;
    }
  };

  const renderCategory = (category: string) => {
    return QuizCategories.find((item) => item.value === category)?.label;
    // switch (category) {

    //   case QuizCategory.language:
    //     return '어법';
    //   case QuizCategory.vocabulary:
    //     return '어휘';
    //   case QuizCategory.grammar:
    //     return '문법';
    //   default:
    //     return category;
    // }
  };

  return (
    <div css={StudioInfoListItemWrapperCSS}>
      <div {...dragHandleProps} className="drag-handle">
        <Image src="/assets/handle.png" alt="handle" width={6} height={12} />
      </div>
      <div css={StudioInfoListItemCSS} className="studio-info-list">
        <div>
          <p>{index + 1}</p>
        </div>
        {/* <div>
          <p>{renderType(quiz?.type)}</p>
        </div> */}
        <div>
          <p className="ellipsis">{renderCategory(quiz.category)}</p>
        </div>
        <div className="ellipsis">
          <p className="ellipsis">
            <span>{quiz.source}</span>
            {quiz.unit && <span>ㆍ{quiz.unit}</span>}
            {quiz.paragraph && <span>ㆍ{quiz.paragraph}</span>}
          </p>
        </div>
        <div>
          <Icon
            onClick={(e) => {
              e.stopPropagation();
              copyQuiz(quiz, index);
            }}
            icon={Copy}
            color={theme.var.gray400}
            size={Sizes.small}
          />
        </div>
        <div>
          <Icon
            onClick={(e) => {
              e.stopPropagation();
              removeQuiz(quiz);
            }}
            icon={Delete}
            color={theme.var.gray400}
            size={Sizes.small}
          />
        </div>
      </div>
    </div>
  );
};
