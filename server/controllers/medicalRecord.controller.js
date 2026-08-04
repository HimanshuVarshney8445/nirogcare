import { MedicalRecord } from "../models/MedicalRecord.js";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";


export const addMedicalRecord = async (req, res) => {
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

    res.status(201).json({
      message: "Medicine record saved successfully.",
      record,
    });
  } catch (error) {
    console.error("Error saving medicine record:", error);
    res.status(500).json({ error: "Failed to save medicine record." });
  }
};

// Get medical history for a patient (looks up Patient by userId first)
export const getMedicalRecords = async (req, res) => {
  try {
    const userId = req.user.id;

    // patientId in MedicalRecord references Patient._id, not User._id
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({ error: "Patient profile not found." });
    }

    const records = await MedicalRecord.find({ patientId: patient._id })
      .populate({
          path: "doctorId",
          select: "specialization hospitalId userId", 
          populate: [
            {
              path: "hospitalId",
              select: "name", 
            },
            {
              path: "userId",
              select: "name", 
            },
          ],
        })


      .sort({ prescribedAt: -1 });

    res.status(200).json({
      message: "Medical records fetched.",
      total: records.length,
      records,
    });
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({ error: "Failed to fetch medical records." });
  }
};
