import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";
import { ScheduleStatus } from "@prisma/client";

export const getStudentClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    // Only students can access this
    if (!requesterRole || requesterRole !== "student") {
      res.status(403).json({ message: "Unauthorized: Only students can view their classes." });
      return;
    }

    const studentId = req.params.student_id;
    if (!studentId) {
      res.status(400).json({ message: "Student ID is required." });
      return;
    }

    const scheduledStatuses: ScheduleStatus[] = [
      ScheduleStatus.scheduled,
      ScheduleStatus.postponed,
      ScheduleStatus.preponed,
    ];

    const completedStatuses: ScheduleStatus[] = [
      ScheduleStatus.cancelled,
      ScheduleStatus.completed,
    ];

    const requestedStatuses: ScheduleStatus[] = [
      ScheduleStatus.requested,
    ];

    const [scheduledClasses, completedClasses, requestedClasses] = await Promise.all([
      prisma.classSchedule.findMany({
        where: {
          student_id: studentId,
          status: { in: scheduledStatuses },
        },
        orderBy: { scheduled_at: "asc" },
        select: {
          id: true,
          scheduled_at: true,
          join_url: true,
          status: true,
          discussion_topics: true,
          educator: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.classSchedule.findMany({
        where: {
          student_id: studentId,
          status: { in: completedStatuses },
        },
        orderBy: { scheduled_at: "desc" },
        select: {
          id: true,
          scheduled_at: true,
          join_url: true,
          status: true,
          discussion_topics: true,
          educator: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.classSchedule.findMany({
        where: {
          student_id: studentId,
          status: { in: requestedStatuses },
        },
        orderBy: { scheduled_at: "asc" },
        select: {
          id: true,
          scheduled_at: true,
          join_url: true,
          status: true,
          discussion_topics: true,
          educator: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    ]);

    res.status(200).json({
      scheduled: scheduledClasses,
      completed: completedClasses,
      requested: requestedClasses,
    });
  } catch (error) {
    console.error("[getStudentClasses] Unexpected error:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }
  }
};
