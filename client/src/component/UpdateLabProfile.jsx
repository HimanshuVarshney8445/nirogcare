import React, { useState } from "react";
import {
  Save,
  AlertCircle,
  MapPin,
  IdCard,
  FlaskConical,
} from "lucide-react";

import { updateLab } from "../services/labServices";
import { toast } from "sonner";

const testOptions = [
  "X-Ray",
  "Blood Test",
  "MRI",
  "CT Scan",
  "Ultrasound",
  "Urine Test",
  "ECG",
  "Cholesterol",
  "Diabetes",
  "Allergy",
];

const UpdateLabProfile = ({
  labData,
  onCancel,
  onUpdateSuccess,
}) => {
  const [formData, setFormData] = useState({
    address: labData?.address || "",
    licenseNumber: labData?.licenseNumber || "",
    testTypes: labData?.testTypes || [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTestTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      testTypes: prev.testTypes.includes(type)
        ? prev.testTypes.filter((t) => t !== type)
        : [...prev.testTypes, type],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (
      !formData.address ||
      !formData.licenseNumber ||
      formData.testTypes.length === 0
    ) {
      setMessage("All required fields must be filled.");
      setMessageType("error");

      toast.error("Please fill all required fields.");

      return;
    }

    try {
      setLoading(true);

      // Update lab in backend
      await updateLab(formData);

      // Success toast
      toast.success("Lab profile updated successfully!", {
        duration: 3000,
        className: "doctor-toast",
      });

      // Update parent state and return to profile view
      if (onUpdateSuccess) {
        onUpdateSuccess(formData);
      }
    } catch (error) {
      console.error("Update lab error:", error);

      const errorMessage =
        error?.error ||
        error?.message ||
        "Failed to update lab profile.";

      setMessage(errorMessage);
      setMessageType("error");

      toast.error(errorMessage, {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-900 rounded-xl border border-green-500/30">

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl text-white font-bold">
          Update Lab Profile 🧪
        </h2>
      </div>

      {/* Error Message */}
      {message && messageType === "error" && (
        <div className="flex items-center p-4 mb-4 rounded-xl bg-red-700/20 text-red-300">
          <AlertCircle className="mr-2 w-5 h-5" />
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Address */}
        <div className="space-y-1">
          <label className="text-gray-300 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-green-400" />
            Address *
          </label>

          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-green-500"
            placeholder="Enter lab address"
          />
        </div>

        {/* License Number */}
        <div className="space-y-1">
          <label className="text-gray-300 flex items-center">
            <IdCard className="w-4 h-4 mr-2 text-green-400" />
            License Number *
          </label>

          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-green-500"
            placeholder="Enter license number"
          />
        </div>

        {/* Test Types */}
        <div className="space-y-2">
          <label className="flex items-center text-gray-300">
            <FlaskConical className="w-4 h-4 mr-2 text-green-400" />
            Select Test Types Offered *
          </label>

          <div className="grid grid-cols-2 gap-2 text-white">
            {testOptions.map((test) => (
              <label
                key={test}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.testTypes.includes(test)}
                  onChange={() =>
                    handleTestTypeChange(test)
                  }
                  className="accent-green-500"
                />

                <span>{test}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">

          {/* Cancel */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2 px-4 rounded text-white font-semibold bg-gray-700 hover:bg-gray-600 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          {/* Update */}
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded text-white font-semibold flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500 cursor-pointer"
            }`}
          >
            {loading ? (
              "Updating..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Lab Info
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateLabProfile;
