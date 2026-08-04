import express from "express";
import { sendFirebaseNotification } from "../controllers/firebase.controller.js";
import { allowRoles, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send-notification", protect, allowRoles("assistant"), sendFirebaseNotification);




export default router
