import express from "express";

import {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerAdmin);

router.post("/login", loginAdmin);

router.get(
  "/me",
  authMiddleware,
  getCurrentAdmin
);

export default router;