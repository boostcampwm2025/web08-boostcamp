import {
  createBrowserRouter,
  RouterProvider,
  type LoaderFunctionArgs,
} from "react-router-dom";
import RoomPage from "@/pages/room/RoomPage";
import NotFoundPage from "@/pages/not-found/NotFoundPage";
import HomePage from "@/pages/home/HomePage";
import { checkRoomExists } from "@/shared/api/room";

async function roomLoader({ params }: LoaderFunctionArgs) {
  const { roomCode } = params;
  if (!roomCode) {
    throw new Response("Room code is required", { status: 400 });
  }
  const exists = await checkRoomExists(roomCode);
  if (!exists) {
    throw new Response("Room not found", { status: 404 });
  }
  return { roomCode };
}

const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/rooms/:roomCode",
        element: <RoomPage />,
        loader: roomLoader,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
