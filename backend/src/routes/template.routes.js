
import express from "express";

import {
  createTemplate,
  getTemplates,
  deleteTemplate,
} from "../controllers/template.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  upload.single("template"),
  createTemplate
);

router.get(
  "/:hackathonId",
  authMiddleware,
  getTemplates
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTemplate
);

export default router;