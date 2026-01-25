import {
  createBrowserRouter,
  RouterProvider,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import RoomPage from '@/pages/room/RoomPage';
import NotFoundPage from '@/pages/not-found/NotFoundPage';
import HomePage from '@/pages/home/HomePage';
import JoinPage from '@/pages/join/JoinPage';
import { checkRoomExists } from '@/shared/api/room';
import type { RoomJoinStatus } from '@codejam/common';
import { HTTP_STATUS } from '@codejam/common';

async function joinLoader({
  params,
  request,
}: LoaderFunctionArgs): Promise<{ roomCode: string; token: string }> {
  const { roomCode } = params;
  if (!roomCode) {
    throw new Response('Room code is required', {
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) {
    throw new Response('Token is required', {
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
    throw new Response('Room code is required', {
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }
  const status = await checkRoomExists(roomCode);
  if (status === 'NOT_FOUND') {
    throw new Response('Room not found', { status: HTTP_STATUS.NOT_FOUND });
  }

  return status;
}

const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/join/:roomCode',
        element: <JoinPage />,
        loader: joinLoader,
      },
      {
        path: '/rooms/:roomCode',
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
