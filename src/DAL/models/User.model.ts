import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
} from "typeorm";
import { CommonEntity } from "./Common.model";
import { ERoleType, EStatusType } from "../../Core/app/enum";
import { Company } from "./Company.model";
import { Task } from "./Task.model";

@Entity({ name: "users" })
export class User extends CommonEntity {
  @Column({ type: "varchar", length: 150, default: null })
  name: string;

  @Column({ type: "varchar", length: 150, default: null })
  surname: string;

  @Column({ type: "varchar", length: 150, unique: true })
  email: string;

  @Column({ type: "varchar", length: 150 })
  password: string;

  @Column({ type: "varchar", default: null })
  username: String;

  @Column({
    type: "enum",
    enum: ERoleType,
    default: ERoleType.ADMIN,
  })
  role: ERoleType;

  @Column({
    type: "enum",
    enum: EStatusType,
    default: EStatusType.ACTIVE,
  })
  status: EStatusType;

  @ManyToOne(() => Company, (company) => company.users, {
    onDelete: "SET NULL",
  })
  company: Company;

  @ManyToMany(() => Task, (task) => task.users, { onDelete: "CASCADE" })
  @JoinTable({
    name: "employees_tasks",
    joinColumn: { name: "employee_id" },
    inverseJoinColumn: { name: "task_id" },
  })
  tasks: Task[];

  @OneToMany(() => Task, (task) => task.creator)
  created_tasks: Task[];

  @OneToOne(() => Company, (company) => company.creator,  { cascade: true })
  @JoinColumn()  
  created_company: Company;

}
