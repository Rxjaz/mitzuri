import express from 'express';
import { pool } from './shared/db/index.js';
//import mediaRoutes from './modules/media/media.routes.js';

const app = express();

app.use(express.json());

//app.use('/admin/media', mediaRoutes);

app.get('/', (req, res) => {
  res.send('Sexooooo');
});


export default app;