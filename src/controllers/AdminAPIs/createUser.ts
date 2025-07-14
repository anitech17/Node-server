import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../../prisma/client";
import { Role } from "@prisma/client";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "admin") {
      res.status(403).json({ message: "Forbidden: Only admins can create users." });
      return;
    }

    const { name, email, password, dob, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !dob || !phone || !role) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    // Validate role against Prisma Role enum
    if (!Object.values(Role).includes(role)) {
      res.status(400).json({
        message: `Invalid role. Allowed roles are: ${Object.values(Role).join(", ")}`,
      });
      return;
    }

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: "User with this email already exists." });
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        dob: new Date(dob),
        phone,
        role: role as Role,
      },
    });

    // Respond with created user info (excluding password)
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        dob: newUser.dob,
        created_at: newUser.created_at,
      },
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
