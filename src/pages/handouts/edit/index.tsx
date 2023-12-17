import type { NextPage } from 'next';
import { v4 as uuidv4 } from 'uuid';
import Layout from '@/components/common/Layout';
import { css, Theme, useTheme } from '@emotion/react';
import QuizCardList from '@/components/studio/QuizCardList';
import { useCallback, useEffect, useState } from 'react';
import Tab, { useTab } from '@/components/common/Tab';
import { StudioTabs } from '../../../../constants';
import QuizEditorModal from '@/components/modal/QuizEditorModal';
import { IQuiz } from '../../../../model';
import StudioInfoList from '@/components/studio/StudioInfoList';
import { Spacing, Typography, Radius } from 'solvook-design-system';
import {
  useQuizzesStore,
  useQuizzesHistory,
  useEditorStatusState,
  useInfoStore,
} from '@/utils/store';
import { DropResult } from 'react-beautiful-dnd';
import ActionBar, { ActionBarContentCSS } from '@/components/common/ActionBar';
import { useModal } from '@/utils/overlay';
import { Icon, CheckCircle } from 'solvook-design-system/icon';
import PreviewModal from '@/components/modal/PreviewModal';
import QuizzesLoaderModal from '@/components/modal/QuizzesLoaderModal';
import QuizMetaModal from '@/components/modal/QuizMetaModal';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { getStudioHandout } from '@/api/studioHandouts';
import PropagateLoader from 'react-spinners/PropagateLoader';
import { getHandout } from '@/api/handouts';
import SaveCompleteModal from '@/components/modal/SaveCompleteModal';
import { Mixpanel } from '@/utils/mixpanel';
import mixpanel from 'mixpanel-browser';
import Button from '@/components/common/Button';

