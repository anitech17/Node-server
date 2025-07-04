import { Request, Response } from 'express';
import { prisma } from '../../../prisma/client';

export const user = async (req: Request, res: Response): Promise<void> =>{
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json({ message: 'Invalid user ID in token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        dob: true,
        phone: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }

    // Return the same structure as login response
    res.status(200).json({
      message: 'Login successful',
      token: req.headers.authorization?.split(' ')[1], // original token
      user,
    });
  } catch (error) {
    console.error('Auto-login failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
