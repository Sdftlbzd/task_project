import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { EStatusType } from "../../app/enum";

export class CreateEmployeeDTO {
  @IsDefined({ message: "Name is required" })
  @IsString()
  @MaxLength(25, { message: "Name is too long" })
  @MinLength(3, { message: "En az 3 simvol olmalidir" })
  name: string;

  @IsDefined()
  @IsString()
  @MaxLength(50)
  surname: string;

  @IsDefined()
  @IsEmail({}, { message: "Email düzgün formatda olmalıdır." })
  email: string;

  @IsDefined()
  @IsString()
  @MinLength(8, { message: "En az 8 simvol olmalidir" })
  @MaxLength(15, { message: "Pass is too long" })
  password: string;

  @IsDefined()
  @IsString()
  @MaxLength(50)
  username: string;

  @IsDefined()
  @IsEnum(EStatusType)
  status: EStatusType;
}
