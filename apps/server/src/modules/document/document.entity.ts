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

  /**
   * Compacted binary snapshot of the Y.Doc document state.
   * - Stores the merged result of all updates up to the `clock` value
   * - Created during Redis compaction process (merging incremental updates)
   * - Used for document hydration
   * - Hidden by default for performance
   */
  @Column({ type: 'bytea', nullable: true, select: false })
  content: Buffer | null;

  /**
   * Logical clock representing the total number of updates in the document's history.
   * Used for synchronization with Redis offset during compaction.
   * - Matches Redis offset after compaction completes
   * - Increments with each update applied to the document
   * - Enables consistency checking between DB snapshot and Redis updates
   */
  @Column({ type: 'int', default: 0 })
  clock: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
