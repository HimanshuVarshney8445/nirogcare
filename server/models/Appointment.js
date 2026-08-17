import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    forPatient: {
      type: {
        type: String,
        enum: ["self", "family"],
        required: true,
      },
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    age : {
      type : String,
      required : true
    },
    gender : {
      type : String,
      required : true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    contact:{
      type : String,
      required : true
    },
    timeSlot: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["online", "offline"],
      required : true
      
    },
    status: {
      type: String,
      enum: ["booked", "confirmed", "in-progress", "cancelled", "completed"],
      default: "booked",
    },
    vitalUpdated:{
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
