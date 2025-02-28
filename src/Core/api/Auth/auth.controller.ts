import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../../DAL/models/User.model";
import { formatErrors } from "../../middlewares/error.moddleware";
import { appConfig } from "../../../consts";
import { AuthRequest } from "../../../types";
import { CreateUserDTO } from "./auth.dto";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, surname, email, username, password } = req.body;

    const user = await User.findOne({ where: { email: email } });
    if (user) {
      res.status(409).json("Bu emaile uygun user artiq movcuddur");
      return;
    }

    const dto = new CreateUserDTO();
    dto.name = name;
    dto.surname = surname;
    dto.email = email;
    dto.password = password;
    dto.username = username;

    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const newPassword = await bcrypt.hash(password, 10);

    const newUser = User.create({
      name,
      surname,
      email,
      password: newPassword,
      username,
    });

    await newUser.save();

    const Data = await User.findOne({
      where: { email },
      select: ["id", "name", "surname", "email", "created_at"],
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

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email: email },
  });

  if (!user) {
    res.status(401).json({ message: "Email ve ya shifre sehvdir!" });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    res.status(401).json({
      message: "Email ve ya shifre sehvdir!",
    });
    console.log("parol yalnisdir");
    return;
  }

  const jwt_payload = {
    sub: user.id,
  };
  const jwtSecret = String(appConfig.JWT_SECRET);

  const new_token = jwt.sign(jwt_payload, jwtSecret, {
    algorithm: "HS256",
    expiresIn: "1d",
  });

  res.status(201).json({
    access_token: new_token,
  });
};

const aboutMe = async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
  
      const data = await User.findOne({
        where: { id: user.id },
        select: [
          "name",
          "surname",
          "email",
          "username",
          "created_at",
        ],
      });
  
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

export const AuthController = () => ({
  register,
  login,
  aboutMe
});
