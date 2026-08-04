import { Appointment } from "../models/Appointment.js";
import {Patient} from "../models/Patient.js"
import { Assistant } from "../models/Assistant.js";

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const type = req.body.forPatient?.type;
    const { doctorId, hospitalId, date, timeSlot ,contact , age , gender , mode } = req.body;

    if (!type || !doctorId || !hospitalId || !date || !timeSlot || !contact || !age || !gender) {
      return res.status(400).json({ error: "All fields are required." });
    }

    

    const patient = await Patient.findOne({ userId: req.user.id });

    if (!patient) {
      return res.status(404).json({ error: "Patient profile not found." });
    }

    const newAppointment = await Appointment.create({
      bookedBy: req.user.id,
      forPatient: { type },
      doctorId,
      hospitalId,
      contact,
      date,
      timeSlot,
      patientId: patient._id,
      age,
      gender,
      mode
    });

    return res.status(201).json({
      message: "Appointment booked!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({
      error: "Server error while booking appointment.",
    });
  }
};


export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ bookedBy: req.user.id })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email ",
        },
        select: "specialization userId",
      })
      .populate("hospitalId", "name address")
      .sort({ date: -1 });

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res
      .status(500)
      .json({ error: "Server error while fetching appointments." });
  }
};



// Get a specific appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      bookedBy: req.user.id,
    })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email",
        },
        select: "specialization userId",
      })
      .populate("hospitalId", "name address");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    return res.status(200).json({ appointment });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return res
      .status(500)
      .json({ error: "Server error while fetching appointment." });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      bookedBy: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    if (appointment.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Appointment already cancelled." });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res
      .status(200)
      .json({ message: "Appointment cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res
      .status(500)
      .json({ error: "Server error while cancelling appointment." });
  }
};

const appointmentStatuses = new Set(["confirmed", "in-progress", "completed", "cancelled"]);

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!appointmentStatuses.has(status)) {
      return res.status(400).json({ message: "Unsupported appointment status" });
    }

    const assistant = await Assistant.findOne({ userId: req.user.id });
    if (!assistant) return res.status(403).json({ message: "Assistant profile is required" });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: assistant.doctorId,
      hospitalId: assistant.hospitalId,
    });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (["cancelled", "completed"].includes(appointment.status)) {
      return res.status(409).json({ message: "This appointment can no longer be updated" });
    }

    appointment.status = status;
    await appointment.save();
    return res.status(200).json({ message: "Appointment status updated", appointment });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return res.status(500).json({ message: "Unable to update appointment status" });
  }
};




export const getMyOnlineAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ bookedBy: req.user.id , mode : 'online' })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email ",
        },
        select: "specialization userId",
      })
      .populate("hospitalId", "name address")
      .sort({ date: -1 });

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res
      .status(500)
      .json({ error: "Server error while fetching appointments." });
  }
};

