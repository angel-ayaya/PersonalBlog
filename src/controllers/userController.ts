import { Request, Response } from "express";
import * as UserModel from "../models/user";
import bcrypt from "bcrypt";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = await UserModel.createUser({
      username,
      email,
      passwordHash,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Error registering new user"});
  }
};
