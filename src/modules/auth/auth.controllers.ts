import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type ms from "ms";
import config from "../../config";
import { authServices } from "./auth.services";

const BCRYPT_SALT_ROUNDS = 10;

function mustGetJwtSecret(): string {
  if (!config.jwt_secret) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }
  return config.jwt_secret;
}

const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "name, email, password, phone, role are required",
      });
    }

    const roleStr = String(role);
    if (roleStr !== "admin" && roleStr !== "customer") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "role must be 'admin' or 'customer'",
      });
    }


    const passwordHash = await bcrypt.hash(String(password), BCRYPT_SALT_ROUNDS);

    const result = await authServices.createUser(
      name,
      email,
      passwordHash,
      phone,
      roleStr
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (err: any) {
    
    const pgCode = err?.code;
    const isDuplicate = pgCode === "23505";

    return res.status(isDuplicate ? 400 : 500).json({
      success: false,
      message: isDuplicate ? "Bad request" : "Internal server error",
      errors: isDuplicate ? "Email already exists" : err.message,
    });
  }
};

const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "email and password are required",
      });
    }

    const user = await authServices.findUserForLoginByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Invalid email or password",
      });
    }

    const ok = await bcrypt.compare(String(password), String(user.password));
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Invalid email or password",
      });
    };

    const jwtSecret = mustGetJwtSecret();

    const expiresIn = (config.jwt_expires_in ?? "7d") as ms.StringValue;
    
    const signOptions: SignOptions = { expiresIn };
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      jwtSecret,
      signOptions
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: err.message,
    });
  }
};

export const authControllers = {
  signup,
  signin,
};
