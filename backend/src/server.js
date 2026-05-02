import './shared/utils/env.js';
import app from './app.js';
import { testDBConnection } from './shared/db/index.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await testDBConnection();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

import { getAllProjects } from './modules/projects/projects.service.js';

const test = async () => {
  const data = await getAllProjects();
  console.log(data);
};

test();