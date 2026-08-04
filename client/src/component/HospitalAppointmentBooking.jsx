import React, { useEffect, useState } from 'react';
import { MapPin, Clock, Phone, Star, Calendar, User,Loader, ChevronLeft, Compass, UserCheck, Contact, Search } from 'lucide-react';
import { getAllDoctorsbyHospitals } from '../services/hospitalsServices';
import { createAppointment } from '../services/patientServices';
import { toast } from 'sonner';

const HospitalAppointmentBooking = ({ hospitals = [] }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading , setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [bookingData, setBookingData] = useState({
    forPatient: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    contact: '',
    age : '',
    gender : '',
    mode : ''
  });

  // Filter hospitals based on search term
  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
  if (hospitals.length > 0) {
    setLoading(false);
  }
}, [hospitals]);



  const handleHospitalSelect = async (hospital) => {
  setSelectedHospital(hospital);
  setBookingData({
    forPatient: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    contact: '',
    age : '',
    gender : '',
    mode : ''
  });

  try {
    setLoading(true)
    const res = await getAllDoctorsbyHospitals(hospital._id);
    console.log(res)
    setDoctors(res.doctors);

  } catch (error) {
    console.error("Error fetching doctors:", error);
  }
  finally{
    setLoading(false)
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
      age : '',
      gender : '',
      mode : ''
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
        doctorId: bookingData.doctorId ,
        hospitalId: selectedHospital._id,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        status: 'booked',
        contact: bookingData.contact,
        age : bookingData.age,
        gender : bookingData.gender,
        mode : bookingData.mode
      };

      const response = await createAppointment(appointmentData);
      if(response){
        console.log(response)
      }

      toast.success("Appointment Booked Successfully 🩺")
      
      // Reset form
      setBookingData({
        forPatient: '',
        doctorId: '',
        date: '',
        timeSlot: '',
        contact : '',
        age : '',
        gender : '',
        mode : ''
      });
      
      handleBackToList();
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  // Show message if no hospitals provided
if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center text-white flex flex-col items-center">
        <Loader className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="text-lg">Loading nearby hospitals...</p>
      </div>
    </div>
  );
}

if (!hospitals || hospitals.length === 0) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">No Hospitals Available</h2>
        <p className="text-gray-300">Please provide hospitals data to display the list.</p>
      </div>
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
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent mb-4">
                Nearby Hospitals
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Select a hospital to book an appointment and receive quality healthcare
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full mx-auto mt-4" />
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-emerald-700" />
                </div>
                <input
                  type="text"
                  placeholder="Search hospitals by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/40  border border-gray-700/30 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300"
                />
              </div>
            </div>
            
            {/* Hospital Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHospitals.map((hospital) => (
                <div
                  key={hospital._id}
                  className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/80 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-500/10"
                  onClick={() => handleHospitalSelect(hospital)}
                >
                  {/* <div className="aspect-video bg-gray-700/50 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={hospital.image} 
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                    />
                  </div> */}
                  
                  {/* Gradient overlay for premium effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Hospital name with premium styling */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-50 transition-colors duration-300">
                        {hospital.name}
                      </h3>
                      {/* <div className="w-12 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:w-20" /> */}
                    </div>

                    {/* Info items with enhanced styling */}
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
                            {(hospital.distance/1000).toFixed(2)} km away
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

                      {/* Rating */}
                      {/* <div className="flex items-center text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-amber-500/20 transition-all duration-300">
                          <Star className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="text-sm font-semibold text-white">{hospital.rating}</p>
                        </div>
                      </div> */}
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

            {/* No results message */}
            {searchTerm && filteredHospitals.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No hospitals found</h3>
                  <p>No hospitals match your search for "{searchTerm}"</p>
                </div>
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
                    <option value="online">Offline</option>
                    <option value="offline">Online</option>
                    
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