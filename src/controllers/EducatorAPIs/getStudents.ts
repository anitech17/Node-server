import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "educator") {
      res.status(401).json({ message: "Unauthorized: Role not allowed." });
      return;
    }

    const educatorId = req.params.educator_id;

    if (!educatorId) {
      res.status(400).json({ message: "Educator ID is required." });
      return;
    }

    const students = await prisma.enrollment.findMany({
      where: {
        educator_id: educatorId,
      },
      select: {
        id: true,
        student_id: true,
        course_id: true,
        progress: true,
        percent_complete: true,
        enrolled_on: true,
        student: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                dob: true,
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            subject: true,
            description: true,
            class: true,
          },
        },
      },
    });

    res.status(200).json({ data: students });
  } catch (error) {
    console.error("[getStudents] Unexpected error:", error);

    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }
  }
};
