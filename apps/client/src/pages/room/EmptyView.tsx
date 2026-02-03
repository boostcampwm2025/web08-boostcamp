import { NewFileButton } from '@/widgets/header/ui/buttons/NewFileButton';
import { FileUploadButton } from '@/widgets/header/ui/buttons/FileUploadButton';
import { useRoomStore } from '@/stores/room';

type EmptyViewProps = {
  deleted?: boolean;
};

export function EmptyView({ deleted = false }: EmptyViewProps) {
  const roomCode = useRoomStore((state) => state.roomCode);

  if (!roomCode) return null;

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {deleted ? '해당 파일은 삭제되었습니다' : '열린 파일이 없습니다.'}
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {deleted
            ? '탭을 닫고 새로운 파일 탭을 열어주세요'
            : '새 파일을 생성하거나 업로드를 해주세요'}
        </p>
        <div className="flex justify-center gap-3">
          <div className="scale-120">
            <NewFileButton roomCode={roomCode} />
            <FileUploadButton roomCode={roomCode} />
          </div>
        </div>
      </div>
    </div>
  );
}
