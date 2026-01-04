import { DefaultEventsMap, Socket } from 'socket.io';

export type CollabSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  {
    clientId?: number;
    roomId?: string;
  }
>;
