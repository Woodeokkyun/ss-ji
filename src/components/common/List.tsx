import { Theme, css } from '@emotion/react';

import { ReactNode } from 'react';

import { Spacing } from 'solvook-design-system';
import { CSSProps } from '../../utils/misc';

const listCSS =
  (hasBorder: boolean, hasMargin: boolean) => (theme: Theme) => css`
    ${hasBorder &&
    css`
      > li {
        border-bottom: 1px solid ${theme.border.lightest};
      }

      > li.no-border {
        border-bottom: none;
      }
    `}
    ${hasMargin &&
    css`
      > li + li {
        margin-top: ${Spacing.small}px;
      }
    `}
  `;

export type ListProps = {
  border?: boolean;
  margin?: boolean;
  children: ReactNode;
};

const List = ({
  className,
  border = false,
  margin = false,
  children,
}: ListProps & CSSProps) => {
  return (
    <ul css={listCSS(border, margin)} className={className}>
      {children}
    </ul>
  );
};

export default List;
