import { useEffect, useState } from 'react';
import { IQuiz } from '../../../model';
import Modal, { ModalProps } from './Modal';
import { css, Theme, useTheme } from '@emotion/react';
import { Spacing, Typography, Radius } from 'solvook-design-system';
import {
  deleteQuizzes as deleteQuizzesApi,
  fetchQuizzesList,
  IQuizzesList,
} from '@/api/firestore';
import { useRouter } from 'next/router';
import { getRouterQuery } from '@/utils/query';

type Props = {
  setQuizzes: (quizzes: IQuiz[]) => void;
  setMainInfo: (title?: string, subTitle?: string) => void;
} & ModalProps;
const QuizzesLoaderModal = ({ setQuizzes, setMainInfo, ...props }: Props) => {
  const router = useRouter();
  const userId = getRouterQuery(router.query.userId) as string;

  const [quizzesList, setQuizzesList] = useState<IQuizzesList[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetch = async () => {
    const data = await fetchQuizzesList(userId);
    data && setQuizzesList(data);
    setIsLoaded(true);
  };
  useEffect(() => {
    if (props.open) {
      fetch();
    }
  }, [props.open, userId]);

  const selectQuizzes = (quizzesId: string) => {
    const c = window.confirm(
      '저장되지 않은 내용이 사라집니다.\n불러오시겠습니까?'
    );
    if (!c) {
      return;
    }

    const data = quizzesList.find((quizzes) => quizzes.id === quizzesId);
    if (data) {
      setQuizzes(data.quizzes);
      setMainInfo(data.title, data.subTitle);
      props.onClose();
    }
  };

  const deleteQuizzes = (quizzesId: string) => {
    const c = window.confirm('정말 삭제하시겠습니까?');
    if (!c) {
      return;
    }
    deleteQuizzesApi(userId, quizzesId);
    setTimeout(() => {
      fetch();
    }, 100);
  };

  return (
    <Modal {...props} title="불러오기" name="load" width={650}>
      <div css={QuizzesLoaderCSS}>
        {isLoaded ? (
          <>
            {quizzesList.length > 0 ? (
              <div className="quizzes-list">
                {quizzesList.map((quiz) => (
                  <div key={quiz.id}>
                    <div className="left-side ellipsis">
                      <h5 className="ellipsis">
                        {quiz.title.length === 0 ? '제목 없음' : quiz.title}
                      </h5>
                      <p>{quiz.updatedAt}</p>
                    </div>
                    <div className="right-side">
                      <button onClick={() => selectQuizzes(quiz.id)}>
                        불러오기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-quizzes">저장된 문제가 없습니다.</p>
            )}
          </>
        ) : (
          <p>불러오는 중입니다.</p>
        )}
      </div>
    </Modal>
  );
};

export default QuizzesLoaderModal;

const QuizzesLoaderCSS = (theme: Theme) => css`
  display: flex;
  max-height: 700px;
  overflow: scroll;

  > p {
    padding: ${Spacing.medium}px;
    text-align: center;
  }

  .empty-quizzes {
    color: ${theme.var.sol_gray_500};
  }

  .quizzes-list {
    display: flex;
    flex-direction: column;
    padding: ${Spacing.medium}px;
    width: 100%;

    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid ${theme.border.light};
      padding: ${Spacing.medium}px;
      width: 100%;
      cursor: pointer;
      border-radius: ${Radius.small}px;
      gap: ${Spacing.xsmall}px;

      .left-side {
        display: flex;
        flex-direction: column;
      }

      .right-side {
        display: flex;
        align-items: center;
        min-width: 154px;

        button {
          padding: ${Spacing.xsmall}px ${Spacing.small}px;
          border: 1px solid ${theme.border.light};
          border-radius: ${Radius.small}px;

          &:hover {
            background-color: ${theme.var.sol_gray_0};
          }

          &.delete-btn {
            margin-left: ${Spacing.xsmall}px;
            color: ${theme.colors.red500};
          }
        }
      }

      p {
        color: ${theme.var.sol_gray_500};
        ${Typography.body12}
      }
    }

    > div + div {
      margin-top: ${Spacing.small}px;
    }
  }
`;
