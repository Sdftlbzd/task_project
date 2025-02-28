import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BaseEntity,
  } from "typeorm";
  
  
  export class CommonEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @CreateDateColumn({ type: "datetime" })
    created_at: Date;
  
    @UpdateDateColumn({ type: "datetime" })
    updated_at: Date;
  
    @DeleteDateColumn({ type: "datetime" })
    deleted_at: Date;
  }
  