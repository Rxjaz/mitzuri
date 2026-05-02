import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, "../../../../");
const envPath = path.join(workspaceRoot, ".env");

dotenv.config({ path: envPath, override: false });

export const isProduction = process.env.NODE_ENV === "production";
export { envPath };

export const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};