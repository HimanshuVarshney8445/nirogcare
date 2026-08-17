import mongoose from "mongoose";
import { Doctor } from "../models/Doctor.js";
import { Appointment } from "../models/Appointment.js"
import User from "../models/User.js";
import { Assistant } from "../models/Assistant.js";
import { MedicalRecord } from "../models/MedicalRecord.js";
import { Hospital } from "../models/Hospital.js";


export const doctorProfile = async (req, res) => {
  try {
    const {
      gender,
      specialization,
      experience,
      licenseNumber,
      hospitalId,
      education,
    } = req.body;

    const userId = req.user.id;

    let doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      if (!gender || !specialization || !licenseNumber || !hospitalId) {
        return res.status(400).json({ error: "All required fields must be filled." });
      }

      if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
        return res.status(400).json({ error: "Invalid hospitalId format." });
      }

      const hospitalExists = await Hospital.findById(hospitalId);
      if (!hospitalExists) {
        return res.status(404).json({ error: "Selected hospital not found." });
      }

      const newDoctor = await Doctor.create({
        userId,
        gender,
        specialization,
        experience,
        licenseNumber,
        hospitalId,
        education,
      });

      return res.status(201).json({
        message: "Doctor profile created successfully.",
        doctor: newDoctor,
      });
    } else {
      // Update fields if provided
      doctor.gender = gender || doctor.gender;
      doctor.specialization = specialization || doctor.specialization;
      doctor.experience = experience !== undefined ? experience : doctor.experience;
      doctor.licenseNumber = licenseNumber || doctor.licenseNumber;
      if (hospitalId) {
        if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
          return res.status(400).json({ error: "Invalid hospitalId format." });
        }

        const hospitalExists = await Hospital.findById(hospitalId);
        if (!hospitalExists) {
          return res.status(404).json({ error: "Selected hospital not found." });
        }

        doctor.hospitalId = hospitalId;
      }
      doctor.education = education || doctor.education;

      await doctor.save();

      return res.status(200).json({
        message: "Doctor profile updated successfully.",
        doctor,
      });
    }

  } catch (error) {
    console.error("Error in doctor profile handler:", error);
    return res.status(500).json({ error: "Server error while handling doctor profile." });
  }
};


export const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctor = await Doctor.findOne({ userId })
      .populate("userId", "name email")
      .populate("hospitalId", "name");

    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found." });
    }

    return res.status(200).json({
      message: "Doctor profile fetched successfully.",
      doctor,
    });

  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return res.status(500).json({ error: "Server error while fetching doctor profile." });
  }
}


// fetch todays patients

export const todaysPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const doctorId = doctor._id;
    const hospitalId = doctor.hospitalId;
    const now = new Date();
    // Convert to IST (UTC + 5.5 hours)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);

    const year = istNow.getFullYear();
    const month = istNow.getMonth();
    const date = istNow.getDate();

    const istStart = new Date(Date.UTC(year, month, date, 0, 0, 0));
    const istEnd = new Date(Date.UTC(year, month, date, 23, 59, 59, 999));

    const appointments = await Appointment.find({
      doctorId,
      hospitalId,
      date: { $gte: istStart, $lte: istEnd },
      status: { $ne: "cancelled" },
    })
      .populate("bookedBy", "name email")
      .populate("patientId", "_id")
      .sort({ timeSlot: 1 });

    return res.status(200).json({
      message: "Today's patients fetched successfully.",
      total: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error("Error fetching today's patients:", error);
    return res.status(500).json({
      error: "Server error while fetching today's patients."
    });
  }
};


export const addMedicineRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found." });
    }

    const {
      patientId,
      appointmentId,
      hospitalId,
      medicines,
      notes,
    } = req.body;

    if (!patientId || !appointmentId || !hospitalId || !medicines || medicines.length === 0) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    const record = new MedicalRecord({
      patientId,
      appointmentId,
      doctorId: doctor._id,
      hospitalId,
      medicines,
      notes,
    });

    await record.save();

    await Appointment.findByIdAndUpdate(appointmentId, { status: "completed" });

    res.status(201).json({
      message: "Medicine record saved successfully.",
      record,
    });
  } catch (error) {
    console.error("Error saving medicine record:", error);
    res.status(500).json({ error: "Failed to save medicine record." });
  }
};


