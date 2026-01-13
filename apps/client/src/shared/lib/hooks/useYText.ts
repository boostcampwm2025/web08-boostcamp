import { useEffect, useMemo, useState } from "react";
import { Text as YText, Map as YMap } from "yjs";
import { useFileStore } from "@/stores/file";

export const useYText = (fileId: string) => {
  const yDoc = useFileStore((state) => state.yDoc);
  const awareness = useFileStore((state) => state.awareness);
  const setActiveFile = useFileStore((state) => state.setActiveFile);

  // Y.Doc 업데이트 시 강제 리렌더링
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    if (!yDoc) return;

    const handleUpdate = () => {
      setUpdateCount((n) => n + 1);
    };

    yDoc.on("update", handleUpdate);
    return () => {
      yDoc.off("update", handleUpdate);
    };
  }, [yDoc]);

  // 계층형 구조에서 Y.Text 가져오기
  const yText = useMemo(() => {
    if (!yDoc) return null;

    const filesMap = yDoc.getMap("files");
    const fileMap = filesMap.get(fileId) as YMap<unknown> | undefined;
    if (!fileMap) return null;

    return fileMap.get("content") as YText | null;
  }, [yDoc, fileId, updateCount]); // updateCount 추가로 업데이트 감지

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
