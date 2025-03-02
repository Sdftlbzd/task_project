import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import { formatErrors } from "../../middlewares/error.moddleware";
import { Company } from "../../../DAL/models/Company.model";
import { CreateCompanyDTO } from "./company.dto";
import { AuthRequest } from "../../../types";
import { User } from "../../../DAL/models/User.model";

const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const user = await User.findOne({
      where: { id: req.user.id },
      relations: ["created_company"],
    });

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    if (user.created_company) {
      res.status(401).json({ message: "User already created a company.!" });
      return;
    }

    const { name, phone, address } = req.body;

    const company = await Company.findOne({ where: { phone, name, address } });
    if (company) {
      res
        .status(409)
        .json("Bu ada,nomreye ve ya addresse uygun sirket artiq movcuddur");
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

    user.created_company = newCompany;
    await user.save();

    const Data = await Company.findOne({
      where: { phone },
      relations: ["creator"],
      select: ["id", "name", "creator", "created_at"],
      loadRelationIds: true,
    });

    res.status(201).json(Data);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const CompanyController = () => ({
  create,
});
