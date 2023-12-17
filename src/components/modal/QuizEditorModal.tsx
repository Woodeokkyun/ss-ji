import Modal, { ModalProps } from './Modal';
import { v4 as uuidv4 } from 'uuid';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { css, Theme } from '@emotion/react';
import {
  Spacing,
  Radius,
  Sizes,
  FontSizes,
  Textarea,
} from 'solvook-design-system';
import { Select, SelectOption } from 'solvook-design-system/form';
import { IQuiz, ISelectionPosition } from '../../../model';
import { DefaultCategoryQuizTitles } from '../../../constants';
import { Icon, Delete } from 'solvook-design-system/icon';
import { ContentState, EditorState } from 'draft-js';
import { getPlainText } from '@/utils/draft';
import PassageEditor from '../studioV2/PassageEditor';
import Button from '../common/Button';
import SelectionViewer, {
  SelectionStatus,
  SelectionType,
} from '../common/SelectionViewer';

import classNames from 'classnames';
import { getRandomBoolean } from '@/utils/misc';
import { useQuizStore, useQuizHistory, QuizStore } from '@/utils/store';
import { Mixpanel } from '@/utils/mixpanel';
import MultipleChoiceEditor from '../studio/MultipleChoiceEditor';
import UnderlineInfoEditor from '../studio/UnderlineInfoEditor';
import SquareInfoEditor from '../studio/SquareInfoEditor';
import { useQuery } from 'react-query';
import { getItemTitleTypes } from '@/api/itemTitleTypes';
import SentenceInfoEditor from '../studio/SentenseInfoEditor';

type Props = {
  setQuizzes: (quizzes: IQuiz[]) => void;
  quizzes: IQuiz[];
  quiz?: IQuiz;
  openMetadataModal: (quizzes: IQuiz[], id: string) => void;
};

