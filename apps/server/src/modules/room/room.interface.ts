import { RoomType, DefaultRolePolicy, WhoCanDestroyRoom } from './room.entity';
import { PtRole } from '../pt/pt.entity';

export interface RoomCreationOptions {
  roomType: RoomType;
  roomPassword?: string;
  hostPassword?: string;
  maxPts: number;
  defaultRolePolicy: DefaultRolePolicy;
  whoCanDestroyRoom: WhoCanDestroyRoom;

  roomCreatorRole: PtRole;
}
