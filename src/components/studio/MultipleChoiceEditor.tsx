import { Textarea, Typography, Sizes, Spacing } from 'solvook-design-system';
import { Icon, Close } from 'solvook-design-system/icon';
import { css, Theme } from '@emotion/react';
import { choiceNumbers } from '@/quiz';
import { IChoice } from '../../../model';
import classNames from 'classnames';
import { SelectionStatus } from '../common/SelectionViewer';
import { QuizStore } from '@/utils/store';

const emptyChoice = {
  title: '',
  isAnswer: false,
};
const MultipleChoiceEditor = ({
  title,
  setTitle,
  choices = [emptyChoice, emptyChoice, emptyChoice, emptyChoice, emptyChoice],
  quizData,
  setData,
  renderExplanations,
}: {
  title?: string;
  setTitle: (title: string) => void;
  passage: string;
  choices?: IChoice[];
  setQuizStatus?: (quizStatus: SelectionStatus) => void;
  quizData: QuizStore['data'];
  setData: (data: QuizStore['data']) => void;
  renderExplanations: () => JSX.Element;
}) => {
  const addMultipleChoice = () => {
    if (choices.length >= 10) {
      alert('선택지는 최대 10개까지 추가할 수 있습니다.');
      return;
    }
    setData({
      ...quizData,
      choices: [...choices, emptyChoice],
    });
  };

  const removeMultipleChoice = (index: number) => {
    if (choices.length <= 2) {
      alert('선택지는 최소 2개까지 있어야 합니다.');
      return;
    }

    const newChoices = choices.filter((_, i) => i !== index);
    const isEmptyAnswer =
      newChoices.filter((choice) => choice.isAnswer).length === 0;

    setData({
      ...quizData,
      quizStatus: isEmptyAnswer
        ? SelectionStatus.makeAnswer
        : SelectionStatus.complete,
      choices: newChoices,
    });
  };

  const onChangeChoice = (index: number, value: string) => {
    setData({
      ...quizData,
      choices: choices.map((choice, i) => {
        if (i === index) {
          return {
            ...choice,
            title: value,
          };
        }
        return choice;
      }),
    });
  };

  const toggleAnswer = (index: number) => {
    const newChoices = choices.map((choice, i) => {
      if (i === index) {
        return {
          ...choice,
          isAnswer: !choice.isAnswer,
        };
      }
      return choice;
    });

    if (
      newChoices.filter((choice) => choice.isAnswer).length === choices.length
    ) {
      alert('모든 선지가 정답일 수 없습니다.');
      return;
    }

    const isEmptyAnswer =
      newChoices.filter((choice) => choice.isAnswer).length === 0;

    setData({
      ...quizData,
      choices: newChoices,
      quizStatus: isEmptyAnswer
        ? SelectionStatus.makeAnswer
        : SelectionStatus.complete,
    });
  };

  return (
    <>
      <div css={MultipleChoiceEditorCSS}>
        <div className="multiple-choice-wrapper">
          <p>지시문</p>
          <input
            className="title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="다음 글의 제목으로 가장 적절한 것은?"
          />
          <p>선택지 내용을 입력 후, 정답이 될 선택지의 번호를 클릭해주세요.</p>
          <div className="multiple-choice-list">
            {Array(choices.length)
              .fill(0)
              .map((_, index) => (
                <div
                  key={`choice-${index}`}
                  className={classNames(
                    'multiple-choice-item',
                    choices[index]?.isAnswer ? 'is-answer' : ''
                  )}
                >
                  <div>
                    <div
                      className="multiple-choice-item__index"
                      onClick={() => toggleAnswer(index)}
                    >
                      {choiceNumbers[index]}
                    </div>
                    <Textarea
                      className="multiple-choice-item__content"
                      placeholder="내용을 입력하세요."
                      minRows={1}
                      onChange={(e) => onChangeChoice(index, e.target.value)}
                      value={choices[index]?.title}
                    />
                  </div>
                  <button
                    onClick={() => removeMultipleChoice(index)}
                    className="multiple-choice-item__remove icon-btn"
                  >
                    <Icon icon={Close} size={Sizes.small} />
                  </button>
                </div>
              ))}
            <button onClick={addMultipleChoice} className="add-multiple-choice">
              + 선택지 추가
            </button>
          </div>
        </div>
        {renderExplanations()}
      </div>
    </>
  );
};

export default MultipleChoiceEditor;

const MultipleChoiceEditorCSS = (theme: Theme) => css`
  height: calc(100vh - 336px);
  overflow: scroll;

  .multiple-choice-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;

    .title-input {
      ${Typography.body16};
      border: 1px solid ${theme.border.light};
      background-color: ${theme.var.white};
      padding: ${Spacing.medium}px;
      margin-top: ${Spacing.xsmall}px;
      margin-bottom: ${Spacing.medium}px;
    }

    p {
      text-align: left;
      ${Typography.body16};
      margin-top: ${Spacing.medium}px;
      color: ${theme.var.gray900};
    }
  }

  .multiple-choice-list {
    display: flex;
    flex-direction: column;
    padding: ${Spacing.medium}px 0;
    width: 100%;
    gap: ${Spacing.xsmall}px;
    height: calc(100% - 100px);
    overflow: scroll;

    .multiple-choice-item {
      display: flex;
      align-items: center;

      > div {
        display: flex;
        align-items: center;
        border: 1px solid ${theme.border.light};
        background-color: ${theme.var.white};
        width: 100%;

        > div {
          width: 100%;
        }
      }

      &__remove {
        margin-left: ${Spacing.medium}px;
      }

      &__index {
        width: auto !important;
        background-color: ${theme.var.sol_gray_50};
        padding: ${Spacing.medium}px;
        margin-right: ${Spacing.medium}px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
    }

    .is-answer {
      > div {
        border-color: ${theme.colors.blue400};
        background-color: ${theme.colors.blue50};
      }

      .multiple-choice-item__index {
        background-color: ${theme.colors.blue100};
      }
    }
  }

  .add-multiple-choice {
    padding: ${Spacing.large}px;
    width: calc(100% - 36px);
    border: 1px solid ${theme.border.light};
    background-color: ${theme.var.white};
  }
`;
