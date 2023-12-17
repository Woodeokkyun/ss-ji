import { Radius, Sizes, Spacing } from 'solvook-design-system';
import { Icon, Return, CheckCircle } from 'solvook-design-system/icon';
import { css, Theme } from '@emotion/react';
import { choiceLargeAlphabets, choiceSmallAlphabets } from '@/quiz';
import { IChoice, ISelectionPosition } from '../../../model';
import classNames from 'classnames';
import {
  Fragment,
  MouseEvent,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { QuizStore } from '@/utils/store';

export const enum SelectionStatus {
  makeSelection,
  makeAnswer,
  complete,
  readOnly,
}

export const enum SelectionType {
  underline,
  square,
}

const SelectionViewer = ({
  passage,
  status,
  selectionPositions,
  removeSelection,
  type = SelectionType.square,
  generateSquareAnswer,
  quizData,
  setData,
  maxSelection,
  placeholder,
}: {
  passage: string;
  status: SelectionStatus;
  selectionPositions: ISelectionPosition[];
  removeSelection?: (e: SyntheticEvent<HTMLButtonElement>) => void;
  type?: SelectionType;
  generateSquareAnswer?: (positions: ISelectionPosition[]) => void;
  quizData?: QuizStore['data'];
  setData?: (data: QuizStore['data']) => void;
  maxSelection?: number;
  placeholder?: string;
}) => {
  const passageRef = useRef<HTMLDivElement>(null);
  const changeTextBoxRef = useRef<HTMLDivElement>(null);
  const changeInputRef = useRef<HTMLInputElement>(null);
  const [start, setStart] = useState<number>();
  const [showChangeTextIndex, setShowChangeTextIndex] = useState<number>();
  const [changeText, setChangeText] = useState('');
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    return () => {
      setStart(undefined);
      setShowChangeTextIndex(undefined);
      setChangeText('');
    };
  }, []);

  const isSelectionComplete = status === SelectionStatus.complete;
  const isSelectionMakeAnswer = status === SelectionStatus.makeAnswer;
  const isCompleteSelection = isSelectionMakeAnswer || isSelectionComplete;

  const isSquareType = type === SelectionType.square;

  const handleOutsideClick = (e: any) => {
    if (
      changeTextBoxRef.current &&
      !changeTextBoxRef.current.contains(e.target)
    ) {
      setChangeText('');
      setShowChangeTextIndex(undefined);
    }
  };

  useEffect(() => {
    const keyPressEnterSubmit = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        changeSelectionText();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    changeInputRef.current?.addEventListener('keydown', keyPressEnterSubmit);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      changeInputRef.current?.removeEventListener(
        'keydown',
        keyPressEnterSubmit
      );
    };
  }, [changeInputRef.current, changeText]);

  const proccesPassage = (text: string) => {
    const regex =
      /(\s+|[ㄱ-ㅎ|ㅏ-ㅣ|가-힣A-Za-z0-9]+|[.,?!'"“”°•*é²ʼü/ćíèáöà#☆·=Śê×‐£´③çó º①②④äθ→⑤{}³́/_~@#$%&*()=+`’\–\―\—:;\-])/g;
    const splitText = text.match(regex);
    const spaceIndex: number[] = [];
    const result: string[] = [];
    let spaceCount = 0;

    splitText?.map((word, index) => {
      if (word === ' ') {
        spaceIndex.push(index - 1 - spaceCount);
        spaceCount += 1;
      } else {
        result.push(word);
      }
    });
    return { spaceIndex, result };
  };

  const isSpecialCharacter = (text: string) => {
    const regex = /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z0-9]+/g;
    return regex.test(text);
  };

  const renderSliptPassage = (passage: string) => {
    const { result: splitPassage, spaceIndex } = proccesPassage(passage);
    let selectionText = '';
    let renderText = <span />;
    let selectionIndex: number | null = null;

    const renderSquareSelectionText = (selectionIndex: number) => {
      if (selectionIndex === null) {
        return;
      }

      if (!changeText && !selectionPositions[selectionIndex].changeText) {
        return selectionText;
      }

      const fixedChangeText = selectionPositions[selectionIndex].changeText;

      if (changeText && selectionIndex === showChangeTextIndex) {
        if (selectionPositions[selectionIndex].isSwitched) {
          return `${changeText} / ${selectionText}`;
        }
        return `${selectionText} / ${changeText}`;
      }

      if (fixedChangeText) {
        if (selectionPositions[selectionIndex].isSwitched) {
          return `${fixedChangeText} / ${selectionText}`;
        }
        return `${selectionText} / ${fixedChangeText}`;
      }

      return selectionText;
    };
    return splitPassage?.map((word, index) => {
      const trimWord = word;
      const isSelection = selectionPositions.some((position, positionIndex) => {
        if (index >= position.start && index <= position.end) {
          selectionIndex = positionIndex;
          return true;
        }
      });

      if (isSelection) {
        selectionText += trimWord;
        if (spaceIndex.includes(index)) {
          selectionText += ' ';
        }
        if (
          selectionIndex !== null &&
          selectionPositions[selectionIndex].end === index
        ) {
          const targetChangeText =
            selectionPositions[selectionIndex].changeText;
          renderText = (
            <span
              key={`selection-${selectionIndex}`}
              className={
                targetChangeText && !isSquareType
                  ? 'is-answer'
                  : 'square-wrapper'
              }
              css={SelectionWrapperCSS(isSquareType)}
            >
              {isCompleteSelection && (
                <span>
                  {isSquareType
                    ? choiceLargeAlphabets[selectionIndex]
                    : choiceSmallAlphabets[selectionIndex]}
                  &nbsp;
                </span>
              )}
              {isSquareType ? (
                <span
                  data-index={selectionIndex}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if (isCompleteSelection) {
                      showChangeSelectionText(e);
                    }
                  }}
                  className="square"
                >
                  {renderSquareSelectionText(selectionIndex)}
                </span>
              ) : (
                <span
                  data-index={selectionIndex}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if (isCompleteSelection) {
                      showChangeSelectionText(e);
                    }
                  }}
                  className="underline"
                >
                  {isCompleteSelection
                    ? targetChangeText ?? selectionText
                    : selectionText}
                </span>
              )}
              {removeSelection && (
                <button
                  className={classNames('icon-btn', 'return-btn')}
                  data-index={selectionIndex}
                  onClick={(e) => {
                    removeSelection(e);
                  }}
                >
                  <Icon icon={Return} size={Sizes.small} />
                </button>
              )}
              {isCompleteSelection &&
                showChangeTextIndex === selectionIndex && (
                  <div
                    className="change-word-input"
                    ref={changeTextBoxRef}
                    style={{
                      left: showRight ? 'auto' : 0,
                      right: showRight ? 0 : 'auto',
                    }}
                  >
                    <input
                      ref={changeInputRef}
                      type="text"
                      value={changeText}
                      onChange={(e) => setChangeText(e.target.value)}
                      placeholder={placeholder}
                      autoFocus
                    />
                    <button className="icon-btn" onClick={changeSelectionText}>
                      <Icon icon={CheckCircle} size={Sizes.medium} />
                    </button>
                  </div>
                )}
            </span>
          );
          selectionText = '';
          return renderText;
        }
      } else {
        renderText = (
          <>
            <span
              key={`word-${index}`}
              onClick={() => {
                !isSelectionComplete &&
                  !isSelectionMakeAnswer &&
                  onClickText(index);
              }}
              className={classNames({
                clickable:
                  !isSelectionComplete &&
                  !isSelectionMakeAnswer &&
                  trimWord !== ' ',
                start: start === index,
                'special-character': isSpecialCharacter(trimWord),
              })}
            >
              {trimWord}
            </span>
            {spaceIndex.includes(index) && <span className="space" />}
          </>
        );

        if (word === '\n') {
          return <br key={`new-line-${index}`} />;
        }

        if (word.indexOf('\n') === 0) {
          return (
            <Fragment key={`word-wrap-${index}`}>
              <br />
              {renderText}
            </Fragment>
          );
        }

        if (word.indexOf('\n') > 0) {
          return (
            <Fragment key={`word-wrap-${index}`}>
              {renderText}
              <br />
            </Fragment>
          );
        }
        return renderText;
      }
    });
  };

  const renderSelectionReadOnly = (passage: string) => {
    const { result: splitPassage, spaceIndex } = proccesPassage(passage);
    let selectionText = '';
    let renderText = <span />;
    let selectionIndex: number | null = null;
    return splitPassage?.map((word, index) => {
      const isSelection = selectionPositions.some((position, positionIndex) => {
        if (index >= position.start && index <= position.end) {
          selectionIndex = positionIndex;
          return true;
        }
      });

      if (isSelection) {
        selectionText += word;
        if (spaceIndex.includes(index)) {
          selectionText += ' ';
        }
        if (
          selectionIndex !== null &&
          selectionPositions[selectionIndex].end === index
        ) {
          const { changeText } = selectionPositions[selectionIndex];
          renderText = (
            <span
              key={`selection-${selectionIndex}`}
              css={SelectionWrapperCSS(isSquareType)}
            >
              {isSquareType ? (
                <>
                  <span>{choiceLargeAlphabets[selectionIndex]}&nbsp;</span>
                  <span className="square">
                    {selectionPositions[selectionIndex].isSwitched
                      ? `${changeText} / ${selectionText}`
                      : `${selectionText} / ${changeText}`}
                  </span>
                </>
              ) : (
                <>
                  <span>{choiceSmallAlphabets[selectionIndex]}&nbsp;</span>
                  <span className="underline">
                    {changeText ?? selectionText}
                  </span>
                </>
              )}
            </span>
          );
          selectionText = '';
          return renderText;
        }
      } else if (word === '\n') {
        return <br key={`new-line-${index}`} />;
      } else if (word.indexOf('\n') === 0) {
        return (
          <Fragment key={`word-wrap-${index}`}>
            <br />
            {renderText}
          </Fragment>
        );
      } else if (word.indexOf('\n') > 0) {
        return (
          <Fragment key={`word-wrap-${index}`}>
            {renderText}
            <br />
          </Fragment>
        );
      } else {
        renderText = (
          <>
            <span
              key={`word-${index}`}
              className={isSpecialCharacter(word) ? 'special-character' : ''}
            >
              {word}
            </span>
            {spaceIndex.includes(index) && <span className="space" />}
          </>
        );
        return renderText;
      }
    });
  };

  const onClickText = (index: number) => {
    if (!maxSelection) {
      return alert('최대 선택 수가 설정되지 않았습니다.');
    }
    if (selectionPositions.length >= maxSelection) {
      window.showActionBar({
        title: `선택할 수 있는 수는 ${maxSelection}개입니다.`,
        status: 'error',
      });
      return;
    }

    if (start !== undefined) {
      const startPosition = start > index ? index : start;
      const endPosition = start > index ? start : index;

      const hasSelection = selectionPositions.some((position) => {
        if (startPosition < position.start && endPosition > position.end) {
          return true;
        }
      });

      if (hasSelection) {
        window.showActionBar({
          title: `이미 선택된 부분을 포함하고 있습니다.`,
          status: 'error',
        });
        return;
      }

      const { result: splitPassage, spaceIndex } = proccesPassage(passage);
      let originText = '';
      splitPassage.map((word, index) => {
        if (index >= startPosition && index <= endPosition) {
          originText += word;
          if (spaceIndex.includes(index)) {
            originText += ' ';
          }
        }
      });
      const newPositions = [
        ...selectionPositions,
        {
          start: startPosition,
          end: endPosition,
          originText,
        },
      ];
      const sortedPositions = newPositions.sort((a, b) => a.start - b.start);

      setStart(undefined);
      if (sortedPositions.length === maxSelection) {
        quizData &&
          setData &&
          setData({
            ...quizData,
            selectionPositions: sortedPositions,
            quizStatus: SelectionStatus.makeAnswer,
          });
      } else {
        quizData &&
          setData &&
          setData({
            ...quizData,
            selectionPositions: sortedPositions,
          });
      }
      return;
    }
    setStart(index);
  };

  const showChangeSelectionText = (e: MouseEvent<HTMLElement>) => {
    const index = Number(e.currentTarget.dataset.index);
    setChangeText('');

    const inputWidth = isSquareType ? 360 : 280;
    const showRight =
      Number(e.currentTarget.parentElement?.parentElement?.clientWidth) -
        Number(e.currentTarget.parentElement?.offsetLeft) <
      inputWidth;
    setShowRight(showRight);
    setShowChangeTextIndex(index);
  };

  const changeSelectionText = () => {
    if (changeText.trim().length === 0) {
      window.showActionBar({
        title: placeholder as string,
        status: 'error',
      });
      return;
    }
    const newSelectionPositions = selectionPositions.map((position, index) => {
      if (index === showChangeTextIndex) {
        return {
          ...position,
          changeText,
        };
      }
      return position;
    });
    setShowChangeTextIndex(undefined);
    if (!isSquareType) {
      const newChoices = newSelectionPositions.map((_, index) => {
        return {
          title: choiceSmallAlphabets[index],
          isAnswer: index === showChangeTextIndex,
        };
      });
      quizData &&
        setData &&
        setData({
          ...quizData,
          selectionPositions: newSelectionPositions,
          choices: newChoices,
          quizStatus: SelectionStatus.complete,
        });
    } else if (
      newSelectionPositions.filter((position) => position.changeText).length ===
      3
    ) {
      generateSquareAnswer && generateSquareAnswer(newSelectionPositions);
    } else {
      quizData &&
        setData &&
        setData({
          ...quizData,
          selectionPositions: newSelectionPositions,
        });
    }
    setChangeText('');
  };

  const isReadOnly = status === SelectionStatus.readOnly;
  console.log(passage);
  return (
    <p ref={passageRef} css={PassageCSS(isReadOnly)}>
      {isReadOnly
        ? renderSelectionReadOnly(passage)
        : renderSliptPassage(passage)}
    </p>
  );
};

