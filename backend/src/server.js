import "./shared/utils/env.js";
import app from "./app.js";
import { testDBConnection } from "./shared/db/index.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await testDBConnection();
  } catch {
    console.error("No se pudo conectar a la base de datos. Revisa DATABASE_URL.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();