import React from 'react';
import type { FallbackProps } from 'react-error-boundary';

import { isSolvookAPIError } from '../../utils/error';
import { OnClickProps } from '@/utils/misc';
import { useRouter } from 'next/router';

type Props = {
  status?: number;
  text?: string;
};

export const ErrorFallback: React.FC<Props & OnClickProps<'onResetClick'>> = ({
  status,
  text,
  onResetClick,
}) => {
  const router = useRouter();

  const defaultAPIErrorMessages: { [key: number]: string } = {
    404: '페이지를 찾을 수 없습니다.',
    403: '권한이 없습니다.',
  };

  const onClick = () => {
    router.push('/');
  };

  return (
    <div>
      {status && <h1>{status}</h1>}
      <p>
        {(status ? defaultAPIErrorMessages[status] : text) ??
          '앗! 문제가 발생했습니다.'}
      </p>
      <div>
        {!status && <button onClick={onResetClick}>재시도하기</button>}
        <button onClick={onClick}>홈으로 가기</button>
      </div>
    </div>
  );
};

const ErrorBoundaryFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  if (error.message === 'Network Error') {
    return (
      <ErrorFallback
        text="인터넷 연결상태를 확인해주세요."
        onResetClick={resetErrorBoundary}
      />
    );
  }

  if (isSolvookAPIError(error)) {
    return <ErrorFallback status={error.response.status} />;
  }

  return <ErrorFallback onResetClick={resetErrorBoundary} />;
};

export default ErrorBoundaryFallback;
