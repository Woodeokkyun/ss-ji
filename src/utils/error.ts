// import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useErrorHandler } from 'react-error-boundary';

import axios from 'axios';
import { ISolvookAPIError } from '../../model';
import { useRouter } from 'next/router';

export class SolvookStudioError extends Error {}

export const isSolvookAPIError = (
  error: unknown
): error is ISolvookAPIError => {
  if (axios.isAxiosError(error)) {
    if (
      error.config?.baseURL === process.env.NEXT_PUBLIC_STUDIO_API_URL ||
      error.config?.baseURL === process.env.NEXT_PUBLIC_API_URL
    ) {
      return true;
    }
  }

  return false;
};

export function useSolvookErrorHandler() {
  const router = useRouter();
  const handleError = useErrorHandler();

  const onError = useCallback((error: unknown) => {
    if (error instanceof SolvookStudioError) {
      alert(error.message);
      return;
    }

    if (!isSolvookAPIError(error)) {
      handleError(error);
      return;
    }
    switch (error.response.status) {
      case 401: {
        const c = window.confirm(
          '로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?'
        );
        if (c) {
          router.push(`${process.env.NEXT_PUBLIC_SOLVOOK_URL}/login`);
        }
        break;
      }

      case 403: {
        break;
      }

      default: {
        alert(
          error.response.data.message ??
            '문제가 발생하였습니다. 잠시 후 다시 시도해주세요.'
        );
      }
    }
  }, []);

  return onError;
}
