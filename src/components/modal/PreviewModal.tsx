import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { IQuiz } from '../../../model';
import Modal, { ModalProps } from './Modal';
import { css, Theme, useTheme } from '@emotion/react';
import { Spacing, Radius, Sizes } from 'solvook-design-system';
import { Icon, Upload, Close } from 'solvook-design-system/icon';

//@ts-ignore
import { useReactToPrint } from 'react-to-print';
import Button from '../common/Button';
import Image from '../common/Image';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import {
  patchStudioHandout,
  postStudioHandout,
  postStudioHandoutPdf,
} from '@/api/studioHandouts';
import { postFile } from '@/api/file';
import PropagateLoader from 'react-spinners/PropagateLoader';
import { Mixpanel } from '@/utils/mixpanel';

type Props = {
  handoutId?: string;
  setHandoutId: (handoutId: string) => void;
  quizzes: IQuiz[];
  title?: string;
  subTitle?: string;
  logo?: string;
  setTitle: (title: string) => void;
  setSubTitle: (subTitle: string) => void;
  setLogo: (logo?: string) => void;
  isEdit?: boolean;
  saveComplete: () => void;
} & ModalProps;
const PreviewModal = ({
  handoutId,
  setHandoutId,
  quizzes,
  title,
  subTitle,
  logo,
  setTitle,
  setSubTitle,
  setLogo,
  isEdit,
  saveComplete,
  ...props
}: Props) => {
  const router = useRouter();
  const theme = useTheme();
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [htmlData, setHtmlData] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [logoName, setLogoName] = useState<string>();
  const queryClient = useQueryClient();
  const postQuizzesToIframe = () => {
    const iframe = previewRef.current;
    const iframeDocument = iframe?.contentDocument;
    const iframeWindow = iframe?.contentWindow;
    if (!iframeDocument || !iframeWindow) return;
    iframeWindow?.location.reload();
    setIsLoading(true);
    setTimeout(() => {
      iframeWindow?.postMessage(
        {
          type: 'SET_DATA',
          content: {
            title,
            subTitle,
            logo,
            quizzes,
          },
        },
        '*'
      );
    }, 1000);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (!previewRef.current) return;
    const iframe = previewRef.current;
    const iframeWindow = iframe.contentWindow;
    let timeoutId: NodeJS.Timeout;
    if (props.open) {
      timeoutId = setTimeout(() => {
        postQuizzesToIframe();
      }, 1000);
    }
    if (!props.open) {
      iframeWindow?.location.reload();
    }

    return () => clearTimeout(timeoutId);
  }, [previewRef.current, props.open, logo, title, subTitle, 1000]);

  const { mutate: saveHandoutPdf } = useMutation(
    ({ id, html }: { id: string; html: string }) =>
      postStudioHandoutPdf(id, html),
    {
      onSuccess: (data) => {
        saveComplete();
      },
    }
  );
  const { mutate: saveHandout } = useMutation(
    () =>
      isEdit
        ? patchStudioHandout({
            handoutId: handoutId!,
            title: title ?? '',
            object: {
              subTitle,
              logoUrl: logo,
            },
            items: quizzes,
          })
        : postStudioHandout({
            originHandoutId:
              handoutId ?? process.env.NEXT_PUBLIC_ORIGIN_HANDOUT_ID,
            title: title ?? '',
            object: {
              subTitle,
              logoUrl: logo,
            },
            items: quizzes,
          }),
    {
      onSuccess: (data) => {
        setHandoutId(data.id);
        router.replace({
          pathname: router.pathname,
          query: {
            handoutId: data.id,
          },
        });
        if (isEdit) {
          Mixpanel.track('Studio Handout Updated', {
            id: data.id,
            title: title,
          });
        } else {
          Mixpanel.track('Studio Handout Created', {
            id: data.id,
            title: title,
            quizCount: quizzes.length,
            type: handoutId ? 'edited' : 'created',
          });
        }
        saveHandoutPdf({
          id: data.id,
          html: htmlData!,
        });
        queryClient.invalidateQueries(['studioHandouts']);
      },
    }
  );

  const { mutate: createLogo } = useMutation((file: File) => postFile(file!), {
    onSuccess: (data) => {
      setLogo(data.uploadedUrl);
    },
  });

  const changeLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoName(file?.name);
    if (file) {
      createLogo(file);
    }
  };

  const removeLogo = () => {
    setLogo(undefined);
    setLogoName(undefined);
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
    #print {
      transform: none;
    }
    @page {
      size: A4;
      margin: 20mm;
    }`,
  });

  const save = () => {
    console.log('==================');
    console.log('data::', quizzes);
    console.log('==================');
    const iframe = previewRef.current;
    const iframeDocument = iframe?.contentDocument;
    setHtmlData(iframeDocument?.getElementById('wrapper')?.innerHTML);
  };

  useEffect(() => {
    if (htmlData) {
      saveHandout();
      props.onClose();
    }
  }, [htmlData]);

  return (
    <Modal {...props} name="preview" disableOutsideClick>
      <div css={PreviewWrapperCSS}>
        <div className="preview-pdf">
          <p>미리보기</p>
          <div css={PreviewCSS} ref={printRef} id="print">
            {isLoading && (
              <div className="loading">
                <PropagateLoader color={theme.colors.primary} />
              </div>
            )}
            <iframe ref={previewRef} src="/quiz-preview/process.html?cache=1" />
          </div>
        </div>
        <div css={PreviewInfoCSS}>
          <div>
            <div className="title">
              <p>제목</p>
              <span>*</span>
            </div>
            <input
              type="text"
              placeholder="고등 영어) 1학년 1학기 모의고사"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <p>부제목</p>
            <input
              type="text"
              placeholder="2024년 준비 예상 문제"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
            />
          </div>

          <div>
            <p>로고</p>
            <input type="file" name="file" id="file" onChange={changeLogo} />
            <label htmlFor="file">
              <div className="btn-upload">
                <Icon icon={Upload} size={Sizes.small} />
                이미지 업로드
              </div>
            </label>
            {logo && (
              <div className="logo-name">
                {logoName && <p>{logoName}</p>}
                <button className="icon-btn" onClick={removeLogo}>
                  <Icon icon={Close} size={Sizes.xsmall} />
                </button>
              </div>
            )}
            {logo && <Image src={logo} alt="logo" width={288} height={144} />}
          </div>
        </div>
      </div>
      <div css={PreviewFooterCSS}>
        <div className="cta-wrapper">
          <Button
            type="border"
            onClick={() => {
              props.onClose();
            }}
          >
            취소
          </Button>
          <Button onClick={save} disabled={isLoading}>
            {isLoading ? '미리보기 생성 중' : '저장하기'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PreviewModal;

const PreviewCSS = (theme: Theme) => css`
  width: 21cm;
  height: 29.7cm;
  transform: scale(0.6);
  transform-origin: 50% 64px;

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  iframe {
    width: 21cm;
    height: 29.7cm;
    border: 1px solid ${theme.border.light};
  }

  .preview-header {
    column-span: all;
    display: flex;
    justify-content: space-between;
    padding: ${Spacing.medium}px;
    position: relative;
    border-bottom: 1px solid ${theme.border.light};

    > div {
      display: flex;
      flex-direction: column;
    }

    img {
      max-width: 96px;
      max-height: 48px;
    }
  }

  > div {
    break-inside: avoid-page;
    padding: ${Spacing.medium}px;
  }

  @page {
    size: A4;
    margin: 20mm;
  }
