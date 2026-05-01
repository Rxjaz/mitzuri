import jwt from 'jsonwebtoken';
import AuthError from "../errors/auth.error.js";
import { getRequiredEnv } from "../utils/env.js";

export const authMiddleware = (req, res, next) => {

  try {
    const authHeader = req.headers.authorization;

    //validar header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('No token provided');
    }

    //extraer token
    const token = authHeader.split(' ')[1];

    //obtener secret
    const JWT_SECRET = getRequiredEnv('JWT_SECRET');

    //verificar token
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        throw new AuthError('Inavlid token');
    }

    //guardar en request
    req.user = {
      userId: decoded.userId
    };

    next();
  } catch (error) {
    
    next(error);
  }
};