import { Entity, Column, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { CommonEntity } from "./Common.model";
import { User } from "./User.model";
import { ERoleType } from "../../Core/app/enum";

@Entity({ name: "companies" })
export class Company extends CommonEntity {
  @Column({ type: "varchar", length: 150, unique: true })
  name: string;

  @Column({
    type: "enum",
    enum: ERoleType,
    default: ERoleType.ADMIN,
  })
  position: ERoleType;

  @Column({ type: "varchar", length: 13, default: null, unique:true })
  phone: string;

  @Column({ type: "varchar", length: 150, unique: true })
  address: string;

  @OneToOne(() => User, (user) => user.created_company, { onDelete: "SET NULL" })
  @JoinColumn()
  creator: User;

  @OneToMany(() => User, (user) => user.company, { cascade: true })
  users: User[];
}
