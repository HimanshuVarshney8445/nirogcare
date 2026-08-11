import React, { useState } from "react";
import { toast } from "sonner";
import { uploadLabReport } from "../services/labServices"; 

const UploadReportForm = ({ appointment, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async () => {
    const preset = import.meta.env.VITE_CLOUDINARY_PRESET;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD;

    if (!preset || !cloudName) {
      throw new Error("Cloudinary configuration missing. Please check env variables.");
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", preset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    if (!res.ok || !json.secure_url) {
      throw new Error(json.error?.message || "Failed to upload file to Cloudinary");
    }
    return json.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a PDF.");

    try {
      setUploading(true);
      const pdfUrl = await uploadToCloudinary();
      const res = await uploadLabReport(appointment._id, pdfUrl);

      toast.success("✅ Report uploaded successfully!");
      if (onUploadSuccess) {
        onUploadSuccess(res);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
      <p className="text-white">Uploading report for:
        <strong> {appointment.patientName || appointment.bookedBy?.name || "Patient"}</strong>
      </p>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="block text-gray-300 file:bg-blue-600 file:text-white file:rounded file:px-4 file:py-1"
      />

      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>
    </form>
  );
};

export default UploadReportForm;
