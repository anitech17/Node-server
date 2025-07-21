import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";
import { ScheduleStatus } from "@prisma/client";

export const getEducatorClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "educator") {
      res.status(403).json({ message: "Unauthorized: Only educators can view their classes." });
      return;
    }

    const educatorId = req.params.educator_id;
    if (!educatorId) {
      res.status(400).json({ message: "Educator ID is required." });
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
          educator_id: educatorId,
          status: { in: scheduledStatuses },
        },
        orderBy: { scheduled_at: "asc" },
        select: {
          id: true,
          scheduled_at: true,
          join_url: true,
          status: true,
          discussion_topics: true,
          student: {
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
          educator_id: educatorId,
          status: { in: completedStatuses },
        },
        orderBy: { scheduled_at: "desc" },
        select: {
          id: true,
          scheduled_at: true,
          join_url: true,
          status: true,
          discussion_topics: true,
          student: {
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
          educator_id: educatorId,
          status: { in: requestedStatuses },
        },
        orderBy: { scheduled_at: "asc" },
        select: {
          id: true,
          scheduled_at: true,
          join_url: true,
          status: true,
          discussion_topics: true,
          student: {
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
    console.error("[getEducatorClasses] Unexpected error:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }
  }
};
