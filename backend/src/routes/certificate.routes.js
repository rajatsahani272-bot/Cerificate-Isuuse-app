import express from "express";

import {
  generateCertificates,
  getCertificateByEmail,
  getCertificates,
  revokeCertificate,
   deleteCertificate
} from "../controllers/certificate.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/generate",
  authMiddleware,
  generateCertificates
);

router.post(
  "/find",
  getCertificateByEmail
);

router.get(
  "/:hackathonId",
  authMiddleware,
  getCertificates
);

router.patch(
  "/:id/revoke",
  authMiddleware,
  revokeCertificate
);
router.delete(
  "/:id",
  authMiddleware,
  deleteCertificate
);

export default router;