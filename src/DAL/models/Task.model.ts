import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CommonEntity } from "./Common.model";
import { User } from "./User.model";
import { EPriorityType, ETaskStatusType } from "../../Core/app/enum";

@Entity({ name: "tasks" })
export class Task extends CommonEntity {
  @Column({ type: "varchar", length: 150, default: null })
  title: string;

  @Column({ type: "text", default: null })
  description: string;

  @Column({ type: "timestamp" })
  deadline: Date;

  @Column({ type: "datetime", nullable: false })
  hour: Date;

  @Column({
    type: "enum",
    enum: EPriorityType,
  })
  priority: EPriorityType;

  @Column({
    type: "enum",
    enum: ETaskStatusType,
    default: ETaskStatusType.NEW,
  })
  status: ETaskStatusType;

  @ManyToOne(() => User, (user) => user.created_tasks, { onDelete: "CASCADE" }) 
  @JoinColumn({ name: "creatorId" }) 
  creator: User;

  @ManyToMany(() => User, (user) => user.tasks)
  @JoinTable()
  users: User[];
}
