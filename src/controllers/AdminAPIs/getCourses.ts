import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    // Authorization check
    if (!requesterRole || requesterRole !== "admin") {
      res.status(401).json({ message: "Unauthorized: Admin access required." });
      return;
    }

    // Parse query parameters
    const classId = typeof req.query.classId === "string" ? req.query.classId.trim() : undefined;
    const searchTitle = typeof req.query.title === "string" ? req.query.title.trim() : undefined;

    const limitRaw = req.query.limit as string;
    const pageRaw = req.query.page as string;

    const limit = limitRaw && !isNaN(+limitRaw) && +limitRaw > 0 ? parseInt(limitRaw) : 10;
    const page = pageRaw && !isNaN(+pageRaw) && +pageRaw >= 0 ? parseInt(pageRaw) : 0;
    const skip = page * limit;

    // Construct where clause
    const whereClause: any = {};

    if (classId && classId !== "null") {
      whereClause.class = classId;
    }

    if (searchTitle) {
      whereClause.title = {
        contains: searchTitle,
        mode: "insensitive",
      };
    }

    // Fetch data & total count in parallel
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          subject: true,
          description: true,
          class: true,
        },
        orderBy: {
          title: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.course.count({ where: whereClause }),
    ]);

    res.status(200).json({
      data: courses,
      total,
      page,
      limit,
    });
    return;
  } catch (error) {
    console.error("[getCourses] Unexpected error:", error);

    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }
    return;
  }
};
