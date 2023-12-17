import { ActionBarOptions } from '@/components/common/Layout';

declare namespace globalThis {
  var __darkMode__: boolean;
  function showActionBar({ title, status }: ActionBarOptions): void;
}
