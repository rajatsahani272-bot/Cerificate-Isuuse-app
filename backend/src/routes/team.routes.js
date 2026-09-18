import express from "express";

import {
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
} from "../controllers/team.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createTeam
);

router.get(
  "/:hackathonId",
  authMiddleware,
  getTeams
);

router.put(
  "/:id",
  authMiddleware,
  updateTeam
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTeam
);

export default router;