const EditPage: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { quizzes, setQuizzes } = useQuizzesStore();
  const { undo, redo } = useQuizzesHistory((state) => state);
  const { title, setTitle, subTitle, setSubTitle, logo, setLogo } =
    useInfoStore();
  const [handoutId, setHandoutId] = useState<string>(
    router.query.handoutId as string
  );
  const type = router.query.type as string;
  const isEdit = !!handoutId && !type;
  const [selectedQuiz, setSelectedQuiz] = useState<IQuiz>();
  const [isShowNewQuizType, setIsShowNewQuizType] = useState<boolean>();
  const { setStatus } = useEditorStatusState();
  useEffect(() => {
    setStatus('notUpdate');
    const preventClose = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', preventClose);

    return () => {
      window.removeEventListener('beforeunload', preventClose);
    };
  }, []);
  useEffect(() => {
    /* @ts-ignore */
    if (!mixpanel.__loaded) {
      return;
    }
    Mixpanel.track('Page Viewed', {
      page: 'Studio',
    });
    if (!router.query.handoutId) {
      Mixpanel.track('Studio Opened', {
        type: 'new',
      });
    } else if (type) {
      Mixpanel.track('Studio Opened', {
        type: 'edit',
      });
    } else {
      Mixpanel.track('Studio Opened', {
        type: 'edit_my',
      });
    }
  }, [
    /* @ts-ignore */
    mixpanel.__loaded,
  ]);

  const [isQuizEditModalOpen, { open: openQuizModal, close: closeQuizModal }] =
    useModal('quiz-edit-modal');
  const [isPreviewOpen, { open: openPreviewModal, close: closePreviewModal }] =
    useModal('preview-modal');
  const [isLoadModalOpen, { open: openLoadModal, close: closeLoadModal }] =
    useModal('load-modal');
  const [
    isMetadataModalOpen,
    { open: openMetadataModal, close: closeMetadataModal },
  ] = useModal('metadata-modal');

  const { data: handout, isLoading } = useQuery(
    ['handout', handoutId],
    () => (isEdit ? getStudioHandout(handoutId!) : getHandout(handoutId!)),
    {
      enabled: !!handoutId && quizzes.length === 0,
      retry: false,
      suspense: false,
      onSuccess: (data) => {
        if (data) {
          setQuizzes(data.items);
          setTitle(data.title);
          setSubTitle(data.object?.subTitle as string);
          if (isEdit) {
            setLogo(data.object?.logoUrl as string);
          }
        }
      },
    }
  );

  const [metadataQuizzes, setMetadataQuizzes] = useState<IQuiz[]>([]);
  const [metadataTargetId, setMetadataTargetId] = useState<string>('');

  const [
    isDeleteQuizModalOpen,
    { open: openDeleteQuizModal, close: closeDeleteQuizModal },
  ] = useModal('delete-quiz-modal');

  const [
    isSaveCompleteModalOpen,
    { open: openSaveCompleteModal, close: closeSaveCompleteModal },
  ] = useModal('save-complete-modal');

  useEffect(() => {
    if (router.query.handoutId) {
      setHandoutId(router.query.handoutId as string);
    }
  }, [router.query]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isQuizEditModalOpen) {
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
  }, [isQuizEditModalOpen]);
  const checkValidationTab = (tab: StudioTabs) => {
    if (tab === StudioTabs.twins && !selectedQuiz) {
      alert('문제를 선택해주세요.');
      return false;
    }
    onChange(tab);
  };
  const { tabs, activeTab, onChange } = useTab([
    {
      label: '문제 리스트',
      value: StudioTabs.info,
    },
    // {
    //   label: '쌍둥이 문제',
    //   value: StudioTabs.twins,
    // },
    // {
    //   label: '북마크 문제',
    //   value: StudioTabs.bookmark,
    // },
    // {
    //   label: '문제 편집',
    //   value: StudioTabs.editor,
    // },
    // {
    //   label: '개념 추가',
    //   value: StudioTabs.addConcept,
    // },
    // {
    //   label: '판매 검증',
    //   value: StudioTabs.salsVerification,
    // },
  ]);

  const moveQuizzesScroll = useCallback((quizId: string) => {
    const quizElement = document.getElementById(quizId);
    if (quizElement) {
      quizElement.scrollIntoView(false);
    }
  }, []);

  const moveItem = useCallback(
    (result: DropResult) => {
      if (!result.destination) {
        return;
      }
      Mixpanel.track('Quiz Order Changed');
      const prevIndex = result.source.index;
      const afterIndex = result.destination.index;
      const newQuizzes = [...quizzes];
      const [removed] = newQuizzes.splice(prevIndex, 1);
      newQuizzes.splice(afterIndex, 0, removed);
      setQuizzes(newQuizzes);
    },
    [setQuizzes, quizzes]
  );

  const copyQuiz = useCallback(
    (quiz: IQuiz, index: number) => {
      const newQuiz = {
        ...quiz,
        id: uuidv4(),
      };

      const newQuizzes = [...quizzes];
      newQuizzes.splice(index + 1, 0, newQuiz);

      setQuizzes(newQuizzes);

      Mixpanel.track('Quiz Duplicated', {
        category: quiz.category,
        source: quiz.source,
        unit: quiz.unit,
        paragraph: quiz.paragraph,
      });

      setTimeout(() => {
        document
          .getElementById(`quiz-info-${newQuiz.id}`)
          ?.classList.add('copied');
      }, 50);
      setTimeout(() => {
        document
          .getElementById(`quiz-info-${newQuiz.id}`)
          ?.classList.remove('copied');
      }, 2050);
    },
    [quizzes, setQuizzes]
  );

  const removeQuiz = useCallback(
    (quiz: IQuiz) => {
      const newQuizzes = quizzes.filter((q) => q.id !== quiz.id);
      setQuizzes(newQuizzes);
      Mixpanel.track('Quiz Deleted', {
        category: quiz.category,
        source: quiz.source,
        unit: quiz.unit,
        paragraph: quiz.paragraph,
      });
      openDeleteQuizModal();
    },
    [quizzes, setQuizzes]
  );

  const openQuizEditor = useCallback((quiz: IQuiz) => {
    setSelectedQuiz(quiz);
    openQuizModal();
  }, []);

  const openNewQuizEditor = useCallback(() => {
    setSelectedQuiz(undefined);
    openQuizModal();
  }, []);

  const openEditMetadata = (quizzes: IQuiz[], id: string) => {
    setMetadataTargetId(id);
    setMetadataQuizzes(quizzes);
    openMetadataModal();
  };

  const setMainInfo = (title?: string, subTitle?: string) => {
    if (title) {
      setTitle(title);
    }

    if (subTitle) {
      setSubTitle(subTitle);
    }
  };

  if (isLoading && isEdit) {
    return (
      <Layout backgroundColor={theme.var.sol_gray_50}>
        <div css={LoadingCSS}>
          <PropagateLoader color={theme.colors.primary} />
          <p>불러오는 중입니다.</p>
        </div>
      </Layout>
    );
  }
  return (
    <Layout
      backgroundColor={theme.var.sol_gray_50}
      cta={
        <div css={HeaderCtaCSS}>
          <Button
            onClick={() => {
              Mixpanel.track('Decorating Pop-up Opened');
              openPreviewModal();
            }}
            disabled={quizzes.length === 0}
          >
            저장하기
          </Button>
        </div>
      }
    >
      <div css={StudioWrapperCSS}>
        <div className="studio-main">
          <QuizCardList
            quizzes={quizzes}
            moveItem={moveItem}
            removeQuiz={removeQuiz}
            openEditQuiz={openQuizEditor}
          />
          <div className="right-area">
            <div css={StudioInfoHeaderCSS}>
              <Tab
                tabs={tabs}
                activeTab={activeTab}
                onChange={checkValidationTab}
                stickyAt={0}
              />
              <div className="new-quiz-wrapper">
                <div className="new-quiz-button-wrapper">
                  <button
                    onClick={() => {
                      setIsShowNewQuizType(!isShowNewQuizType);
                    }}
                  >
                    + 새 문제
                  </button>
                </div>
                {isShowNewQuizType && (
                  <div className="new-quiz-type">
                    <button
                      onClick={() => {
                        router.replace({
                          pathname: '/handouts/load',
                          query: {
                            ...router.query,
                          },
                        });
                      }}
                    >
                      지문 불러오기
                    </button>
                    <button
                      onClick={() => {
                        setIsShowNewQuizType(false);
                        openNewQuizEditor();
                      }}
                    >
                      직접 입력하기
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="right-area__content">
              {activeTab === StudioTabs.info && (
                <StudioInfoList
                  quizzes={quizzes}
                  moveItem={moveItem}
                  moveQuizzesScroll={moveQuizzesScroll}
                  copyQuiz={copyQuiz}
                  removeQuiz={removeQuiz}
                />
              )}
              {activeTab === StudioTabs.twins && <p>쌍둥이 문제</p>}
              {activeTab === StudioTabs.bookmark && <p>북마크 문제</p>}
              {activeTab === StudioTabs.editor && (
                <p>
                  <button onClick={openQuizModal}>문제 편집</button>
                </p>
              )}
              {activeTab === StudioTabs.addConcept && <p>개념 추가</p>}
              {activeTab === StudioTabs.salsVerification && <p>판매 검증</p>}
            </div>
          </div>
        </div>
      </div>
      {isQuizEditModalOpen && (
        <QuizEditorModal
          open={isQuizEditModalOpen}
          onClose={closeQuizModal}
          quiz={selectedQuiz}
          setQuizzes={setQuizzes}
          quizzes={quizzes}
          openMetadataModal={openEditMetadata}
        />
      )}
      <QuizMetaModal
        open={isMetadataModalOpen}
        setQuizzes={setQuizzes}
        targetId={metadataTargetId}
        quizzes={metadataQuizzes}
        onClose={() => {
          setMetadataTargetId('');
          setMetadataQuizzes([]);
          closeMetadataModal();
        }}
      />
      <QuizzesLoaderModal
        setQuizzes={setQuizzes}
        open={isLoadModalOpen}
        onClose={closeLoadModal}
        setMainInfo={setMainInfo}
      />
      <PreviewModal
        handoutId={handoutId}
        setHandoutId={setHandoutId}
        open={isPreviewOpen}
        onClose={closePreviewModal}
        quizzes={quizzes}
        title={title}
        subTitle={subTitle}
        logo={logo}
        setTitle={setTitle}
        setSubTitle={setSubTitle}
        setLogo={setLogo}
        isEdit={isEdit}
        saveComplete={openSaveCompleteModal}
      />
      <ActionBar
        title="delete-quiz"
        open={isDeleteQuizModalOpen}
        onClose={closeDeleteQuizModal}
      >
        <div css={ActionBarContentCSS}>
          <p>
            <Icon icon={CheckCircle} color={theme.colors.mint400} />
            문제를 삭제했습니다.
          </p>
          <button
            style={{ marginLeft: Spacing.medium, pointerEvents: 'auto' }}
            onClick={() => {
              closeDeleteQuizModal();
              undo();
            }}
          >
            실행 취소
          </button>
        </div>
      </ActionBar>

      <SaveCompleteModal
        open={isSaveCompleteModalOpen}
        onClose={closeSaveCompleteModal}
        handout={handout}
      />
    </Layout>
  );
};

export default EditPage;

const LoadingCSS = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 88px);

  p {
    ${Typography.body16};
    color: ${theme.var.gray600};
    margin-top: ${Spacing.xxxlarge}px;
  }
