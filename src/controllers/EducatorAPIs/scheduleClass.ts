import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";
import { createGoogleMeetLink } from "../../services";

export const scheduleClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "educator") {
      res.status(403).json({ message: "Unauthorized: Only educators can schedule a class." });
      return;
    }

    const { student_id, educator_id, scheduled_at, discussion_topics } = req.body;

    // Basic field check
    if (!student_id || !educator_id || !scheduled_at || !discussion_topics) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    const startTime = new Date(scheduled_at).toISOString();
    const endTime = new Date(new Date(scheduled_at).getTime() + 60 * 60 * 1000).toISOString(); // +1hr class

    let join_url: string;
    try {
      join_url = await createGoogleMeetLink("Class with Student", startTime, endTime);
    } catch (googleError) {
      console.error("Google Meet link generation failed:", googleError);
      res.status(502).json({ message: "Failed to generate Google Meet link. Try again later." });
      return;
    }

    let newClass;
    try {
      newClass = await prisma.classSchedule.create({
        data: {
          student_id,
          educator_id,
          scheduled_at: new Date(scheduled_at),
          join_url,
          status: "scheduled",
          discussion_topics,
        },
      });
    } catch (dbError: any) {
      console.error("Database error while creating class:", dbError);

      // Example Prisma error handling (e.g., unique constraint)
      if (dbError.code === "P2002") {
        res.status(409).json({ message: "Conflict: Class already scheduled at this time." });
        return;
      }

      res.status(500).json({ message: "Database error occurred while scheduling the class." });
      return;
    }

    res.status(201).json({ message: "Class scheduled successfully", class: newClass });
  } catch (error) {
    console.error("Unexpected error while scheduling class:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
