
import { Hospital } from "../models/Hospital.js";
import { Patient } from "../models/Patient.js";
import { Lab } from "../models/Lab.js"
import User from "../models/User.js";
import { LabAppointment } from "../models/LabAppointment.js";
import { Assistant } from "../models/Assistant.js";
import { Appointment } from "../models/Appointment.js";




export const patientProfile = async (req, res) => {
  try {
    const userId = req.user.id;


    let patient = await Patient.findOne({ userId });

    if (!patient) {
      patient = new Patient({ userId });
    }

    await patient.save();

    res.status(200).json({
      message: "Patient profile updated successfully.",
      patient,
    });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
};




// Fetch nearby hospitals
export const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, maxDistance } = req.body;

    if (!lat || !lng) {
      const allHospitals = await Hospital.find({});
      return res.status(200).json({ hospitals: allHospitals });
    }

    const geoNearOptions = {
      near: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      distanceField: "distance", // field added to each doc
      spherical: true,
    };

    if (maxDistance && !isNaN(maxDistance)) {
      geoNearOptions.maxDistance = parseFloat(maxDistance);
    }

    const nearbyHospitals = await Hospital.aggregate([
      {
        $geoNear: geoNearOptions,
      },
    ]);

    res.status(200).json({ hospitals: nearbyHospitals });
  } catch (error) {
    console.error("Error fetching nearby hospitals:", error);
    res.status(500).json({ error: "Failed to fetch nearby hospitals" });
  }
};

// fetch nearby labs
export const getNearbylabs = async (req, res) => {
  try {
    const { lat, lng, maxDistance } = req.body;

    if (!lat || !lng) {
      const allLabs = await Lab.find({});
      return res.status(200).json({ labs: allLabs });
    }

    const geoNearOptions = {
      near: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      distanceField: "distance", // Distance in meters
      spherical: true,
    };

    if (maxDistance && !isNaN(maxDistance)) {
      geoNearOptions.maxDistance = parseFloat(maxDistance);
    }

    const nearbyLabs = await Lab.aggregate([
      {
        $geoNear: geoNearOptions,
      },
    ]);

    res.status(200).json({ labs: nearbyLabs });
  } catch (error) {
    console.error("Error fetching nearby labs:", error);
    res.status(500).json({ error: "Failed to fetch nearby labs" });
  }
};





export const updateVitalsForUser = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const {
      heartRate,
      bloodPressure,
      oxygenLevel,
      temperature,
    } = req.body;

    const assistant = await Assistant.findOne({ userId: req.user.id });

    if (!assistant) {
      return res.status(403).json({
        success: false,
        message: "Assistant profile is required",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: assistant.doctorId,
      hospitalId: assistant.hospitalId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Do not allow vitals to be updated after appointment is completed
    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot update vitals after appointment completion",
      });
    }

    // Do not allow vitals to be updated more than once
    if (appointment.vitalUpdated === true) {
      return res.status(400).json({
        success: false,
        message: "Vitals have already been updated for this appointment",
      });
    }

    const user = await User.findById(appointment.bookedBy);

    if (!user || user.role !== "patient") {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Update patient's vitals
    user.heartRate = heartRate;
    user.bloodPressure = bloodPressure;
    user.oxygenLevel = oxygenLevel;
    user.temperature = temperature;

    await user.save();

    // Mark THIS appointment as having its vitals updated
    appointment.vitalUpdated = true;

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Vitals updated successfully",
      data: {
        heartRate: user.heartRate,
        bloodPressure: user.bloodPressure,
        oxygenLevel: user.oxygenLevel,
        temperature: user.temperature,
        vitalUpdated: appointment.vitalUpdated,
      },
    });

  } catch (error) {
    console.error("Error updating vitals:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const getVitalsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user || user.role !== "patient") {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const vitals = {
      heartRate: user.heartRate,
      bloodPressure: user.bloodPressure,
      oxygenLevel: user.oxygenLevel,
      temperature: user.temperature,
    };

    res.status(200).json({
      success: true,
      data: vitals,
    });

  } catch (error) {
    console.error("Error fetching vitals:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}



export const getAllLabReportsBookedByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const reports = await LabAppointment.find({
      bookedBy: userId,
      reportPDF: { $exists: true, $ne: null },
    })
      .populate("labId", "name address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Lab reports fetched successfully.",
      reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Server error fetching lab reports." });
  }
};

