import express from "express";
import {
  registerLab,
  getMyLabProfile,
  updateLabProfile,
  verifyLab,
} from "../controllers/lab.controller.js";
import { allowRoles, protect } from "../middlewares/auth.middleware.js";
import { bookLabAppointment ,getMyLabAppointments, getTodayAppointmentsForLab ,getAllLabAppointments, getTodayLabAppointmentCount} from "../controllers/labAppointment.controller.js";
import { uploadReportForAppointment } from "../controllers/labAppointment.controller.js";



const router = express.Router();

router.use(protect);

router.post("/register", allowRoles("labAdmin"), registerLab);
router.get("/profile", allowRoles("labAdmin"), getMyLabProfile);
router.put("/profile", allowRoles("labAdmin"), updateLabProfile);
router.patch("/verify/:labId", allowRoles("labAdmin"), verifyLab);

// ------------------------------------------------------------


router.post("/book-appointment", allowRoles("patient"), bookLabAppointment);
router.get("/appointments", allowRoles("patient"), getMyLabAppointments);

router.get("/all-lab-appointments/:labId", allowRoles("labAdmin"), getAllLabAppointments);
router.get("/today-appointments/count", allowRoles("labAdmin"), getTodayLabAppointmentCount);
router.get("/labs/:labId/today-appointments", allowRoles("labAdmin"), getTodayAppointmentsForLab);
router.post("/lab-appointments/:id/upload-report", allowRoles("labAdmin"), uploadReportForAppointment);


export default router;
