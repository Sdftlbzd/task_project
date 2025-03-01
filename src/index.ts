import express, { Request, Response } from "express";
import "reflect-metadata";
import { AppDataSource } from "./DAL/config/data-source";
import { appConfig } from "./consts";
import { v1Routes } from "./Routes";
import { Task } from "./DAL/models/Task.model";
import cron from "node-cron";
import markExpiredTasksAsFailed from "./Core/middlewares/cron.middleware";

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");

    const app = express();
    const port = appConfig.PORT;

    app.use(express.json());
    app.use("/api/v1", v1Routes);

    app.get("/api/v1/cron", markExpiredTasksAsFailed);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database", error);
  });
