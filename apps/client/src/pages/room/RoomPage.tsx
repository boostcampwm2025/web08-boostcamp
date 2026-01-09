import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { CodeEditor } from "@/widgets/code-editor";
import { Header } from "@/widgets/header";
import { Participants } from "@/widgets/participants";
import { useSocket } from "@/shared/lib/hooks/useSocket";
import { useRoomJoin } from "@/shared/lib/hooks/useRoomJoin";
import { useRoomStore } from "@/stores/room";
import { usePt } from "@/stores/pts";
import { NicknameInputDialog } from "@/widgets/nickname-input";

function RoomPage() {
  const {
    paramCode,
    isNicknameDialogOpen,
    setIsNicknameDialogOpen,
    roomError,
    handleNicknameConfirm,
  } = useRoomJoin();

  const setRoomCode = useRoomStore((state) => state.setRoomCode);

  useSocket(paramCode || "");

  useEffect(() => {
    setRoomCode(paramCode || "");
  }, [paramCode, setRoomCode]);

  const myPtId = useRoomStore((state) => state.myPtId);
  const myPt = usePt(myPtId || "");
  const isViewer = myPt?.role === "viewer";

  return (
    <div className="flex flex-col h-screen">
      <Header />
      {roomError && (
        <div className="bg-red-500 text-white p-4 text-center">{roomError}</div>
      )}
      <main className="flex-1 overflow-hidden flex">
        <div className="border-r h-full overflow-y-auto scrollbar-thin">
          <Participants />
        </div>
        <div className="flex-1 h-full">
          <CodeEditor
            fileId={paramCode || "prototype"}
            language="javascript"
            readOnly={isViewer}
          />
        </div>
      </main>
      <NicknameInputDialog
        open={isNicknameDialogOpen}
        onOpenChange={setIsNicknameDialogOpen}
        onConfirm={handleNicknameConfirm}
      />
    </div>
  );
}

export default RoomPage;
