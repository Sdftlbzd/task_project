import { Request } from "express";
import { User } from "../DAL/models/User.model";
import { ImageModel } from "../DAL/models/Image.model";

export interface IUser extends User {
    id: number;
    name: string;
}

export interface IImage extends ImageModel {
    id: number;
}

export interface AuthRequest extends Request {
    user?: IUser;
   img?:IImage
//    pagination
}