`;

const PreviewInfoCSS = (theme: Theme) => css`
  gap: ${Spacing.xlarge}px;
  padding-left: ${Spacing.xxxlarge}px;
  padding-right: ${Spacing.xxxlarge}px;
  padding-top: ${Spacing.xxxxxlarge}px;
  > button {
    position: absolute;
    bottom: 16px;
    right: 16px;
    width: 320px;
  }

  > div {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${Spacing.xxsmall}px;
    margin-right: auto;

    .title {
      display: flex;
      align-items: center;
      gap: ${Spacing.xxsmall}px;

      span {
        color: ${theme.colors.mint300};
      }
    }

    input {
      border: 1px solid ${theme.var.gray300};
      border-radius: ${Radius.xsmall}px;
      padding: ${Spacing.small}px ${Spacing.medium}px;
    }

    img {
      max-width: 288px;
      max-height: 144px;
      width: fit-content;
    }
  }

  .btn-upload {
    border: 1px solid ${theme.border.light};
    border-radius: ${Radius.small}px;
    padding: ${Spacing.xsmall}px ${Spacing.small}px;
    color: ${theme.var.gray600};
    display: inline-flex;
    align-items: center;
    gap: ${Spacing.xxsmall}px;
    cursor: pointer;

    &:hover {
      background-color: ${theme.var.sol_gray_0};
    }
  }

  .logo-name {
    display: flex;
    align-items: center;
    gap: ${Spacing.xxsmall}px;

    p {
      color: ${theme.colors.blue500};
      text-decoration: underline;
      font-size: 12px;
    }
  }

  input[type='file'] {
    display: none;
  }
`;

const PreviewWrapperCSS = (theme: Theme) => css`
  display: flex;

  > div {
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .preview-pdf {
    padding-top: ${Spacing.xxxlarge}px;
    background-color: ${theme.colors.blue0};

    p {
      font-size: 14px;
      background-color: ${theme.var.gray800};
      position: absolute;
      left: ${Spacing.medium}px;
      top: ${Spacing.medium}px;
      padding: ${Spacing.xxsmall}px ${Spacing.small}px;
      color: ${theme.var.white};
    }

    iframe {
      background-color: ${theme.var.white};
    }
  }
`;

const PreviewFooterCSS = (theme: Theme) => css`
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
