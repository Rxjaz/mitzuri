import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import projectsRoutes from "./modules/projects/projects.routes.js";

import errorMiddleware from "./shared/middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/auth", authRoutes);

app.use("/admin/projects", projectsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorMiddleware);

export default app;