export default SelectionViewer;

const PassageCSS = (isReadOnly: boolean) => (theme: Theme) => css`
  margin-bottom: ${Spacing.medium}px;

  > span {
    padding: ${Spacing.xxsmall}px 0;
    display: inline-block;
    align-items: center;
  }

  .clickable {
    cursor: pointer;

    &:hover {
      background-color: ${theme.colors.blue50};
    }
  }

  .space {
    width: 6px;
  }

  // .special-character {
  //   margin: 0 2px;
  //   white-space: nowrap;

  //   & + & {
  //     margin-left: 4px;
  //   }
  // }

  .square-wrapper {
    padding: 0;
    display: initial;
  }

  .square {
    border: 1px solid ${theme.var.black};
    padding: ${Spacing.xxxsmall}px;
    margin-right: ${Spacing.xxsmall}px;

    &:hover {
      background-color: ${theme.colors.blue50};
      cursor: initial;
    }
  }
  .underline {
    text-decoration: underline;
    text-underline-offset: 4px;
    display: initial;
    margin-right: ${Spacing.xxsmall}px;

    &:hover {
      background-color: ${theme.var.white};
      cursor: initial;
    }
  }
  .start {
    background-color: ${theme.colors.blue100};

    &:hover {
      background-color: ${theme.colors.blue300} !important;
    }
  }

  .is-answer {
    color: ${theme.colors.red500};
  }
`;

