import { useFileStore } from '@/stores/file';
import { CodeEditor } from '@/widgets/code-editor';
import { ImageViewer } from '@/widgets/viewer/ImageViewer';

interface FileContentViewerProps {
  fileId: string;
  readOnly: boolean;
}

/**
 * FileContentViewer - Renders viewer based on file type
 * - CodeEditor for text files
 * - ImageViewer for image files
 */
export default function FileContentViewer({
  fileId,
  readOnly,
}: FileContentViewerProps) {
  const getFileType = useFileStore((state) => state.getFileType);
  const getFileContent = useFileStore((state) => state.getFileContent);

  const fileType = getFileType(fileId);
  const fileContent = getFileContent(fileId);

  switch (fileType) {
    case 'text':
      return <CodeEditor fileId={fileId} readOnly={readOnly} />;
    case 'image':
      return <ImageViewer url={fileContent || ''} />;
    default:
      return <CodeEditor fileId={fileId} readOnly={readOnly} />;
  }
}
