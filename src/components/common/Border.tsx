import { css, useTheme } from '@emotion/react';

import { CSSProps } from '../../utils/misc';

export enum BorderType {
  line = 'line',
  space = 'space',
}

type Props = {
  color?: string;
  type?: BorderType;
  style?: 'solid' | 'dashed';
};

const borderCSS = (color: string, style: string, size: number) => css`
  width: 100%;
  border-top-width: ${size}px;
  border-style: ${style};
  border-color: ${color};
  border-bottom: none;
`;

const Border = ({
  className,
  color,
  type = BorderType.line,
  style = 'solid',
}: Props & CSSProps) => {
  const theme = useTheme();

  if (type === BorderType.space) {
    return (
      <div
        css={borderCSS(color ?? theme.border.space, style, 8)}
        className={className}
      />
    );
  }

  return (
    <div
      css={borderCSS(color ?? theme.border.lightest, style, 1)}
      className={className}
    />
  );
};

export default Border;
