import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "admin") {
      res.status(401).json({ message: "Unauthorized: Role not found in request." });
    }

    // Validate & parse query parameters
    const queryRole = typeof req.query.role === "string" ? req.query.role.trim() : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const limitRaw = req.query.limit as string;
    const pageRaw = req.query.page as string;

    const limit = limitRaw && !isNaN(+limitRaw) && +limitRaw > 0 ? parseInt(limitRaw) : 10;
    const page = pageRaw && !isNaN(+pageRaw) && +pageRaw > 0 ? parseInt(pageRaw) : 0;
    const skip = page * limit;

    const whereClause: any = {};

    if (queryRole) {
      if (!["admin", "student", "educator"].includes(queryRole)) {
        res.status(400).json({ message: `Invalid role provided: ${queryRole}` });
      }
      whereClause.role = queryRole;
    }

    if (search) {
      whereClause.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          dob: true,
          role: true,
          created_at: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    res.status(200).json({
      data: users,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[getUsers] Unexpected error:", error);

    // Optional: add more granular error logging if needed
    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

    res.status(500).json({ message: "Unknown Server Error" });
  }
};
