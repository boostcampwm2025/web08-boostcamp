import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Room } from '../room/room.entity';

/**
 * 참가자 역할
 */
export enum PtRole {
  /** 방장 */
  HOST = 'host',

  /** 편집 가능 */
  EDITOR = 'editor',

  /** 읽기 전용 */
  VIEWER = 'viewer',
}

/**
 * 참여자 접속 상태
 */
export enum PtPresence {
  /** 온라인 */
  ONLINE = 'online',

  /** 오프라인 */
  OFFLINE = 'offline',
}

@Entity('pts')
export class Pt {
  @PrimaryGeneratedColumn('uuid')
  ptId: string;

  @Column({ type: 'int' })
  roomId: number;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

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

  @Column({ type: 'varchar' })
  nickname: string;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  color: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;
}
