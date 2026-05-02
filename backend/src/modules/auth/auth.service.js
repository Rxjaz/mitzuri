import * as authRepository from "./auth.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AuthError from "../../shared/errors/auth.error.js";
import { getRequiredEnv } from "../../shared/utils/env.js";


export const login = async (email, password) => {

  const JWT_SECRET = getRequiredEnv("JWT_SECRET");

  const user = await authRepository.findByEmail(email);

  if (!user) {
    throw new AuthError("Invalid credentials");
  };

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AuthError("Invalid credentials");
  };

  const payload = {
    userId: user.id
  };

  const token = jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const safeUser = {
    id: user.id,
    email: user.email,
    full_name: user.full_name
  };

  return {
    user: safeUser,
    token
  };
};