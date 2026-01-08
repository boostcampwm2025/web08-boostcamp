import { CodeEditor } from "@/widgets/code-editor";
import { Header } from "@/widgets/header";
import { Participants } from "@/widgets/participants";
import { useSocket } from "@/shared/lib/hooks/useSocket";
import { useRoomStore } from "@/stores/room";
import { usePt } from "@/stores/pts";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { ptStorage } from "@/shared/lib/storage";

function RoomPage() {
  // Initialize socket connection
  const { roomCode } = useParams();
  const { setMyPtId, setRoomCode } = useRoomStore();

  useSocket(roomCode || "");
  useEffect(() => {
    setRoomCode(roomCode || "");
    setMyPtId(ptStorage.myId(roomCode) || "");
  }, [roomCode, setMyPtId, setRoomCode]);

  const myPtId = useRoomStore((state) => state.myPtId);
  const myPt = usePt(myPtId || "");
  const isViewer = myPt?.role === "viewer";

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden flex">
        <div className="border-r h-full overflow-y-auto scrollbar-thin">
          <Participants />
        </div>
        <div className="flex-1 h-full">
          <CodeEditor
            fileId="prototype"
            language="javascript"
            readOnly={isViewer}
          />
        </div>
      </main>
    </div>
  );
}

export default RoomPage;
