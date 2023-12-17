import type { NextPage } from 'next';
import { v4 as uuidv4 } from 'uuid';
import Layout from '@/components/common/Layout';
import { css, Theme, useTheme } from '@emotion/react';
import DragableQuizzes from '@/components/studio/QuizCardList';
import { useCallback, useEffect, useState } from 'react';
import Tab, { useTab } from '@/components/common/Tab';
import { StudioTabs } from '../../constants';
import QuizEditorModal from '@/components/modal/QuizEditorModal';
import { IQuiz } from '../../model';
import StudioInfoList from '@/components/studio/StudioInfoList';
import { Spacing, Typography, Radius } from 'solvook-design-system';
import { useQuizzesStore, useQuizzesHistory } from '@/utils/store';
import { DropResult } from 'react-beautiful-dnd';
import ActionBar from '@/components/common/ActionBar';
import { useModal } from '@/utils/overlay';

import { useRouter } from 'next/router';

const HomePage: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { quizzes, setQuizzes } = useQuizzesStore();
  const { undo, redo } = useQuizzesHistory((state) => state);
  const [title, setTitle] = useState<string>();
  const [subTitle, setSubTitle] = useState<string>();
  const [logo, setLogo] = useState<string>();
  const [selectedQuiz, setSelectedQuiz] = useState<IQuiz>();
  const [newQuizPosition, setNewQuizPosition] = useState<'top' | 'bottom'>();

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

  const [metadataQuizzes, setMetadataQuizzes] = useState<IQuiz[]>([]);
  const [metadataTargetId, setMetadataTargetId] = useState<string>('');

  const [
    isDeleteQuizModalOpen,
    { open: openDeleteQuizModal, close: closeDeleteQuizModal },
  ] = useModal('delete-quiz-modal');
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
      label: '교재 구성',
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
        title: `${quiz.title} (복사본)`,
      };
      const newQuizzes = [...quizzes];
      newQuizzes.splice(index + 1, 0, newQuiz);

      setQuizzes(newQuizzes);

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
      openDeleteQuizModal();
    },
    [quizzes, setQuizzes]
  );

  const openQuizEditor = useCallback((quiz: IQuiz) => {
    setSelectedQuiz(quiz);
    openQuizModal();
  }, []);

  const openNewQuizEditor = useCallback((position: 'top' | 'bottom') => {
    setSelectedQuiz(undefined);
    setNewQuizPosition(position);
    openQuizModal();
  }, []);

  const openEditMetadata = (quizzes: IQuiz[], id: string) => {
    setMetadataTargetId(id);
    setMetadataQuizzes(quizzes);
    openMetadataModal();
  };

  const setMainInfo = (title?: string, subTitle?: string) => {
    setTitle(title);
    setSubTitle(subTitle);
  };

  return (
    <Layout>
      <p css={tmpWaitCSS}>
        만들어주신 문제 데이터를 쏠북에 이전 중입니다.
        <br />
        조금만 기다려주세요 🙂
      </p>
    </Layout>
  );

  // return (
  //   <Layout>
  //     <div css={studioWrapperCSS}>
  //       <div className="studio-header">
  //         <h3>교재 편집하기</h3>
  //         <div>
  //           <Link
  //             target="_blank"
  //             href="https://www.youtube.com/playlist?list=PLgG88ki1uYb7xyuenHQH2qUn9bH2Q-veU"
  //             onClick={() => router.push('/handouts')}
  //           >
  //             도움말
  //           </Link>
  //         </div>
  //       </div>
  //       <div className="studio-main">
  //         <DragableQuizzes
  //           quizzes={quizzes}
  //           moveItem={moveItem}
  //           // onClick={setSelectedQuiz}
  //           // selectedQuiz={selectedQuiz}
  //           removeQuiz={removeQuiz}
  //           openEditQuiz={openQuizEditor}
  //           openNewQuiz={openNewQuizEditor}
  //         />
  //         <div className="right-area">
  //           <Tab
  //             tabs={tabs}
  //             activeTab={activeTab}
  //             onChange={checkValidationTab}
  //             stickyAt={0}
  //           />
  //           <div className="right-area__content">
  //             {activeTab === StudioTabs.info && (
  //               <StudioInfoList
  //                 quizzes={quizzes}
  //                 moveItem={moveItem}
  //                 moveQuizzesScroll={moveQuizzesScroll}
  //                 copyQuiz={copyQuiz}
  //                 openNewQuiz={openNewQuizEditor}
  //                 removeQuiz={removeQuiz}
  //                 openLoadModal={openLoadModal}
  //               />
  //             )}
  //             {activeTab === StudioTabs.twins && <p>쌍둥이 문제</p>}
  //             {activeTab === StudioTabs.bookmark && <p>북마크 문제</p>}
  //             {activeTab === StudioTabs.editor && (
  //               <p>
  //                 <button onClick={openQuizModal}>문제 편집</button>
  //               </p>
  //             )}
  //             {activeTab === StudioTabs.addConcept && <p>개념 추가</p>}
  //             {activeTab === StudioTabs.salsVerification && <p>판매 검증</p>}
  //           </div>
  //           <div css={CtaFooterCSS}>
  //             <Button onClick={openPreviewModal}>저장하기</Button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     {isQuizEditModalOpen && (
  //       <QuizEditorModal
  //         open={isQuizEditModalOpen}
  //         onClose={closeQuizModal}
  //         quiz={selectedQuiz}
  //         setQuizzes={setQuizzes}
  //         quizzes={quizzes}
  //         newQuizPosition={newQuizPosition}
  //         openMetadataModal={openEditMetadata}
  //       />
  //     )}
  //     <QuizMetaModal
  //       open={isMetadataModalOpen}
  //       setQuizzes={setQuizzes}
  //       targetId={metadataTargetId}
  //       quizzes={metadataQuizzes}
  //       onClose={() => {
  //         setMetadataTargetId('');
  //         setMetadataQuizzes([]);
  //         closeMetadataModal();
  //       }}
  //     />
  //     <QuizzesLoaderModal
  //       setQuizzes={setQuizzes}
  //       open={isLoadModalOpen}
  //       onClose={closeLoadModal}
  //       setMainInfo={setMainInfo}
  //     />
  //     <PreviewModal
  //       open={isPreviewOpen}
  //       onClose={closePreviewModal}
  //       quizzes={quizzes}
  //       title={title}
  //       logo={logo}
  //       setLogo={setLogo}
  //       subTitle={subTitle}
  //       setTitle={setTitle}
  //       setSubTitle={setSubTitle}
  //     />
  //     <ActionBar
  //       title="delete-quiz"
  //       open={isDeleteQuizModalOpen}
  //       onClose={closeDeleteQuizModal}
  //     >
  //       <div css={DeleteQuizBarCSS}>
  //         <p>
  //           <Icon icon={CheckCircle} color={theme.colors.blue500} />
  //           문제를 삭제했습니다.
  //         </p>
  //         <button
  //           onClick={() => {
  //             closeDeleteQuizModal();
  //             undo();
  //           }}
  //         >
  //           실행 취소
  //         </button>
  //       </div>
  //     </ActionBar>
  //   </Layout>
  // );
};

