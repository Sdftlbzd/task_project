import express, { Request, Response } from "express";
import "reflect-metadata";
import { AppDataSource } from "./DAL/config/data-source";
import { appConfig } from "./consts";
import { v1Routes } from "./Routes";
import { Task } from "./DAL/models/Task.model";
import cron from 'node-cron';

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");

    const app = express();
    const port = appConfig.PORT;

    app.use(express.json());
    app.use("/api/v1", v1Routes);

app.get("/api/v1/cron",(req:Request, res:Response)=>{
  class Task {
      id: number;
      title: string;
      deadline: Date;
      status: 'pending' | 'completed' | 'failed';
  
      constructor(id: number, title: string, deadline: Date) {
          this.id = id;
          this.title = title;
          this.deadline = deadline;
          this.status = 'pending';
      }
  
      // Deadline keçibsə statusu 'failed' et
      checkDeadline() {
          if (new Date() > this.deadline && this.status === 'pending') {
              this.status = 'failed';
              console.log(`Task ${this.id} failed due to missed deadline.`);
          }
      }
  }
  
  // Tapşırıqlar
  const tasks: Task[] = [
      new Task(1, 'Finish project', new Date('2025-03-01T10:00:00')),
      new Task(2, 'Submit report', new Date('2025-03-01T12:00:00')),
  ];
  
  // Cron job - hər dəqiqə tapşırıqların deadline-larını yoxlayır
  cron.schedule('* * * * *', () => {
      console.log('Checking tasks deadlines...');
      tasks.forEach(task => task.checkDeadline());
  });
  
  console.log('Cron job started. Checking tasks every minute.');
  

})

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database", error);
  });
