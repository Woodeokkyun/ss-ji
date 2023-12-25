import { Radius, Sizes, Spacing } from 'solvook-design-system';
import { Icon, XCircle } from 'solvook-design-system/icon';
import Image from '../common/Image';
import SelectionViewer, {
  SelectionStatus,
  SelectionType,
} from '../common/SelectionViewer';
import { IChoice, ISelectionPosition } from '../../../model';
import { AnswerWrapperCSS } from '../modal/QuizEditorModal';
import { choiceNumbers } from '@/quiz';
import classNames from 'classnames';
import Border from '../common/Border';
import { Theme, css, useTheme } from '@emotion/react';
import { SyntheticEvent, useEffect, useState } from 'react';
import { QuizStore } from '@/utils/store';
import { EditorState } from 'draft-js';

type Props = {
  quizStatus: SelectionStatus;
  selectionPositions: ISelectionPosition[];
  removeSelection?: (e: SyntheticEvent<HTMLButtonElement>) => void;
  clearChangeText: () => void;
  renderExplanations: () => JSX.Element;
  quizData: QuizStore['data'];
  setData: (data: QuizStore['data']) => void;
};
const SentenceInfoEditor = ({
  quizStatus,
  selectionPositions,
  removeSelection,
  clearChangeText,
  quizData,
  setData,
  renderExplanations,
}: Props) => {
  const theme = useTheme();
  const [localPassageState, setLocalPassageState] = useState<EditorState>(
    EditorState.createEmpty()
  );

  const [requireWords, setRequireWords] = useState<string[]>(['']);
  useEffect(() => {
    if (selectionPositions.length === 0) {
      return;
    }
    const newQuizData = { ...quizData };
    newQuizData.description = {
      title: '<조건>',
      contents: [
        ...(requireWords.length > 0
          ? [`${requireWords.join(',')}을 쓰되 필요시 변형할 것`]
          : []),
        `총 ${selectionPositions[0].originText?.trim().split(' ')
          .length}개의 어절로 영작할 것`,
      ],
    };
    setData(newQuizData);
  }, [requireWords]);
  return (
    <div className="quiz-info__guide">
      {/* {quizStatus === SelectionStatus.makeSelection && (
        <h4>밑줄로 지정할 곳을 클릭하세요.</h4>
      )}
      {quizStatus === SelectionStatus.makeAnswer && (
        <h4>밑줄을 선택하여 영작 대상 내용을 입력하세요.</h4>
      )} */}
      <SelectionViewer
        passage={localPassageState.getCurrentContent().getPlainText()}
        status={quizStatus}
        selectionPositions={selectionPositions}
        type={SelectionType.underline}
        removeSelection={removeSelection}
        setData={setData}
        maxSelection={2}
        placeholder="대치할 단어를 입력해주세요."
      />
      {quizStatus === SelectionStatus.complete && (
        <div css={SenetenceEditorCSS}>
          <p>정답</p>
          <div className="answer">{selectionPositions[0].originText}</div>
          <p>&lt;조건&gt;</p>
          <div className="condition">
            <p>다음 단어를 쓰되, 필요시 변형할 것</p>
            <div className="condition__words">
              {requireWords.map((word, index) => (
                <div key={`require-word-${index}`}>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => {
                      const newRequireWords = [...requireWords];
                      newRequireWords[index] = e.target.value;
                      setRequireWords(newRequireWords);
                    }}
                  />
                  <button
                    onClick={() => {
                      const newRequireWords = [...requireWords];
                      newRequireWords.splice(index, 1);
                      setRequireWords(newRequireWords);
                    }}
                  >
                    <Icon
                      icon={XCircle}
                      size={Sizes.small}
                      color={theme.var.black}
                    />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setRequireWords([...requireWords, '']);
                }}
              >
                +
              </button>
            </div>
            <Border />
            <p className="total-word-condition">
              총 {selectionPositions[0].originText?.trim().split(' ').length}
              개의 어절로 영작할 것
            </p>
          </div>
          {renderExplanations()}
        </div>
      )}
    </div>
  );
};

export default SentenceInfoEditor;

const SenetenceEditorCSS = (theme: Theme) => css`
  width: 100%;
  display: flex;
  flex-direction: column;

  > p {
    font-weight: 700;
    margin-bottom: ${Spacing.xxsmall}px;
    line-height: 1.5;
    margin-top: ${Spacing.large}px;
  }

  .answer {
    padding: ${Spacing.large}px;
    background-color: ${theme.var.sol_gray_0};
    border-radius: ${Radius.medium}px;
  }

  .condition {
    padding: ${Spacing.large}px;
    border: 1px solid ${theme.var.sol_gray_100};
    border-radius: ${Radius.medium}px;
    margin-bottom: ${Spacing.large}px;

    p {
      margin-bottom: ${Spacing.small}px;
    }

    .total-word-condition {
      margin-bottom: 0;
      margin-top: ${Spacing.large}px;
    }

    &__words {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      margin-bottom: ${Spacing.large}px;
      gap: ${Spacing.small}px;

      > div {
        position: relative;

        input {
          width: 100%;
          padding: ${Spacing.small}px;
          border: 1px solid ${theme.var.sol_gray_100};
          border-radius: ${Radius.small}px;

          &:hover {
            border-color: ${theme.var.sol_gray_200};
          }
        }

        > button {
          display: none;
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          text-align: center;
          border-radius: ${Radius.round}px;
          background-color: ${theme.var.black};
        }

        &:hover {
          > button {
            display: block;
          }
        }
      }

      > button {
        width: 100%;
        padding: ${Spacing.small}px;
        border: 1px solid ${theme.var.sol_gray_100};
        border-radius: ${Radius.small}px;
      }
    }
  }
`;
