import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("get users API");

    const data = {
      firstname: "Animesh - getusers",
      lastname: "Pandey",
    };

    res.status(200).json({ data });
  } catch (error) {
    console.error("error API", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};