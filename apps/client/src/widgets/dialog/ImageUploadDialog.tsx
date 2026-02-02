import {
  RadixDialog as Dialog,
  RadixDialogContent as DialogContent,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
  RadixDialogDescription as DialogDescription,
  RadixButton as Button,
  RadixDialogClose as DialogClose,
} from '@codejam/ui';
import { useState } from 'react';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, url: string) => void;
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  onSubmit,
}: ImageUploadDialogProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckImage = () => {
    setError(null);
    setPreviewUrl(null);

    if (!name.trim()) {
      setError('파일 이름을 입력해주세요');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('올바른 URL 형식이 아닙니다');
      return;
    }

    setIsChecking(true);

    const img = new Image();
    img.onload = () => {
      setPreviewUrl(url);
      setIsChecking(false);
    };
    img.onerror = () => {
      setError('이미지를 불러올 수 없습니다');
      setIsChecking(false);
    };
    img.src = url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;

    onSubmit(name.trim(), previewUrl);
    onOpenChange(false);

    // reset
    setName('');
    setUrl('');
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <Header />

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <FileNameInput value={name} onChange={setName} />
          <ImageUrlInput value={url} onChange={setUrl} />
          <CheckImageButton
            isChecking={isChecking}
            onClick={handleCheckImage}
          />
          <ErrorMessage error={error} />
          <Preview url={previewUrl} />
          <Footer disabled={!previewUrl} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Header() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>이미지 공유</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        이미지 URL을 사용해 파일을 공유하면 파일 목록에서 이미지를 확인할 수
        있습니다.
      </DialogDescription>
    </>
  );
}

function FileNameInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">파일 이름</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="example.png"
        className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 text-sm"
        autoFocus
      />
    </div>
  );
}

function ImageUrlInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">이미지 URL</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/image"
        className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 text-sm"
      />
    </div>
  );
}

function CheckImageButton({
  isChecking,
  onClick,
}: {
  isChecking: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isChecking}
      variant="secondary"
    >
      {isChecking ? '이미지 확인 중…' : '이미지 확인'}
    </Button>
  );
}

function ErrorMessage({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="text-sm text-red-500">{error}</p>;
}

function Preview({ url }: { url: string | null }) {
  if (!url) return null;

  return (
    <img
      src={url}
      alt="preview"
      className="max-h-48 w-full rounded-md border object-contain"
    />
  );
}

function Footer({ disabled }: { disabled: boolean }) {
  return (
    <DialogFooter>
      <DialogClose asChild>
        <Button type="button" variant="ghost">
          취소
        </Button>
      </DialogClose>
      <Button type="submit" disabled={disabled}>
        공유
      </Button>
    </DialogFooter>
  );
}
