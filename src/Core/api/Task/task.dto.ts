import {
  IsDate,
  IsDefined,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { EPriorityType, ETaskStatusType } from "../../app/enum";
import { User } from "../../../DAL/models/User.model";

export class CreateTaskDTO {
  @IsDefined()
  @IsString()
  @MinLength(1)
  title: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  @MinLength(3)
  description: string;

  @IsDefined()
  @IsDate()
  deadline: Date;

  @IsDefined()
  @IsDate()
  hour: Date;

  @IsDefined()
  @IsEnum(EPriorityType)
  priority: EPriorityType;

  @IsOptional()
  @IsEnum(ETaskStatusType)
  status: ETaskStatusType;

  @IsDefined()
  users: User[];
}

export class UpdateTaskDTO {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MinLength(3)
  description: string;

  @IsOptional()
  @IsDate()
  deadline: Date;

  @IsOptional()
  @IsDate()
  hour: Date;

  @IsOptional()
  @IsEnum(EPriorityType)
  priority: EPriorityType;

  @IsOptional()
  @IsEnum(ETaskStatusType)
  status: ETaskStatusType;

  @IsOptional()
  users: User[];
}
