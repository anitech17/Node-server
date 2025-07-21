import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const getEducator = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "educator") {
      res.status(401).json({ message: "Unauthorized: Role not allowed." });
      return;
    }

    const user_id = req.params.id;

    if (!user_id) {
      res.status(400).json({ message: "Educator ID is required." });
      return;
    }

    const educator = await prisma.user.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        email: true,
        dob: true,
        phone: true,
        educator: {
          select: {
            bio: true,
            expertise: true,
            classSchedules: {
              where: {
                scheduled_at: { gte: new Date() },
                status: "scheduled",
              },
              orderBy: {
                scheduled_at: "asc",
              },
              take: 1,
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
            },
            tests: {
              where: {
                scheduled_at: { gte: new Date() },
              },
              orderBy: {
                scheduled_at: "asc",
              },
              take: 1,
              select: {
                id: true,
                scheduled_at: true,
                join_url: true,
                test_format: true,
                course: {
                  select: {
                    title: true,
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!educator || !educator.educator) {
      res.status(404).json({ message: "Educator not found." });
      return;
    }

    const { educator: educatorProfile, ...basicDetails } = educator;

    res.status(200).json({
      ...basicDetails,
      bio: educatorProfile.bio,
      expertise: educatorProfile.expertise,
      nextScheduledClass: educatorProfile.classSchedules[0] || null,
      nextTest: educatorProfile.tests[0] || null,
    });
    return;
  } catch (error) {
    console.error("Error in getEducator API:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }
    return;
  }
};