const QuizEditorModal = ({
  setQuizzes,
  quizzes,
  quiz,
  openMetadataModal,
  ...props
}: Props & ModalProps) => {
  const { data, setData } = useQuizStore();

  const {
    selectionPositions,
    passageState,
    selectedCategory,
    selectedTitle,
    quizStatus,
    explanation,
    hasFootnote,
    footnote,
    choices,
  } = data;

  const setQuizValue = useCallback(
    <K extends keyof QuizStore['data']>(
      name: K,
      value: QuizStore['data'][K]
    ) => {
      setData({ ...data, [name]: value });
    },
    [data]
  );

  const { undo, redo } = useQuizHistory((state) => state);

  const [selectedAnswerType, setSelectedAnswerType] =
    useState<string>('choice');
  const [quizCategories, setQuizCategories] = useState<SelectOption[]>([]);
  const [quizTitles, setQuizTitles] = useState<SelectOption[]>([]);
  const { data: itemTitleTypes } = useQuery(
    'itemTitleTypes',
    () => getItemTitleTypes(),
    {
      staleTime: Infinity,
      onSuccess(data) {},
    }
  );

  useEffect(() => {
    if (!itemTitleTypes) {
      return;
    }

    const answerType = itemTitleTypes.answerTypes.find(
      (type) => type.value === selectedAnswerType
    );
    if (answerType) {
      const quizCategories = answerType.itemTypes.map((itemType) => {
        return {
          label: itemType.label,
          value: itemType.value,
        };
      });
      setQuizCategories(quizCategories);
    }
  }, [itemTitleTypes, selectedAnswerType]);

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }
    const targetCategory = itemTitleTypes?.answerTypes
      .find((type) => type.value === selectedAnswerType)
      ?.itemTypes.find((itemType) => itemType.value === selectedCategory.value);
    if (targetCategory) {
      const quizTitles = targetCategory.titleTypes.map((title) => {
        console.log(title);
        return {
          label: title.defaultTitle,
          value: title.value,
        };
      });
      setQuizTitles(quizTitles);
    }
  }, [selectedCategory]);

  const [localPassageState, setLocalPassageState] = useState<EditorState>(
    EditorState.createEmpty()
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!props.open) {
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        undo();
      }

      if (e.key === 'z' && e.shiftKey) {
        redo();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [props.open]);

  const isUnderline =
    selectedCategory?.value.includes('underline') ||
    selectedTitle?.value.includes('underline') ||
    selectedTitle?.value.includes('sentence');
  const [isInit, setIsInit] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  useEffect(() => {
    if (quiz) {
      const initData = data;
      if (quiz.title) {
        setTitle(quiz.title);
      }
      if (quiz.passage) {
        const contentDataState = ContentState.createFromText(quiz.passage);
        setLocalPassageState(EditorState.createWithContent(contentDataState));
        initData.passageState = EditorState.createWithContent(contentDataState);
      }
      if (quiz.choices) {
        initData.choices = quiz.choices;
        initData.quizStatus = SelectionStatus.complete;
      }
      if (quiz.selectionPositions) {
        initData.selectionPositions = quiz.selectionPositions;
      }
      if (quiz.explanation) {
        initData.explanation = quiz.explanation;
      }
      if (quiz.footnote) {
        initData.hasFootnote = true;
        initData.footnote = quiz.footnote;
      }
      // initData.selectedCategory = QuizCategories.find(
      //   (category: SelectOption) => category.value === quiz.category
      // );
      setData(initData);
      setIsInit(true);
    }
    if (!props.open) {
      setData({
        ...data,
        passageState: EditorState.createEmpty(),
        selectedCategory: undefined,
        choices: [],
        selectionPositions: [],
        explanation: '',
        hasFootnote: false,
        footnote: undefined,
      });
    }
  }, [quiz, props.open]);

  const editOrCreateQuiz = () => {
    if (!selectedCategory || !selectedTitle) {
      return;
    }
    const passage = getPlainText(passageState);
    const id = quiz ? quiz.id : uuidv4();
    let newQuizzes = quizzes;
    if (quiz) {
      newQuizzes = quizzes.map((q) => {
        if (q.id === quiz.id) {
          return {
            ...q,
            category: `${selectedCategory.value}-${selectedTitle.value}`,
            title,
            passage,
            ...(footnote ? { footnote } : { footnote: '' }),
            ...(explanation ? { explanation } : {}),
            ...(choices ? { choices } : {}),
            ...(selectionPositions ? { selectionPositions } : {}),
          };
        } else {
          return q;
        }
      });
      setQuizzes(newQuizzes);
      Mixpanel.track('Quiz Edited', {
        category: selectedCategory.value,
      });
    } else {
      const newQuiz: IQuiz = {
        id,
        category: selectedCategory.value,
        title,
        passage,
        ...(footnote ? { footnote } : {}),
        ...(explanation ? { explanation } : {}),
        ...(choices ? { choices } : {}),
        ...(selectionPositions ? { selectionPositions } : {}),
      };
      newQuizzes = [...quizzes, newQuiz];

      setQuizzes(newQuizzes);

      Mixpanel.track('Quiz Created', {
        category: selectedCategory.value,
      });

      setTimeout(() => {
        const quizElement = document.getElementById(id);
        if (quizElement) {
          quizElement.scrollIntoView(false);
          quizElement.classList.add('created');
        }
      }, 50);
      setTimeout(() => {
        const quizElement = document.getElementById(id);
        if (quizElement) {
          quizElement.scrollIntoView(false);
          quizElement.classList.remove('created');
        }
      }, 2050);
    }
    setData({
      selectionPositions: [],
      passageState: EditorState.createEmpty(),
      selectedCategory: undefined,
      selectedTitle: undefined,
      quizStatus: SelectionStatus.makeSelection,
      explanation: undefined,
      hasFootnote: false,
      footnote: undefined,
      choices: [],
    });
    props.onClose();
    openMetadataModal(newQuizzes, id);
  };

  const removeSelection = (e: SyntheticEvent<HTMLButtonElement>) => {
    const index = Number(e.currentTarget.dataset.index);
    const newSelections = selectionPositions
      .filter((_, i) => i !== index)
      .map((selection, i) => {
        return {
          ...selection,
          changeText: undefined,
        };
      });
    setData({
      ...data,
      quizStatus: SelectionStatus.makeSelection,
      selectionPositions: newSelections,
    });
  };

  const clearChangeText = () => {
    const newSelections = selectionPositions.map((selection, i) => {
      return {
        ...selection,
        changeText: undefined,
      };
    });
    setData({
      ...data,
      quizStatus: SelectionStatus.makeAnswer,
      selectionPositions: newSelections,
    });
  };

  const changeSelectCategory = useCallback(
    (category: SelectOption) => {
      if (selectedCategory?.value === category.value) {
        return;
      }
      if (
        category.value === 'clear' &&
        confirm('작업하신 내용이 초기화됩니다.\n수정하시겠습니까?')
      ) {
        setData({
          ...data,
          selectedCategory: undefined,
          passageState: localPassageState,
          choices: [],
          selectionPositions: [],
        });
        return;
      }
      setTitle(DefaultCategoryQuizTitles[category.value]);
      setData({
        ...data,
        quizStatus: SelectionStatus.makeSelection,
        passageState: localPassageState,
        selectedCategory: category,
        footnote,
        hasFootnote: true,
        choices: [],
        selectionPositions: [],
      });
    },
    [data, selectedCategory]
  );

  const changeSelectedTitle = useCallback(
    (title: SelectOption) => {
      if (selectedTitle?.value === title.value) {
        return;
      }
      setData({
        ...data,
        quizStatus: SelectionStatus.makeSelection,
        selectedTitle: title,
        footnote,
        hasFootnote: true,
        choices: [],
        selectionPositions: [],
      });
    },
    [data, selectedTitle]
  );

  const renderCta = () => {
    return (
      <div className="cta-wrapper">
        <Button
          type="border"
          onClick={() => {
            props.onClose();
          }}
        >
          취소
        </Button>
        <Button
          disabled={
            !selectedCategory ||
            choices.length === 0 ||
            quizStatus !== SelectionStatus.complete
          }
          onClick={() => {
            editOrCreateQuiz();
          }}
        >
          {quiz ? '수정 완료' : '출제하기'}
        </Button>
      </div>
    );
  };

  const generateSquareAnswer = (
    positions: ISelectionPosition[] = selectionPositions
  ) => {
    const incorrectChoiceMap = [
      [true, true, false],
      [true, false, true],
      [true, false, false],
      [false, true, true],
      [false, true, false],
      [false, false, true],
      [false, false, false],
    ];

    const switchPositions = positions.map((position) => ({
      ...position,
      ...(getRandomBoolean() ? { isSwitched: true } : { isSwitched: false }),
    }));

    const randomAnswer = Math.floor(Math.random() * 5) + 1;

    const choices = Array(5)
      .fill(0)
      .map((_, index) => {
        if (index === randomAnswer - 1) {
          return {
            title: `${switchPositions[0].originText}/${switchPositions[1].originText}/${switchPositions[2].originText}`,
            isAnswer: true,
          };
        }

        const randomIndex = Math.floor(
          Math.random() * incorrectChoiceMap.length
        );
        const randomChoice = incorrectChoiceMap[randomIndex];
        incorrectChoiceMap.splice(randomIndex, 1);

        return {
          title: `${
            switchPositions[0][randomChoice[0] ? 'originText' : 'changeText']
          }/${
            switchPositions[1][randomChoice[1] ? 'originText' : 'changeText']
          }/${
            switchPositions[2][randomChoice[2] ? 'originText' : 'changeText']
          }`,
          isAnswer: false,
        };
      });
    setData({
      ...data,
      selectionPositions: switchPositions,
      choices,
      quizStatus: SelectionStatus.complete,
    });
  };

  const renderExplanations = () => {
    return (
      <div className="explanation-wrapper">
        <div className={classNames('explanation-wrapper__header', 'active')}>
          해설
        </div>
        <Textarea
          className="explanation-content"
          placeholder="해설을 입력하세요."
          minRows={1}
          onChange={(e) => setQuizValue('explanation', e.target.value)}
          value={explanation}
        />
      </div>
    );
  };

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

  const getSelectionViewerOption = () => {
    if (
      selectedCategory?.value === 'grammar-choice' ||
      selectedCategory?.value === 'vocabulary-choice' ||
      selectedTitle?.value === 'combination'
    ) {
      return {
        maxSelection: 3,
        placeholder: '대응할 단어를 입력해주세요.',
      };
    }
    if (
      selectedCategory?.value === 'grammar-underline' ||
      selectedCategory?.value === 'vocabulary-underline' ||
      selectedTitle?.value === 'underline'
    ) {
      return {
        maxSelection: 5,
        placeholder: '대치할 단어를 입력해주세요.',
      };
    }
    return {
      maxSelection: 1,
      placeholder: '대치할 내용을 입력해주세요.',
    };
  };

  const renderSelectedCategoryPassage = () => {
    if (!selectedCategory) {
      return (
        <PassageEditor
          passageState={localPassageState}
          onPassageChange={(passageState) => {
            setLocalPassageState(passageState);
          }}
        />
      );
    }

    if (
      selectedCategory.value === 'grammar-choice' ||
      selectedCategory.value === 'grammar-underline' ||
      selectedCategory.value === 'vocabulary-choice' ||
      selectedCategory.value === 'vocabulary-underline' ||
      selectedTitle?.value === 'sentence' ||
      selectedTitle?.value === 'underline' ||
      selectedTitle?.value === 'combination'
    ) {
      return (
        <SelectionViewer
          passage={localPassageState.getCurrentContent().getPlainText()}
          status={quizStatus}
          selectionPositions={selectionPositions}
          type={isUnderline ? SelectionType.underline : SelectionType.square}
          removeSelection={removeSelection}
          generateSquareAnswer={generateSquareAnswer}
          quizData={data}
          setData={setData}
          maxSelection={getSelectionViewerOption().maxSelection}
          placeholder={getSelectionViewerOption().placeholder}
        />
      );
    }
    return (
      <PassageEditor
        passageState={localPassageState}
        onPassageChange={(passageState) => {
          setLocalPassageState(passageState);
        }}
      />
    );
  };

  const renderSelectedCategoryQuizEditor = () => {
    if (!selectedCategory) {
      return null;
    }

    if (
      selectedCategory.value === 'subject-choice' ||
      selectedCategory.value === 'title-choice' ||
      selectedCategory.value === 'opinion-choice' ||
      selectedCategory.value === 'purpose-choice' ||
      selectedCategory.value === 'match-choice' ||
      selectedCategory.value === 'mismatch-choice' ||
      selectedTitle?.value === 'basic'
    ) {
      return (
        <MultipleChoiceEditor
          title={title}
          setTitle={setTitle}
          choices={choices.length > 0 ? choices : undefined}
          passage={passageState.getCurrentContent().getPlainText()}
          setQuizStatus={(status) => setQuizValue('quizStatus', status)}
          quizData={data}
          setData={setData}
          renderExplanations={renderExplanations}
        />
      );
    }

    if (
      selectedCategory.value === 'grammar-choice' ||
      selectedCategory.value === 'vocabulary-choice' ||
      selectedTitle?.value === 'combination'
    ) {
      return (
        <SquareInfoEditor
          quizStatus={quizStatus}
          selectionPositions={selectionPositions}
          choices={choices}
          renderSquareChoice={renderSquareChoice}
          generateSquareAnswer={generateSquareAnswer}
          renderExplanations={renderExplanations}
        />
      );
    }

    if (
      selectedCategory.value === 'grammar-underline' ||
      selectedCategory.value === 'vocabulary-underline' ||
      selectedTitle?.value === 'underline'
    ) {
      return (
        <UnderlineInfoEditor
          quizStatus={quizStatus}
          selectionPositions={selectionPositions}
          choices={choices}
          removeSelection={removeSelection}
          clearChangeText={clearChangeText}
          renderExplanations={renderExplanations}
        />
      );
    }

    if (selectedTitle?.value === 'sentence') {
      return (
        <SentenceInfoEditor
          quizStatus={quizStatus}
          selectionPositions={selectionPositions}
          choices={choices}
          removeSelection={removeSelection}
          clearChangeText={clearChangeText}
          renderExplanations={renderExplanations}
        />
      );
    }
  };

  return (
    <Modal {...props} name="quiz-edit" disableOutsideClick fixedHeight>
      <div css={EditorWrapperCSS} key={`category-${selectedCategory}`}>
        <div>
          <div className="passage-wrapper">
            <div
              className={classNames('passage-wrapper__header', {
                active: !selectedCategory,
              })}
            >
              지문
            </div>
            <div className="passage-content">
              {renderSelectedCategoryPassage()}
            </div>
          </div>
          {hasFootnote ? (
            <div className="footnote-wrapper">
              <div className={classNames('footnote-wrapper__header', 'active')}>
                <span>각주</span>
                <button
                  className="icon-btn"
                  onClick={() => {
                    setData({
                      ...data,
                      footnote: '',
                      hasFootnote: false,
                    });
                  }}
                >
                  <Icon icon={Delete} size={Sizes.small} />
                </button>
              </div>
              <Textarea
                className="footnote-content"
                placeholder="각주를 입력하세요."
                minRows={1}
                onChange={(e) => setQuizValue('footnote', e.target.value)}
                value={footnote}
              />
            </div>
          ) : (
            <Button
              type="border"
              onClick={() => setQuizValue('hasFootnote', true)}
            >
              각주 추가
            </Button>
          )}
        </div>
        <div
          className="right-content"
          key={`category-${selectedCategory}-${quizStatus}-${isInit}-${
            localPassageState.getCurrentContent().getPlainText().length
          }`}
        >
          <div className="select-quiz-type">
            <div>
              <p>정답 유형</p>
              <p>문제 유형</p>
            </div>
            <div>
              <div>
                <div>
                  <input
                    name="answer-type"
                    id="choice-type"
                    value="choice"
                    type="radio"
                    checked={selectedAnswerType === 'choice'}
                    onChange={() => setSelectedAnswerType('choice')}
                  />
                  <label htmlFor="choice-type">객관식</label>
                </div>
                <div>
                  <input
                    name="answer-type"
                    id="essay-type"
                    value="essay"
                    type="radio"
                    checked={selectedAnswerType === 'essay'}
                    onChange={() => setSelectedAnswerType('essay')}
                  />
                  <label htmlFor="essay-type">서술형</label>
                </div>
              </div>
              <Select
                key={selectedCategory?.value}
                placeholder="문제 유형을 선택해주세요."
                options={[
                  ...quizCategories,
                  { label: '지시문 수정', value: 'clear' },
                ]}
                name="category"
                optionStyle={{ maxHeight: 250 }}
                selected={selectedCategory}
                onChange={(values) => changeSelectCategory(values)}
                className="category-select"
              />
            </div>
          </div>
          <div className="select-quiz-title">
            <p>지시문</p>
            <Select
              key={selectedTitle?.value}
              placeholder="지시문을 선택해주세요."
              options={[...quizTitles]}
              disabled={!selectedCategory}
              name="quiz-title"
              optionStyle={{ maxHeight: 350 }}
              selected={selectedTitle}
              onChange={(values) => changeSelectedTitle(values)}
            />
          </div>
          {renderSelectedCategoryQuizEditor()}
        </div>
      </div>
      <div style={{ height: 97 }} />
      <div css={QuizEditorFooterCSS}>{renderCta()}</div>
    </Modal>
  );
};

