import express from "express";
import cors from "cors";
import routes from "./routes";
import dotenv from "dotenv";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/studies", routes);


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
