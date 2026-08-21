import { Hospital } from "../models/Hospital.js";
import { Assistant } from "../models/Assistant.js";
import { Doctor } from "../models/Doctor.js";
import { Appointment } from "../models/Appointment.js";
import User from "../models/User.js";

// Register a hospital
export const registerHospital = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      phone,
      address,
      licenseNumber,
      longitude,
      latitude,
    } = req.body;

    if (
      !name ||
      !phone ||
      !address ||
      !licenseNumber ||
      !longitude ||
      !latitude
    ) {
      return res.status(400).json({
        error: "All required fields must be provided.",
      });
    }

    const existingHospital = await Hospital.findOne({ userId });

    if (existingHospital) {
      return res.status(400).json({
        error: "Hospital already registered.",
      });
    }

    const longitudeValue = parseFloat(longitude);
    const latitudeValue = parseFloat(latitude);

    if (
      Number.isNaN(longitudeValue) ||
      Number.isNaN(latitudeValue)
    ) {
      return res.status(400).json({
        error: "Invalid latitude or longitude values.",
      });
    }

    const hospital = new Hospital({
      userId,
      name,
      phone,
      address,
      licenseNumber,

      location: {
        type: "Point",
        coordinates: [longitudeValue, latitudeValue],
      },

      // Hospital itself is verified after registration
      isVerified: true,
    });

    await hospital.save();

    // Update user role
    await User.findByIdAndUpdate(userId, {
      role: "hospitalAdmin",
    });

    res.status(201).json({
      message: "Hospital registered successfully.",
      hospital,
      success: true,
    });
  } catch (error) {
    console.error("Error registering hospital:", error);

    if (error.code === 11000) {
      const duplicateField =
        Object.keys(error.keyPattern || {})[0] || "Hospital";

      return res.status(400).json({
        error: `${duplicateField} already exists.`,
      });
    }

    res.status(500).json({
      error: "Failed to register hospital.",
    });
  }
};

// Get hospital profile for logged-in admin
export const getMyHospitalProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const hospital = await Hospital.findOne({ userId }).populate({
      path: "userId",
      select: "name email",
    });

    if (!hospital) {
      return res.status(404).json({
        error: "Hospital not found.",
      });
    }

    res.status(200).json({
      hospital,
    });
  } catch (error) {
    console.error("Error fetching hospital profile:", error);

    res.status(500).json({
      error: "Failed to fetch hospital profile.",
    });
  }
};


// ============================================================
// GET ACTIVE DOCTORS + PATIENT STATS
// ============================================================

export const getPatientStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find hospital belonging to logged-in hospital admin
    const hospital = await Hospital.findOne({ userId });

    if (!hospital) {
      return res.status(404).json({
        error: "Hospital not found.",
      });
    }

    const doctors = await Doctor.find({
      hospitalId: hospital._id,

      // Only active doctors
      status: "approved",
      // isVerified: true,
    }).populate({
      path: "userId",
      select: "name",
    });

    const doctorIds = doctors.map((doctor) => doctor._id);

    /*
      If there are no approved doctors, don't make
      an unnecessary appointment query.
    */
    let appointments = [];

    if (doctorIds.length > 0) {
      appointments = await Appointment.find({
        doctorId: {
          $in: doctorIds,
        },
      }).populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name phone",
        },
      });
    }

    // Mapping doctor -> patients
    const doctorPatientsMap = {};

    for (const doctor of doctors) {
      doctorPatientsMap[doctor._id.toString()] = {
        doctorId: doctor._id,
        doctorName: doctor.userId?.name || "Unknown Doctor",
        specialization: doctor.specialization,
        patients: [],
      };
    }

    // Group patients under their doctors
    for (const appointment of appointments) {
      const doctorId = appointment.doctorId?.toString();

      const patient = appointment.patientId;

      if (
        patient &&
        patient.userId &&
        doctorPatientsMap[doctorId]
      ) {
        const patientUser = patient.userId;

        // Avoid duplicate patients for same doctor
        const alreadyAdded =
          doctorPatientsMap[doctorId].patients.some(
            (p) =>
              p._id.toString() === patient._id.toString()
          );

        if (!alreadyAdded) {
          doctorPatientsMap[doctorId].patients.push({
            _id: patient._id,
            userId: patientUser._id,
            name: patientUser.name,
            phone: patientUser.phone,
            age: appointment.age,
            gender: appointment.gender,
            address: undefined,
          });
        }
      }
    }

    const doctorsWithPatients =
      Object.values(doctorPatientsMap);

    res.status(200).json({
      totalDoctors: doctorsWithPatients.length,
      doctors: doctorsWithPatients,
    });
  } catch (error) {
    console.error(
      "Error fetching doctor-patient data:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch doctor-wise patient stats.",
    });
  }
};


