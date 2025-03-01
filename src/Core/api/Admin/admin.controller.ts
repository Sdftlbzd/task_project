import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import bcrypt from "bcrypt";
import { User } from "../../../DAL/models/User.model";
import { ERoleType } from "../../app/enum";
import { formatErrors } from "../../middlewares/error.moddleware";
import { AuthRequest } from "../../../types";
import { CreateEmployeeDTO } from "./admin.dto";
import { Task } from "../../../DAL/models/Task.model";
import { In } from "typeorm";
import { addMinutes, isBefore, startOfDay } from "date-fns";
import { UpdateTaskDTO } from "../Task/task.dto";

const addEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const user = await User.findOne({
      where: { id: req.user.id },
      relations: ["created_company"],
    });

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const { name, surname, email, username, password, status } = req.body;

    const employee = await User.findOne({ where: { email: email } });
    if (employee) {
      res.status(409).json("A user with this email address already exists.");
      return;
    }

    const dto = new CreateEmployeeDTO();
    dto.name = name;
    dto.surname = surname;
    dto.email = email;
    dto.password = password;
    dto.username = username;
    dto.status = status;

    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(422).json(formatErrors(errors));
      return;
    }

    const newPassword = await bcrypt.hash(password, 10);

    const newUser = User.create({
      name,
      surname,
      email,
      password: newPassword,
      username,
      status,
      role: ERoleType.EMPLOYEE,
      company: user.created_company,
    });

    await newUser.save();

    const Data = await User.findOne({
      where: { email },
      select: ["id", "name", "surname", "email", "created_at"],
    });

    res.status(201).json(Data);
    next();
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const id = Number(req.params.id);
    const {
      title,
      description,
      deadline,
      hour,
      priority,
      status,
      employee_ids,
    } = req.body;

    const task = await Task.findOne({
      where: { id },
      relations: ["users"],
    });

    if (!task) {
      res.status(404).json({ message: "Task not found!" });
      return;
    }

    if (isBefore(task.deadline, new Date())) {
      res
        .status(400)
        .json({ message: "The deadline for this task has passed!" });
      return;
    }

    const employee_list = await User.find({
      where: { id: In(employee_ids) },
    });

    if (employee_list.length === 0) {
      res.status(404).json({ message: "Employee(s) not found!" });
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

    const dto = new UpdateTaskDTO();
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

    await Task.update(task.id, {
      title,
      description,
      deadline: selectedDeadline,
      hour: selectedHour,
      priority,
      status,
      users: employee_list,
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

const taskList = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const status = (req.query.status as string)?.trim() || undefined;
    const priority = (req.query.priority as string)?.trim() || undefined;
    const title = (req.query.title as string)?.trim() || undefined;
    const startDate = (req.query.startDate as string)?.trim() || undefined;
    const endDate = (req.query.endDate as string)?.trim() || undefined;
    const createdStartDate =
      (req.query.createdStartDate as string)?.trim() || undefined;
    const createdEndDate =
      (req.query.createdEndDate as string)?.trim() || undefined;
    const user_ids = (req.query.user_ids as string)?.trim() || undefined;
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
    if (title) {
      query.andWhere("task.title LIKE :title", { title: `%${title}%` });
    }

    const isValidDate = (date: string) => !isNaN(Date.parse(date));
    if (startDate && endDate) {
      if (isValidDate(startDate) && isValidDate(endDate)) {
        query.andWhere("task.deadline BETWEEN :startDate AND :endDate", {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
      } else {
        res.status(400).json({ message: "Invalid date format!" });
        return;
      }
    }

    if (createdStartDate && createdEndDate) {
      if (isValidDate(createdStartDate) && isValidDate(createdEndDate)) {
        query.andWhere(
          "task.created_at BETWEEN :createdStartDate AND :createdEndDate",
          {
            createdStartDate: new Date(createdStartDate),
            createdEndDate: new Date(createdEndDate),
          }
        );
      } else {
        res.status(400).json({ message: "Invalid date format!" });
        return;
      }
    }

    if (user_ids) {
      const userIds = user_ids.split(",").map((id) => Number(id));
      query.andWhere("user.id IN (:...userIds)", { userIds });
    }

    const [list, total] = await query.getManyAndCount();

    res.status(200).json({
      data: list,
      pagination: {
        total,
        page,
        per_page: list.length,
        total_pages: Math.ceil(Number(total) / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const getByIdTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
      where: { id: task_id, creator: user },
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

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const AdminController = () => ({
  addEmployee,
  updateTask,
  taskList,
  getByIdTask,
});
