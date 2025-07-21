import { Request, Response } from "express";
import { prisma } from "../../../prisma/client";

export const editUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const requesterRole = req.user?.role;

    if (!requesterRole || requesterRole !== "admin") {
      res.status(403).json({ message: "Forbidden: Only admins can edit users." });
      return;
    }

    const userId = req.params.id;
    const { name, email, dob, phone } = req.body;

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

    // If email is being changed, ensure it's not already taken
    if (email && email !== existingUser.email) {
      const emailUser = await prisma.user.findUnique({ where: { email } });
      if (emailUser) {
        res.status(409).json({ message: "Email already in use by another user." });
        return;
      }
    }

    // Prepare update payload (no password or role updates)
    const updateData: any = {
      ...(name && { name }),
      ...(email && { email }),
      ...(dob && { dob: new Date(dob) }),
      ...(phone && { phone }),
    };

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        dob: updatedUser.dob,
        created_at: updatedUser.created_at,
      },
    });
    return;
  } catch (err) {
    console.error("Error updating user:", err);

    if (err instanceof Error) {
      res.status(500).json({ message: "Internal server error", error: err.message });
    } else {
      res.status(500).json({ message: "Unknown Server Error" });
    }
    return;
  }
};
