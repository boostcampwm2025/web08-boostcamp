import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Pencil } from 'lucide-react';
import { Input, Button } from '@codejam/ui';
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Enter') {
      handleSubmit();
    }
    if (e.code === 'Escape') {
      setIsEditable(false);
      setEditTitle(docMeta?.title ?? '');
    }
  };

  const handleSubmit = () => {
    if (!fileManager) return;

    // Update Y.Doc
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
      <Input
        type="text"
        className="w-auto min-w-32 text-xl font-bold"
        value={editTitle}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        autoFocus
      />
    );
  }

  return (
    <div className="group flex min-w-0 items-center gap-2">
      <h1 className="truncate text-xl font-bold">{docMeta?.title || ''}</h1>
      {canEdit && <EditButton onClick={handleEditClick} />}
    </div>
  );
}

/**
 * Edit Button
 */

interface EditButtonProps {
  onClick: () => void;
}

function EditButton({ onClick }: EditButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
      onClick={onClick}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );
}
