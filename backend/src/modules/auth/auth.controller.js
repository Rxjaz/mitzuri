import * as authService from "./auth.service.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body; //obtener datos
    const result = await authService.login(email, password); //leer datos
    res.json(result); //responder
  } catch (error) {
    next(error); //error
  }
};

export const logout = async (req, res, next) => {
  try {
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await authService.getMe(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};