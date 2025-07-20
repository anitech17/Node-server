import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const getCourseSyllabus = async (req: Request, res: Response): Promise<void> => {
    try {
        const requesterRole = req.user?.role;

        if (!requesterRole || requesterRole !== "student") {
            res.status(401).json({ message: "Unauthorized: Role not allowed." });
            return;
        }

        const course_id = req.params.courseid;

        if (!course_id) {
            res.status(400).json({ message: "Bad Request: Course ID is required." });
            return;
        }

        const syllabus = await prisma.syllabusSection.findMany({
            where: {
                course_id,
            },
            select: {
                id: true,
                course_id: true,
                title: true,
                description: true,
                order: true
            },
            orderBy: {
                order: "asc"
            }
        });

        res.status(200).json({ syllabus });

    } catch (error) {
        console.error("Error in getCourseSyllabus API:", error instanceof Error ? error.stack : error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
