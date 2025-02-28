import {
    IsBoolean,
    IsDate,
    IsDefined,
    IsEmail,
    IsEnum,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Matches,
    MaxLength,
    MinLength,
  } from "class-validator";
  
  export class CreateCompanyDTO {
    @IsDefined({ message: "Name is required" })
    @IsString()
    @MaxLength(25, { message: "Name is too long" })
    @MinLength(3, { message: "En az 3 simvol olmalidir" })
    name: string;
  
    @IsOptional()
    @IsPhoneNumber()
    @Matches(/^\+994\d{9}$/, {
      message: "Phone number must be in +994XXXXXXXXX format",
    })
    phone: string;

    @IsDefined()
    @IsString()
    address:string;
  }