export default QuizEditorModal;

const EditorWrapperCSS = (theme: Theme) => css`
  display: flex;

  > * {
    padding: ${Spacing.medium}px;
    width: 50%;

    > button {
      margin-top: ${Spacing.medium}px;
    }
  }

  .right-content {
    > p {
      margin-bottom: ${Spacing.xsmall}px;
    }

    .select-quiz-title {
      margin: ${Spacing.large}px 0;

      p {
        font-weight: 700;
        line-height: 1.5;
        margin-bottom: ${Spacing.xxsmall}px;
      }
    }

    .select-quiz-type {
      display: flex;
      gap: ${Spacing.xsmall}px;
      flex-direction: column;

      > div {
        display: flex;
        align-items: center;
        gap: ${Spacing.xxsmall}px;

        > p {
          font-weight: 700;
        }

        > div {
          flex: 1;
          display: flex;
          align-items: center;
          gap: ${Spacing.medium}px;

          > div {
            display: flex;
            align-items: center;
            gap: ${Spacing.xxsmall}px;
          }
        }

        .category-select {
          > div {
            padding: 12px;
          }
        }

        > p {
          margin-right: auto;
        }

        > input {
          margin-right: ${Spacing.xxsmall}px;
        }
      }
    }
    .quiz-info {
      margin-top: ${Spacing.xlarge}px;

      &__guide {
        display: flex;
        align-items: center;

        img {
          margin-right: ${Spacing.xsmall}px;
        }
      }
    }
  }

  .footnote-wrapper,
  .passage-wrapper,
  .explanation-wrapper {
    border: 1px solid ${theme.border.light};
    border-radius: ${Radius.xsmall}px;

    &__header {
      background-color: ${theme.var.sol_gray_100};
      border-bottom: 1px solid ${theme.border.light};
      padding: ${Spacing.small}px ${Spacing.medium}px;
      position: sticky;
      top: 0;

      &.active {
        background-color: #def7fa;
      }
    }
  }

  .footnote-wrapper__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    button {
      background-color: ${theme.var.white};
      padding: ${Spacing.xxsmall}px;
      border-radius: ${Radius.xsmall}px;
      border: 1px solid ${theme.border.light};
    }
  }
  .passage-content {
    overflow: scroll;
    height: 440px;
    // background-color: ${theme.colors.blue50};

    > p,
    .DraftEditor-root {
      padding: ${Spacing.xsmall}px ${Spacing.medium}px;
    }

    .DraftEditor-root {
      height: 400px;
    }
  }

  .explanation-content {
    max-height: 190px;
    padding: ${Spacing.xsmall}px ${Spacing.medium}px;
  }

  .footnote-content {
    max-height: 80px;
    padding: ${Spacing.xsmall}px ${Spacing.medium}px;
  }
  .footnote-wrapper {
    margin-top: ${Spacing.small}px;
  }
`;

