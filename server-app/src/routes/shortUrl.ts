import express from "express";
import { createUrl, deleteUrl, getAllUrl, getUrl, getUrlStats } from "../controllers/shorturl";
import { authOptional } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/shortUrl", authOptional, createUrl);
router.get("/shortUrl", authOptional, getAllUrl);
router.get("/shortUrl/stats/:id", authOptional, getUrlStats);
router.get("/shortUrl/:id", getUrl);
router.delete("/shortUrl/:id", authOptional, deleteUrl);

export default router;
