import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import {
  ROOM_TYPE,
  WHO_CAN_DESTROY_ROOM,
  DEFAULT_ROLE,
  type RoomType,
  type DefaultRolePolicy,
  type WhoCanDestroyRoom,
} from '@codejam/common';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  roomId: number;

  @Column({ type: 'varchar', unique: true })
  roomCode: string;

  @Column({
    type: 'enum',
    enum: Object.values(ROOM_TYPE),
  })
  roomType: RoomType;

  @Column({ type: 'varchar', nullable: true })
  roomPassword: string | null;

  @Column({ type: 'varchar', nullable: true })
  hostPassword: string | null;

  @Column({ type: 'integer' })
  maxPts: number;

  @Column({
    type: 'enum',
    enum: Object.values(DEFAULT_ROLE),
  })
  defaultRolePolicy: DefaultRolePolicy;

  @Column({
    type: 'enum',
    enum: Object.values(WHO_CAN_DESTROY_ROOM),
  })
  whoCanDestroyRoom: WhoCanDestroyRoom;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;
}
