import { Router } from "express";
import { AdminController } from "./admin.controller";

export const adminRoutes = Router();
const controller = AdminController();

adminRoutes.post("/add/employee", controller.addEmployee);
adminRoutes.put("/task/update/:id", controller.updateTask);
adminRoutes.get("/list", controller.taskList)