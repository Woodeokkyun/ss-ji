import { ActionBarOptions } from '@/components/common/Layout';

declare global {
  interface Window {
    __darkMode__: boolean;
    showActionBar: ({ title, status }: ActionBarOptions) => void;
  }
}
