import { Request, Response } from "express";
import * as UserModel from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.ACCESS_TOKEN_SECRET;

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
    res.status(500).json({ error: "Error registering new user" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);

    // If the password doesn't match
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create a JWT token
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT secret is not defined" });
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      return res
        .status(500)
        .json({ error: "Access token secret is not defined" });
    }
    // Token de Acceso
    const accessToken = jwt.sign(
      { userId: user.user_id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    if (!process.env.REFRESH_TOKEN_SECRET) {
      return res
        .status(500)
        .json({ error: "Refresh token secret is not defined" });
    }
    // Token de Actualización
    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await UserModel.setRefreshToken(user.user_id, refreshToken);

    res.json({ message: "Login succesful", accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: "Error logging in", message: error });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is required" });
  }

  try {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      return res
        .status(500)
        .json({ error: "Refresh token secret is not defined" });
    }
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload;
    
    const storedRefreshToken = await UserModel.getRefreshToken(payload.userId);

    // If the refresh token is not valid
    if (refreshToken !== storedRefreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
      
    }

    // Create a new access token
    if (!process.env.ACCESS_TOKEN_SECRET) {
      return res
        .status(500)
        .json({ error: "Access token secret is not defined" });
    }
    const accessToken = jwt.sign(
      { userId: payload.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ error: "Error refreshing token" });
  }
};
