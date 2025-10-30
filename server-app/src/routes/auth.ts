import express from "express";
import { register, login, getMe } from "../controllers/auth";
import { authOptional, authRequired } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", authOptional, register);
router.post("/login", authOptional, login);
router.get("/me", authRequired, getMe);

export default router;
