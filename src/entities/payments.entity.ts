import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subscription } from './subscriptions.entity';
// import { Subscription } from './subscription.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subscription_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['VNPay', 'MoMo'] })
  method: 'VNPay' | 'MoMo';

  @Column({
    type: 'enum',
    enum: ['success', 'pending', 'failed'],
    default: 'success',
    // tạm thời default là success vì chưa tích hợp thành toán từ bên thứ 3 . nên chưa cập nhật status chính xác được F
  })
  status: 'success' | 'pending' | 'failed';

  @Column({ length: 100, nullable: true })
  transaction_id?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Subscription, subscription => subscription.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;
}
