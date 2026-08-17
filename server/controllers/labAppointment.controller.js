import { LabAppointment } from "../models/LabAppointment.js";
import { Lab } from "../models/Lab.js";

const getOwnedLab = (userId) => Lab.findOne({ userId });


export const bookLabAppointment = async (req, res) => {
  try {
    const {
      forPatientType,
      labId,
      testDetails,
      scheduledDate,
      timeSlot,
      notes,
      doctorReference,
    } = req.body;

    if (
      !forPatientType ||
      !labId ||
      !testDetails?.testName ||
      !testDetails?.testType ||
      !scheduledDate ||
      !timeSlot
    ) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    const appointmentData = {
      forPatientType,
      labId,
      testDetails,
      scheduledDate,
      timeSlot,
      notes,
    };

    if (doctorReference) appointmentData.doctorReference = doctorReference;
    if (req.user?.id) appointmentData.bookedBy = req.user.id;
    if (req.body.bookedBy) appointmentData.bookedBy = req.body.bookedBy;

    const appointment = new LabAppointment(appointmentData);
    const saved = await appointment.save();

    res.status(201).json({
      success: true,
      message: "Lab appointment booked successfully.",
      appointment: saved,
    });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: err.message || "Server error while booking appointment." });
  }
};

// @desc: Get all lab appointments for a user
export const getMyLabAppointments = async (req, res) => {
  try {
    const appointments = await LabAppointment.find({
      bookedBy: req.user.id,
      isDeleted: false,
    })
      .populate("labId", "name address")
      .populate({
        path: "doctorReference",
        populate: {
          path: "userId",
          select: "name",
        },
        select: "specialization userId",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Unable to fetch appointments." });
  }
};


export const getTodayLabAppointmentCount = async (req, res) => {
  try {
    const lab = await getOwnedLab(req.user.id);

    if (!lab) {
      return res.status(404).json({
        message: "Lab profile not found",
      });
    }

    const now = new Date();

    const indiaDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    const startOfDay = new Date(
      `${indiaDate}T00:00:00+05:30`
    );

    const endOfDay = new Date(
      `${indiaDate}T23:59:59.999+05:30`
    );

    const count = await LabAppointment.countDocuments({
      labId: lab._id,
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      isDeleted: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Count error:", error);

    res.status(500).json({
      error: "Could not count today's appointments.",
    });
  }
};

// Returns all today's appointments for a specific lab
export const getTodayAppointmentsForLab = async (req, res) => {
  try {
    const { labId } = req.params;

    const lab = await getOwnedLab(req.user.id);

    if (!lab || lab._id.toString() !== labId) {
      return res.status(403).json({
        message: "You cannot access this lab's appointments",
      });
    }

    // Get today's date in India
    const now = new Date();

    const indiaDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    // Create start and end of today in IST
    const startOfDay = new Date(`${indiaDate}T00:00:00+05:30`);
    const endOfDay = new Date(`${indiaDate}T23:59:59.999+05:30`);

    const appointments = await LabAppointment.find({
      labId,
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      isDeleted: false,
    })
      .populate("bookedBy", "name")
      .populate({
        path: "doctorReference",
        populate: {
          path: "userId",
          select: "name",
        },
        select: "userId",
      });

    res.json(appointments);
  } catch (err) {
    console.error("Error fetching today's lab appointments:", err);

    res.status(500).json({
      error: "Unable to fetch today's appointments.",
    });
  }
};


export const uploadReportForAppointment = async (req, res) => {
  try {
    console.log("========== UPLOAD REPORT ==========");
    const { id } = req.params;
    const { reportPDF } = req.body;

    console.log("Appointment ID:", id);
    console.log("Report PDF:", reportPDF);
    console.log("Request body:", req.body);
    console.log("Logged in user:", req.user);

    if (!id || !reportPDF) {
      return res.status(400).json({ error: "Missing appointment ID or report URL" });
    }

    const lab = await getOwnedLab(req.user.id);
    console.log("Owned lab:", lab);
    if (!lab) return res.status(404).json({ message: "Lab profile not found" });

    const appointment = await LabAppointment.findOneAndUpdate(
      { _id: id, labId: lab._id },
      { reportPDF, status: "Completed" },
      { new: true }
    );
    console.log("Updated appointment:", appointment);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    console.log("✅ REPORT UPLOADED SUCCESSFULLY");

    res.status(200).json({
      message: "Report uploaded successfully",
      appointment,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Server error uploading report" });
  }
};





export const getAllLabAppointments = async (req, res) => {
  try {
    const {labId} = req.params;
    const lab = await getOwnedLab(req.user.id);
    if (!lab || lab._id.toString() !== labId) {
      return res.status(403).json({ message: "You cannot access this lab's appointments" });
    }
    const appointments = await LabAppointment.find({labId})
      .populate("labId", "name address")
      .populate("bookedBy", "name phone email")
      .populate({
        path: "doctorReference",
        populate: {
          path: "userId",
          select: "name",
        },
        select: "specialization userId",
      })
      .sort({ scheduledDate: -1 });

    res.status(200).json({ appointments });

  } catch (error) {
    console.error("Error fetching all lab appointments:", error);
    res.status(500).json({ error: "Failed to fetch all lab appointments." });
    
  }
}