export const getMedicineRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required." });
    }

    const records = await MedicalRecord.find({ patientId })
      .populate("doctorId", "specialization")
      .sort({ prescribedAt: -1 });

    res.status(200).json({
      message: "Medicine records fetched.",
      total: records.length,
      records,
    });
  } catch (error) {
    console.error("Error fetching medicine records:", error);
    res.status(500).json({ error: "Failed to fetch medicine records." });
  }
};


export const getDoctorsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.query;

    if (!hospitalId) {
      return res.status(400).json({ error: "Hospital ID is required." });
    }

    const doctors = await Doctor.find({ hospitalId })
      .populate({
        path: "userId",
        select: "name email",
      })
      .select("specialization experience userId");

    const formattedDoctors = doctors.map((doc) => ({
      doctorId: doc._id,
      name: doc.userId?.name || "Unknown",
      email: doc.userId?.email || "Unknown",
      specialization: doc.specialization,
      experience: doc.experience,
    }));

    return res.status(200).json({
      message: "Doctors fetched successfully.",
      total: formattedDoctors.length,
      doctors: formattedDoctors,
    });
  } catch (error) {
    console.error("Error fetching doctors for hospital:", error);
    return res.status(500).json({ error: "Server error while fetching doctors." });
  }
};


export const allAppointments = async (req, res) => {
  try {
    const assistant = await Assistant.findOne({ userId: req.user.id });

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: "Assistant profile not found",
      });
    }

    const doctorId = assistant.doctorId;
    const hospitalId = assistant.hospitalId;

    const appointments = await Appointment.find({
      doctorId,
      hospitalId,
      status: { $ne: "cancelled" },
    })
      .populate({
        path: "bookedBy",
        select: "name email",
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ date: -1, timeSlot: 1 });

    return res.status(200).json({
      success: true,
      message: "All appointments fetched successfully.",
      total: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error("Error fetching all appointments:", error);
    return res.status(500).json({
      error: "Server error while fetching all appointments."
    });
  }
};




export const allTodaysAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const doctorId = doctor._id;
    const hospitalId = doctor.hospitalId;

    let dateFilter = {};
    const targetDateStr = req.query.date;
    if (targetDateStr) {
      const d = new Date(targetDateStr);
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth();
      const day = d.getUTCDate();
      const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      dateFilter = { date: { $gte: startOfDay, $lte: endOfDay } };
    } else {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(now.getTime() + istOffset);
      const year = istNow.getUTCFullYear();
      const month = istNow.getUTCMonth();
      const day = istNow.getUTCDate();
      const istStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const istEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      dateFilter = { date: { $gte: istStart, $lte: istEnd } };
    }

    const appointments = await Appointment.find({
      doctorId,
      hospitalId,
      ...dateFilter,
      status: { $ne: "cancelled" },
    })
      .populate({
        path: "bookedBy",
        select: "name email vitalUpdated",
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ date: -1, timeSlot: 1 });

    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully.",
      total: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({
      error: "Server error while fetching appointments."
    });
  }

}


export const allTodaysOnlineAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      userId: req.user.id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // Today's date
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      hospitalId: doctor.hospitalId,

      // Only today's appointments
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },

      // Only online appointments
      mode: "online",

      // Don't show cancelled
      status: {
        $nin: ["cancelled"],
      },
    })
      .populate({
        path: "bookedBy",
        select: "name email vitalUpdated",
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({
        timeSlot: 1,
      });

    return res.status(200).json({
      success: true,
      message: "Today's online appointments fetched successfully.",
      total: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error(
      "Error fetching today's online appointments:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Server error while fetching today's online appointments.",
    });
  }
};