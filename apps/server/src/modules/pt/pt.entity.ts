import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Room } from '../room/room.entity';

export enum PtRole {
  HOST = 'host',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum PtPresence {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

@Entity('pts')
export class Pt {
  @PrimaryGeneratedColumn('uuid')
  ptId: string;

  @Column({ type: 'varchar' })
  roomCode: string;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_code', referencedColumnName: 'roomCode' })
  room: Room;

  @Column({ type: 'varchar' })
  ptHash: string;

  @Column({ type: 'varchar' })
  nickname: string;

  @Column({ type: 'varchar' })
  color: string;

  @Column({
    type: 'enum',
    enum: PtRole,
  })
  role: PtRole;

  @Column({
    type: 'enum',
    enum: PtPresence,
    default: PtPresence.ONLINE,
  })
  presence: PtPresence;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
