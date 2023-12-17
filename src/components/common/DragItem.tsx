import React, { ReactNode, useRef } from 'react';
import { Draggable, DropResult } from 'react-beautiful-dnd';

export interface IDragItem {
  index: number;
  id: string;
  type: string;
}

export const ItemTypes = {
  CARD: 'card',
};

const DragItem = ({
  name,
  id,
  children,
  className,
  index,
  moveItem,
  onClick,
  handle = false,
  isDragDisabled = false,
}: {
  name: string;
  id?: string | number;
  children: ReactNode | string;
  className?: string;
  index: number;
  moveItem: (result: DropResult) => void;
  onClick?: () => void;
  handle?: boolean;
  isDragDisabled?: boolean;
}) => {
  return (
    <Draggable
      key={`drag-item-${name}-${id}`}
      draggableId={`${name}-${id}`}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(!handle
            ? {
                ...provided.dragHandleProps,
              }
            : {})}
          className={className}
          onClick={onClick}
        >
          {handle
            ? React.cloneElement(children as any, {
                dragHandleProps: { ...provided.dragHandleProps },
              })
            : children}
        </div>
      )}
    </Draggable>
  );
};

export default DragItem;
