import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";
import { ServiceCreateNewMeetingLink } from "../../services";

export const scheduleClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "educator") {
      res.status(401).json({ message: "Unauthorized: Role not allowed." });
      return;
    }

    const { student_id, educator_id, scheduled_at, discussion_topics } = req.body;

    // Basic validation
    if (!student_id || !educator_id || !scheduled_at || !discussion_topics) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    const join_url = ServiceCreateNewMeetingLink();

    const newClass = await prisma.classSchedule.create({
      data: {
        student_id,
        educator_id,
        scheduled_at: new Date(scheduled_at),
        join_url,
        status: "scheduled",
        discussion_topics,
      },
    });

    res.status(201).json({ message: "Class scheduled successfully", class: newClass });
  } catch (error) {
    console.error("Error scheduling class:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
