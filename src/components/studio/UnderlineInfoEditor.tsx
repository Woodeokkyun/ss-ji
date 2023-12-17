import { Sizes } from 'solvook-design-system';
import { Icon, Return } from 'solvook-design-system/icon';
import Image from '../common/Image';
import { SelectionStatus } from '../common/SelectionViewer';
import { IChoice, ISelectionPosition } from '../../../model';
import { AnswerWrapperCSS } from '../modal/QuizEditorModal';
import { choiceNumbers } from '@/quiz';
import classNames from 'classnames';
import Border from '../common/Border';

type Props = {
  quizStatus: SelectionStatus;
  selectionPositions: ISelectionPosition[];
  choices: IChoice[];
  removeSelection: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  clearChangeText: () => void;
  renderExplanations: () => JSX.Element;
};
const UnderlineInfoEditor = ({
  quizStatus,
  selectionPositions,
  choices,
  removeSelection,
  clearChangeText,
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
        <h4>밑줄을 지정해주세요. {`(${selectionPositions.length} / 5)`}</h4>
      )}
      {quizStatus === SelectionStatus.makeAnswer && (
        <h4>정답으로 설정할 내용을 선택하세요.</h4>
      )}
      {quizStatus === SelectionStatus.complete && (
        <div css={AnswerWrapperCSS}>
          <h5>
            밑줄 친 (a)～(e) 중에서 문맥상 내용의 쓰임이 적절하지 않은 것은?
          </h5>
          <div className="underline-choice-list">
            {choices.map((choice, index) => (
              <div key={`choice-${index}`}>
                <span
                  className={choice.isAnswer ? 'is-answer' : ''}
                >{`${choiceNumbers[index]} ${choice.title}`}</span>
                <button
                  className={classNames('icon-btn', 'return-btn')}
                  data-index={index}
                  onClick={(e) => {
                    removeSelection(e);
                  }}
                >
                  <Icon icon={Return} size={Sizes.small} />
                </button>
              </div>
            ))}
          </div>
          <Border />
          <div className="answer-wrapper">
            <div>
              <h5>정답</h5>
              <span>
                {
                  choiceNumbers[
                    selectionPositions.findIndex(
                      (position) => position.changeText
                    )
                  ]
                }
              </span>
              <button onClick={clearChangeText}>
                <u>정답 교체하기</u>
              </button>
            </div>
            <p>
              원문 :{' '}
              {
                selectionPositions.find((position) => position.changeText)
                  ?.originText
              }
            </p>
          </div>
          {renderExplanations()}
        </div>
      )}
    </div>
  );
};

export default UnderlineInfoEditor;
