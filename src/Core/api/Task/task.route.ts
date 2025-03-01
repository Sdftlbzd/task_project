import { Router } from "express";
import { TaskController } from "./task.controller";
import { roleCheck } from "../../middlewares/auth.middleware";
import { ERoleType } from "../../app/enum";

export const taskRoutes = Router();
const controller = TaskController();

taskRoutes.post("/create", roleCheck([ERoleType.ADMIN]), controller.create);
taskRoutes.put("/update/:id", controller.update);
taskRoutes.get("/get/by/:id", controller.getById);