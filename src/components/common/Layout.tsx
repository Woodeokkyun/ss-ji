import Head from 'next/head';
import { css, Theme, Global, useTheme } from '@emotion/react';
import { ReactNode, useEffect, useState } from 'react';

import { Typography, Spacing, Radius, Sizes } from 'solvook-design-system';

import { CSSProps } from '../../utils/misc';
import {
  ThemeType,
  useEditorStatusState,
  useInfoStore,
  useThemeStore,
} from '../../utils/store';
import { MAX_WIDTH } from '@/styles/css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import ActionBar, { ActionBarContentCSS } from './ActionBar';
import { useModal } from '@/utils/overlay';
import {
  Icon,
  CheckCircle,
  XCircle,
  InfoCircle,
} from 'solvook-design-system/icon';

export type ActionBarOptions = {
  title: string;
  status: 'success' | 'error';
};

type Props = {
  theme?: ThemeType;
  backgroundColor?: string;
  children?: ReactNode;
  cta?: ReactNode;
  full?: boolean;
  header?: ReactNode;
  withoutMenu?: boolean;
};

const Layout = ({
  className,
  theme,
  backgroundColor,
  children,
  cta,
  full,
  header,
  withoutMenu,
}: Props & CSSProps) => {
  const { setTheme } = useThemeStore();
  const { title } = useInfoStore();
  const router = useRouter();
  const isEdit = router.pathname.includes('edit');
  const { status } = useEditorStatusState();
  useEffect(() => {
    if (theme) {
      setTheme(theme);
    } else {
      setTheme(window.__darkMode__ ? 'dark' : 'light');
    }
  }, [theme]);

  const defaultTheme = useTheme();

  const [isOpenActionBar, { open: openActionBar, close: closeActionBar }] =
    useModal('global-action-bar');
  const [actionBarOptions, setActionBarOptions] = useState<ActionBarOptions>();
  const showActionBar = ({ title, status }: ActionBarOptions) => {
    setActionBarOptions({ title, status });
    openActionBar();
  };
  useEffect(() => {
    window.showActionBar = showActionBar;
  }, []);
  useEffect(() => {
    closeActionBar();
  }, [router.pathname]);

  const moveLink = (href: string) => {
    router.replace({
      pathname: href,
      query: {
        ...router.query,
      },
    });
  };

  return (
    <>
      {header && header}
      <div className={className} css={LayoutCSS(withoutMenu, backgroundColor)}>
        {backgroundColor && (
          <Head>
            <meta name="theme-color" content={backgroundColor} />
          </Head>
        )}
        <Global
          styles={(theme) => css`
            html {
              background-color: ${theme.var.sol_gray_0};
            }

            h1 {
              ${Typography.h1}
            }

            h2 {
              ${Typography.h2}
            }

            h3 {
              ${Typography.h3}
            }

            h4 {
              ${Typography.h4}
            }

            h5 {
              ${Typography.h5}
            }

            h6 {
              ${Typography.h6}
            }
            #overlay {
              max-width: 100%;
              margin: 0 auto;
            }
          `}
        />
        {withoutMenu ? (
          children
        ) : (
          <div>
            <div css={HeaderCSS}>
              <h3>{title ?? '새 학습지 만들기'}</h3>
              {cta && cta}
            </div>
            <div css={ContentWrapperCSS(backgroundColor)}>
              <div css={SideBarCSS}>
                <button
                  className={!isEdit ? 'active' : ''}
                  onClick={() => moveLink('/handouts/load')}
                >
                  불러오기
                </button>
                <button
                  className={classNames({
                    active: isEdit,
                    update: status === 'update',
                  })}
                  onClick={() => moveLink('/handouts/edit')}
                >
                  편집하기
                </button>
                <Link
                  target="_blank"
                  href="https://www.youtube.com/playlist?list=PLgG88ki1uYb7xyuenHQH2qUn9bH2Q-veU"
                >
                  도움말
                  <Icon icon={InfoCircle} size={Sizes.small} />
                </Link>
              </div>
              <div css={ContentCSS(full)}>{children}</div>
            </div>
          </div>
        )}
      </div>
      <ActionBar
        open={isOpenActionBar}
        title="global-action-bar"
        onClose={closeActionBar}
      >
        <div css={ActionBarContentCSS}>
          <p>
            {actionBarOptions?.status === 'success' ? (
              <Icon icon={CheckCircle} color={defaultTheme.colors.mint400} />
            ) : (
              <Icon icon={XCircle} color={defaultTheme.colors.red400} />
            )}
            {actionBarOptions?.title}
          </p>
        </div>
      </ActionBar>
    </>
  );
};

export default Layout;

const LayoutCSS =
  (withoutMenu: boolean | undefined, backgroundColor?: string) =>
  (theme: Theme) => css`
    position: relative;
    ${withoutMenu ? `max-width: ${MAX_WIDTH}px;` : ''}
    margin: 0 auto;
    background-color: ${backgroundColor ?? theme.var.white};
    min-height: 100%;
    color: ${theme.var.black};

    // @media all and (min-width: ${MAX_WIDTH + 1}px) {
    //   box-shadow: 0 0 10px ${theme.var.gray200}cc;
    // }
  `;

const HeaderCSS = (theme: Theme) => css`
  height: 88px;
  border-bottom: 1px solid ${theme.var.sol_gray_50};
  background-color: ${theme.var.white};
  padding: ${Spacing.large}px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-weight: 600;
  }
`;

const ContentWrapperCSS = (backgroundColor?: string) => (theme: Theme) => css`
  display: flex;
  background-color: ${backgroundColor ?? theme.var.sol_gray_100};
`;

const SideBarCSS = (theme: Theme) => css`
  width: 160px;
  min-width: 160px;
  height: calc(100vh - 88px);
  background-color: ${theme.var.sol_gray_0};
  border-right: 1px solid ${theme.var.sol_gray_50};
  padding: ${Spacing.xxlarge}px;
  position: relative;

  button + button {
    margin-top: ${Spacing.xxxlarge}px;
  }

  button {
    ${Typography.h3};
    color: ${theme.var.gray300};
    position: relative;
    display: inline-block;

    &.active {
      color: ${theme.var.black};
    }

    &.update {
      &:after {
        content: '';
        position: absolute;
        right: -12px;
        top: 4px;
        width: 8px;
        height: 8px;
        border-radius: ${Radius.round}px;
        background-color: ${theme.colors.red400};
      }
    }
  }

  a {
    display: flex;
    align-items: center;
    gap: ${Spacing.xxsmall}px;
    position: absolute;
    color: ${theme.var.gray600};
    ${Typography.body16}
    left: ${Spacing.xxlarge}px;
    bottom: ${Spacing.xxlarge}px;

    svg {
      fill: ${theme.var.gray600};
    }
  }
`;

const ContentCSS = (full: boolean | undefined) => () => css`
  margin-left: auto;
  margin-right: auto;
  ${full && 'width: 100%;'}
`;
