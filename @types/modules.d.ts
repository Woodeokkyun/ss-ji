import type { Theme as MyTheme } from 'solvook-design-system/theme';

declare module '@emotion/react' {
  export interface Theme extends MyTheme {}
}
