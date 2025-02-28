import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
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

  @ManyToMany(() => User, (user) => user.tasks)
  @JoinTable()
  users: User[];
}
