import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_devices')
@Index(['userId', 'platform'], { unique: true })
export class UserDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  userId: string;

  @Column({ name: 'fcm_token', type: 'text' })
  fcmToken: string;

  @Column({ type: 'varchar', length: 20 })
  platform: 'ios' | 'android';

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'app_version', type: 'varchar', length: 50, nullable: true })
  appVersion?: string;

  @Column({
    name: 'device_model',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  deviceModel?: string;

  @Column({ name: 'last_seen_at', type: 'timestamp', nullable: true })
  lastSeenAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