const SelectionWrapperCSS = (isSquareType: boolean) => (theme: Theme) => css`
  position: relative;
  ${!isSquareType ? 'display: initial !important;' : 'height: 20px;'}

  .change-word-input {
    z-index: 1;
    width: max-content;
    display: flex;
    align-items: center;
    position: absolute;
    bottom: -64px;
    background-color: ${theme.var.white};
    box-shadow: 0px 4px 4px 0px #00000040;
    padding: ${Spacing.xsmall}px;

    .replace-btn {
      padding: ${Spacing.small}px ${Spacing.medium}px;
      border: 1px solid ${theme.border.light};
      margin-right: ${Spacing.xxsmall}px;
    }

    input {
      width: 220px;
      border: 1px solid ${theme.border.light};
      border-radius: ${Radius.small}px;
      padding: ${Spacing.small}px ${Spacing.medium}px;
      margin-right: ${Spacing.xxsmall}px;
    }
  }

  .return-btn {
    background-color: ${theme.var.white};
    padding: ${Spacing.xxsmall}px;
    border-radius: ${Radius.xsmall}px;
    border: 1px solid ${theme.border.light};
    margin-left: ${Spacing.xxxsmall}px;
    position: relative;
    bottom: -2px;
    margin-right: 4px;
  }
`;
