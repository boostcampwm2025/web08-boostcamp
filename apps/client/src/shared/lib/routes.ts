const ROOM_PREFIX = '/rooms';

export function getRoomUrl(roomCode: string): string {
  return `${ROOM_PREFIX}/${roomCode}`;
}
