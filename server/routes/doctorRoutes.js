import express from "express";
import {
  doctorProfile,
  todaysPatients,
  addMedicineRecord,
  getMedicineRecords,
  getDoctorsByHospital,
  allTodaysAppointment,
  getDoctorProfile,
  allTodaysOnlineAppointment,
  getDoctorRequests,
  updateDoctorRequest,
} from "../controllers/doctor.controller.js";
import { allowRoles, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.use(protect);


router.post("/profile", allowRoles("doctor"), doctorProfile);
router.get("/get-profile", allowRoles("doctor"), getDoctorProfile)


router.get("/patients", allowRoles("doctor"), todaysPatients);


router.post("/medicine", allowRoles("doctor"), addMedicineRecord);

router.get("/requests",allowRoles("hospitalAdmin"),getDoctorRequests);

router.patch("/requests/:doctorId",allowRoles("hospitalAdmin"),updateDoctorRequest);


router.get("/medicine/:patientId", allowRoles("doctor"), getMedicineRecords);

router.get("/getAllDoctors", allowRoles("patient", "assistant"), getDoctorsByHospital)

router.get("/getAllDrAppointments", allowRoles("doctor"), allTodaysAppointment);

router.get("/getOnlineAppointments", allowRoles("doctor"), allTodaysOnlineAppointment)

export default router;
