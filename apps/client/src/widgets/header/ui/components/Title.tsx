import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Pencil } from 'lucide-react';
import { useFileStore } from '@/stores/file';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSION } from '@codejam/common';

export function Title() {
  const docMeta = useFileStore((state) => state.docMeta);
  const fileManager = useFileStore((state) => state.fileManager);
  const { can } = usePermission();
  const canEdit = can(PERMISSION.EDIT_DOCS);

  const [editTitle, setEditTitle] = useState('');
  const [isEditable, setIsEditable] = useState(false);

  const textStyles =
    'font-sans text-lg font-bold tracking-tight text-foreground leading-none';
  const underlineStyles =
    'border-b-2 border-border group-hover:border-muted-foreground transition-colors';

  const handleSubmit = () => {
    if (!fileManager) return;
    const newTitle = editTitle.trim() || docMeta?.title || '';
    fileManager.setTitle(newTitle);
    setIsEditable(false);
  };

  const handleEditClick = () => {
    if (!canEdit) return;
    setEditTitle(docMeta?.title ?? '');
    setIsEditable(true);
  };

  if (canEdit && isEditable) {
    return (
      <div className="flex h-10 min-w-0 flex-1 items-center px-4">
        <div className="group flex max-w-full items-center gap-2">
          <input
            type="text"
            className={`${textStyles} ${underlineStyles} focus:border-muted-foreground [field-sizing:content] max-w-full min-w-[60px] bg-transparent pb-1 outline-none`}
            value={editTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEditTitle(e.target.value)
            }
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.code === 'Enter') handleSubmit();
              if (e.code === 'Escape') {
                setIsEditable(false);
                setEditTitle(docMeta?.title ?? '');
              }
            }}
            onBlur={handleSubmit}
            autoFocus
          />
          <Pencil className="text-muted-foreground size-4 shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-10 min-w-0 flex-1 items-center px-4">
      <div
        onClick={handleEditClick}
        className="group hover:bg-muted/30 -ml-2 inline-flex max-w-full cursor-pointer items-center gap-2 rounded-md px-2 transition-colors"
      >
        <h1 className={`${textStyles} ${underlineStyles} truncate pb-1`}>
          {docMeta?.title || '제목 없음'}
        </h1>

        {canEdit && (
          <Pencil className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
    </div>
  );
}
