import { Theme, css } from '@emotion/react';

import { useRouter } from 'next/router';

import React, { ReactNode, useCallback, useEffect, useState } from 'react';

import { FontSizes, Spacing } from 'solvook-design-system';

import { sticky } from '../../styles/css';
import { CSSProps, useMounted } from '../../utils/misc';

const tabWrapperCSS =
  (isFit: boolean, top: number, hideBorder: boolean) => (theme: Theme) => css`
    ${top > 0
      ? sticky(top)
      : css`
          position: sticky;
          top: 0;
        `};
    background-color: ${theme.var.white};
    ${!hideBorder && `border-bottom: 1px solid ${theme.var.sol_gray_50}`};
    overflow: auto;
    white-space: nowrap;
    z-index: 9;

    ${isFit &&
    css`
      display: flex;

      button {
        flex-basis: 0;
      }
    `}

    &::-webkit-scrollbar {
      display: none;
    }
  `;

const tabCSS = (isActive: boolean, isFit: boolean) => (theme: Theme) => css`
  font-size: ${FontSizes.small}px;
  height: 56px;
  padding: 0 ${Spacing.medium}px;

  ${isFit &&
  css`
    flex-grow: 1;
  `}

  ${isActive
    ? css`
        color: ${theme.var.black};
        border-bottom: 2px solid ${theme.var.black};
        font-weight: 600;
      `
    : css`
        color: ${theme.var.sol_gray_500};
        border-bottom: 2px solid transparent;
      `}
`;

export type ITab<T> = {
  label: string | ReactNode;
  value: T;
};

type Props<T = unknown> = {
  tabs: ITab<T>[];
  activeTab?: T;
  fit?: boolean;
  stickyAt?: number;
  onChange?: (tabName: T) => void;
  hideBorder?: boolean;
};

const Tab = <T,>({
  className,
  tabs,
  activeTab,
  fit = false,
  stickyAt = 44,
  onChange,
  hideBorder = false,
}: Props<T> & CSSProps) => {
  const handleChangeTab = useCallback(
    (e: React.SyntheticEvent<HTMLButtonElement>) => {
      const { name } = e.currentTarget.dataset;
      if (!name) {
        return;
      }

      onChange?.(name as unknown as T);
    },
    [onChange]
  );

  return (
    <div css={tabWrapperCSS(fit, stickyAt, hideBorder)} className={className}>
      {tabs.map((tab) => (
        <button
          css={tabCSS(tab.value === activeTab, fit)}
          onClick={handleChangeTab}
          key={`tab-${tab.label}`}
          data-name={tab.value}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tab;

export const useTab = <T,>(
  tabs: ITab<T>[],
  options: { replace: boolean } = { replace: false }
) => {
  const router = useRouter();
  const isMounted = useMounted();

  const { replace } = options;
  const currentTab = router.query.tab;

  const [activeTab, setActiveTab] = useState(
    (currentTab as unknown as T) || (tabs[0].value as unknown as T)
  );

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (activeTab && replace) {
      router.replace(
        { query: { ...router.query, tab: activeTab as unknown as string } },
        undefined,
        { shallow: true, scroll: false }
      );
    }
  }, [activeTab]);

  return { tabs, activeTab, onChange: setActiveTab };
};
