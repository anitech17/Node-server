import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const getCourseSyllabu = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "admin") {
      res.status(401).json({ message: "Unauthorized: Role not allowed." });
      return;
    }

    const course_id = req.params.courseid;

    if (!course_id) {
      res.status(400).json({ message: "Bad Request: Course ID is required." });
      return;
    }

    const syllabus = await prisma.syllabusSection.findMany({
      where: { course_id },
      select: {
        id: true,
        course_id: true,
        title: true,
        description: true,
        order: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    res.status(200).json({
      message: "Syllabus fetched successfully",
      data: syllabus,
    });
  } catch (error) {
    console.error("[getCourseSyllabus] Unexpected error:", error);

    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }
  }
};
