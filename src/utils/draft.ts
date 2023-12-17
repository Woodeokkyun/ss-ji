import { EditorState } from 'draft-js';

export const getPlainText = (editorState: EditorState) => {
  return editorState.getCurrentContent().getPlainText();
};
