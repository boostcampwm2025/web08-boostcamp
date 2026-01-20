import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from '../room/room.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  docId: string;

  @Column()
  roomId: number;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id', referencedColumnName: 'roomId' })
  room: Room;

  // Hidden by default for performance
  @Column({ type: 'bytea', nullable: true, select: false })
  content: Buffer | null;

  @Column({ type: 'int', default: 0 })
  clock: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