export default HomePage;

const tmpWaitCSS = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  line-height: 1.5;
  ${Typography.body16};
  color: ${theme.var.gray600};
  margin-top: ${Spacing.xxxlarge}px;
`;

const studioWrapperCSS = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  background-color: ${theme.var.sol_gray_100};
  padding: ${Spacing.medium}px;
  overflow: hidden;
  height: 100vh;

  .studio-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${Spacing.medium}px;

    h3 {
      color: ${theme.var.gray600};
    }

    a {
      ${Typography.body16};
      color: ${theme.var.gray600};
    }
  }

  .studio-main {
    display: flex;
  }

  .right-area {
    width: 100%;
    background-color: ${theme.colors.blue50};
    border-radius: ${Radius.medium}px;
    overflow: hidden;

    &__content {
      padding: 0 ${Spacing.medium}px;
    }

    .copied {
      animation: target-fade 2s ease-in-out;
    }
  }

  @keyframes target-fade {
    0% {
      background-color: rgba(173, 216, 230, 0.8);
    }
    100% {
      background-color: rgba(173, 216, 230, 0);
    }
  }
`;

const DeleteQuizBarCSS = (theme: Theme) => css`
  ${Typography.body16};
  display: flex;
  align-items: center;
  justify-content: space-between;

  p {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button {
    ${Typography.body16};
    color: ${theme.colors.red400};
  }
`;

const CtaFooterCSS = (theme: Theme) => css`
  height: 64px;
  background-color: ${theme.var.white};
  border-top: 1px solid ${theme.border.light};
  display: flex;
  align-items: center;
  padding: 0 ${Spacing.medium}px;

  > button {
    width: 95px;
    margin-left: auto;
  }
`;