`;

const StudioWrapperCSS = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 88px);

  .studio-main {
    display: flex;
  }

  .right-area {
    width: 100%;
    background-color: ${theme.var.white};

    .copied {
      .studio-info-list {
        animation: target-fade 2s ease-in-out;
      }
    }
  }

  @keyframes target-fade {
    0% {
      background-color: rgba(173, 216, 230, 0.8) !important;
    }
    100% {
      background-color: rgba(173, 216, 230, 0) !important;
    }
  }
`;

const StudioInfoHeaderCSS = (theme: Theme) => css`
  position: relative;

  .new-quiz-button-wrapper {
    display: flex;
    gap: ${Spacing.small}px;

    > button {
      background-color: ${theme.var.white};
      padding: ${Spacing.xsmall}px ${Spacing.small}px;
      border: 1px solid ${theme.border.light};
      border-radius: ${Radius.small}px;
    }
  }
  .new-quiz-wrapper {
    position: absolute;
    top: 12px;
    right: 16px;
    z-index: 9;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .new-quiz-type {
      position: absolute;
      z-index: 99;
      top: 50px;
      right: 0;
      background-color: ${theme.var.white};
      padding: ${Spacing.small}px ${Spacing.medium}px;
      border: 1px solid ${theme.border.light};
      display: flex;
      flex-direction: column;
      gap: ${Spacing.medium}px;
      align-items: flex-start;

      button {
        width: 120px;
        text-align: left;
      }
    }
  }
`;

const HeaderCtaCSS = (theme: Theme) => css`
  height: 64px;
  background-color: ${theme.var.white};
  display: flex;
  align-items: center;
  padding: 0 ${Spacing.medium}px;

  > button {
    width: 95px;
    margin-left: auto;
    height: 48px;
  }
`;
