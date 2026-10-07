import React, { useEffect, useState } from 'react';
import { MapPin, Clock, Phone, Star, Calendar, User,Loader, ChevronLeft, Compass, UserCheck, Contact, Search } from 'lucide-react';
import { getAllDoctorsbyHospitals } from '../services/hospitalsServices';
import { createAppointment } from '../services/patientServices';
import { toast } from 'sonner';

const HospitalAppointmentBooking = ({ hospitals = [], loading = false }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rangeKm, setRangeKm] = useState(500);
  const [isUnlimited, setIsUnlimited] = useState(false);

  const [bookingData, setBookingData] = useState({
    forPatient: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    contact: '',
    age: '',
    gender: '',
    mode: ''
  });

  // Filter hospitals based on search term & distance range
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch =
      (hospital.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hospital.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesRange = true;
    if (!isUnlimited) {
      if (hospital.distance !== undefined && hospital.distance !== null) {
        matchesRange = (hospital.distance / 1000) <= rangeKm;
      }
    }

    return matchesSearch && matchesRange;
  });

  const handleHospitalSelect = async (hospital) => {
    setSelectedHospital(hospital);
    setBookingData({
      forPatient: '',
      doctorId: '',
      date: '',
      timeSlot: '',
      contact: '',
      age: '',
      gender: '',
      mode: ''
    });

    try {
      setDoctorsLoading(true);
      const res = await getAllDoctorsbyHospitals(hospital._id);
      console.log(res);
      setDoctors(res.doctors || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedHospital(null);
    setBookingData({
      forPatient: '',
      doctorId: '',
      date: '',
      timeSlot: '',
      contact: '',
      age: '',
      gender: '',
      mode: ''
    });
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBookAppointment = async () => {
    try {
      if (!bookingData.doctorId || !bookingData.date || !bookingData.timeSlot || !bookingData.contact) {
        alert('Please fill in all required fields');
        return;
      }

      const appointmentData = {
        forPatient: {
          type: bookingData.forPatient
        },
        doctorId: bookingData.doctorId,
        hospitalId: selectedHospital._id,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        status: 'booked',
        contact: bookingData.contact,
        age: bookingData.age,
        gender: bookingData.gender,
        mode: bookingData.mode
      };

      const response = await createAppointment(appointmentData);
      if (response) {
        console.log(response);
      }

      toast.success("Appointment Booked Successfully 🩺", {
        duration: 3000,
        className: "doctor-toast",
      });

      // Reset form
      setBookingData({
        forPatient: '',
        doctorId: '',
        date: '',
        timeSlot: '',
        contact: '',
        age: '',
        gender: '',
        mode: ''
      });

      handleBackToList();

    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="text-center text-white flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
          <p className="text-lg">Loading nearby hospitals...</p>
        </div>
      </div>
    );
  }

  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="py-20 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">No Hospitals Available</h2>
        <p className="text-gray-300">No hospitals were found in your area.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        {!selectedHospital ? (
          // Hospital List View
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent mb-4">
                Nearby Hospitals
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Select a hospital to book an appointment and receive quality healthcare
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
                  placeholder="Search hospitals by name or address..."
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
            
            {/* Hospital Cards Grid */}
            {filteredHospitals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHospitals.map((hospital) => (
                  <div
                    key={hospital._id}
                    className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/80 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-500/10"
                    onClick={() => handleHospitalSelect(hospital)}
                  >
                    {/* Gradient overlay for premium effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Hospital name */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-50 transition-colors duration-300">
                          {hospital.name}
                        </h3>
                      </div>

                      {/* Info items */}
                      <div className="space-y-4 mb-6">
                        {/* Address */}
                        <div className="flex items-start text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                          <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-emerald-500/20 transition-all duration-300">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="flex-1 pt-2">
                            <p className="text-sm font-medium leading-relaxed">{hospital.address}</p>
                          </div>
                        </div>

                        {/* Distance */}
                        <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-500/20 transition-all duration-300">
                            <Compass className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1 pt-2">
                            <p className="text-sm font-medium">
                              {hospital.distance !== undefined && hospital.distance !== null
                                ? `${(hospital.distance / 1000).toFixed(2)} km away`
                                : 'Nearby'}
                            </p>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                          <div className="flex-shrink-0 w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-500/20 transition-all duration-300">
                            <Phone className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1 pt-2">
                            <p className="text-sm font-medium">{hospital.phone}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Specialties */}
                      {hospital.specialties && hospital.specialties.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Specialties
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {hospital.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/20 group-hover:border-emerald-400/30 transition-all duration-300"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  </div>
                ))}
              </div>
            ) : (
              /* No matches found state */
              <div className="text-center py-16 bg-gray-800/30 border border-gray-700/40 rounded-2xl p-8 max-w-xl mx-auto">
                <Search className="w-16 h-16 mx-auto mb-4 text-emerald-400/50 opacity-70" />
                <h3 className="text-2xl font-bold text-white mb-2">No Hospitals Match Your Filter</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {searchTerm && !isUnlimited
                    ? `No hospitals matching "${searchTerm}" found within ${rangeKm} km.`
                    : !isUnlimited
                    ? `No hospitals found within ${rangeKm} km radius.`
                    : `No hospitals matching "${searchTerm}" found.`}
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setIsUnlimited(true); }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                >
                  Clear Filters / Show All Hospitals
                </button>
              </div>
            )}
          </div>
        ) : (
          // Appointment Booking Form
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <button
                onClick={handleBackToList}
                className="flex items-center text-gray-300 hover:text-white mr-4"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Hospitals
              </button>
            </div>
            
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <div className="flex items-center mb-6">
                {/* <div className="w-16 h-16 bg-gray-700/50 rounded-lg overflow-hidden mr-4">
                  <img 
                    src={"https://static.vecteezy.com/system/resources/previews/004/493/181/original/hospital-building-for-healthcare-background-illustration-with-ambulance-car-doctor-patient-nurses-and-medical-clinic-exterior-free-vector.jpg"} 
                    alt={selectedHospital.name}
                    className="w-full h-full object-cover"
                  />
                </div> */}
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedHospital.name}</h2>
                  <p className="text-gray-300">{selectedHospital.address}</p>
                </div>
              </div>
              
              
              <h3 className="text-xl font-bold text-blue-400 mb-6">Book an Appointment</h3> 
              
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    Appointment For
                  </label>
                  <select 
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                    value={bookingData.forPatient}
                    onChange={(e) => handleInputChange('forPatient', e.target.value)}
                  >

                    <option value="">Type</option>
                    <option value="self">Self</option>
                    <option value="family">Family Member</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Select Doctor
                  </label>
                  <select 
                    className="w-full bg-gray-800 border rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                    value={bookingData.doctorId}
                    onChange={(e) => handleInputChange('doctorId', e.target.value)}
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctorId} value={doctor.doctorId}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div>

  {/* Patient Gender */}
                <div>
                  <label className="block text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    className="w-full bg-gray-800 border rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                    value={bookingData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select gender...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

                <div>
                <label className="block text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-gray-800 border rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                  placeholder="Enter age"
                  value={bookingData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
              </div>
                            
                
                <div>
                  <label className="block text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Preferred Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                    value={bookingData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    <Contact className="w-4 h-4 inline mr-1" />
                    Contact
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                    value={bookingData.contact}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only digits and max 10
                      if (/^\d{0,10}$/.test(value)) {
                        handleInputChange('contact', value);
                      }
                    }}
                    placeholder="Enter 10-digit number"
                  />
                </div>

                
                <div>
                  <label className="block text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time Slot
                  </label>
                  <select 
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                    value={bookingData.timeSlot}
                    onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                  >
                    <option value="">Select time slot...</option>
                    <option value="9:00 AM - 9:30 AM">9:00 AM - 9:30 AM</option>
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                    <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                    <option value="2:00 PM - 2:30 PM">2:00 PM - 2:30 PM</option>
                    <option value="3:00 PM - 3:30 PM">3:00 PM - 3:30 PM</option>
                    <option value="4:00 PM - 4:30 PM">4:00 PM - 4:30 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Mode
                  </label>
                  <select 
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                    value={bookingData.mode}
                    onChange={(e) => handleInputChange('mode', e.target.value)}
                  >
                    <option value="">Select Mode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  onClick={handleBookAppointment}
                  className="mt-6 flex flex-row bg-gradient-to-r from-green-600 to-green-500 text-black font-bold 
            px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-600 border border-green-500/30
             transition-all duration-300 hover:shadow-green-500/30 hover:scale-105"
                >
                  <Calendar className="w-4 h-4 mr-2 mt-1 text-black font-bold" />
                  Book Appointment
                </button>
                <button 
                  onClick={handleBackToList}
                  className="mt-6  text-black font-bold bg-neutral-600
            px-6 py-3 rounded-lg
             transition-all duration-300 hover:shadow-green-500/30 hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalAppointmentBooking;