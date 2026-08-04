import React, { useState,useEffect, useMemo } from 'react';
import { Search, Filter,Loader, FileText, User, Stethoscope, Calendar, Building2, ChevronDown, ChevronUp, Download, Eye, Clock, Pill, X, AlertCircle } from 'lucide-react';

const MedicalRecordPatient = ({ medicalRecord = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [loading , setLoading]=useState(true)





      useEffect(() => {
      if (medicalRecord.length > 0) {
        setLoading(false);
      }
    }, [medicalRecord]);
  const filteredRecords = useMemo(() => {
    let records = [...medicalRecord];

    // Filter by type
    if (filterType !== "all") {
      records = records.filter(record => record.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      records = records.filter((record) => (
        record?.type?.toLowerCase().includes(searchTerm) ||
        record?.doctorId?.userId?.name?.toLowerCase().includes(searchTerm) ||
        record?.medicine?.toLowerCase().includes(searchTerm) ||
        record?.description?.toLowerCase().includes(searchTerm) ||
        record?.doctorId?.hospitalId?.name?.toLowerCase().includes(searchTerm) ||
        record?.diagnosis?.toLowerCase().includes(searchTerm)
      ));
    }

    // Sort records
    records.sort((a, b) => {
      const dateA = new Date(a.prescribedAt || a.date);
      const dateB = new Date(b.prescribedAt || b.date);
      return sortBy === "date" ? dateB - dateA : dateA - dateB;
    });

    return records;
  }, [medicalRecord, searchQuery, filterType, sortBy]);

  const getRecordTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'consultation': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'emergency': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'surgery': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'follow-up': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getUniqueTypes = () => {
    const types = new Set(medicalRecord.map(record => record.type).filter(Boolean));
    return Array.from(types);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setShowFilters(false);
  };


  
    if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
          <p className="text-lg">Loading Medical records...</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto ">
        {/* Header */}
        

        {/* Header with Search */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Medical Records
              </h1>
            </div>
            <p className="text-gray-400">View and manage your medical history</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl pl-12 pr-10 py-3 text-white placeholder-gray-400 focus:border-emerald-500  focus:outline-none transition-all duration-300 w-80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>
                  {type?.charAt(0).toUpperCase() + type?.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="date">Newest First</option>
              <option value="date-asc">Oldest First</option>
            </select>

            {(filterType !== "all" || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Summary */}
          {searchQuery && (
            <div className="text-sm text-gray-400">
              {filteredRecords.length > 0
                ? `Found ${filteredRecords.length} record(s)`
                : `No records found`}
            </div>
          )}
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords?.map((record, index) => (
            <div
              key={record._id || index}
              className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRecordTypeColor(record.type)}`}>
                      {record.type?.charAt(0).toUpperCase() + record.type?.slice(1) || 'Consultation'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(record?.prescribedAt || record?.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedRecordId(expandedRecordId === record._id ? null : record._id)}
                    className="flex items-center cursor-pointer gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span className="text-sm">
                      {expandedRecordId === record._id ? 'Hide Details' : 'View Details'}
                    </span>
                    {expandedRecordId === record._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-3">
                    {record?.doctorId?.userId?.name && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <User className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{record.doctorId.userId.name}</p>
                          <p className="text-gray-400 text-sm">{record.doctorId.specialization}</p>
                        </div>
                      </div>
                    )}

                    {(record?.medicine || record?.diagnosis) && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Stethoscope className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wide">Diagnosis</p>
                          <p className="text-white font-medium">{record.medicine || record.diagnosis}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    {record?.doctorId?.hospitalId?.name && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <Building2 className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wide">Hospital</p>
                          <p className="text-white font-medium">{record.doctorId.hospitalId.name}</p>
                        </div>
                      </div>
                    )}

                    {record?.description && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <FileText className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wide">Description</p>
                          <p className="text-gray-300 text-sm">{record.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedRecordId === record._id && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Prescribed Medicines */}
                      {record?.medicines?.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Pill className="w-5 h-5 text-green-400" />
                            <h4 className="text-white font-semibold">Prescribed Medicines</h4>
                          </div>
                          <div className="space-y-3">
                            {record.medicines.map((med, idx) => (
                              <div key={idx} className="bg-white/5 rounded-lg p-3">
                                <p className="text-green-400 font-medium">{med.name}</p>
                                <div className="text-sm text-gray-300 mt-1 space-y-1">
                                  <p><span className="text-gray-400">Dosage:</span> {med.dosage}</p>
                                  <p><span className="text-gray-400">Frequency:</span> {med.frequency}</p>
                                  <p><span className="text-gray-400">Duration:</span> {med.duration}</p>
                                  {med.notes && <p><span className="text-gray-400">Notes:</span> {med.notes}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Doctor's Notes */}
                      {record?.notes && record.notes.trim() !== "" && (
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-blue-400" />
                            <h4 className="text-white font-semibold">Doctor's Notes</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty States */}
          {filteredRecords.length === 0 && !searchQuery && medicalRecord.length === 0 && (
            <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-500/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Medical Records</h3>
                <p className="text-gray-400">Your medical records will appear here once you have consultations with healthcare providers.</p>
              </div>
            </div>
          )}

          {filteredRecords.length === 0 && (searchQuery || filterType !== "all") && medicalRecord.length > 0 && (
            <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-500/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Records Found</h3>
                <p className="text-gray-400 mb-4">
                  No records match your current search criteria. Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordPatient;
