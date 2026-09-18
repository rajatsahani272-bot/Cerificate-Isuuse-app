import express from "express";

import {
  createParticipant,
  getParticipants,
  updateParticipant,
  deleteParticipant,
} from "../controllers/participant.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createParticipant);

router.get("/:hackathonId", authMiddleware, getParticipants);

router.put("/:id", authMiddleware, updateParticipant);

router.delete("/:id", authMiddleware, deleteParticipant);

export default router;