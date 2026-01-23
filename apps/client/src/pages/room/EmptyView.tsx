import { NewFileButton } from '@/widgets/header/ui/buttons/NewFileButton';
import { FileUploadButton } from '@/widgets/header/ui/buttons/FileUploadButton';
import { useRoomStore } from '@/stores/room';

export function EmptyView() {
  const roomCode = useRoomStore((state) => state.roomCode);

  if (!roomCode) return null;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
          No file open
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Create a new file or upload an existing one to get started
        </p>
        <div className="flex gap-3 justify-center">
          <div className="scale-120">
            <NewFileButton roomCode={roomCode} />
            <FileUploadButton roomCode={roomCode} />
          </div>
        </div>
      </div>
    </div>
  );
}
