import Image from '../common/Image';
import { SelectionStatus } from '../common/SelectionViewer';
import { IChoice, ISelectionPosition } from '../../../model';
import { AnswerWrapperCSS } from '../modal/QuizEditorModal';
import { choiceNumbers } from '@/quiz';
import Border from '../common/Border';

type Props = {
  quizStatus: SelectionStatus;
  selectionPositions: ISelectionPosition[];
  choices: IChoice[];
  renderSquareChoice: (title: string) => JSX.Element;
  generateSquareAnswer: () => void;
  renderExplanations: () => JSX.Element;
};
const SquareInfoEditor = ({
  quizStatus,
  selectionPositions,
  choices,
  renderSquareChoice,
  generateSquareAnswer,
  renderExplanations,
}: Props) => {
  return (
    <div className="quiz-info__guide">
      {quizStatus !== SelectionStatus.complete && (
        <Image
          src="/assets/quiz-arrow.gif"
          alt="quizInfoArrow"
          width={20}
          height={16}
        />
      )}
      {quizStatus === SelectionStatus.makeSelection && (
        <h4>
          네모 안에 넣을 영역을 선택해주세요.{' '}
          {`(${selectionPositions.length} / 3)`}
        </h4>
      )}
      {quizStatus === SelectionStatus.makeAnswer && (
        <h4>각 네모를 선택하여 대응할 내용을 입력해주세요.</h4>
      )}
      {quizStatus === SelectionStatus.complete && (
        <div css={AnswerWrapperCSS}>
          <h5>
            (A), (B), (C)의 각 네모 안에서 문맥에 맞는 내용으로 가장 적절한
            것은?
          </h5>
          <div className="square-choice-list">
            {choices?.map((choice, index) => {
              return (
                <div
                  key={`choice-${index}`}
                  className={choice.isAnswer ? 'is-answer' : ''}
                >
                  <span>{choiceNumbers[index]}</span>
                  {renderSquareChoice(choice.title)}
                </div>
              );
            })}
          </div>
          <Border />
          <div className="answer-wrapper">
            <div>
              <h5>정답</h5>
              <span>
                {choiceNumbers[choices!.findIndex((choice) => choice.isAnswer)]}
              </span>
              <button onClick={() => generateSquareAnswer()}>
                <u>선택지 다시 섞기</u>
              </button>
            </div>
          </div>
          {renderExplanations()}
        </div>
      )}
    </div>
  );
};

export default SquareInfoEditor;
