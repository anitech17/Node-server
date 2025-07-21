import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    // Check if requester is admin
    if (!requesterRole || requesterRole !== "admin") {
      res.status(401).json({ message: "Unauthorized: Admin access required." });
      return;
    }

    const { courseId } = req.params;

    // Validate courseId
    if (!courseId) {
      res.status(400).json({ message: "Missing courseId in request parameters." });
      return;
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      res.status(404).json({ message: "Course not found." });
      return;
    }

    // Use transaction to delete syllabus sections and course
    await prisma.$transaction([
      prisma.syllabusSection.deleteMany({ where: { course_id: courseId } }),
      prisma.course.delete({ where: { id: courseId } }),
    ]);

    res.status(200).json({ message: "Course and associated syllabus deleted successfully." });
    return;
  } catch (error) {
    console.error("deleteCourse Unexpected error:", error);

    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }

    return;
  }
};
