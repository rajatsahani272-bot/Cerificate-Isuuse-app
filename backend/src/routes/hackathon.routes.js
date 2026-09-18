import express from "express";

import {
  createHackathon,
  getHackathons,
  getAdminHackathons,
  getHackathon,
  updateHackathon,
  deleteHackathon,
} from "../controllers/hackathon.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/admin",
  authMiddleware,
  getAdminHackathons
);

router.get(
  "/",
  getHackathons
);

router.post(
  "/",
  authMiddleware,
  createHackathon
);

router.get(
  "/:id",
  authMiddleware,
  getHackathon
);

router.put(
  "/:id",
  authMiddleware,
  updateHackathon
);

router.delete(
  "/:id",
  authMiddleware,
  deleteHackathon
);

export default router;