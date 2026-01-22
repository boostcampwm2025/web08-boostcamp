export type Language = 'javascript' | 'html' | 'css';

export interface CodeEditorProps {
  fileId?: string;
  language?: Language;
  readOnly?: boolean;
}
