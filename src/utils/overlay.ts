import { OverlayState, useOverlayStore } from '@/components/common/Overlay';
import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

interface ModalState<T> {
  isOpen: boolean;
  meta?: T;
}

interface ActionSheetStore<T = unknown> {
  map: Map<string, ModalState<T>>;
  setModal: (name: string) => (state: ModalState<T>) => void;
  current?: string;
  setCurrent: (name?: string) => void;
}

export const useModalStore = create<ActionSheetStore>((set) => ({
  map: new Map(),
  setModal: (name) => (state) => {
    set((prev) => {
      const prevState = prev.map.get(name);

      return {
        map: new Map(prev.map).set(name, { ...prevState, ...state }),
        current: name,
      };
    });
  },
  current: undefined,
  setCurrent: (name) => {
    set({ current: name });
  },
}));

type UseModalOptions = {
  initialOpen?: boolean;
  routeChange?: boolean;
  lock?: boolean;
  onClose?: () => void;
  /**
   * useEffect 호출 여부
   */
  trigger?: boolean;
};

export function useModal<T>(
  name: string,
  {
    initialOpen = false,
    routeChange = true,
    trigger = true,
    onClose,
  }: UseModalOptions = {}
): [
  boolean,
  {
    open: (modalState?: T) => void;
    close: OverlayState['close'];
  },
  T | undefined,
] {
  const [{ isOpen, meta }, setModal, setCurrent] = useModalStore((state) => [
    (state.map.get(name) ?? { isOpen: initialOpen }) as ModalState<T>,
    state.setModal(name),
    state.setCurrent,
  ]);

  const [openOverlay, closeOverlay] = useOverlayStore(
    (state) => [state.open, state.close],
    shallow
  );

  useEffect(() => {
    if (!trigger) {
      return;
    }

    if (isOpen) {
      openOverlay({
        name,
        routeChange,
        onClose: () => {
          setModal({ isOpen: false });
          onClose?.();
        },
      });
    } else {
      setCurrent(undefined);
    }
  }, [isOpen, trigger]);

  const open = useCallback((meta?: T) => {
    setModal({ isOpen: true, meta });
  }, []);

  return [isOpen, { open, close: closeOverlay }, meta];
}
