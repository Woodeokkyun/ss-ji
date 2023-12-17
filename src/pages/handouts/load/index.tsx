import type { NextPage } from 'next';
import Layout from '@/components/common/Layout';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import { getCategories, getUnitItems, getUnits } from '@/api/sources';
import { PropagateLoader } from 'react-spinners';
import { Theme, css, useTheme } from '@emotion/react';
import CategoryAccordion from '@/components/common/CategoryAccordion';
import { Fragment, useEffect, useState } from 'react';
import {
  FontSizes,
  Radius,
  Sizes,
  Spacing,
  Typography,
} from 'solvook-design-system';
import classNames from 'classnames';
import Passage from '@/components/load/Passage';
import {
  useEditorStatusState,
  useLoadControlStore,
  useQuizzesStore,
} from '@/utils/store';
import { Icon, ArrowRight, ArrowDown } from 'solvook-design-system/icon';
import Overlay from '@/components/common/Overlay';
import { IQuiz, IUnitPassage } from '../../../../model';
import { Mixpanel } from '@/utils/mixpanel';
import Quiz from '@/components/common/Quiz';
import Image from '@/components/common/Image';
import { QuizCategories } from '../../../../constants';
import { deleteBoardItem } from '@/api/boardItems';

const LoadPage: NextPage = () => {
  const theme = useTheme();
  const { quizzes, setQuizzes } = useQuizzesStore();

  const {
    selectedCategoryId,
    setSelectedCategoryId,
    selectedUnitId,
    setSelectedUnitId,
    itemCount,
    setItemCount,
    selectedItems,
    setSelectedItems,
  } = useLoadControlStore();
  const { data, isLoading } = useQuery(['categories'], () => getCategories(), {
    suspense: false,
    staleTime: Infinity,
    cacheTime: Infinity,
    onSuccess: (data) => {
      setSelectedCategoryId(
        data.categories[0].typeCategories[0].seriesCategories[0]
          .sourceCategories[0].id
      );
    },
  });

  const {
    data: unitsResponse,
    isLoading: isUnitsLoading,
    refetch,
  } = useQuery(['units'], () => getUnits(selectedCategoryId as string), {
    suspense: false,
    enabled: !!selectedCategoryId,
    staleTime: Infinity,
    cacheTime: Infinity,
    onSuccess: () => {
      removeUnitItem();
      setSelectedUnitId('all');
    },
  });

  useEffect(() => {
    if (selectedCategoryId) {
      refetch();
    }
  }, [selectedCategoryId]);

  const {
    data: unitItemResponse,
    isLoading: isUnitItemLoading,
    remove: removeUnitItem,
    refetch: refetchUnitItem,
  } = useQuery(
    ['unitItem'],
    () => getUnitItems(selectedCategoryId as string, selectedUnitId as string),
    {
      suspense: false,
      enabled: !!selectedUnitId,
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess(data) {
        let count = 0;
        data.units.forEach((unit) => {
          count += unit.passages!.length;
        });
        setSelectedItems(data.units);
        setItemCount(count);
      },
    }
  );

  useEffect(() => {
    if (selectedUnitId) {
      if (selectedUnitId === 'all' && unitItemResponse) {
        const data = unitItemResponse.units;
        let count = 0;
        data?.forEach((unit) => {
          count += unit.passages!.length;
        });
        setSelectedItems(data);
        setItemCount(count);
        return;
      }
      const selectData = unitItemResponse?.units.find(
        (unit) => unit.id === selectedUnitId
      );
      if (selectData) {
        setItemCount(selectData.passages!.length);
        setSelectedItems([selectData]);
      }
    }
  }, [selectedUnitId, unitItemResponse]);

  // side peek
  const filterTypes = {
    all: {
      label: '모두 보기',
      value: 'all',
    },
    board: {
      label: '복사한 문제만 보기',
      value: 'board',
    },
    handout: {
      label: '구매한 문제만 보기',
      value: 'handout',
    },
  };
  type TUsableQuizType = 'board' | 'handout' | 'origin';
  const { setStatus } = useEditorStatusState();
  const [selectedFilter, setSelectedFilter] = useState(filterTypes.all.value);
  const [openTargetPassageId, setOpenTargetPassageId] = useState<string>();
  const [openFilter, setOpenFilter] = useState(false);
  const [targetPassage, setTargetPassage] = useState<IUnitPassage>();
  const [totalUsableQuiz, setTotalUsableQuiz] = useState(0);
  const [openSidePeek, setOpenSidePeek] = useState(false);
  const [deleteBoardTargetId, setDeleteBoardTargetId] = useState<string>();
  const queryClient = useQueryClient();
  const { mutate: deleteBoard } = useMutation(
    (id: string) => deleteBoardItem(id),
    {
      onSuccess: () => {
        window.showActionBar({
          title: '보드에 문제를 삭제했어요.',
          status: 'success',
        });
        queryClient.invalidateQueries(['unitItem']);
        Mixpanel.track('Delete Board', {
          source: targetPassage?.source,
          unit: targetPassage?.unit,
          paragraph: targetPassage?.paragraph,
        });
      },
    }
  );
  useEffect(() => {
    const newBoardItems = targetPassage?.boardItems?.filter(
      (item) => item.id !== deleteBoardTargetId
    );
    setTargetPassage({
      ...targetPassage!,
      boardItems: newBoardItems!,
    });
  }, [deleteBoardTargetId]);
  useEffect(() => {
    let targetPassage: IUnitPassage | undefined;
    selectedItems?.some((unit) => {
      targetPassage = unit.passages?.find(
        (passage) => passage.id === openTargetPassageId
      );
      return targetPassage;
    });
    if (targetPassage) {
      setTargetPassage(targetPassage);
      setTotalUsableQuiz(
        targetPassage.boardItems.length + targetPassage.handoutItems.length
      );
      setOpenSidePeek(true);
    }
  }, [openTargetPassageId]);

  const addQuiz = (quiz: IQuiz, type: TUsableQuizType) => {
    const newQuizzes = [
      ...quizzes,
      {
        ...quiz,
        id: uuidv4(),
      },
    ];
    setQuizzes(newQuizzes);
    setStatus('update');

    window.showActionBar({
      title: '편집하기 탭에 추가되었습니다.',
      status: 'success',
    });
    Mixpanel.track('Add Quiz', {
      source: quiz.source,
      unit: quiz.unit,
      paragraph: quiz.paragraph,
      type,
    });
  };

  const renderCategory = (category: string) => {
    return QuizCategories.find((item) => item.value === category)?.label;
  };

  const renderUsableQuiz = (quiz: IQuiz, type: TUsableQuizType = 'handout') => {
    return (
      <div css={UsableQuizCSS} key={`usable-quiz-${quiz.id}`}>
        <div className="btn-wrapper">
          {type === 'board' && (
            <button
              className="delete-board"
              onClick={() => {
                setDeleteBoardTargetId(quiz.id);
                deleteBoard(quiz.id);
              }}
            >
              <Image
                src="/assets/ic_saved_board.png"
                alt="saved board"
                width={18}
                height={17}
              />
            </button>
          )}
          <button
            onClick={() => addQuiz(quiz, type)}
            className="add-usable-quiz"
          >
            <div />
            <div />
          </button>
        </div>
        <p className="category">{renderCategory(quiz.category)}</p>
        <Quiz quiz={quiz} />
      </div>
    );
  };

  const addAll = () => {
    if (!targetPassage) {
      return;
    }
    const newQuizzes = [...quizzes];
    const addQuizzes: IQuiz[] = [];
    if (selectedFilter !== filterTypes.board.value) {
      targetPassage.handoutItems.forEach((handoutItem) => {
        addQuizzes.push({
          ...handoutItem,
          id: uuidv4(),
        });
      });
    }
    if (selectedFilter !== filterTypes.handout.value) {
      targetPassage.boardItems.forEach((boardItem) => {
        addQuizzes.push({
          ...boardItem,
          id: uuidv4(),
        });
      });
    }
    setQuizzes([...newQuizzes, ...addQuizzes]);
    setStatus('update');
    window.showActionBar({
      title: '편집하기 탭에 추가되었습니다.',
      status: 'success',
    });
    Mixpanel.track('Add All Quizzes', {
      quizCount: addQuizzes.length,
      source: targetPassage.source,
      unit: targetPassage.unit,
      paragraph: targetPassage.paragraph,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <PropagateLoader color={theme.colors.primary} />
      </Layout>
    );
  }
  return (
    <Layout full>
      <div css={LoadPageCSS}>
        <div className="categories">
          {data?.categories.map((category) => {
            return (
              <CategoryAccordion
                defaultOpen
                key={`category-${category.title}`}
                label={category.title}
              >
                {category.typeCategories.map((typeCategory) => (
                  <CategoryAccordion
                    defaultOpen
                    key={`type-category-${typeCategory.title}`}
                    label={typeCategory.title}
                  >
                    {typeCategory.seriesCategories.map((seriesCategory) => (
                      <CategoryAccordion
                        key={`series-category-${seriesCategory.title}`}
                        label={seriesCategory.title}
                        defaultOpen={
                          seriesCategory.sourceCategories[0].id ===
                          selectedCategoryId
                        }
                      >
                        {seriesCategory.sourceCategories.map(
                          (sourceCategory) => (
                            <p
                              className={classNames('source-category', {
                                selected:
                                  selectedCategoryId === sourceCategory.id,
                              })}
                              key={`source-category-${sourceCategory.id}`}
                              onClick={() => {
                                setSelectedCategoryId(sourceCategory.id);
                              }}
                            >
                              {sourceCategory.title}
                            </p>
                          )
                        )}
                      </CategoryAccordion>
                    ))}
                  </CategoryAccordion>
                ))}
              </CategoryAccordion>
            );
          })}
        </div>
        {!isUnitsLoading && unitsResponse && (
          <div className="units-wrapper">
            <h3>{unitsResponse.title}</h3>
            <div className="units">
              <p
                onClick={() => setSelectedUnitId('all')}
                className={classNames({
                  selected: selectedUnitId === 'all',
                })}
              >
                전체
              </p>
              {unitsResponse.units.map((unit) => (
                <p
                  onClick={() => {
                    setSelectedUnitId(unit.id);
                  }}
                  key={`unit-${unit.id}`}
                  className={classNames({
                    selected: selectedUnitId === unit.id,
                  })}
                >
                  {unit.title}
                </p>
              ))}
            </div>
            {!isUnitItemLoading && unitItemResponse && selectedItems && (
              <div className="unit-items">
                <div className="unit-items__header">
                  <p>
                    원문<span>총 {itemCount}개</span>
                  </p>
                </div>
                {selectedItems.map((unit) => (
                  <div className="passages-wrapper" key={`unit-${unit.id}`}>
                    <p className="passages-wrapper__title">{unit.title}</p>
                    {unit.passages!.map((passage) => (
                      <Passage
                        key={`passage-${passage.id}`}
                        {...passage}
                        setOpenTargetPassageId={setOpenTargetPassageId}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Overlay
        open={openSidePeek}
        onClose={() => {
          setOpenTargetPassageId(undefined);
          setOpenSidePeek(false);
          setOpenFilter(false);
        }}
      >
        {totalUsableQuiz === 0 || !targetPassage ? (
          <div css={ChildItemSidePeekCSS(openSidePeek)}>
            <div className="empty-usable-quiz">
              <h3>
                문제를 제작하시거나,
                <br />
                편집 가능한 자료를 구매하세요!
              </h3>
              <button
                onClick={() =>
                  window.open('https://studio-blog.solvook.com/pyeon/')
                }
              >
                편집 가능한 자료 리스트
                <Icon
                  icon={ArrowRight}
                  size={Sizes.small}
                  color={theme.var.white}
                />
              </button>
            </div>
          </div>
        ) : (
          <div css={ChildItemSidePeekCSS(openSidePeek)}>
            <p className="header">사용 가능한 문제</p>
            <div css={FilterCSS}>
              <button
                className={classNames({
                  active: openFilter,
                })}
                onClick={() => {
                  setOpenFilter(!openFilter);
                }}
              >
                {filterTypes[selectedFilter as keyof typeof filterTypes]?.label}
                <Icon
                  icon={ArrowDown}
                  size={Sizes.small}
                  color={openFilter ? theme.var.white : theme.var.gray200}
                />
              </button>
              {openFilter && (
                <div className="filter__list">
                  {Object.values(filterTypes).map((filterType) => (
                    <button
                      key={`${targetPassage.id} - ${filterType.value}`}
                      onClick={() => {
                        setSelectedFilter(filterType.value);
                        setOpenFilter(false);
                      }}
                      className={
                        selectedFilter === filterType.value ? 'active' : ''
                      }
                    >
                      {filterType.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="content">
              <div className="content__header">
                <p>
                  총{' '}
                  {selectedFilter === filterTypes.all.value
                    ? totalUsableQuiz
                    : selectedFilter === filterTypes.board.value
                    ? targetPassage.boardItems.length
                    : targetPassage.handoutItems.length}
                  개
                </p>
                <button onClick={addAll}>+ 모든 문제 편집하기에 추가</button>
              </div>
              {targetPassage.handoutItems?.length > 0 &&
                selectedFilter !== filterTypes.board.value && (
                  <div className="quiz-wrapper">
                    {targetPassage.handoutItems?.map((handoutItem) => (
                      <Fragment key={handoutItem.id}>
                        {renderUsableQuiz(handoutItem)}
                      </Fragment>
                    ))}
                  </div>
                )}
              {targetPassage.boardItems?.length > 0 &&
                selectedFilter !== filterTypes.handout.value && (
                  <div className="quiz-wrapper">
                    {targetPassage.boardItems?.map((boardItem) => (
                      <Fragment key={boardItem.id}>
                        {renderUsableQuiz(boardItem, 'board')}
                      </Fragment>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}
      </Overlay>
    </Layout>
  );
};

export default LoadPage;

const LoadPageCSS = (theme: Theme) => css`
  display: flex;

  .categories {
    width: 296px;
    flex-basis: 296px;
    min-width: 296px;
    height: calc(100vh - 88px);
    overflow: scroll;
    background-color: ${theme.var.white};
  }

  .source-category {
    padding: ${Spacing.medium}px;
    ${Typography.body16}
    color: ${theme.var.sol_gray_500};
    cursor: pointer;
    font-weight: 600;

    &.selected {
      border-radius: ${Radius.medium}px;
      background-color: ${theme.colors.indigo50};
      color: ${theme.colors.sol_indigo_500};
    }
  }

  .units-wrapper {
    flex: 1;
    h3 {
      padding: ${Spacing.xlarge}px;
      text-align: center;
      background-color: ${theme.var.sol_gray_0};
      border-bottom: 1px solid ${theme.var.sol_gray_50};
    }

    .units {
      background-color: ${theme.var.sol_gray_0};
      display: flex;
      position: absolute;
      width: calc(100% - 296px - 160px);
      overflow: scroll;
      gap: ${Spacing.xxlarge}px;
      padding: 0 ${Spacing.medium}px;

      p {
        white-space: nowrap;
        text-align: center;
        cursor: pointer;
        padding: ${Spacing.medium}px 0;
        &.selected {
          box-shadow: inset 0 -4px 0 0 ${theme.colors.sol_indigo_500};
        }
      }
    }

    .unit-items {
      height: calc(100vh - 124px - 88px);
      margin-top: 56px;
      overflow: scroll;
      padding: ${Spacing.xxxlarge}px;
      display: flex;
      flex-direction: column;
      gap: ${Spacing.xxlarge}px;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: ${Spacing.medium}px;

        p {
          font-weight: 600;
          font-size: ${FontSizes.xlarge}px;
          span {
            color: ${theme.var.sol_gray_500};
            ${Typography.body16}
            font-weight: 400;
            margin-left: ${Spacing.xsmall}px;
          }
        }

        button {
          padding: ${Spacing.xsmall}px ${Spacing.small}px;
          border: 1px solid ${theme.colors.sol_indigo_500};
          border-radius: ${Radius.small}px;
          background-color: ${theme.var.white};
          color: ${theme.colors.sol_indigo_500};
        }
      }

      .passages-wrapper {
        display: flex;
        flex-direction: column;
        gap: ${Spacing.medium}px;

        &__title {
          color: ${theme.var.sol_gray_500};
          font-weight: 600;
        }
      }
    }
  }
`;

const ChildItemSidePeekCSS = (openSidePeek: boolean) => (theme: Theme) => css`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 560px;
  background-color: ${theme.var.sol_gray_0};
  border-left: 1px solid ${theme.var.sol_gray_50};
  height: 100vh;
  z-index: 9;
  overflow: scroll;

  .empty-usable-quiz {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    h3 {
      color: ${theme.var.gray700};
      text-align: center;
      margin-bottom: ${Spacing.xlarge}px;
    }

    button {
      background-color: ${theme.colors.sol_indigo_500};
      color: ${theme.var.white};
      padding: ${Spacing.medium}px ${Spacing.xlarge}px;
      display: flex;
      align-items: center;
      ${Typography.body16}
      font-weight: 600;
      border-radius: ${Radius.small}px;
      gap: ${Spacing.xxsmall}px;
    }
  }

  .header {
    font-size: ${FontSizes.xlarge}px;
    font-weight: 600;
    padding: ${Spacing.xxlarge}px;
    background-color: ${theme.var.white};
  }

  .content {
    padding: ${Spacing.xlarge}px ${Spacing.xxlarge}px;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${Spacing.xlarge}px;

      p {
        ${Typography.body16}
        color: ${theme.var.sol_gray_500};
      }

      button {
        color: ${theme.colors.sol_indigo_500};
        font-size: ${FontSizes.small}px;
        font-weight: 700;
      }
    }

    .quiz-wrapper {
      display: flex;
      flex-direction: column;
      gap: ${Spacing.xsmall}px;

      > div {
        background-color: ${theme.var.white};
        border-radius: ${Radius.large}px;
        margin-bottom: ${Spacing.xxlarge}px;
        padding: ${Spacing.xlarge}px;
        box-shadow: 3px 3px 12px 0px #1c1f2e0f;
      }

      .category {
        font-size: ${FontSizes.small}px;
        color: ${theme.colors.mint600};
        padding: ${Spacing.xxhsmall}px ${Spacing.xhsmall}px;
        border-radius: ${Radius.small}px;
        background-color: ${theme.colors.mint0};
        margin-bottom: ${Spacing.xsmall}px;
        display: inline-block;
        font-weight: 700;
      }
    }
  }

  ${!openSidePeek &&
  css`
    display: none;
  `}
`;

const FilterCSS = (theme: Theme) => css`
  background-color: ${theme.var.sol_gray_50};
  padding: ${Spacing.medium}px;
  position: relative;

  > button {
    display: flex;
    align-items: center;
    gap: ${Spacing.xxsmall}px;
    color: ${theme.var.sol_gray_500};
    padding: ${Spacing.xsmall}px ${Spacing.medium}px;
    border-radius: ${Radius.round}px;
    border: 1px solid ${theme.var.sol_gray_100};
    background-color: ${theme.var.white};
    ${Typography.body16}
    font-weight: 600;

    &.active {
      background-color: ${theme.colors.sol_indigo_500};
      border-color: ${theme.colors.sol_indigo_500};
      color: ${theme.var.white};
    }
  }

  .filter__list {
    position: absolute;
    width: 192px;
    top: 62px;
    background-color: ${theme.var.white};
    padding: ${Spacing.medium}px;
    border: 1px solid ${theme.var.sol_gray_0};
    border-radius: ${Radius.large}px;
    box-shadow: 6px 6px 20px 0px #1c1f2e1f;
    display: flex;
    flex-direction: column;
    gap: ${Spacing.medium}px;

    button {
      background-color: ${theme.var.sol_gray_0};
      ${Typography.body14}
      color: ${theme.var.sol_gray_500};
      padding: ${Spacing.xsmall}px;
      text-align: center;
      width: 100%;
      border-radius: ${Radius.small}px;
      font-weight: 600;

      &.active {
        border: 1px solid ${theme.colors.sol_indigo_500};
        color: ${theme.colors.sol_indigo_500};
        background-color: ${theme.colors.indigo50};
      }

      &:first-of-type {
        margin-bottom: ${Spacing.medium}px;

        &:after {
          position: absolute;
          height: 1px;
          width: calc(100% - 32px);
          content: '';
          display: block;
          background-color: ${theme.var.sol_gray_50};
          left: 16px;
          top: 65px;
        }
    }
  }
`;

const UsableQuizCSS = (theme: Theme) => css`
  .btn-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .delete-board {
      width: 40px;
      height: 40px;
      border-radius: ${Radius.small}px;

      &:hover {
        background-color: ${theme.var.sol_gray_0};
      }
    }

    .add-usable-quiz {
      width: 40px;
      height: 32px;
      position: relative;
      border-radius: ${Radius.small}px;
      border: 1px solid ${theme.colors.sol_indigo_500};
      display: block;
      margin-left: auto;
      margin-bottom: ${Spacing.xsmall}px;

      > div:first-of-type {
        width: 1.5px;
        height: 12px;
        background-color: ${theme.colors.sol_indigo_500};
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      > div:last-of-type {
        width: 12px;
        height: 1.5px;
        background-color: ${theme.colors.sol_indigo_500};
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
`;
