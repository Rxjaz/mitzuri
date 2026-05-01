import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import errorMiddleware from "./shared/middleware/error.middleware.js";
//import mediaRoutes from './modules/media/media.routes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Running');
});

app.use('/auth', authRoutes);

//app.use('/admin/media', mediaRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(errorMiddleware);

export default app;