import { Hospital } from "../models/Hospital.js";
import { Assistant } from "../models/Assistant.js";
import { Doctor } from "../models/Doctor.js";
import { Appointment } from "../models/Appointment.js";
import User from "../models/User.js";

// Register a hospital
export const registerHospital = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, licenseNumber, longitude , latitude } = req.body;

    if (!name || !phone || !address || !licenseNumber || !longitude || !latitude) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    const existingHospital = await Hospital.findOne({ userId });
    if (existingHospital) {
      return res.status(400).json({ error: "Hospital already registered." });
    }

    const hospital = new Hospital({
      userId,
      name,
      phone,
      address,
      licenseNumber,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    await hospital.save();

    // Ensure user role is updated to hospitalAdmin
    await User.findByIdAndUpdate(userId, { role: "hospitalAdmin" });

    res.status(201).json({ message: "Hospital registered successfully.", hospital, success: true });
  } catch (error) {
    console.error("Error registering hospital:", error);
    res.status(500).json({ error: "Failed to register hospital." });
  }
};

// Get hospital profile for logged-in admin
// Get hospital profile for logged-in admin
export const getMyHospitalProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const hospital = await Hospital.findOne({ userId }).populate({
      path: "userId",
      select: "name email" 
    });

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found." });
    }

    res.status(200).json({ hospital });
  } catch (error) {
    console.error("Error fetching hospital profile:", error);
    res.status(500).json({ error: "Failed to fetch hospital profile." });
  }
};


// Get total patients and patient counts by doctor department
export const getPatientStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find hospital by logged-in user ID
    const hospital = await Hospital.findOne({ userId });
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found." });
    }

    // Get all doctors under this hospital, and populate their user name
    const doctors = await Doctor.find({ hospitalId: hospital._id }).populate({
      path: "userId",
      select: "name", // get doctor name from User model
    });

    const doctorIds = doctors.map((doc) => doc._id);

    // Get appointments linked to these doctors
    const appointments = await Appointment.find({ doctorId: { $in: doctorIds } }).populate({
      path: "patientId",
      populate: {
        path: "userId",
        select: "name phone", // get patient name & phone from User model
      },
    });

    // Initialize mapping of doctors to their patients
    const doctorPatientsMap = {};

    for (const doctor of doctors) {
      doctorPatientsMap[doctor._id.toString()] = {
        doctorId: doctor._id,
        doctorName: doctor.userId?.name || "Unknown Doctor",
        specialization: doctor.specialization,
        patients: [],
      };
    }

    // Group patients under each doctor (avoiding duplicates)
    for (const appointment of appointments) {
      const doctorId = appointment.doctorId.toString();
      const patient = appointment.patientId;

      if (patient && patient.userId && doctorPatientsMap[doctorId]) {
        const patientUser = patient.userId;

        // Avoid duplicate patients for same doctor
        const alreadyAdded = doctorPatientsMap[doctorId].patients.some(
          (p) => p._id.toString() === patient._id.toString()
        );

        if (!alreadyAdded) {
          doctorPatientsMap[doctorId].patients.push({
            _id: patient._id,            // patient schema ID
            userId: patientUser._id,     // user ID from User model
            name: patientUser.name,
            phone: patientUser.phone,
            age: appointment.age,
            gender: appointment.gender,
            address: undefined,
          });
        }
      }
    }

    // Final list of doctors with their patients
    const doctorsWithPatients = Object.values(doctorPatientsMap);

    res.status(200).json({
      totalDoctors: doctorsWithPatients.length,
      doctors: doctorsWithPatients,
    });
  } catch (error) {
    console.error("Error fetching doctor-patient data:", error);
    res.status(500).json({ error: "Failed to fetch doctor-wise patient stats." });
  }
};


export const getAllHospitalPatients = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the hospital linked to this user
    const hospital = await Hospital.findOne({ userId });
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found." });
    }

    // Fetch all appointments for this hospital
    const appointments = await Appointment.find({ hospitalId: hospital._id })
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name phone", // Only fetch name & phone from user
        },
      })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name",
        },
        select: "specialization userId",
      });

    // Format appointment list
    const patientAppointments = appointments.map((appointment) => {
      const patient = appointment.patientId;
      const user = patient?.userId;

      return {
        appointmentId: appointment._id,
        patientId: patient?._id,
        userId: user?._id,
        name: user?.name,
        phone: user?.phone,
        age: appointment?.age,
        gender: appointment?.gender,
        address: undefined,
        doctorName: appointment.doctorId?.userId?.name,
        specialization: appointment.doctorId?.specialization,
        appointmentDate: appointment.date,
        status: appointment.status,
      };
    });

    res.status(200).json({
      totalAppointments: patientAppointments.length,
      appointments: patientAppointments,
    });
  } catch (error) {
    console.error("Error fetching hospital patients:", error);
    res.status(500).json({ error: "Failed to fetch appointment details." });
  }
};



export const getAllAssistantsForHospital = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: user ID not found",
    });
  }

  try {
    // Find hospital from logged-in user
    const hospital = await Hospital.findOne({ userId });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Fetch all assistants for that hospital
    const assistants = await Assistant.find({ hospitalId: hospital._id })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          model: "User",
          select: "name email",
        },
        select: "specialization gender userId",
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name email phone",
      });

    res.status(200).json({
      success: true,
      total: assistants.length,
      assistants,
    });
  } catch (error) {
    console.error("Error fetching assistants:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching assistants",
      error: error.message,
    });
  }
};








