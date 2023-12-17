import { Theme, css, useTheme } from '@emotion/react';

import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  FontSizes,
  Radius,
  Sizes,
  Spacing,
  Typography,
} from 'solvook-design-system';
import { trimStringByLine } from '../../utils/misc';
import { IUnitPassage } from '../../../model';
import { useEditorStatusState, useQuizzesStore } from '@/utils/store';
import { ArrowRight, Icon } from 'solvook-design-system/icon';

import { Mixpanel } from '@/utils/mixpanel';

type Props = {
  setOpenTargetPassageId: (id: string) => void;
};

const Passage = ({
  id,
  content,
  source,
  unit,
  paragraph,
  boardItems,
  handoutItems,
  setOpenTargetPassageId,
}: IUnitPassage & Props) => {
  const [isContentOpen, setContentOpen] = useState(false);
  const { quizzes, setQuizzes } = useQuizzesStore();
  const [content1, content2] = useMemo(
    () => trimStringByLine(content),
    [content]
  );
  const { setStatus } = useEditorStatusState();

  // const [hasQuiz, setHasQuiz] = useState(false);
  // useEffect(() => {
  //   const quiz = quizzes.find((quiz) => quiz.passage === content);
  //   quiz && setHasQuiz(true);
  // });

  const addPassage = () => {
    const quiz = {
      passage: content,
      source: source,
      unit: unit,
      paragraph: paragraph,
      title: '',
      category: '',
      id: uuidv4(),
      passageId: id,
    };
    setQuizzes([...quizzes, quiz]);
    setStatus('update');
    window.showActionBar({
      title: '편집하기 탭에 추가되었습니다.',
      status: 'success',
    });
    Mixpanel.track('Add Quiz', {
      source,
      unit,
      paragraph,
      type: 'origin',
    });
  };

  const theme = useTheme();

  const totalUsableQuiz = boardItems.length + handoutItems.length;

  return (
    <div css={PassageCSS} onClick={() => setOpenTargetPassageId(id)}>
      <div className="passage-header">
        <p className="source">
          {unit && <span>{unit}</span>}
          {paragraph && <span>ㆍ{paragraph}</span>}
        </p>
        <button>
          <span>사용 가능한 문제 {totalUsableQuiz}개</span>
          <Icon
            icon={ArrowRight}
            size={Sizes.xsmall}
            color={theme.var.sol_gray_500}
          />
        </button>
      </div>
      <div className="content-wrapper">
        <button
          onClick={(e) => {
            e.stopPropagation();
            addPassage();
          }}
        >
          + 편집하기에 추가
        </button>
        <p>
          {content1}
          {isContentOpen && content2}
          {!isContentOpen && content2 && (
            <button
              css={ContentMoreBtnCSS}
              className="text-btn"
              onClick={(e) => {
                e.stopPropagation();
                setContentOpen(true);
              }}
            >
              ...더보기
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default Passage;

const ContentMoreBtnCSS = (theme: Theme) => css`
  color: ${theme.var.sol_gray_500};

  &:before {
    content: '\\00a0';
  }
`;

const PassageCSS = (theme: Theme) => css`
  background-color: ${theme.var.white};
  padding: ${Spacing.medium}px;
  border-radius: ${Radius.small}px;
  box-shadow: 3px 3px 12px 0px #1c1f2e0f;

  .passage-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${Spacing.xxlarge}px;

    button {
      display: flex;
      align-items: center;
      font-size: ${FontSizes.small}px;
      color: ${theme.var.sol_gray_500};
      padding: ${Spacing.xsmall}px ${Spacing.medium}px;
      border: 1px solid ${theme.var.sol_gray_500};
      border-radius: ${Radius.small}px;
      gap: ${Spacing.xxsmall}px;
      margin-left: auto;
    }
  }

  .source {
    ${Typography.body16}
    font-weight: 600;
    color: ${theme.var.gray900};
  }

  .content-wrapper {
    display: flex;
    align-items: baseline;
    gap: ${Spacing.xxlarge}px;

    p {
      white-space: pre-line;
      line-height: 1.5;
    }

    > button {
      width: 120px;
      color: ${theme.colors.sol_indigo_500};
      font-size: ${FontSizes.small}px;
      font-weight: 700;
      text-align: left;
      min-width: 120px;
    }
  }
`;
