import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user';
import { Course } from '../../../course/entities/course/course';

@Entity()
export class UserCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userCourses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @CreateDateColumn()
  purchased_at: Date;
}
