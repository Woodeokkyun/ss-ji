import { Theme, css } from '@emotion/react';
import { OverlayClose } from '../common/Overlay';
import Modal, { ModalProps } from './Modal';
import { Spacing, Typography } from 'solvook-design-system';
import { useRouter } from 'next/router';
import { IStudioHandoutDetail } from '../../../model';
import { useQueryClient } from 'react-query';

const SaveCompleteModal = ({
  handout,
  ...props
}: {
  handout?: IStudioHandoutDetail;
} & ModalProps) => {
  const router = useRouter();

  return (
    <Modal {...props} name="save-complete" width={630} noRadius>
      <div css={SaveCompleteModalCSS}>
        <div className="modal-header">
          <h3>자료가 저장되었습니다!</h3>
          <OverlayClose onClose={props.onClose} />
        </div>
        <p>편집을 계속하거나 목록으로 가서 제작하신 자료를 확인하세요.</p>
        <div className="btn-wrapper">
          <button onClick={() => props.onClose()}>편집 계속하기</button>
          <button
            onClick={() => router.push(`/handouts/`)}
            className="move-viewer"
          >
            목록으로 이동하기
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SaveCompleteModal;

const SaveCompleteModalCSS = (theme: Theme) => css`
  padding: ${Spacing.xlarge}px;

  .modal-header {
    > button {
      top: 24px;
      right: 24px;
    }
    margin-bottom: ${Spacing.xlarge}px;
  }

  p {
    color: ${theme.var.gray600};
    margin-bottom: ${Spacing.xxxlarge}px;
  }

  .btn-wrapper {
    display: flex;
    justify-content: flex-end;
    gap: ${Spacing.xsmall}px;
    align-items: center;

    button {
      width: 190px;
      padding: ${Spacing.small}px ${Spacing.medium}px;
      color: ${theme.var.gray600};
      border: 1px solid ${theme.border.light};
      ${Typography.body16};
    }

    .move-viewer {
      background-color: ${theme.colors.primary};
      color: ${theme.var.white};
      border: none;
    }
  }
`;
