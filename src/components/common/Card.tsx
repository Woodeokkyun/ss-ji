import { ReactNode } from 'react';
import { css, Theme } from '@emotion/react';
import { Radius, Spacing } from 'solvook-design-system';

const Card = ({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode | string;
  className?: string;
}) => {
  return (
    <div id={id} css={cardCSS} className={className}>
      {children}
    </div>
  );
};

export default Card;

const cardCSS = (theme: Theme) => css`
  padding: ${Spacing.medium}px;
  border: 1px solid ${theme.border.light};
  border-radius: ${Radius.small}px;
  overflow: hidden;
  background-color: ${theme.var.white};
`;
