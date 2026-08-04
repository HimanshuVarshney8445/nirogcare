import express from "express";
import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  getMyOnlineAppointments,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js";
import { allowRoles, protect } from "../middlewares/auth.middleware.js";
import { allAppointments } from "../controllers/doctor.controller.js";


const router = express.Router();

router.use(protect);

router.post("/createAppointment", createAppointment);
router.get("/all-appointments",allAppointments)
router.get("/online-appointment",getMyOnlineAppointments)
router.patch("/:id/status", allowRoles("assistant"), updateAppointmentStatus);
router.get("/", getMyAppointments);
router.get("/:id", getAppointmentById);
router.patch("/:id/cancel", cancelAppointment);




// -----------------------------------------------------------------------------------------


export default router;
