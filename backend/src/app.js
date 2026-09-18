import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import hackathonRoutes from "./routes/hackathon.routes.js";
import teamRoutes from "./routes/team.routes.js";
import participantRoutes from "./routes/participant.routes.js";
import templateRoutes from "./routes/template.routes.js";
import winnerRoutes from "./routes/winner.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Certificate Management System API is running",
  });
});

app.use(errorMiddleware);

export default app;