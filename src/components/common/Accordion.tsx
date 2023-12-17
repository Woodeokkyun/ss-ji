import { Theme, css, useTheme } from '@emotion/react';

import React, {
  PropsWithChildren,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Sizes, Spacing, Typography } from 'solvook-design-system';
import { ArrowDown, ArrowUp, Icon } from 'solvook-design-system/icon';

const accordionListWrapCSS =
  (border?: 'top' | 'bottom' | 'both' | 'none') => (theme: Theme) => css`
    border-top: ${border === 'top' || border === 'both'
      ? `1px solid ${theme.border.light}`
      : 'none'};
    border-bottom: ${border === 'bottom' || border === 'both'
      ? `1px solid ${theme.border.light}`
      : 'none'};
  `;

const accordionCSS = (open: boolean) => (theme: Theme) => css`
  ${Typography.body16}
  width: 100%;
  padding: ${Spacing.medium}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  cursor: pointer;
  color: ${open ? theme.var.black : theme.var.sol_gray_500};
  font-weight: 600;
  position: relative;
  padding-left: ${Spacing.xxxlarge}px;

  &:after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: ${Spacing.xlarge}px;
    width: 0;
    height: 0;
    border-style: solid;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 4px solid ${open ? theme.var.black : theme.var.sol_gray_500};
    border-right: 0;
    ${open && `transform: translateY(-50%) rotate(90deg);`}
  }
`;

const contentCSS =
  (border?: 'top' | 'bottom' | 'both' | 'none') => (theme: Theme) => css`
    padding: 0 ${Spacing.xxsmall}px ${Spacing.medium}px ${Spacing.medium}px;
    ${border !== 'none' && `border-bottom: 1px solid ${theme.border.light};`}
  `;

interface AccordionProps {
  open: boolean;
  label: string | ReactNode;
  onClick?: (e: SyntheticEvent) => void;
  scrollIntoView?: boolean;
  border?: 'top' | 'bottom' | 'both' | 'none';
}

const Accordion = ({
  open,
  label,
  children,
  className,
  onClick,
  scrollIntoView = true,
  border = 'bottom',
}: PropsWithChildren<AccordionProps> & { className?: string }) => {
  const theme = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollIntoView) {
      contentRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open]);

  return (
    <>
      <div css={accordionListWrapCSS(border)}>
        <div
          css={accordionCSS(open)}
          className={className}
          onClick={onClick}
          role="button"
          tabIndex={0}
        >
          <div>{label}</div>
        </div>
      </div>
      {open && children && (
        <div css={contentCSS(border)} ref={contentRef}>
          {children}
        </div>
      )}
    </>
  );
};

export default Accordion;
