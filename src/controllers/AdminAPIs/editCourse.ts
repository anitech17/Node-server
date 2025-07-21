import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const editCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    // Admin access only
    if (!requesterRole || requesterRole !== "admin") {
      res.status(401).json({ message: "Unauthorized: Admin access required." });
      return;
    }

    const { courseId } = req.params;
    const { title, subject, description, class: classLevel, syllabusSections } = req.body;

    // Basic validations
    if (!courseId) {
      res.status(400).json({ message: "Missing courseId in request parameters." });
      return;
    }

    if (!title || !subject || !description || !classLevel) {
      res.status(400).json({
        message: "Missing one or more required fields: title, subject, description, class.",
      });
      return;
    }

    if (!Array.isArray(syllabusSections)) {
      res.status(400).json({ message: "syllabusSections must be an array." });
      return;
    }

    for (const section of syllabusSections) {
      if (!section.title || !section.description || typeof section.order !== "number") {
        res.status(400).json({
          message: "Each syllabus section must include title, description, and order (number).",
        });
        return;
      }
    }

    // Ensure course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ message: "Course not found." });
      return;
    }

    // Use transaction to ensure atomicity
    const [updatedCourse] = await prisma.$transaction([
      prisma.course.update({
        where: { id: courseId },
        data: {
          title,
          subject,
          description,
          class: classLevel,
        },
      }),
      prisma.syllabusSection.deleteMany({ where: { course_id: courseId } }),
      prisma.syllabusSection.createMany({
        data: syllabusSections.map((section: any) => ({
          course_id: courseId,
          title: section.title,
          description: section.description,
          order: section.order,
        })),
      }),
    ]);

    res.status(200).json({
      message: "Course and syllabus updated successfully",
      data: updatedCourse,
    });
    return;
  } catch (error) {
    console.error("[editCourse] Unexpected error:", error);

    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === "P2002"
    ) {
      res.status(409).json({ message: "Course with this title already exists." });
      return;
    }

    if (error instanceof Error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
      return;
    }

    res.status(500).json({ message: "Unknown Server Error" });
    return;
  }
};
