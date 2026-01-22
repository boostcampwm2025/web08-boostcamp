export type Language = 'javascript' | 'html' | 'css';

export interface CodeEditorProps {
  fileId: string | null;
  language?: Language;
  readOnly?: boolean;
}
