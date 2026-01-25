import type { Language, FileId } from '@codejam/common';

export interface CodeEditorProps {
  fileId: FileId;
  language?: Language;
  readOnly?: boolean;
}
