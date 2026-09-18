import express from "express";

import {
  assignWinner,
  getWinners,
  getAllTeamsForWinner,
} from "../controllers/winner.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.patch(
  "/:teamId",
  authMiddleware,
  assignWinner
);

router.get(
  "/hackathon/:hackathonId/winners",
  authMiddleware,
  getWinners
);

router.get(
  "/hackathon/:hackathonId/teams",
  authMiddleware,
  getAllTeamsForWinner
);

router.get(
  "/hackathon/:hackathonId",
  authMiddleware,
  getAllTeamsForWinner
);

export default router;