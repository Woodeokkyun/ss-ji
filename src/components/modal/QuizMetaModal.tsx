import { IQuiz } from '../../../model';
import Modal, { ModalProps } from './Modal';
import { css, Theme } from '@emotion/react';
import { Spacing, Typography, Radius, Sizes } from 'solvook-design-system';
import { SelectOption } from 'solvook-design-system/form';
import { Icon, ArrowDown } from 'solvook-design-system/icon';
import Lottie from 'react-lottie';
import doneLottie from '../../../public/assets/done_lottie.json';
import { useEffect, useRef, useState } from 'react';
import Button from '../common/Button';
import { Mixpanel } from '@/utils/mixpanel';
import { useQuery } from 'react-query';
import { getMetadata } from '@/api/sources';

type Props = {
  targetId: string;
  quizzes: IQuiz[];
  setQuizzes: (quizzes: IQuiz[]) => void;
} & ModalProps;
const QuizMetaModal = ({ targetId, quizzes, setQuizzes, ...props }: Props) => {
  const [sources, setSources] = useState<SelectOption[]>([]);
  const [units, setUnits] = useState<SelectOption[]>([]);
  const [paragraphs, setParagraphs] = useState<SelectOption[]>([]);

  const unitRef = useRef<HTMLSelectElement>(null);
  const paragraphRef = useRef<HTMLSelectElement>(null);

  const { data } = useQuery('metadata', () => getMetadata(), {
    suspense: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });
  useEffect(() => {
    if (!data) return;
    const options = data.metadata.map((meta) => {
      return {
        label: meta.title,
        value: meta.title,
      };
    });
    setSources(options);
  }, [data]);

  const [selectedSource, setSelectedSource] = useState<SelectOption>();
  const [selectedUnit, setSelectedUnit] = useState<SelectOption>();
  const [selectedParagraph, setSelectedParagraph] = useState<SelectOption>();

  useEffect(() => {
    const quiz = quizzes.find((quiz) => quiz.id === targetId);
    if (quiz?.source) {
      const source = sources.find((source) => source.value === quiz?.source);
      setSelectedSource(source);
      const targetSource = data?.metadata.find(
        (data) => data.title === source?.value
      );
      const unitOptions = targetSource?.units.map((unit) => {
        return {
          label: unit.title,
          value: unit.title,
        };
      });
      setUnits(unitOptions!);
      if (quiz.source) {
        const unit = unitOptions?.find((unit) => unit.value === quiz.unit);
        setSelectedUnit(unit);
        const targetUnit = targetSource?.units.find(
          (data) => data.title === unit?.value
        );
        const paragraphOptions = targetUnit?.paragraphs.map((paragraph) => {
          return {
            label: paragraph.title,
            value: paragraph.id,
          };
        });
        setParagraphs(paragraphOptions!);
        // paragraph만 label로 찾음
        if (quiz.unit) {
          const paragraph = paragraphOptions?.find(
            (paragraph) => paragraph.label === quiz.paragraph
          );
          setSelectedParagraph(paragraph);
        }
      }
    }
  }, [quizzes, targetId]);

  useEffect(() => {
    if (!data) return;
    if (selectedSource) {
      const unitOptions = data.metadata
        .find((data) => data.title === selectedSource.value)
        ?.units.map((unit) => {
          return {
            label: unit.title,
            value: unit.title,
          };
        });
      setUnits(unitOptions!);
    }
  }, [selectedSource, data]);

  useEffect(() => {
    if (!data) return;
    if (selectedUnit) {
      const paragraphOptions = data.metadata
        .find((data) => data.title === selectedSource?.value)
        ?.units.find((unit) => unit.title === selectedUnit.value)
        ?.paragraphs.map((paragraph) => {
          return {
            label: paragraph.title,
            value: paragraph.id,
          };
        });
      setParagraphs(paragraphOptions!);
    }
  }, [selectedUnit, selectedSource, data]);

  const saveMetadata = () => {
    if (selectedSource === undefined) {
      window.showActionBar({
        title: '출처교재를 선택해주세요.',
        status: 'error',
      });
      return;
    }
    if (selectedUnit === undefined) {
      window.showActionBar({
        title: '단원을 선택해주세요.',
        status: 'error',
      });
      return;
    }
    if (selectedParagraph === undefined) {
      window.showActionBar({
        title: '단락 또는 문항을 선택해주세요.',
        status: 'error',
      });
      return;
    }
    const newQuizzes = quizzes.map((q) => {
      if (q.id === targetId) {
        return {
          ...q,
          source: selectedSource?.value,
          unit: selectedUnit?.value,
          paragraph: selectedParagraph?.label,
          passageId: selectedParagraph?.value,
        };
      }
      return q;
    });
    Mixpanel.track('Quiz Meta Saved', {
      source: selectedSource?.value,
      unit: selectedUnit?.value,
      paragraph: selectedParagraph?.value,
    });
    setQuizzes(newQuizzes);
    props.onClose();
  };

  const defaultOptions = {
    loop: false,
    autoplay: props.open,
    animationData: doneLottie,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };
  return (
    <Modal {...props} name="metadata" width={500} disableOutsideClick>
      <div css={QuizMetaCSS}>
        <div className="metadata-header">
          <div className="lottie-done">
            {props.open && (
              <Lottie options={defaultOptions} height={192} width={192} />
            )}
          </div>
          <div className="metadata-header__title">
            <h5>출제 완료!</h5>
            <p>아래 정보로 문서가 등록되었어요.</p>
          </div>
        </div>
        <div className="metadata-content">
          <div>
            <h5>출처교재</h5>
            <div className="metadata-select">
              <select
                placeholder="출처교재를 선택해주세요."
                name="source"
                onChange={(e) => {
                  const source = sources.find(
                    (source) => source.value === e.target.value
                  );
                  setSelectedSource(source);
                  setSelectedUnit(undefined);
                  setSelectedParagraph(undefined);
                  unitRef.current!.value = '';
                  paragraphRef.current!.value = '';
                }}
                value={selectedSource?.value}
              >
                <option disabled selected>
                  출처 교재를 선택해주세요.
                </option>
                {sources.map((source, index) => (
                  <option key={`source-${index}`} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
              <Icon icon={ArrowDown} size={Sizes.small} />
            </div>
          </div>
          <div className="half-items">
            <div>
              <h5>단원</h5>
              <div className="metadata-select">
                <select
                  ref={unitRef}
                  name="unit"
                  disabled={selectedSource === undefined}
                  onChange={(e) => {
                    const unit = units.find(
                      (unit) => unit.value === e.target.value
                    );
                    setSelectedUnit(unit);
                  }}
                  value={selectedUnit?.value}
                >
                  <option disabled selected></option>
                  {units.map((unit, index) => (
                    <option key={`unit-${index}`} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                <Icon icon={ArrowDown} size={Sizes.small} />
              </div>
            </div>
            <div>
              <h5>단락 또는 문항</h5>
              <div className="metadata-select">
                <select
                  ref={paragraphRef}
                  name="paragraph"
                  placeholder="선택해주세요."
                  disabled={selectedUnit === undefined}
                  onChange={(e) => {
                    const paragraph = paragraphs.find(
                      (paragraph) => paragraph.value === e.target.value
                    );
                    setSelectedParagraph(paragraph);
                  }}
                  value={selectedParagraph?.value}
                >
                  <option disabled selected></option>
                  {paragraphs.map((paragraph, index) => (
                    <option key={`paragraph-${index}`} value={paragraph.value}>
                      {paragraph.label}
                    </option>
                  ))}
                </select>
                <Icon icon={ArrowDown} size={Sizes.small} />
              </div>
            </div>
            {/* <div>
            <h5>출천교재</h5>
            <Select placeholder="출처교재를 선택해주세요." name="unit" />
          </div> */}
          </div>
        </div>
        <div className="metadata-footer">
          <Button onClick={saveMetadata}>확인</Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuizMetaModal;

const QuizMetaCSS = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  line-height: 1.5;

  .metadata-header {
    background-color: #f7f9fc; //set theme indigo0
    text-align: center;
    padding-bottom: ${Spacing.small}px;

    .lottie-done {
      margin-top: -40px;
    }

    &__title {
      margin-top: -48px;

      h5 {
        margin-bottom: ${Spacing.xxsmall}px;
      }
    }
  }

  .metadata-content {
    padding: ${Spacing.xxlarge}px ${Spacing.xxxlarge}px;

    .metadata-select {
      position: relative;
      i {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
      }
      select {
        padding: 16px;
        border: 1px solid ${theme.var.sol_gray_100};
        width: 100%;
        ${Typography.body16};
        appearance: none;
        outline: none;
        position: relative;
        border-radius: ${Radius.xsmall}px;
        background-color: ${theme.var.white};
        background-repeat: no-repeat;
        background-position: right 0.7rem top 50%;
        background-size: 0.65rem auto;

        &[disabled] {
          background-color: ${theme.var.sol_gray_50};
        }

        option[disabled] {
          display: none;
        }
      }
    }
    h5 {
      margin-bottom: ${Spacing.xxsmall}px;
    }

    .half-items {
      margin-top: ${Spacing.xlarge}px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: ${Spacing.medium}px;
    }
  }

  .metadata-footer {
    border-top: 1px solid ${theme.var.sol_gray_100};
    padding: ${Spacing.xlarge}px;

    button {
      width: 190px;
      float: right;
    }
  }
`;
