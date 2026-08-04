import express from "express"
import { getNearbyHospitals, patientProfile , getNearbylabs } from "../controllers/patient.controller.js";
import { allowRoles, protect } from "../middlewares/auth.middleware.js";
import { createAppointment , getMyAppointments ,cancelAppointment, getAppointmentById} from "../controllers/appointment.controller.js";
import { updateVitalsForUser ,getVitalsForUser} from "../controllers/patient.controller.js";
import { getAllLabReportsBookedByUser } from "../controllers/patient.controller.js";
const router = express.Router();



router.post("/profile", protect, allowRoles("patient"), patientProfile);
router.post("/near-hospitals", protect, allowRoles("patient"), getNearbyHospitals)
router.post("/near-labs", protect, allowRoles("patient"), getNearbylabs)
router.patch("/update-vitals", protect, allowRoles("assistant"), updateVitalsForUser);
router.get('/vitals', protect, allowRoles("patient"), getVitalsForUser)


router.post("/book-appointment", protect, allowRoles("patient"), createAppointment)
router.get("/appointments", protect, allowRoles("patient"), getMyAppointments)
router.get('/lab-reports', protect, allowRoles("patient"), getAllLabReportsBookedByUser)
router.get("/appointments/:id", protect, allowRoles("patient"), getAppointmentById)
router.patch("/appointments/:id/cancel", protect, allowRoles("patient"), cancelAppointment)










export default router

