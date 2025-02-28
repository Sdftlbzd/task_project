import { Router } from "express";
import { adminRoutes } from "../Core/api/Admin/admin.route";
import { roleCheck, useAuth } from "../Core/middlewares/auth.middleware";
import { ERoleType } from "../Core/app/enum";
import { authRoutes } from "../Core/api/Auth/auth.route";
import { companyRoutes } from "../Core/api/Company/company.route";
import { taskRoutes } from "../Core/api/Task/task.route";

export const v1Routes = Router();

v1Routes.use("/auth", authRoutes);
v1Routes.use("/admin", useAuth, roleCheck([ERoleType.ADMIN]), adminRoutes);
v1Routes.use("/company", useAuth, roleCheck([ERoleType.ADMIN]), companyRoutes);
v1Routes.use("/task", useAuth, taskRoutes);
