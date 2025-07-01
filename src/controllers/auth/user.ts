import { Request, Response } from "express";

export const user = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("user API");

    const data = {
      firstname: "Animesh",
      lastname: "Pandey",
    };

    res.status(200).json({ data });
  } catch (error) {
    console.error("error API", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};