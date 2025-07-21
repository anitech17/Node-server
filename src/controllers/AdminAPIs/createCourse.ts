import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    // Only admins can create courses
    if (!requesterRole || requesterRole !== "admin") {
      res.status(401).json({ message: "Unauthorized: Admin access required." });
      return;
    }

    const {
      title,
      subject,
      description,
      class: classLevel,
      syllabusSections,
    } = req.body;

    // Basic validation
    if (!title || !subject || !description || !classLevel) {
      res.status(400).json({ message: "Missing required course fields." });
      return;
    }

    if (!Array.isArray(syllabusSections) || syllabusSections.length === 0) {
      res.status(400).json({ message: "Syllabus sections are required and must be a non-empty array." });
      return;
    }

    // Validate each syllabus section
    for (const section of syllabusSections) {
      if (!section.title || !section.description || typeof section.order !== "number") {
        res.status(400).json({
          message: "Each syllabus section must include title, description, and order (number).",
        });
        return;
      }
    }

    // Create Course
    const newCourse = await prisma.course.create({
      data: {
        title,
        subject,
        description,
        class: classLevel,
      },
    });

    // Create Syllabus Sections
    await prisma.syllabusSection.createMany({
      data: syllabusSections.map((section: any) => ({
        course_id: newCourse.id,
        title: section.title,
        description: section.description,
        order: section.order,
      })),
    });

    res.status(201).json({
      message: "Course created successfully",
      data: {
        courseId: newCourse.id,
        title: newCourse.title,
      },
    });
    return;
  } catch (error) {
    console.error("[createCourse] Unexpected error:", error);

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
