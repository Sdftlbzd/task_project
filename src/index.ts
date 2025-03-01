import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./DAL/config/data-source";
import { appConfig } from "./consts";
import { v1Routes } from "./Routes";
import markExpiredTasksAsFailed from "./Core/Cron/task.failed";

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");

    const app = express();
    const port = appConfig.PORT;

    app.use(express.json());
    app.use("/api/v1", v1Routes);

    //app.get("/api/v1/cron", markExpiredTasksAsFailed);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database", error);
  });
