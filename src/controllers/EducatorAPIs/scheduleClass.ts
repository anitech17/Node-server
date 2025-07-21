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

    // Basic validation
    if (!student_id || !educator_id || !scheduled_at || !discussion_topics) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    const startTime = new Date(scheduled_at).toISOString();
    const endTime = new Date(new Date(scheduled_at).getTime() + 60 * 60 * 1000).toISOString(); // 1 hour class

    let join_url: string;
    try {
      join_url = await createGoogleMeetLink("Class with Student", startTime, endTime);
    } catch (googleError) {
      console.error("Google Meet link generation failed:", googleError);
      res.status(502).json({ message: "Failed to generate Google Meet link. Try again later." });
      return;
    }

    try {
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

      res.status(201).json({
        message: "Class scheduled successfully",
        class: newClass,
      });
      return;
    } catch (dbError: any) {
      console.error("Database error while creating class:", dbError);

      if (dbError.code === "P2002") {
        res.status(409).json({ message: "Conflict: Class already scheduled at this time." });
        return;
      }

      res.status(500).json({ message: "Database error occurred while scheduling the class." });
      return;
    }
  } catch (error) {
    console.error("Unexpected error while scheduling class:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }
    return;
  }
};
