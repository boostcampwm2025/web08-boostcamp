import { useFileStore } from "@/stores/file";
import { memo } from "react";

type FileProps = {
  fileId: string;
	fileName: string;
};

export const File = memo(({ fileId, fileName }: FileProps) => {
	const setActiveFile = useFileStore((state) => state.setActiveFile);
  const activeFileId = useFileStore((state) => state.activeFileId);

  const isActive = activeFileId === fileId;
  const opacity = isActive ? "opacity-40" : "opacity-100";

  const handleClick = () => {
    setActiveFile(fileId);
  };

  return (
    <div
      className="flex items-center justify-between p-2 transition-colors
        select-none hover:bg-gray-100 dark:hover:bg-gray-700"
    onClick={handleClick}>
      <div className={`flex items-center space-x-3 ${opacity}`}>
        <div>
					<div className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-100">
						<p className="w-50 truncate" title={ fileName }>{ fileName }</p>
					</div>
      	</div>
    	</div>
		</div>
  );
});

File.displayName = "FileList";