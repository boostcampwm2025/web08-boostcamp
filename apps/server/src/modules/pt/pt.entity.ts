import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Room } from '../room/room.entity';
import { ROLE, PRESENCE, type PtRole, type PtPresence } from '@codejam/common';

@Entity('pts')
export class Pt {
  @PrimaryGeneratedColumn('uuid')
  ptId: string;

  @Column()
  roomId: number;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id', referencedColumnName: 'roomId' })
  room: Room;

  @Column({ type: 'varchar' })
  ptHash: string;

  @Column({ type: 'varchar' })
  nickname: string;

  @Column({ type: 'varchar' })
  color: string;

  @Column({
    type: 'enum',
    enum: Object.values(ROLE),
  })
  role: PtRole;

  @Column({
    type: 'enum',
    enum: Object.values(PRESENCE),
  })
  presence: PtPresence;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
