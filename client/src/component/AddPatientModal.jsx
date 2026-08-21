import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  Clock,
  Stethoscope,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllDoctorsbyHospitals } from '../services/hospitalsServices';
import { addPatientToDoctor } from '../services/hospitalsServices';

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
];

const INITIAL_FORM = {
  name: '',
  phone: '',
  age: '',
  gender: '',
  doctorId: '',
  date: '',
  timeSlot: '',
  mode: '',
};

const AddPatientModal = ({ isOpen, onClose, onSuccess, hospitalId }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch approved doctors for this hospital
  useEffect(() => {
    if (!isOpen || !hospitalId) return;

    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await getAllDoctorsbyHospitals(hospitalId);
        setDoctors(res?.doctors || []);
      } catch {
        toast.error('Failed to load doctors');
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [isOpen, hospitalId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_FORM);
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = 'Enter a valid 10-digit Indian phone number';
    if (!form.age || isNaN(form.age) || form.age < 1 || form.age > 120) newErrors.age = 'Enter a valid age (1–120)';
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.doctorId) newErrors.doctorId = 'Please select a doctor';
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.timeSlot) newErrors.timeSlot = 'Time slot is required';
    if (!form.mode) newErrors.mode = 'Mode is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await addPatientToDoctor({
        name: form.name.trim(),
        phone: form.phone.trim(),
        age: form.age.toString(),
        gender: form.gender,
        doctorId: form.doctorId,
        date: form.date,
        timeSlot: form.timeSlot,
        mode: form.mode,
      });
      toast.success('Patient added successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.error || 'Failed to add patient';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Patient to Doctor</h2>
              <p className="text-xs text-gray-400">Register a walk-in patient without an account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Patient Name" error={errors.name}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className={inputCls(errors.name) + ' pl-9'}
                />
              </div>
            </Field>

            <Field label="Phone Number" error={errors.phone}>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  className={inputCls(errors.phone) + ' pl-9'}
                />
              </div>
            </Field>
          </div>

          {/* Age + Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Age" error={errors.age}>
              <input
                name="age"
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={handleChange}
                placeholder="Years"
                className={inputCls(errors.age)}
              />
            </Field>

            <Field label="Gender" error={errors.gender}>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={selectCls(errors.gender)}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>

          {/* Doctor */}
          <Field label="Assign to Doctor" error={errors.doctorId}>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              {loadingDoctors ? (
                <div className="flex items-center gap-2 px-9 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading doctors...
                </div>
              ) : (
                <select
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleChange}
                  className={selectCls(errors.doctorId) + ' pl-9'}
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.doctorId} value={doc.doctorId}>
                      {doc.name} — {doc.specialization}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </Field>

          {/* Date + Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Appointment Date" error={errors.date}>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls(errors.date) + ' pl-9'}
                />
              </div>
            </Field>

            <Field label="Time Slot" error={errors.timeSlot}>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  name="timeSlot"
                  value={form.timeSlot}
                  onChange={handleChange}
                  className={selectCls(errors.timeSlot) + ' pl-9'}
                >
                  <option value="">Select time</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </Field>
          </div>

          {/* Mode */}
          <Field label="Appointment Mode" error={errors.mode}>
            <div className="flex gap-3">
              {['offline', 'online'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, mode: m }));
                    if (errors.mode) setErrors((prev) => ({ ...prev, mode: undefined }));
                  }}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium capitalize transition-all duration-200 ${
                    form.mode === m
                      ? m === 'offline'
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                        : 'bg-blue-500/20 border-blue-500/60 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                  }`}
                >
                  {m === 'offline' ? '🏥 In-Person' : '💻 Online'}
                </button>
              ))}
            </div>
            {errors.mode && <p className="text-red-400 text-xs mt-1">{errors.mode}</p>}
          </Field>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Add Patient</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────
const inputCls = (error) =>
  `w-full px-3 py-2.5 rounded-lg bg-gray-800/60 border text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition ${
    error
      ? 'border-red-500/60 focus:ring-red-500/30'
      : 'border-gray-700 focus:ring-blue-500/30 focus:border-blue-500/50'
  }`;

const selectCls = (error) =>
  `w-full px-3 py-2.5 rounded-lg bg-gray-800/60 border text-sm text-white focus:outline-none focus:ring-2 transition appearance-none ${
    error
      ? 'border-red-500/60 focus:ring-red-500/30'
      : 'border-gray-700 focus:ring-blue-500/30 focus:border-blue-500/50'
  }`;

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

export default AddPatientModal;
