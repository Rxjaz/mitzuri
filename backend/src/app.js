import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import projectsRoutes from "./modules/projects/projects.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";

import errorMiddleware from "./shared/middleware/error.middleware.js";
import { authMiddleware } from "./shared/middleware/auth.middleware.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/auth", authRoutes);

app.use("/admin/projects", authMiddleware, projectsRoutes);

app.use("/admin/media", authMiddleware, mediaRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorMiddleware);

export default app;