import { PROJECT_NAME } from '@codejam/common';
import { useRef, useState, type ChangeEvent } from 'react';
import LogoAnimation from '@/assets/logo_animation.svg';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/shared/ui/dialog';
import {
  Check,
  Copy,
  Upload,
  Download,
  Share2,
  Sun,
  Moon,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useFileRename } from '@/shared/lib/hooks/useFileRename';
import { extname } from '@/shared/lib/file';
import { NewFileDialog } from '@/widgets/dialog/NewFileDialog';
import { useFileStore } from '@/stores/file';
import { DuplicateDialog } from '@/widgets/dialog/DuplicateDialog';
import { SettingsDialog } from '@/widgets/dialog/SettingsDialog';
import { LeaveRoomButton } from './buttons/LeaveRoomButton';

type HeaderProps = {
  roomCode: string;
};

export default function Header({ roomCode }: HeaderProps) {
  const { isDark, toggleTheme } = useDarkMode();
  const { setIsDuplicated, isDuplicated, handleCheckRename } =
    useFileRename(roomCode);
  const [isCopied, setIsCopied] = useState(false);
  const { getFileId, createFile } = useFileStore();
  const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);
  const [filename, setFilename] = useState('');

  const uploadRef = useRef<HTMLInputElement>(null);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode || '');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success('방 코드가 복사되었습니다.');
    } catch (err) {
      const error = err as Error;
      toast.error(`복사에 실패했습니다: ${error.message}`);
    }
  };

  const handleNotImplemented = (feature: string) => {
    toast.warning(`${feature} 기능은 아직 구현되지 않았습니다.`, {
      description: '추후 업데이트될 예정입니다.',
    });
  };

  const handleUploadButton = () => {
    if (!uploadRef.current) {
      toast.error('오류가 발생했습니다. 새로고침을 해주세요.');
      return;
    }

    uploadRef.current.click();
  };

  const handleFileChange = async (ev: ChangeEvent<HTMLInputElement>) => {
    const currentMimes = ['text/javascript', 'text/html', 'text/css'];
    const MAX_SIZE = 1024 * 1024;

    const files = ev.target.files;

    if (!roomCode) {
      toast.error('유효하지 않는 방 코드 입니다.');
      return;
    }

    if (!files || files.length === 0) {
      toast.error('파일을 하나 이상 선택해주세요.');
      return;
    }

    const uploadFile = files[0];
    if (uploadRef.current) {
      uploadRef.current.value = '';
    }

    if (!currentMimes.includes(uploadFile.type) && !extname(uploadFile.name)) {
      toast.error('정해진 파일 타입만 업로드 할 수 있습니다.');
      return;
    }

    if (uploadFile.size > MAX_SIZE) {
      toast.error('파일의 크기가 1MB 를 초과했습니다.');
      return;
    }

    setUploadFile(uploadFile);

    if (getFileId(uploadFile.name)) {
      setFilename(uploadFile.name);
      setIsDuplicated(true);
    } else {
      const result = await handleCheckRename(uploadFile.name);
      if (result) {
        const content = await uploadFile.text();
        createFile(uploadFile.name, content);
        setUploadFile(undefined);
      }
    }
  };

  const handleNewFile = async (name: string, ext: string) => {
    const filename = `${name}.${ext}`;
    if (getFileId(filename)) {
      setFilename(filename);
      setIsDuplicated(true);
    } else {
      const result = await handleCheckRename(filename);
      if (result) {
        createFile(filename, '');
      }
    }
  };

  const handleDuplicateDialog = () => {
    setUploadFile(undefined);
    setFilename('');
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center px-4 gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
      {/* 로고 및 서비스명 */}
      <a href="/" className="shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={LogoAnimation}
            alt="CodeJam Logo"
            className="h-8 w-8 sm:h-10 sm:w-10"
          />
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground hidden sm:block">
            {PROJECT_NAME}
          </h1>
        </div>
      </a>

      {/* Room CODE - 화면 작을 땐 CODE만 표시 */}
      <div className="flex items-center gap-2 ml-2 sm:ml-6 shrink-0">
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider hidden md:block">
          ROOM CODE
        </span>
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 border border-border rounded-md bg-secondary/50">
          <span className="font-mono text-xs sm:text-sm font-semibold max-w-[80px] sm:max-w-none truncate">
            {roomCode}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={copyRoomCode}
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* 파일 중복 다이어로그 */}
      <DuplicateDialog
        open={isDuplicated}
        onOpenChange={setIsDuplicated}
        filename={filename}
        file={uploadFile}
        onClick={handleDuplicateDialog}
      />

      {/* 우측 액션 버튼들 */}
      <div className="ml-auto flex items-center gap-1 shrink-0">
        <NewFileDialog onSubmit={handleNewFile}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-8 px-2 sm:px-3"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">New File</span>
          </Button>
        </NewFileDialog>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8 px-2 sm:px-3"
          onClick={handleUploadButton}
        >
          <input
            type="file"
            ref={uploadRef}
            className="hidden"
            accept="text/javascript,text/css,text/html,.ts,.tsx,.jsx"
            onChange={handleFileChange}
          />
          <Upload className="h-4 w-4" />
          <span className="hidden lg:inline">Upload</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8 px-2 sm:px-3"
          onClick={() => handleNotImplemented('Download')}
        >
          <Download className="h-4 w-4" />
          <span className="hidden lg:inline">Download</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8 px-2 sm:px-3 hidden sm:flex"
          onClick={() => handleNotImplemented('Copy')}
        >
          <Copy className="h-4 w-4" />
          <span className="hidden lg:inline">Copy</span>
        </Button>

        {/* 공유 다이얼로그 */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs h-8 px-2 sm:px-3"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden lg:inline">Share</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Link</DialogTitle>
              <DialogDescription>
                현재 페이지의 링크를 복사하여 다른 사람에게 공유해보세요.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={window.location.href}
                  readOnly
                  className="h-9"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary" size="sm">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <SettingsDialog />

        {/* 라이트/다크 모드 토글 */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8 px-2 sm:px-3"
          onClick={toggleTheme}
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4" />
              <span className="hidden lg:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span className="hidden lg:inline">Dark</span>
            </>
          )}
        </Button>

        <LeaveRoomButton />
      </div>
    </header>
  );
}
