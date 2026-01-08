import { DefaultRolePolicy, HostTransferPolicy } from './room.entity';

export interface RoomCreationOptions {
  hostTransferPolicy: HostTransferPolicy;
  defaultRolePolicy: DefaultRolePolicy;
  roomPassword?: string;
  hostPassword?: string;
}
