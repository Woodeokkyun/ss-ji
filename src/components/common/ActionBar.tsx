import { PropsWithChildren, ReactNode, useEffect } from 'react';

import Overlay, { OverlayClose, OverlayProps } from '../common/Overlay';
import { css, useTheme, Theme } from '@emotion/react';
import { Spacing, Sizes, Typography } from 'solvook-design-system';

const actionBarOverlayCSS = css`
  display: flex;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  pointer-events: none;
`;

const actionBarCSS = (isOpen: boolean) => (theme: Theme) => css`
  top: -40%;
  position: relative;
  border-radius: 4px;
  background-color: ${theme.var.gray800};
  color: ${theme.var.white};
  max-height: 100%;
  margin: 0 auto;
  transition: 0.3s;
  will-change: transform;
  overflow-x: hidden;
  display: flex;
  align-items: center;
  padding-right: ${Spacing.medium}px;

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

const contentCSS = css`
  overflow: auto;
  padding: 12px;
`;

type Props = {
  title: string;
};

export type ActionBarProps = OverlayProps;

const ActionBar = ({
  title,
  children,
  ...props
}: PropsWithChildren<Props> & ActionBarProps) => {
  const { open, onClose } = props;
  const theme = useTheme();

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  }, [open]);

  return (
    <Overlay
      depth={999}
      css={actionBarOverlayCSS}
      name={title}
      {...props}
      blocking={false}
    >
      <div css={actionBarCSS(open)}>
        <div css={contentCSS}>{children}</div>
        <OverlayClose
          {...props}
          noFixed
          color={theme.var.white}
          size={Sizes.small}
        />
      </div>
    </Overlay>
  );
};

export default ActionBar;

export const ActionBarContentCSS = (theme: Theme) => css`
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
