import jwt from "jsonwebtoken";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { appConfig } from "../../consts";
import { User } from "../../DAL/models/User.model";
import { AuthRequest } from "../../types";

export const useAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    console.log("token yoxdur");
    res.status(401).json({
      message: "Token not found!",
    });
    return;
  }

  const access_token = String(authorizationHeader).split(" ")[1];
  if (!access_token) {
    res.status(401).json({
      message: "Token not found!",
    });
    return;
  }

  try {
    const jwtResult = jwt.verify(
      access_token,
      String(appConfig.JWT_SECRET)
    ) as jwt.JwtPayload;

    const user = await User.findOne({
      where: { id: Number(jwtResult.sub) },
    });

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({
      message: "The token is invalid",
      error,
    });
    return;
  }
};

export const roleCheck = (roles: string[]): any => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({ message: "You don't have permission!" });
      return;
    }

    next();
  };
};
