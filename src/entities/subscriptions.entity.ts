import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './users.entity';
import { Plan } from './plans.entity';
import { Payment } from './payments.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  plan_id: number;

  @Column({ type: 'date', nullable: true })
  start_date?: Date;

  @Column({ type: 'date', nullable: true })
  end_date?: Date;

  @Column({
    type: 'enum',
    enum: ['pending_payment', 'active', 'expired', 'cancelled'],
    default: 'pending_payment',
  })
  status: 'pending_payment' | 'active' | 'expired' | 'cancelled';

  @ManyToOne(() => User, user => user.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Plan, plan => plan.subscriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @OneToMany(() => Payment, payment => payment.subscription)
  payments: Payment[];
}
