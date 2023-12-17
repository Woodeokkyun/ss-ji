import { ChangeEventHandler, Dispatch, SetStateAction, useState } from 'react';
import { Textarea, Typography, Radius, Spacing } from 'solvook-design-system';
import { css, Theme } from '@emotion/react';
import Editor from '@draft-js-plugins/editor';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import { ContentState, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import '@draft-js-plugins/static-toolbar/lib/plugin.css';

const staticToolbarPlugin = createToolbarPlugin();
const { Toolbar } = staticToolbarPlugin;

const PassageEditor = ({
  passageState,
  onPassageChange,
  readOnly,
}: {
  passageState: EditorState;
  onPassageChange: (passage: EditorState) => void;
  readOnly?: boolean;
}) => {
  return (
    <div css={PassageEditorCSS}>
      {/* <div className="toolbar-wrapper">
        <Toolbar />
      </div> */}
      <Editor
        readOnly={readOnly}
        editorState={passageState}
        onChange={onPassageChange}
        plugins={[staticToolbarPlugin]}
      />
    </div>
  );
};

export default PassageEditor;

const PassageEditorCSS = (theme: Theme) => css`
  display: flex;
  flex-direction: column;

  .toolbar-wrapper {
    padding: ${Spacing.xxsmall}px;
  }

  .DraftEditor-root {
    line-height: 1.8;
  }
`;
