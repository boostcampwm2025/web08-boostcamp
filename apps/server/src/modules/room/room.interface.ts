import type {
  RoomType,
  DefaultRolePolicy,
  WhoCanDestroyRoom,
  PtRole,
  Password,
  MaxPts,
} from '@codejam/common';

export interface RoomCreationOptions {
  roomType: RoomType;
  roomPassword?: Password;
  hostPassword?: Password;
  maxPts: MaxPts;
  defaultRolePolicy: DefaultRolePolicy;
  whoCanDestroyRoom: WhoCanDestroyRoom;
  roomCreatorRole: PtRole;
}
