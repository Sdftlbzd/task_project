import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import { User } from "../../../DAL/models/User.model";
import { formatErrors } from "../../middlewares/error.moddleware";
import { AuthRequest } from "../../../types";
import { CreateTaskDTO, UpdateTaskDTO } from "./task.dto";
import { Task } from "../../../DAL/models/Task.model";
import { In } from "typeorm";
import { addMinutes, isBefore, startOfDay } from "date-fns";
import { ETaskStatusType } from "../../app/enum";

const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const {
      title,
      description,
      deadline,
      hour,
      priority,
      status,
      employee_ids,
    } = req.body;

    const employee_list = await User.find({
      where: {
        id: In(employee_ids),
      },
    });

    if (employee_list.length === 0) {
      res.status(404).json("Employee(s) not found!");
      return;
    }

    const selectedDeadline = new Date(deadline);

    const [hourStr, minuteStr] = hour.split(":");
    const selectedHour = new Date();
    selectedHour.setHours(parseInt(hourStr, 10), parseInt(minuteStr, 10), 0, 0);
    const now = new Date();
    const minHour = addMinutes(now, 30);

    if (isBefore(selectedDeadline, startOfDay(now))) {
      res.status(400).json({ message: "Deadline cannot be in the past!" });
      return;
    }

    if (isBefore(selectedHour, minHour)) {
      res.status(400).json({
        message: "Hour must be at least 30 minutes after the current time!",
      });
      return;
    }

    const dto = new CreateTaskDTO();
    dto.title = title;
    dto.description = description;
    dto.deadline = selectedDeadline;
    dto.hour = selectedHour;
    dto.priority = priority;
    dto.status = status;
    dto.users = employee_list;

    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const newTask = Task.create({
      title,
      description,
      deadline: selectedDeadline,
      hour: selectedHour,
      priority,
      status,
      users: employee_list,
      creator: user,
    });

    await newTask.save();

    res.status(201).json("Task created successfully!");
    next();
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const id = Number(req.params.id);
    const { status } = req.body;

    const task = await Task.findOne({
      where: { id },
      relations: ["users"],
    });

    if (!task) {
      res.status(404).json({ message: "Task not found!" });
      return;
    }

    const isAuthorized = task.users.some((u) => u.id === user.id);
    if (!isAuthorized) {
      res
        .status(403)
        .json({ message: "You are not authorized to edit this task!" });
      return;
    }

    const dto = new UpdateTaskDTO();
    dto.status = status;

    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }
    await Task.update(task.id, {
      status,
    });

    const updatedData = await Task.findOne({
      where: { id: task.id },
    });

    res.status(200).json({
      message: "Task updated succesfully",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const getByIdTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const task_id = Number(req.params.id);

    if (!task_id) {
      res.status(400).json("Id is required");
      return;
    }

    const task = await Task.findOne({
      where: { id: task_id },
      relations: ["users"],
      select: {
        id: true,
        title: true,
        description: true,
        deadline: true,
        hour: true,
        priority: true,
        status: true,
        created_at: true,
        users: {
          id: true,
          name: true,
          surname: true,
          email: true,
        },
      },
    });

    if (!task) {
      res.status(404).json("Task is not found");
      return;
    }

    const isUserAssigned = task.users.some(
      (assignedUser) => assignedUser.id === user.id
    );

    if (!isUserAssigned) {
      res
        .status(403)
        .json({ message: "You are not authorized to view this task" });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const TaskController = () => ({
  create,
  update,
  getByIdTask,
});
