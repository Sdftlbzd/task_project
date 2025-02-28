import { Router } from "express";
import { CompanyController } from "./company.controller";

export const companyRoutes = Router();
const controller = CompanyController();

companyRoutes.post("/create", controller.create);
