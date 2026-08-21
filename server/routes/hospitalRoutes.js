import express from "express";
import {
  registerHospital,
  getMyHospitalProfile,
  getPatientStats,
  getAllHospitalPatients,
  getAllAssistantsForHospital,
  getAllHospitals,
  addPatientToDoctor,
} from "../controllers/hospital.controller.js";
import { allowRoles, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Require authentication for all hospital routes
router.use(protect);

// Allow any authenticated user to register a hospital (user may later be assigned hospitalAdmin role)
router.post("/register", registerHospital);

// Allow doctors and patients to fetch hospital search/list data
router.get("/list", getAllHospitals);

// Restrict the remaining hospital routes to hospital admins only
router.use(allowRoles("hospitalAdmin"));

router.get("/profile", getMyHospitalProfile);

router.get("/stats", getPatientStats);

router.get("/patients", getAllHospitalPatients);

router.get('/all-assistants', getAllAssistantsForHospital);

router.post('/add-patient', addPatientToDoctor);

export default router;
