import { ReactNode, useState } from 'react';
import { css } from '@emotion/react';
import Accordion from './Accordion';
const CategoryAccordion = ({
  label,
  children,
  className,
  defaultOpen = false,
}: {
  defaultOpen?: boolean;
  label: string;
  children: ReactNode | string;
  className?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Accordion
      label={label}
      open={open}
      onClick={() => setOpen(!open)}
      css={CategoryAccordionCSS}
      border="none"
    >
      {children}
    </Accordion>
  );
};

export default CategoryAccordion;

const CategoryAccordionCSS = css`
  .category-accordion {
    padding-right: 0;
  }
`;
