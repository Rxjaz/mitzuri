import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import projectsRoutes from "./modules/projects/projects.routes.js";
import projectsPublicRoutes from "./modules/projects/projects.public.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";
import {
  projectSectionsRouter,
  sectionsRouter,
} from "./modules/sections/sections.routes.js";

import { pool } from "./shared/db/index.js";
import errorMiddleware from "./shared/middleware/error.middleware.js";
import { authMiddleware } from "./shared/middleware/auth.middleware.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "ok" });
  } catch {
    res.status(503).json({ status: "error", database: "error" });
  }
});

app.use("/auth", authRoutes);

app.use("/admin/projects", authMiddleware, projectSectionsRouter);

app.use("/admin/projects", authMiddleware, projectsRoutes);

app.use("/admin/sections", authMiddleware, sectionsRouter);

app.use("/admin/media", authMiddleware, mediaRoutes);

//sitio publico: sin token, y despues de las rutas de admin
app.use("/projects", projectsPublicRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorMiddleware);

export default app;