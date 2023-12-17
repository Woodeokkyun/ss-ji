import { ChangeEventHandler, Dispatch, SetStateAction, useState } from 'react';
import { Textarea, Typography, Radius, Spacing } from 'solvook-design-system';
import { Input } from 'solvook-design-system/form';
import { css, Theme } from '@emotion/react';
import Editor from '@draft-js-plugins/editor';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import { ContentState, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import '@draft-js-plugins/static-toolbar/lib/plugin.css';

const staticToolbarPlugin = createToolbarPlugin();
const { Toolbar } = staticToolbarPlugin;

const TitlePassageInput = ({
  title,
  passageState,
  onTitleChange,
  onPassageChange,
}: {
  title: string;
  passageState: EditorState;
  onTitleChange: ChangeEventHandler<HTMLInputElement>;
  onPassageChange: Dispatch<SetStateAction<EditorState>>;
}) => {
  return (
    <div css={TitlePassageInputCSS}>
      <Input
        value={title}
        onChange={onTitleChange}
        placeholder="제목을 입력하세요."
      />
      <div className="passage-wrapper">
        <div className="passage-wrapper__header">지문</div>
        {/* <Textarea
          value={passage}
          onChange={onPassageChange}
          placeholder="지문을 입력하세요."
          minRows={10}
        /> */}
        <Toolbar />
        <Editor
          editorState={passageState}
          onChange={onPassageChange}
          plugins={[staticToolbarPlugin]}
        />
      </div>
    </div>
  );
};

export default TitlePassageInput;

const TitlePassageInputCSS = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  padding: ${Spacing.xxxlarge}px;

  .passage-wrapper {
    margin-top: ${Spacing.medium}px;
    border: 1px solid ${theme.border.light};
    border-radius: ${Radius.xsmall}px;
    overflow: scroll;
    max-height: 600px;

    &__header {
      background-color: ${theme.var.sol_gray_100};
      border-bottom: 1px solid ${theme.border.light};
      padding: ${Spacing.small}px ${Spacing.medium}px;
      position: sticky;
      top: 0;
    }

    .DraftEditor-root {
      padding: ${Spacing.medium}px;
    }
  }
`;
