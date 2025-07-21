import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "admin") {
      res.status(403).json({ message: "Forbidden: Only admins can delete users." });
      return;
    }

    const userId = req.params.id;

    if (!userId) {
      res.status(400).json({ message: "Missing user ID in request parameters." });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Delete the user
    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({ message: "User deleted successfully." });
    return;
  } catch (err) {
    console.error("Error deleting user:", err);

    if (err instanceof Error) {
      res.status(500).json({ message: "Internal server error", error: err.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }
    return;
  }
};
