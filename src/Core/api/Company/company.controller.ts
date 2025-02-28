import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../../DAL/models/User.model";
import { ERoleType } from "../../app/enum";
import { formatErrors } from "../../middlewares/error.moddleware";
import { appConfig } from "../../../consts";
import { Company } from "../../../DAL/models/Company.model";
import { CreateCompanyDTO } from "./company.dto";
import { AuthRequest } from "../../../types";

const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const { name, phone, address } = req.body;

    const company = await Company.findOne({ where: { phone } });
    if (company) {
      res.status(409).json("Bu nomreye uygun sirket artiq movcuddur");
      return;
    }

    const dto = new CreateCompanyDTO();
    dto.name = name;
    dto.phone = phone;
    dto.address = address;

    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const newCompany = Company.create({
      name,
      phone,
      address,
      creator: user,
    });

    await newCompany.save();

    const Data = await Company.findOne({
      where: { phone },
      relations: ["creator"],
      select: ["id", "name", "creator", "created_at"],
    });

    res.status(201).json(Data);
    next();
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const CompanyController = () => ({
   create
});