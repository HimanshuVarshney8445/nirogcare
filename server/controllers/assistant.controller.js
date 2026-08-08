// controllers/assistantController.js
import mongoose from "mongoose";
import { Assistant } from "../models/Assistant.js";
import { Hospital } from "../models/Hospital.js";
import { Doctor } from "../models/Doctor.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const registerAssistant = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: user ID not found" });
  }

  const { hospitalLicense, doctorLicense, hospitalId, doctorId } = req.body;
  const hospitalIdentifier = (hospitalLicense || hospitalId || "").toString().trim();
  const doctorIdentifier = (doctorLicense || doctorId || "").toString().trim();

  if (!hospitalIdentifier || !doctorIdentifier) {
    return res.status(400).json({
      success: false,
      message: "Hospital license number and Doctor license number are required",
    });
  }

  try {
    // Validate hospital and doctor existence using license numbers first, but allow existing ObjectId values for compatibility
    let hospitalExists = null;
    if (mongoose.Types.ObjectId.isValid(hospitalIdentifier)) {
      hospitalExists = await Hospital.findById(hospitalIdentifier);
    }
    if (!hospitalExists) {
      hospitalExists = await Hospital.findOne({
        licenseNumber: { $regex: `^${escapeRegex(hospitalIdentifier)}$`, $options: 'i' },
      });
    }

    let doctorExists = null;
    if (mongoose.Types.ObjectId.isValid(doctorIdentifier)) {
      doctorExists = await Doctor.findById(doctorIdentifier);
    }
    if (!doctorExists) {
      doctorExists = await Doctor.findOne({
        licenseNumber: { $regex: `^${escapeRegex(doctorIdentifier)}$`, $options: 'i' },
      });
    }

    if (!hospitalExists || !doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Hospital or Doctor not found for the provided license numbers",
      });
    }

    // Check if already exists
    let assistant = await Assistant.findOne({ userId });

    if (assistant) {
      // Optional: update hospital/doctor if re-registering
      assistant.hospitalId = hospitalExists._id;
      assistant.doctorId = doctorExists._id;
      const savedAssistant = await assistant.save();

      const populatedAssistant = await Assistant.findById(savedAssistant._id)
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', model: 'User', select: 'name email' },
          select: 'specialization gender userId licenseNumber',
        })
        .populate({ path: 'hospitalId', select: 'name address phone licenseNumber' });

      if (!populatedAssistant) {
        return res.status(500).json({
          success: false,
          message: 'Assistant profile could not be loaded after update',
        });
      }

      return res.status(200).json({
        success: true,
        message: "Assistant profile updated",
        assistant: populatedAssistant,
      });
    }

    // Create new assistant
    const newAssistant = new Assistant({
      userId,
      hospitalId: hospitalExists._id,
      doctorId: doctorExists._id,
    });

    const savedAssistant = await newAssistant.save();
    if (!savedAssistant || !savedAssistant._id) {
      return res.status(500).json({
        success: false,
        message: 'Assistant could not be saved',
      });
    }

    const populatedAssistant = await Assistant.findById(savedAssistant._id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', model: 'User', select: 'name email' },
        select: 'specialization gender userId licenseNumber',
      })
      .populate({ path: 'hospitalId', select: 'name address phone licenseNumber' });

    if (!populatedAssistant) {
      return res.status(500).json({
        success: false,
        message: 'Assistant was saved but could not be loaded',
      });
    }

    res.status(201).json({
      success: true,
      message: "Assistant registered successfully",
      assistant: populatedAssistant,
    });
  } catch (error) {
    console.error("Assistant Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering assistant",
      error: error.message
    });
  }
};


export const getAssistantProfile = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: user ID not found",
    });
  }

  try {
    const assistant = await Assistant.findOne({ userId })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId", // <-- nested population
          model: "User",
          select: "name email"
        },
        select: "specialization gender userId" // needed to keep userId for nested population
      })
      .populate({
        path: "hospitalId",
        select: "name address phone"
      });

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: "Assistant profile not found",
      });
    }

    res.status(200).json({
      success: true,
      assistant,
    });
  } catch (error) {
    console.error("Error fetching assistant profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching assistant profile",
      error: error.message,
    });
  }
};



