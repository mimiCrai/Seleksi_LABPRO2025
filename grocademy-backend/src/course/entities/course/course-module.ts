import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { Course } from './course';
import { UserProgress } from '../../../user/entities/user/user-progress';


@Entity()
@Unique(['course', 'order']) // Ensures order is unique within each course
export class CourseModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  pdf_content: string;

  @Column({ nullable: true })
  video_content: string;

  @ManyToOne(() => Course, (c) => c.modules)
  course: Course;

  @OneToMany(() => UserProgress, (up) => up.module)
  userProgresses: UserProgress[];

  @Column()
  order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
