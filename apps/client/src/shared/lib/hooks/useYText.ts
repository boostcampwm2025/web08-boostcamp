import { useEffect, useMemo } from "react";
import { useFileStore } from "@/stores/file";

export const useYText = (fileId: string) => {
  const yDoc = useFileStore((state) => state.yDoc);
  const awareness = useFileStore((state) => state.awareness);
  const setActiveFile = useFileStore((state) => state.setActiveFile);

  // Get Y.Text instance for the file
  const yText = useMemo(() => {
    if (!yDoc) return null;
    return yDoc.getText(fileId);
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
