import { PropsWithChildren, ReactNode } from 'react';

import { OnClickProps } from '../../utils/misc';
import Overlay, {
  OverlayClose,
  OverlayProps,
  useCloseOverlay,
} from '../common/Overlay';
import { css } from '@emotion/react';
import Button from '../common/Button';
import { Radius } from 'solvook-design-system';

const modalOverlayCSS = css`
  display: flex;
  align-items: center;
  padding: 16px;
`;

const modalCSS = (
  isOpen: boolean,
  width?: number,
  fixedHeight?: boolean,
  noRadius?: boolean
) => css`
  position: relative;
  ${noRadius ? '' : `border-radius: ${Radius.medium}px;`}
  background-color: #fff;
  color: #222;
  width: ${width ? `${width}px` : '100%'};
  max-width: 90%;
  ${fixedHeight ? 'height: 90%;' : 'max-height: 100%;'}
  margin: 0 auto;
  transition: 0.3s;
  will-change: transform;
  overflow: hidden;

  ${isOpen
    ? css`
        transform: scale(1);
        visibility: visible;
      `
    : css`
        transition: 0.25s;
        transform: scale(0.4);
        opacity: 0;
        visibility: hidden;
      `}
`;

const headerCSS = css`
  position: relative;
  justify-content: space-between;
  padding: 0 16px;
  height: 44px;
  border-bottom: 1px solid #e3e3e3;
  background-color: #fff;

  h4 {
    text-align: center;
    line-height: 44px;
  }

  button {
    position: absolute;
    top: 10px;
    right: 4px;
  }
`;

const contentCSS = css`
  overflow: scroll;
  max-height: 100%;
`;

type Props = {
  title?: string | ReactNode;
  width?: number;
  fixedHeight?: boolean;
  noRadius?: boolean;
};

export type ModalProps = OverlayProps;

const Modal = ({
  title,
  children,
  width,
  fixedHeight,
  noRadius,
  ...props
}: PropsWithChildren<Props> & ModalProps) => {
  const { open } = props;
  return (
    <Overlay css={modalOverlayCSS} {...props}>
      <div css={modalCSS(open, width, fixedHeight, noRadius)}>
        {title && (
          <header css={headerCSS}>
            <h4>{title}</h4>
            <OverlayClose {...props} />
          </header>
        )}
        <div css={contentCSS}>{children}</div>
      </div>
    </Overlay>
  );
};

export default Modal;

/** Button */

const modalButtonCSS = css`
  margin-top: 24px;
`;

export type ButtonProps = {
  // type?: ButtonType;
  text?: string;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  children?: ReactNode;
};

export const ModalButton = ({
  onClick,
  ...props
}: ButtonProps & OnClickProps) => {
  const closeOverlay = useCloseOverlay();

  return (
    <div css={modalButtonCSS}>
      <Button {...props} onClick={onClick ?? (() => closeOverlay())} />
    </div>
  );
};

type ModalTitleProps = {
  text: string | ReactNode;
};

const modalTitleCSS = css`
  text-align: center;
  padding-bottom: 24px;
`;

export const ModalTitle = ({ text }: ModalTitleProps) => {
  return (
    <h4 className="multiline" css={modalTitleCSS}>
      {text}
    </h4>
  );
};
