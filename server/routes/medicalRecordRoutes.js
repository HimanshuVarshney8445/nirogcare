import express from "express";
import {
  addMedicalRecord,
  getMedicalRecords,
} from "../controllers/medicalRecord.controller.js";
import { allowRoles, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/medical-record", allowRoles("doctor"), addMedicalRecord);
router.get("/get-medical-record", allowRoles("patient"), getMedicalRecords);

export default router;
