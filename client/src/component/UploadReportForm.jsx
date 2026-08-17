import React, { useState } from "react";
import { toast } from "sonner";
import { uploadLabReport } from "../services/labServices";

const UploadReportForm = ({ appointment, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async () => {
    const preset = import.meta.env.VITE_CLOUDINARY_PRESET;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD;

    console.log("Cloudinary config:", {
      preset,
      cloudName,
    });

    if (!preset || !cloudName) {
      throw new Error(
        "Cloudinary configuration missing. Please check env variables."
      );
    }

    const data = new FormData();

    data.append("file", file);
    data.append("upload_preset", preset);

    console.log("Uploading file to Cloudinary:", file.name);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();

    console.log("Cloudinary response:", json);

    if (!res.ok || !json.secure_url) {
      throw new Error(
        json.error?.message || "Failed to upload file to Cloudinary"
      );
    }

    console.log("Cloudinary PDF URL:", json.secure_url);

    return json.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("========== REPORT UPLOAD START ==========");
    console.log("Appointment:", appointment);
    console.log("Appointment ID:", appointment?._id);
    console.log("Selected file:", file);

    if (!appointment?._id) {
      toast.error("Appointment information is missing.");
      return;
    }

    if (!file) {
      toast.error("Please select a PDF.");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }

    try {
      setUploading(true);

      // STEP 1: Upload PDF to Cloudinary
      const pdfUrl = await uploadToCloudinary();

      console.log("PDF uploaded successfully.");
      console.log("PDF URL:", pdfUrl);

      // STEP 2: Save Cloudinary URL in backend
      console.log(
        "Sending report URL to backend for appointment:",
        appointment._id
      );

      const res = await uploadLabReport(
        appointment._id,
        pdfUrl
      );

      console.log("Backend upload response:", res);

      toast.success("Report uploaded successfully!", {
        duration: 3000,
        className: "doctor-toast",
      });

      // STEP 3: Refresh dashboard
      if (onUploadSuccess) {
        onUploadSuccess(res);
      }

      setFile(null);

    } catch (error) {
      console.error("❌ Upload error:", error);

      console.error("Error response:", error?.response?.data);

      toast.error(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message ||
        "Upload failed. Try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-800 p-4 rounded-xl border border-gray-700"
    >
      <p className="text-white">
        Uploading report for:
        <strong>
          {" "}
          {appointment?.patientName ||
            appointment?.bookedBy?.name ||
            "Patient"}
        </strong>
      </p>

      <p className="text-gray-400 text-sm">
        Test:{" "}
        <span className="text-white">
          {appointment?.testDetails?.testName || "N/A"}
        </span>
      </p>

      <p className="text-gray-400 text-sm">
        Type:{" "}
        <span className="text-white">
          {appointment?.testDetails?.testType || "N/A"}
        </span>
      </p>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] || null;

          console.log("Selected file:", selectedFile);

          setFile(selectedFile);
        }}
        className="block text-gray-300 file:bg-blue-600 file:text-white file:rounded file:px-4 file:py-1"
      />

      {file && (
        <p className="text-sm text-gray-400">
          Selected:{" "}
          <span className="text-white">{file.name}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>
    </form>
  );
};

export default UploadReportForm;