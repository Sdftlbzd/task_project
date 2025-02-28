import { Router } from "express";
import { AuthController } from "./auth.controller";
import { useAuth } from "../../middlewares/auth.middleware";

export const authRoutes = Router();
const controller = AuthController();

authRoutes.post("/register", controller.register);
authRoutes.post("/login", controller.login);
authRoutes.get('/me', useAuth, controller.aboutMe);