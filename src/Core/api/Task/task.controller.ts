import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import { User } from "../../../DAL/models/User.model";
import { formatErrors } from "../../middlewares/error.moddleware";
import { AuthRequest } from "../../../types";
import { CreateTaskDTO, UpdateTaskDTO } from "./task.dto";
import { Task } from "../../../DAL/models/Task.model";
import { In, Not } from "typeorm";
import { addMinutes, isBefore, startOfDay } from "date-fns";
import { ERoleType, ETaskStatusType } from "../../app/enum";

const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const user = await User.findOne({ where:{ id: req.user.id},
    relations:["company"]})

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
        role: Not (ERoleType.ADMIN),
        company: user.created_company
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

    const isToday = selectedDeadline.toDateString() === now.toDateString();

    if (isToday && isBefore(selectedHour, minHour)) {
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

const getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

const taskList = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const title = req.query.title as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const createdStartDate = req.query.createdStartDate as string | undefined;
    const createdEndDate = req.query.createdEndDate as string | undefined;
    const before_page = (page - 1) * limit;

    const query = Task.createQueryBuilder("task")
      .leftJoinAndSelect("task.users", "user")
      .where("user.id = :userId OR task.creatorId = :userId", {
        userId: user.id,
      })
      .skip(before_page)
      .take(limit);

    if (status) query.andWhere("task.status = :status", { status });
    if (priority) query.andWhere("task.priority = :priority", { priority });
    if (title)
      query.andWhere("task.title LIKE :title", { title: `%${title}%` });

    if (startDate && endDate) {
      query.andWhere("task.deadline BETWEEN :startDate AND :endDate", {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    if (createdStartDate && createdEndDate) {
      query.andWhere(
        "task.created_at BETWEEN :createdStartDate AND :createdEndDate",
        {
          createdStartDate: new Date(createdStartDate),
          createdEndDate: new Date(createdEndDate),
        }
      );
    }

    const [list, total] = await query.getManyAndCount();

    res.status(200).json({
      data: list,
      pagination: {
        total,
        page,
        items_on_page: list.length,
        per_page: Math.ceil(Number(total) / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const TaskController = () => ({
  create,
  update,
  getById,
  taskList,
});
