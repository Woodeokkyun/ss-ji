import { Theme, css } from '@emotion/react';

import { ReactNode } from 'react';

import { FontSizes, Radius } from 'solvook-design-system';

import { CSSProps, OnClickProps } from '../../utils/misc';

type ButtonType = 'fill' | 'border' | 'text';

const buttonCSS =
  (
    type: ButtonType,
    color?: string,
    backgroundColor?: string,
    isDisabled = false
  ) =>
  (theme: Theme) => css`
    width: 100%;
    border-radius: ${Radius.small}px;
    font-size: ${FontSizes.small}px;
    font-weight: 600;

    ${type === 'fill' &&
    css`
      height: 48px;

      ${isDisabled
        ? css`
            background: ${theme.var.gray200};
            color: ${theme.var.gray400};
          `
        : css`
            background: ${backgroundColor ?? theme.colors.subPrimary};
            color: ${color ?? theme.true.white};

            &:active {
              background-image: linear-gradient(rgb(0, 0, 0, 0.1) 0 0);
            }
          `}
    `}

    ${type === 'border' &&
    css`
      height: 48px;
      border-width: 1px;
      border-style: solid;
      border-radius: ${Radius.small}px;

      ${isDisabled
        ? css`
            border-color: ${theme.var.gray200};
            color: ${theme.var.gray400};
          `
        : css`
            border-color: ${backgroundColor ?? theme.colors.subPrimary};
            color: ${backgroundColor ?? theme.colors.subPrimary};

            &:active {
              background-image: linear-gradient(rgb(0, 0, 0, 0.1) 0 0);
            }
          `}
    `}

      ${type === 'text' &&
    css`
      height: 24px;
      color: ${color ?? theme.var.sol_gray_500};
    `}
  `;

export type ButtonProps = {
  type?: ButtonType;
  text?: string;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  children?: ReactNode;
};

const Button = ({
  className,
  type = 'fill',
  text,
  color,
  backgroundColor,
  disabled = false,
  children,
  onClick,
}: ButtonProps & OnClickProps & CSSProps) => {
  return (
    <button
      className={className}
      css={buttonCSS(type, color, backgroundColor, disabled)}
      disabled={disabled}
      onClick={onClick}
    >
      {children || text}
    </button>
  );
};

export default Button;
