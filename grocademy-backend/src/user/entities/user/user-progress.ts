import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user';
import { CourseModule } from '../../../course/entities/course/course-module';


@Entity()
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => CourseModule)
  @JoinColumn()
  module: CourseModule;

  @CreateDateColumn()
  completed_at: Date;
}
