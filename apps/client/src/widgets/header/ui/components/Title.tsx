import { useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { Pencil } from 'lucide-react';
import { useFileStore } from '@/stores/file';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PERMISSION } from '@codejam/common';

export function Title() {
  const docMeta = useFileStore((state) => state.docMeta);
  const fileManager = useFileStore((state) => state.fileManager);
  const { can } = usePermission();
  const canEdit = can(PERMISSION.EDIT_DOCS);

  const inputRef = useRef<HTMLInputElement>(null);
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

  const handlePencilClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    setEditTitle(docMeta?.title ?? '');
    setIsEditable(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const isEditMode = canEdit && isEditable;

  return (
    <div className="flex h-10 min-w-0 flex-1 items-center px-2">
      <div
        onClick={isEditMode ? undefined : handleEditClick}
        className={`group flex min-w-0 items-center gap-2 ${
          isEditMode
            ? ''
            : 'hover:bg-muted/30 cursor-pointer rounded-md transition-colors'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          className={`${textStyles} ${underlineStyles} min-w-0 bg-transparent outline-none ${
            isEditMode
              ? 'focus:border-muted-foreground field-sizing-content'
              : 'pointer-events-none field-sizing-content truncate'
          }`}
          value={isEditMode ? editTitle : docMeta?.title || '제목 없음'}
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
          readOnly={!isEditMode}
          autoFocus={isEditMode}
        />

        {canEdit && (
          <Pencil
            onClick={handlePencilClick}
            className={`text-muted-foreground size-4 shrink-0 cursor-pointer ${
              isEditMode
                ? ''
                : 'opacity-0 transition-opacity group-hover:opacity-100'
            }`}
          />
        )}
      </div>
    </div>
  );
}
