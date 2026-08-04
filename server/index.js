import express from 'express';
import dotenv from 'dotenv';

import { connectDB } from './database/db.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import hospitalRoute from "./routes/hospitalRoutes.js"
import patientRoute from "./routes/patientRoutes.js"
import doctorRoute from "./routes/doctorRoutes.js"
import labRoute from "./routes/labRoutes.js"
import firebaseRoute from "./routes/firebaseRoutes.js"
import assistantRoute from "./routes/assistantRoutes.js"
import appointmentRoute from "./routes/appointmentRoutes.js"
import aiRouter from "./routes/aiRoutes.js"
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js"
import videoRoutes from './routes/videoRoutes.js'




dotenv.config();
const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));



app.use(express.json());
app.use(cookieParser());



app.use('/api/auth', authRoutes);
app.use('/api/hospital',hospitalRoute);
app.use('/api/patient',patientRoute)
app.use('/api/doctor',doctorRoute);
app.use('/api/lab',labRoute)
app.use('/api/firebase',firebaseRoute)
app.use('/api/assistant',assistantRoute)
app.use('/api/appointment',appointmentRoute)
app.use('/api/ai',aiRouter)
app.use('/api/record',medicalRecordRoutes)
app.use('/api/stream',videoRoutes)

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', database: 'connected' });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
});



const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
}

startServer();


