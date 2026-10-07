import React, { useEffect, useState } from 'react';
import { MapPin, Clock, Phone, Calendar,Search, ChevronLeft,Loader, FileText, Compass, User } from 'lucide-react';
import {toast} from "sonner"
import {createAppointmentLab} from "../services/patientServices"

const LabAppointmentBooking = ({ labs = [], loading = false }) => {
  const [selectedLab, setSelectedLab] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rangeKm, setRangeKm] = useState(500);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [formData, setFormData] = useState({
    testName: '',
    testType: '',
    date: '',
    time: '',
    notes: '',
    forPatientType: 'self'
  });

  const handleLabSelect = (lab) => setSelectedLab(lab);

  const handleBack = () => {
    setSelectedLab(null);
    setFormData({ 
      testName: '', 
      testType: '', 
      date: '', 
      time: '', 
      notes: '',
      forPatientType: 'self'
    });
  };

  const filteredLabs = labs.filter(lab => {
    const matchesSearch =
      (lab.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lab.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesRange = true;
    if (!isUnlimited) {
      if (lab.distance !== undefined && lab.distance !== null) {
        matchesRange = (lab.distance / 1000) <= rangeKm;
      }
    }

    return matchesSearch && matchesRange;
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBookTest = async () => {
    if (!formData.testName || !formData.testType || !formData.date || !formData.time) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const appointmentData = {
        forPatientType: formData.forPatientType,
        labId: selectedLab._id,
        testDetails: {
          testName: formData.testName,
          testType: formData.testType,
        },
        scheduledDate: formData.date,
        timeSlot: formData.time,
        notes: formData.notes || undefined,
      };

      const response = await createAppointmentLab(appointmentData);
      if (response?.success || response?.appointment || response?.message) {
        toast.success("Lab Test Booked Successfully! 🧪", {
          duration: 3000,
          className: "doctor-toast",
        });
        handleBack();
      } else {
        toast.error("Failed to book appointment. Please try again.");
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error?.message || 'Failed to book appointment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="text-center text-white flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
          <p className="text-lg">Loading nearby Labs...</p>
        </div>
      </div>
    );
  }

  if (!labs || labs.length === 0) {
    return (
      <div className="py-20 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">No Labs Available</h2>
        <p className="text-gray-300">No labs were found in your area.</p>
      </div>
    );
  }

  return (
    <div>
      {!selectedLab ? (
        <>
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent mb-4">
              Nearby Labs
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Select a lab for checkups
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full mx-auto mt-4" />
          </div>

          {/* Search Bar & Range Filters */}
          <div className="max-w-3xl mx-auto mb-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-emerald-400" />
              </div>
              <input
                type="text"
                placeholder="Search labs by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300"
              />
            </div>

            {/* Dynamic Range Slider Volume Bar */}
            <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 backdrop-blur-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-gray-300 font-medium text-sm">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <span>Preferred Range:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl text-sm">
                    {isUnlimited ? 'All Distances' : `Within ${rangeKm} km`}
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[10, 50, 100, 250, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setRangeKm(val);
                        setIsUnlimited(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        !isUnlimited && rangeKm === val
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-400/40'
                          : 'bg-gray-700/40 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600/30'
                      }`}
                    >
                      {val} km
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsUnlimited(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isUnlimited
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-400/40'
                        : 'bg-gray-700/40 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600/30'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Range Slider Track */}
              <div className="space-y-1.5">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={isUnlimited ? 500 : rangeKm}
                    onChange={(e) => {
                      setRangeKm(Number(e.target.value));
                      setIsUnlimited(false);
                    }}
                    className="w-full h-2.5 rounded-lg appearance-none cursor-pointer transition-all duration-300 accent-emerald-400 bg-gray-700"
                    style={{
                      background: isUnlimited
                        ? `linear-gradient(to right, #10b981 0%, #06b6d4 100%)`
                        : `linear-gradient(to right, #10b981 0%, #06b6d4 ${(rangeKm / 500) * 100}%, #374151 ${(rangeKm / 500) * 100}%, #374151 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 font-medium px-1">
                  <span>1 km</span>
                  <span>100 km</span>
                  <span>250 km</span>
                  <span>375 km</span>
                  <span>500 km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Labs Cards Grid */}
          {filteredLabs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLabs.map((lab) => (
                <div
                  key={lab._id}
                  className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/80 transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-500/10"
                  onClick={() => handleLabSelect(lab)}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-50 transition-colors duration-300">
                        {lab.name}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Address */}
                      <div className="flex items-start text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                        <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-emerald-500/20 transition-all duration-300">
                          <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="text-sm font-medium leading-relaxed">{lab.address}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-500/20 transition-all duration-300">
                          <Phone className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="text-sm font-medium">{lab.phone}</p>
                        </div>
                      </div>

                      {/* Distance */}
                      <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-500/20 transition-all duration-300">
                          <Compass className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="text-sm font-medium">
                            {lab.distance !== undefined && lab.distance !== null
                              ? `${(lab.distance / 1000).toFixed(2)} km away`
                              : 'Nearby'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-blue-500/0 opacity-0 group-hover:opacity-200 transition-opacity duration-500 blur-2xl" />
                </div>
              ))}
            </div>
          ) : (
            /* No matches found state */
            <div className="text-center py-16 bg-gray-800/30 border border-gray-700/40 rounded-2xl p-8 max-w-xl mx-auto">
              <Search className="w-16 h-16 mx-auto mb-4 text-emerald-400/50 opacity-70" />
              <h3 className="text-2xl font-bold text-white mb-2">No Labs Match Your Filter</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {searchTerm && !isUnlimited
                  ? `No labs matching "${searchTerm}" found within ${rangeKm} km.`
                  : !isUnlimited
                  ? `No labs found within ${rangeKm} km radius.`
                  : `No labs matching "${searchTerm}" found.`}
              </p>
              <button
                onClick={() => { setSearchTerm(''); setIsUnlimited(true); }}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
              >
                Clear Filters / Show All Labs
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
          <button onClick={handleBack} className="flex items-center text-gray-300 hover:text-white mb-6">
            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Labs
          </button>

          <h2 className="text-2xl text-white font-bold mb-4">{selectedLab.name}</h2>
          <p className="text-gray-400 mb-6">{selectedLab.address}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Type Selection */}
            <div>
              <label className="block text-gray-300 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Booking For *
              </label>
              <select
                value={formData.forPatientType}
                onChange={(e) => handleInputChange('forPatientType', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white"
              >
                <option value="self">Self</option>
                <option value="familyMember">Family Member</option>
              </select>
            </div>

            {/* Test Name */}
            <div>
              <label className="block text-gray-300 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Test Name *
              </label>
              <input
                type="text"
                value={formData.testName}
                onChange={(e) => handleInputChange('testName', e.target.value)}
                placeholder="Enter test name (e.g., Complete Blood Count)"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400"
              />
            </div>

            {/* Test Type */}
            <div>
              <label className="block text-gray-300 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Test Type *
              </label>
              <select
                value={formData.testType}
                onChange={(e) => handleInputChange('testType', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white"
              >
                <option value="">Choose a test...</option>
                {selectedLab.testTypes?.map((test, index) => (
                  <option key={index} value={test}>
                    {test}
                  </option>
                ))}
              </select>

            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Preferred Date *
              </label>
              <input
                type="date"
                value={formData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-gray-300 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Preferred Time *
              </label>
              <select
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white"
              >
                <option value="">Choose time...</option>
                <option value="8:00 AM">8:00 AM</option>
                <option value="9:00 AM">9:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="1:00 PM">1:00 PM</option>
                <option value="2:00 PM">2:00 PM</option>
                <option value="3:00 PM">3:00 PM</option>
                <option value="4:00 PM">4:00 PM</option>
                <option value="5:00 PM">5:00 PM</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-gray-300 mb-2">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special instructions or requirements..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400"
              rows="2"
            />
          </div>

          <button
            onClick={handleBookTest}
            className="mt-6 flex bg-gradient-to-r from-green-600 to-green-500 text-black font-bold 
            px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-600 border border-green-500/30
             transition-all duration-300 hover:shadow-green-500/30 hover:scale-105"
          >
            <Calendar className="w-4 h-4 mr-2 mt-1 text-black font-bold" />
            Book Lab Test
          </button>
        </div>
      )}
    </div>
  );
};

export { LabAppointmentBooking };