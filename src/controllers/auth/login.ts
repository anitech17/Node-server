import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../../types/authTypes';
import { prisma } from '../../../prisma/client';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Validate JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not set in environment variables");
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    // Generate JWT
    const payload: TokenPayload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

    // Return token + user info
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        dob: user.dob,
        phone: user.phone,
      },
    });
    return;
  } catch (error) {
    console.error('Login Error:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    } else {
      res.status(500).json({ message: 'Unknown server error' });
    }
    return;
  }
};
