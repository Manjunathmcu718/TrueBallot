import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  UserPlus,
  X,
  MapPin,
  Sparkles,
  Upload
} from "lucide-react";

export default function AddVoterForm({ onSubmit, onCancel }) {

  const [formData, setFormData] = useState({
    full_name: "",
    voter_id: "",
    aadhar_number: "",
    phone_number: "",
    date_of_birth: "",
    constituency: "",
    address: "",
    polling_station: "",
    current_location: ""   // ✅ Your required field
  });

  const [faceImage, setFaceImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [isAllocating, setIsAllocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✨ Smart Allocate Booth
  const handleAllocate = async () => {
    if (!formData.address.trim()) {
      alert("Enter address first.");
      return;
    }

    try {
      setIsAllocating(true);

      const res = await axios.post(
        "http://127.0.0.1:5000/api/booth-allocation/auto-allocate",
        { address: formData.address }
      );

      if (res.data.booth) {
        setFormData(prev => ({
          ...prev,
          polling_station: res.data.booth.booth_name
        }));
      } else {
        alert("No booth found.");
      }

    } catch {
      alert("Allocation failed.");
    }

    setIsAllocating(false);
  };

  // 📸 Image Upload
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const minSize = 50 * 1024;
    const maxSize = 100 * 1024;

    if (file.size < minSize || file.size > maxSize) {
      setError("Image must be 50KB – 100KB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setFaceImage(file);
    setPreview(url);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!faceImage) {
      setError("Face photo is required.");
      return;
    }

    const birthDate = new Date(formData.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const data = new FormData();

    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    data.append("age", age);
    data.append("face_image", faceImage);

    try {
      setIsSubmitting(true);

      await axios.post(
        "http://127.0.0.1:5000/api/add-voter",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Voter added successfully!");
      if (onSubmit) onSubmit();

    } catch {
      alert("Failed to add voter.");
    }

    setIsSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-white rounded-xl shadow-lg border p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Add New Voter
          </h3>
          <button onClick={onCancel}>
            <X />
          </button>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {[
            ["Full Name *", "full_name"],
            ["Voter ID *", "voter_id"],
            ["Aadhar Number *", "aadhar_number"],
            ["Mobile Number *", "phone_number"],
            ["Constituency *", "constituency"]
          ].map(([label, field]) => (
            <div key={field}>
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mt-1"
              />
            </div>
          ))}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Date of Birth *
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-1"
            />
          </div>

        </div>

        {/* ADDRESS SECTION */}
        <div className="border-t mt-6 pt-6">

          <h4 className="font-semibold text-lg flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            Address & Booth Allocation
          </h4>

          <textarea
            rows="3"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Enter full address including locality"
            className="w-full px-3 py-2 border rounded-lg"
          />

          <p className="text-xs text-gray-500 mt-2">
            Enter complete address including locality name for smart booth allocation
          </p>

          <button
            type="button"
            onClick={handleAllocate}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg flex items-center gap-2"
          >
            <Sparkles size={16} />
            {isAllocating ? "Allocating..." : "Smart Allocate Booth"}
          </button>

          {/* POLLING STATION */}
          <div className="mt-4">
            <label className="text-sm font-medium">
              Polling Station *
            </label>
            <input
              value={formData.polling_station}
              onChange={(e) => handleChange("polling_station", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-1"
            />
          </div>

          {/* ✅ CURRENT LOCATION FIELD */}
          <div className="mt-4">
            <label className="text-sm font-medium">
              Current Location *
            </label>
            <input
              value={formData.current_location}
              onChange={(e) => handleChange("current_location", e.target.value)}
              placeholder="Enter current location"
              className="w-full px-3 py-2 border rounded-lg mt-1"
              required
            />
          </div>

        </div>

        {/* PHOTO SECTION */}
        <div className="border-t mt-6 pt-6">

          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Voter Photo</h4>
            <span className="text-xs text-gray-500">
              Required: 4.5x3.5cm, 50-100KB, JPG/PNG
            </span>
          </div>

          {/* <div className="mt-4 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer">
            <Upload className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">
              Click to upload or drag & drop
            </p>
            <input type="file" hidden onChange={handleUpload} />
          </div> */}
          <div
  className="mt-4 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
  onClick={() => document.getElementById("voterImageInput").click()}
>
  <Upload className="mx-auto mb-2 text-gray-400" />
  <p className="text-gray-600">
    Click to upload or drag & drop
  </p>

  <input
    id="voterImageInput"
    type="file"
    accept="image/png,image/jpeg,image/jpg"
    onChange={handleUpload}
    className="hidden"
  />
</div>


          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-32 h-32 mt-4 rounded border"
            />
          )}

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}

        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg"
          >
            {isSubmitting ? "Submitting..." : "Add Voter"}
          </button>
        </div>

      </div>
    </motion.div>
  );
}



