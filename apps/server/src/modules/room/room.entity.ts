import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * 방장 퇴장 시 Host 권한 처리 정책
 */
export enum HostTransferPolicy {
  /** 권한을 넘기지 않고 방장을 공석으로 둠 (기본값) */
  NO_TRANSFER = 'no_transfer',

  /** 권한을 자동으로 넘김 */
  AUTO_TRANSFER = 'auto_transfer',
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

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  roomId: number;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  roomPassword: string | null;

  @Column({ type: 'varchar', nullable: true })
  hostPassword: string | null;

  @Column({
    type: 'enum',
    enum: HostTransferPolicy,
    default: HostTransferPolicy.NO_TRANSFER,
  })
  hostTransferPolicy: HostTransferPolicy;

  @Column({
    type: 'enum',
    enum: DefaultRolePolicy,
    default: DefaultRolePolicy.VIEWER,
  })
  defaultRolePolicy: DefaultRolePolicy;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;
}
