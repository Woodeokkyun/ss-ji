import classNames from 'classnames';
import { IQuizCategories, IQuizCategory, ISelectItem } from '../../../model';
import HorizontalMultipleChoicePreview from '../../../public/quiz-preview/horizontal_multiple_choice.png';
import Image from '../common/Image';
import { css, Theme } from '@emotion/react';
import { Typography, Radius, Spacing } from 'solvook-design-system';
import { QuizTypes } from '../../../constants';

const QuizTypeSelector = ({
  quizTypes,
  selectedQuizCategory,
  setSelectedQuizCategory,
  selectedQuizType,
  setSelectedQuizType,
}: {
  quizTypes: IQuizCategories[];
  selectedQuizCategory: IQuizCategory | undefined;
  setSelectedQuizCategory: (quizCategory: IQuizCategory) => void;
  selectedQuizType: ISelectItem | undefined;
  setSelectedQuizType: (quizType: ISelectItem | undefined) => void;
}) => {
  return (
    <div css={QuizTypesCSS}>
      <div css={QuizCategoriesCSS}>
        {quizTypes.map((type, index) => {
          return (
            <div key={`quiz-type-wrap-${index}`}>
              {type.title && <p className="quiz-type-title">{type.title}</p>}
              <div className="quiz-category-wrapper">
                {type.categories.map((category, index) => {
                  return (
                    <div key={`quiz-type-${index}`}>
                      <button
                        className={classNames(
                          'quiz-category',
                          selectedQuizCategory?.value === category.value
                            ? 'selected'
                            : ''
                        )}
                        onClick={() => {
                          setSelectedQuizCategory(category);
                          setSelectedQuizType(undefined);
                        }}
                      >
                        {category.label}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {selectedQuizCategory && selectedQuizCategory.typesWithTitle && (
        <div css={QuizCategoriesCSS}>
          {selectedQuizCategory.typesWithTitle.map((twt, index) => {
            return (
              <div key={`quiz-type-wrap-${index}`}>
                {twt.title && <p className="quiz-type-title">{twt.title}</p>}
                <div className="quiz-category-wrapper">
                  {twt.types.map((type, index) => {
                    return (
                      <div key={`quiz-type-${index}`}>
                        <button
                          className={classNames(
                            'quiz-category',
                            selectedQuizType?.value === type.value
                              ? 'selected'
                              : ''
                          )}
                          onClick={() => setSelectedQuizType(type)}
                        >
                          {type.label}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div css={QuizTypePreviewCSS}>
        {selectedQuizType?.value === QuizTypes.vMultipleChoice ? (
          <div>
            <div className="preview-label">
              <p>미리보기</p>
            </div>
            <Image
              src={HorizontalMultipleChoicePreview}
              alt="horizontal-multiple-choice"
            />
          </div>
        ) : (
          <h3>👈 여기서 제작할 문제 유형을 선택하세요.</h3>
        )}
      </div>
    </div>
  );
};

export default QuizTypeSelector;

const QuizTypesCSS = (theme: Theme) => css`
  display: flex;
  overflow: hidden;
  height: calc(100vh - 172px);
`;

const QuizTypePreviewCSS = (theme: Theme) => css`
  flex: 1;
  height: 100%;
  background-color: ${theme.var.sol_gray_50};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .preview-label {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    text-align: center;

    p {
      display: inline-block;
      background-color: ${theme.var.gray800};
      color: ${theme.var.white};
      border-radius: 0 0 ${Radius.small}px ${Radius.small}px;
      padding: ${Spacing.xxsmall}px ${Spacing.small}px;
    }
  }

  h3 {
    color: ${theme.var.gray300};
  }
`;

const QuizCategoriesCSS = (theme: Theme) => css`
  width: 180px;
  height: 100%;
  overflow: scroll;
  border-right: 1px solid ${theme.border.lightest};

  // Hide scrollbar
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera*/
  }

  .quiz-type-title {
    ${Typography.body12};
    color: ${theme.var.sol_gray_500};
    margin-top: ${Spacing.medium}px;
    margin-bottom: ${Spacing.small}px;
    padding: 0 ${Spacing.medium}px;
  }

  .quiz-category-wrapper {
    display: flex;
    flex-direction: column;
    gap: ${Spacing.xsmall}px;
    margin-bottom: ${Spacing.xxlarge}px;
  }

  .quiz-category {
    ${Typography.body16};
    width: 100%;
    text-align: left;
    padding: ${Spacing.xsmall}px ${Spacing.medium}px;
  }

  .quiz-category.selected {
    background-color: ${theme.colors.blue50};
  }
`;
