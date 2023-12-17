import { useEffect, useState } from 'react';

import type { AppContext, AppInitialProps, AppProps } from 'next/app';
import Head from 'next/head';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider, DehydratedState } from 'react-query';
import '@/styles/globals.css';
import { useSolvookErrorHandler } from '@/utils/error';
import ErrorBoundaryFallback from '@/components/common/Error';
import { ThemeProvider } from '@emotion/react';
import { DarkTheme, LightTheme } from 'solvook-design-system/theme';
import { useThemeStore } from '@/utils/store';
import { NextComponentType } from 'next';
import App from 'next/app';
import { getCookies, setCookie } from 'cookies-next';
import { isEnv } from '@/utils/misc';
import { resetServerContext } from 'react-beautiful-dnd';
import { AuthProvider } from '@/components/AuthProvider';
import { api } from '@/api';
import { useModal } from '@/utils/overlay';

type CustomPageProps = {
  isDarkMode: boolean;
  dehydratedState?: DehydratedState;
};

type CustomAppProps = AppProps<CustomPageProps>;

const MyApp: NextComponentType<AppContext, AppInitialProps, CustomAppProps> = ({
  Component,
  pageProps,
}) => {
  const { theme } = useThemeStore();
  const onError = useSolvookErrorHandler();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            suspense: false,
            retry: 0,
            onError,
          },
          mutations: {
            onError,
          },
        },
      })
  );
  const selectedTheme = theme === 'dark' ? DarkTheme : LightTheme;
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="/manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="description"
          content="새 문제 추가와 문제 변형. 쉽고 빠른 방법 없을까요? 내신문제 유형별 템플릿이 준비되어 있어요. 학교별 경향에 맞춰 조금씩만 수정하면 끝나요."
        />
        <meta name="og:image" content="og.png" />
        <title>쏠북 스튜디오 | 고퀄리티의 문제를 쉽고 빠르게 내 학습지로</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={selectedTheme}>
          <AuthProvider>
            <ErrorBoundary
              FallbackComponent={ErrorBoundaryFallback}
              onError={(error, errorInfo) => {
                console.error(error);
                // TODO: Sentry
                // captureException(error, { extra: errorInfo });
              }}
            >
              <Component {...pageProps} />
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
      <div id="overlay" />
    </>
  );
};

const staticPages = ['/404'];

MyApp.getInitialProps = async (
  appContext: AppContext
): Promise<AppInitialProps> => {
  resetServerContext();
  const { Component, ctx, router } = appContext;
  const appProps = await App.getInitialProps(appContext);
  const pageProps = Component.getInitialProps
    ? await Component.getInitialProps(ctx)
    : {};

  const cookies = getCookies(ctx);
  if (ctx.req && !staticPages.includes(ctx.pathname)) {
    const options = {
      ...ctx,
      domain: isEnv('dev') ? undefined : 'solvook.com',
    };

    if (cookies.accessToken) {
      setCookie('accessToken', cookies.accessToken, options);
      api.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `${cookies.accessToken}`;
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    }
  }

  return {
    ...appProps,
    pageProps: {
      ...pageProps,
    },
  };
};

export default MyApp;
