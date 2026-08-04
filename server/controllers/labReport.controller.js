
import { LabReport } from "../models/LabReport.js";
import { Patient } from "../models/Patient.js";
import { FamilyMember } from "../models/FamilyMember.js";

// Create a new lab report
export const createLabReport = async (req, res) => {
  try {
    const {
      patientId,
      forPatientType,
      labId,
      testName,
      testType,
      result,
      normalRange,
      unit,
      diagnosis,
      doctorReference,
    } = req.body;

    if (
      !patientId ||
      !forPatientType ||
      !labId ||
      !testName ||
      !testType ||
      !result
    ) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // Validate forPatientType existence
    if (forPatientType === "Patient") {
      const patientExists = await Patient.findById(patientId);
      if (!patientExists) {
        return res.status(404).json({ error: "Patient not found." });
      }
    } else if (forPatientType === "FamilyMember") {
      const memberExists = await FamilyMember.findById(patientId);
      if (!memberExists) {
        return res.status(404).json({ error: "Family member not found." });
      }
    } else {
      return res.status(400).json({ error: "Invalid patient type." });
    }

    const newReport = new LabReport({
      patientId,
      forPatientType,
      labId,
      testName,
      testType,
      result,
      normalRange,
      unit,
      diagnosis,
      doctorReference,
    });

    await newReport.save();

    res.status(201).json({
      message: "Lab report created successfully.",
      report: newReport,
    });
  } catch (error) {
    console.error("Error creating lab report:", error);
    res.status(500).json({ error: "Failed to create lab report." });
  }
};

// Get all lab reports for logged-in patient (and optionally family members)
export const getLabReportsForPatient = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({ error: "Patient profile not found." });
    }

    const reports = await LabReport.find({
      $or: [
        { patientId: patient._id, forPatientType: "Patient" },
        { forPatientType: "FamilyMember", patientId: { $in: await FamilyMember.find({ patientId: patient._id }).distinct('_id') } }
      ]
    })
      .populate("labId")
      .populate({
        path: "doctorReference",
        populate: { path: "userId", select: "name" },
        select: "specialization userId",
      });

    res.status(200).json({ reports });
  } catch (error) {
    console.error("Error fetching lab reports:", error);
    res.status(500).json({ error: "Failed to fetch lab reports." });
  }
};

// Get lab reports for a specific family member
export const getReportsForFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;

    const familyMember = await FamilyMember.findById(id);
    if (!familyMember) {
      return res.status(404).json({ error: "Family member not found." });
    }

    const reports = await LabReport.find({
      patientId: id,
      forPatientType: "FamilyMember",
    })
      .populate("labId")
      .populate({
        path: "doctorReference",
        populate: { path: "userId", select: "name" },
        select: "specialization userId",
      });

    res.status(200).json({ reports });
  } catch (error) {
    console.error("Error fetching family member reports:", error);
    res.status(500).json({ error: "Failed to fetch reports." });
  }
};

// Get reports issued by a specific lab (e.g. lab staff dashboard)
export const getReportsByLab = async (req, res) => {
  try {
    const { labId } = req.params;

    const reports = await LabReport.find({ labId }).populate({
      path: "doctorReference",
      populate: { path: "userId", select: "name" },
      select: "specialization userId",
    });

    res.status(200).json({ reports });
  } catch (error) {
    console.error("Error fetching lab reports:", error);
    res.status(500).json({ error: "Failed to fetch lab reports." });
  }
};


