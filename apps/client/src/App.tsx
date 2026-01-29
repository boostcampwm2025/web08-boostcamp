import {
  createBrowserRouter,
  RouterProvider,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import RoomPage from '@/pages/room/RoomPage';
import NotFoundPage from '@/pages/not-found/NotFoundPage';
import HomePage from '@/pages/home/HomePage';
import JoinPage from '@/pages/join/JoinPage';
import { checkRoomJoinable } from '@/shared/api/room';
import type { RoomJoinStatus } from '@codejam/common';
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  ROOM_JOIN_STATUS,
  ROUTE_PATTERNS,
  VALIDATION_MESSAGES,
} from '@codejam/common';

async function joinLoader({
  params,
  request,
}: LoaderFunctionArgs): Promise<{ roomCode: string; token: string }> {
  const { roomCode } = params;
  if (!roomCode) {
    throw new Response(VALIDATION_MESSAGES.ROOM_CODE_REQUIRED, {
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) {
    throw new Response(VALIDATION_MESSAGES.TOKEN_REQUIRED, {
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }

  return { roomCode, token };
}

async function roomLoader({
  params,
}: LoaderFunctionArgs): Promise<RoomJoinStatus> {
  const { roomCode } = params;
  if (!roomCode) {
    throw new Response(VALIDATION_MESSAGES.ROOM_CODE_REQUIRED, {
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }
  const status = await checkRoomJoinable(roomCode);
  if (status === ROOM_JOIN_STATUS.NOT_FOUND) {
    throw new Response(ERROR_MESSAGES.ROOM_NOT_FOUND, {
      status: HTTP_STATUS.NOT_FOUND,
    });
  }

  return status;
}

const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
    children: [
      {
        path: ROUTE_PATTERNS.HOME,
        element: <HomePage />,
      },
      {
        path: ROUTE_PATTERNS.JOIN,
        element: <JoinPage />,
        loader: joinLoader,
      },
      {
        path: ROUTE_PATTERNS.ROOM,
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
