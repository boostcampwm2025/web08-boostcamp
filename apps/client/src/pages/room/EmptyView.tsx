import { NewFileButton } from '@/widgets/header/ui/buttons/NewFileButton';
import { FileUploadButton } from '@/widgets/header/ui/buttons/FileUploadButton';
import { useRoomStore } from '@/stores/room';

export function EmptyView() {
  const roomCode = useRoomStore((state) => state.roomCode);

  if (!roomCode) return null;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">
          No file open
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Create a new file or upload an existing one to get started
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
