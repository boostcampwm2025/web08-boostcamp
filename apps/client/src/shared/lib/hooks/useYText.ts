import { useEffect, useMemo } from "react";
import { Text as YText } from "yjs";
import { useFileStore } from "@/stores/file";

export const useYText = (fileId: string) => {
  const yDoc = useFileStore((state) => state.yDoc);
  const awareness = useFileStore((state) => state.awareness);
  const setActiveFile = useFileStore((state) => state.setActiveFile);

  // 계층형 구조에서 Y.Text 가져오기
  const yText = useMemo(() => {
    if (!yDoc) return null;

    const filesMap = yDoc.getMap("files");
    const fileMap = filesMap.get(fileId) as Map<string, unknown> | undefined;
    if (!fileMap) return null;

    return fileMap.get("content") as YText | null;
  }, [yDoc, fileId]);

  // Update active file when the component mounts
  useEffect(() => {
    setActiveFile(fileId);

    // Cleanup awareness state on unmount
    const handleUnload = () => {
      awareness?.setLocalState(null);
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [fileId, setActiveFile, awareness]);

  return { yText, awareness };
};