export const QuizEditorFooterCSS = (theme: Theme) => css`
  position: fixed;
  bottom: 0;
  z-index: 100;
  background-color: ${theme.var.white};
  width: 100%;
  padding: ${Spacing.xlarge}px;
  border-top: 1px solid ${theme.border.lightest};

  .cta-wrapper {
    display: flex;
    justify-content: flex-end;
    gap: ${Spacing.small}px;

    button {
      width: 190px;
      border: 1px solid ${theme.border.light};
    }
  }
`;

export const AnswerWrapperCSS = (theme: Theme) => css`
  width: 100%;

  > * {
    margin-bottom: ${Spacing.medium}px;
  }

  > h5 {
    padding: ${Spacing.small}px ${Spacing.medium}px;
    background-color: ${theme.background.gray};
  }

  .underline-choice-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);

    > div {
      display: flex;
      align-items: center;
    }
  }

  .square-choice-list {
    display: flex;
    flex-direction: column;
    gap: ${Spacing.small}px;

    > div {
      display: flex;
      align-items: center;
      gap: ${Spacing.small}px;

      .square-choice {
        display: flex;
        align-items: center;
        width: 100%;

        > span {
          width: 100%;
        }
      }
    }
  }

  .is-answer {
    color: ${theme.colors.red500};
  }

  .return-btn {
    background-color: ${theme.var.white};
    padding: ${Spacing.xxsmall}px;
    border-radius: ${Radius.xsmall}px;
    border: 1px solid ${theme.border.light};
    margin-left: ${Spacing.xxsmall}px;
  }

  .answer-wrapper {
    display: flex;
    flex-direction: column;
    gap: ${Spacing.medium}px;

    > p {
      padding: ${Spacing.small}px ${Spacing.medium}px;
      background-color: ${theme.background.gray};
    }

    > div {
      display: flex;
      align-items: center;
      gap: ${Spacing.xxsmall}px;

      > span {
        font-size: ${FontSizes.xlarge}px;
      }

      > button {
        font-size: ${FontSizes.medium}px;
        color: ${theme.var.sol_gray_500};
        text-decoration: underline;
      }
    }
  }
`;
