import Router from 'next/router';
import { css, Theme, useTheme } from '@emotion/react';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { Spacing, Sizes } from 'solvook-design-system';
import { Icon, Close } from 'solvook-design-system/icon';
import {
  CSSProps,
  lockScroll,
  unlockScroll,
  useDelayedState,
  useMounted,
} from '../../utils/misc';

/** Store */
type OverlayOption = {
  name: string;
  onClose: () => void;
  routeChange?: boolean;
};

type OverlayPopOption = {
  afterClose?: () => void;
};

export type OverlayState = {
  isBackKeyEnabled: boolean;
  isLocked: boolean;
  stack: OverlayOption[];
  setBackKeyEnabled: (isEnabled: boolean) => void;
  open: (options: OverlayOption) => void;
  close: (options?: OverlayPopOption) => void;
  pop: (options?: OverlayPopOption) => void;
};

const _handleOpitons = (options?: OverlayPopOption) => {
  if (!options) {
    return;
  }

  if (options.afterClose) {
    setTimeout(options.afterClose, 400);
  }
};

export const useOverlayStore = create<OverlayState>((set, get) => ({
  isBackKeyEnabled: false,
  stack: [],
  isLocked: false,
  setBackKeyEnabled: (isBackKeyEnabled) => {
    set({ isBackKeyEnabled: isBackKeyEnabled });
  },
  open: (options) => {
    const { isBackKeyEnabled, isLocked } = get();

    if (!isLocked) {
      lockScroll();
      set({ isLocked: true });
    }

    if (isBackKeyEnabled && options.routeChange) {
      const url = new URL(location.href);

      if (Router.router) {
        Router.router.isFirstPopStateEvent = true;
      }
      url.hash = options.name;
      history.pushState(history.state, '', url);
    }

    set((state) => ({
      stack: state.stack.concat(options),
    }));
  },
  close: (options) => {
    const { stack, isBackKeyEnabled, pop } = get();

    if (stack.length === 0) {
      return;
    }

    const last = stack[stack.length - 1];
    if (isBackKeyEnabled && last.routeChange) {
      history.back();
      _handleOpitons(options);
      return;
    }

    pop(options);
  },
  pop: (options) => {
    const { stack } = get();
    if (stack.length === 0) {
      return;
    }

    const popped = stack[stack.length - 1];
    popped.onClose();

    if (stack.length === 1) {
      unlockScroll();
      set({ isLocked: false });
    }

    _handleOpitons(options);

    set((state) => ({ stack: state.stack.slice(0, -1) }));
  },
}));

export const useCloseOverlay = () => useOverlayStore((state) => state.close);

const overlayCSS = (open: boolean, delayOpen: boolean, depth = 0) => css`
  position: fixed;
  top: 0;
  max-width: inherit;
  width: 100%;
  height: 100%;
  z-index: ${99 + depth};

  ${open
    ? css`
        visibility: visible;
      `
    : css`
        visibility: hidden;
        transition: visibility 0s 0.4s;
      `}

  ${!delayOpen &&
  css`
    pointer-events: none;
  `}
`;

const bgCSS = (isOpen: boolean) => (theme: Theme) => css`
  position: absolute;
  top: 0;
  left: -100%;
  width: 300%;
  height: 100%;
  background-color: ${theme.overlay.dark};
  ${isOpen
    ? css`
        opacity: 1;
      `
    : css`
        opacity: 0;
      `}
  transition: opacity 0.3s;
`;

export interface OverlayProps {
  open: boolean;
  name?: string;
  depth?: number;
  blocking?: boolean;
  disableOutsideClick?: boolean;
  onClose: OverlayState['close'];
}

const Overlay = ({
  className,
  open,
  name,
  depth,
  blocking = true,
  disableOutsideClick = false,
  onClose,
  children,
}: PropsWithChildren<OverlayProps & CSSProps>) => {
  const isMounted = useMounted();

  const [delayOpen, setDelayOpenImmediate, setDelayOpen] =
    useDelayedState(open);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDelayOpen(true);
    } else {
      setDelayOpenImmediate(false);
    }
  }, [open]);

  return isMounted
    ? createPortal(
        <div
          id={name}
          css={overlayCSS(open, delayOpen, depth)}
          className={className}
          ref={ref}
        >
          {blocking && (
            <div
              css={bgCSS(open)}
              onClick={() => {
                !disableOutsideClick && onClose();
              }}
            />
          )}
          {children}
        </div>,
        document.getElementById('overlay')!
      )
    : null;
};

export default Overlay;

const overlayCloseCSS = css`
  position: absolute;
  top: ${Spacing.xsmall}px;
  right: ${Spacing.xsmall}px;
  z-index: 9;
`;

export const OverlayClose = ({
  onClose,
  color,
  size,
  noFixed = false,
}: Pick<OverlayProps, 'onClose'> & {
  color?: string;
  size?: Sizes;
  noFixed?: boolean;
}) => {
  const theme = useTheme();

  return (
    <button
      css={!noFixed && overlayCloseCSS}
      style={{ pointerEvents: 'auto' }}
      className="icon-btn"
      aria-label="닫기"
      onClick={() => onClose()}
    >
      <Icon
        icon={Close}
        color={color ?? theme.var.black}
        size={size ?? Sizes.medium}
      />
    </button>
  );
};
