import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
/* @ts-ignore */

export interface CSSProps {
  className?: string;
}

export type OnClickProps<T extends string = 'onClick', E = Element> = Partial<
  Record<T, (e: React.SyntheticEvent<E>) => void>
>;

export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

export function useDelayedState<T>(
  initialValue: T,
  delay = 200
): [T, React.Dispatch<SetStateAction<T>>, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const timeout = useRef(0);

  const setDelayValue = useCallback(
    (value: T) => {
      timeout.current = window.setTimeout(() => {
        setValue(value);
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  return [value, setValue, setDelayValue];
}

export const lockScroll = () => {
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
};

export const unlockScroll = () => {
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
};

export function isEnv(env: 'dev' | 'staging' | 'production') {
  return process.env.NEXT_PUBLIC_ENV === env;
}

export function isNullish(value: any) {
  return value === undefined || value === null;
}

export const getRandomBoolean = () => {
  return Math.random() < 0.5;
};

export const toQueryString = (
  obj: { [key: string]: any } | null,
  withQuerySymbol = true
) => {
  if (obj === null) {
    return '';
  }

  const query = Object.keys(obj)
    .filter((key) => key !== '' && obj[key] !== undefined && obj[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');

  if (!query) {
    return '';
  }

  return withQuerySymbol ? `?${query}` : query;
};

export const trimString = (str: string, length = 60, newLineCheck = true) => {
  if (newLineCheck) {
    const newlineIndex = str.indexOf('\n');
    if (newlineIndex !== -1) {
      return [str.substring(0, newlineIndex), str.slice(newlineIndex)];
    }
  }

  if (str.length > length) {
    return [str.substring(0, length), str.slice(length)];
  }

  return [str, ''];
};

export const trimStringByLine = (str: string, maxLine = 5) => {
  if ((str.match(/\n/g) || []).length < maxLine) {
    return trimString(str, 100, false);
  }

  const lines = str.split('\n');
  return [lines.slice(0, maxLine).join('\n'), lines.slice(maxLine).join('\n')];
};
