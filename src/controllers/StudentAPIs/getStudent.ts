import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const getStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "student") {
      res.status(401).json({ message: "Unauthorized: Role not allowed." });
      return;
    }

    const studentId = req.params.student_id;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        dob: true,
        phone: true,
        student: {
          select: {
            parent_whatsapp: true,
            enrollments: {
              select: {
                id: true,
                enrolled_on: true,
                percent_complete: true,
                progress: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    subject: true,
                    description: true,
                  },
                },
              },
            },
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
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
                syllabusSections: {
                  select: {
                    id: true,
                    title: true,
                    order: true,
                  },
                },
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
                    id: true,
                    title: true,
                    subject: true,
                  },
                },
                syllabusSections: {
                  select: {
                    id: true,
                    title: true,
                    order: true,
                  },
                },
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
            testResults: {
              orderBy: {
                submitted_at: "desc",
              },
              take: 1,
              select: {
                id: true,
                marks_scored: true,
                total_marks: true,
                feedback: true,
                submitted_at: true,
                test: {
                  select: {
                    test_format: true,
                    scheduled_at: true,
                    course: {
                      select: {
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student || !student.student) {
      res.status(404).json({ message: "Student not found." });
      return;
    }

    const { student: studentProfile, ...basicDetails } = student;

    res.status(200).json({
      ...basicDetails,
      parent_whatsapp: studentProfile.parent_whatsapp,
      enrolledCourses: studentProfile.enrollments,
      nextScheduledClass: studentProfile.classSchedules[0] || null,
      nextTest: studentProfile.tests[0] || null,
      lastTestPerformance: studentProfile.testResults[0] || null,
    });
  } catch (error) {
    console.error("Error in getStudent API:", error);

    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }
    return;
  }
};