// ============================================================
// GET ALL HOSPITAL PATIENTS
// ============================================================

export const getAllHospitalPatients = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find hospital linked to this user
    const hospital = await Hospital.findOne({ userId });

    if (!hospital) {
      return res.status(404).json({
        error: "Hospital not found.",
      });
    }

    // Fetch appointments for this hospital
    const appointments = await Appointment.find({
      hospitalId: hospital._id,
    })
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name phone",
        },
      })
      .populate({
        path: "doctorId",
        match: {
          status: "approved",
          // isVerified: true,
        },
        populate: {
          path: "userId",
          select: "name",
        },
        select: "specialization userId status isVerified",
      });

    /*
      Remove appointments whose doctor is not active.

      populate().match() makes doctorId null when the doctor
      is pending/rejected/unverified.
    */
    const activeAppointments = appointments.filter(
      (appointment) => appointment.doctorId
    );

    const patientAppointments = activeAppointments.map(
  (appointment) => {
    const patient = appointment.patientId;
    const user = patient?.userId;

    return {
      appointmentId: appointment._id,

      patientId: patient?._id,

      userId: user?._id,

      name: user?.name,

      // Phone number provided when THIS appointment was created
      phone: appointment.contact,

      age: appointment?.age,

      gender: appointment?.gender,

      address: undefined,

      doctorName:
        appointment.doctorId?.userId?.name,

      specialization:
        appointment.doctorId?.specialization,

      appointmentDate: appointment.date,

      time: appointment.timeSlot,

      status: appointment.status,

      mode: appointment.mode,
    };
  }
);

    res.status(200).json({
      totalAppointments:
        patientAppointments.length,

      appointments: patientAppointments,
    });
  } catch (error) {
    console.error(
      "Error fetching hospital patients:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch appointment details.",
    });
  }
};


// ============================================================
// GET ALL ASSISTANTS FOR HOSPITAL
// ============================================================

export const getAllAssistantsForHospital = async (
  req,
  res
) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: user ID not found",
    });
  }

  try {
    // Find hospital from logged-in user
    const hospital = await Hospital.findOne({
      userId,
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Fetch assistants for this hospital
    const assistants = await Assistant.find({
      hospitalId: hospital._id,
    })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          model: "User",
          select: "name email",
        },
        select:
          "specialization gender userId status isVerified",
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
    console.error(
      "Error fetching assistants:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching assistants",
      error: error.message,
    });
  }
};


// ============================================================
// GET ALL HOSPITALS
// ============================================================

export const getAllHospitals = async (req, res) => {
  try {
    const query = req.query.q
      ? req.query.q.trim()
      : "";

    const filter = query
      ? {
          $or: [
            {
              name: {
                $regex: query,
                $options: "i",
              },
            },
            {
              address: {
                $regex: query,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const hospitals = await Hospital.find(filter)
      .select(
        "_id name address phone location"
      )
      .lean();

    res.status(200).json({
      hospitals,
    });
  } catch (error) {
    console.error(
      "Error fetching hospitals list:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch hospitals.",
    });
  }
};