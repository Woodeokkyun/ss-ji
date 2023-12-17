import { api } from '@/api';
import { useMe } from '@/utils/me';
import { AxiosRequestHeaders } from 'axios';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { FC, Fragment, useEffect } from 'react';
import { create } from 'zustand';
import TagManager from 'react-gtm-module';
import { Mixpanel } from '@/utils/mixpanel';
import mixpanel from 'mixpanel-browser';

type AuthStatus = 'initial' | 'loading' | 'success' | 'error' | 'anonymous';

export type AuthStore = {
  status: AuthStatus;
  setStatus: (status: AuthStatus) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  status: 'initial',
  setStatus: (status) => set({ status }),
}));

type Props = {
  children: React.ReactNode;
};

export const AuthProvider: FC<Props> = ({ children }) => {
  const router = useRouter();
  const { status, setStatus } = useAuthStore();
  const { data: me } = useMe();

  // firebase event listener
  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      const idToken = getCookie('accessToken');

      config.headers = {
        ...(idToken ? { Authorization: `${idToken}` } : undefined),
      } as AxiosRequestHeaders;

      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  // initial sign in with cookie
  useEffect(() => {
    if (router.pathname === '/signout') {
      return;
    }

    if (status !== 'loading') {
      return;
    }

    const token = getCookie('accessToken');
    if (!token) {
      setStatus('anonymous');
      return;
    }
  }, [status]);

  //set gtm, mixpanel alias
  useEffect(() => {
    if (!me) {
      return;
    }
    mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN as string);
    Mixpanel.alias(me.user.id);
    const tagManagerArgs = {
      gtmId: process.env.NEXT_PUBLIC_GTM_ID as string,
      dataLayer: {
        userId: me.user.id,
      },
    };

    TagManager.initialize(tagManagerArgs);
  }, [me]);

  return <Fragment key="auth-context-provider">{children}</Fragment>;
};
