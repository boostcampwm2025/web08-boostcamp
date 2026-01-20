import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * 방 설정
 */
export enum RoomType {
  QUICK = 'quick',
  CUSTOM = 'custom',
}

/**
 * 기본 입장 권한 설정 정책
 */
export enum DefaultRolePolicy {
  /** 읽기 전용 (기본값) */
  VIEWER = 'viewer',

  /** 편집 가능 */
  EDITOR = 'editor',
}

/**
 * 방을 폭파할 수 있는 권한 범위
 */
export enum WhoCanDestroyRoom {
  HOST = 'host',
  EDITOR = 'editor',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  roomId: number;

  @Column({ type: 'varchar', unique: true })
  roomCode: string;

  @Column({
    type: 'enum',
    enum: RoomType,
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
    enum: DefaultRolePolicy,
    default: DefaultRolePolicy.VIEWER,
  })
  defaultRolePolicy: DefaultRolePolicy;

  @Column({
    type: 'enum',
    enum: WhoCanDestroyRoom,
    default: WhoCanDestroyRoom.HOST,
  })
  whoCanDestroyRoom: WhoCanDestroyRoom;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;
}
