import { css } from '@emotion/react';

type Direction =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'all'
  | 'horizontal'
  | 'vertical';

type SingleDirection = Extract<Direction, 'top' | 'bottom' | 'left' | 'right'>;

const _directions: { [key in Direction]: SingleDirection[] } = {
  top: ['top'],
  bottom: ['bottom'],
  left: ['left'],
  right: ['right'],
  all: ['top', 'bottom', 'left', 'right'],
  horizontal: ['left', 'right'],
  vertical: ['top', 'bottom'],
};

export const sticky = (top: number) => css`
  position: sticky;
  top: calc(constant(safe-area-inset-top) + ${top}px);
  top: calc(env(safe-area-inset-top) + ${top}px);
`;

export const multilineEllipsis = (line: number) => css`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${line};
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const linearGradient = (
  direction: SingleDirection,
  from = 'rgba(87, 87, 87, 0)',
  to = 'rgba(0, 0, 0, 0.5)'
) => css`
  background-image: linear-gradient(to ${direction}, ${from}, ${to});
`;

export const marginXTop = (margin: number) => css`
  margin-top: ${margin}px;
`;

export const marginXBottom = (margin: number) => css`
  margin-bottom: ${margin}px;
`;

export const marginXLeft = (margin: number) => css`
  margin-left: ${margin}px;
`;

export const marginXRight = (margin: number) => css`
  margin-right: ${margin}px;
`;

const _marginXMap = {
  top: marginXTop,
  bottom: marginXBottom,
  left: marginXLeft,
  right: marginXRight,
};

export const marginX = (margin: number, direction: Direction) => {
  return _directions[direction].map((d) => _marginXMap[d](margin));
};

export const fontSize = (size: number) => css`
  font-size: ${size}px;
`;

export const shadow = () => css`
  box-shadow: 0px 1px 5px 2px rgba(128, 128, 128, 0.2);
`;

export const textColor = (color: string) => css`
  color: ${color};
`;

export const MAX_WIDTH = 1200;
