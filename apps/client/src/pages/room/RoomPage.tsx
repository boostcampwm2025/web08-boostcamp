import { CodeEditor } from "@/widgets/code-editor";
import { Header } from "@/widgets/header";
import { Participants } from "@/widgets/participants";
import { useSocket } from "@/shared/lib/hooks/useSocket";
import { useRoomStore } from "@/stores/room";
import { usePt } from "@/stores/pts";

function RoomPage() {
  // Initialize socket connection
  const roomId = useRoomStore((state) => state.roomId);
  useSocket(roomId || "");

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
