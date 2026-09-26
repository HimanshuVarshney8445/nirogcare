import React, { useState } from 'react';
import { User, CheckCircle, XCircle, Phone, Mail, Search } from 'lucide-react';

const AllAssistants = ({ data, onVerificationChange }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!data || !Array.isArray(data)) {
    return (
      <div className="p-6 text-center text-gray-400">
        No assistant data available
      </div>
    );
  }

  // Filter assistants based on name/email of assistant or doctor
  const filteredData = data.filter((assistant) => {
    const assistantName = assistant?.userId?.name?.toLowerCase() || "";
    const assistantEmail = assistant?.userId?.email?.toLowerCase() || "";
    const doctorName = assistant?.doctorId?.userId?.name?.toLowerCase() || "";
    const doctorEmail = assistant?.doctorId?.userId?.email?.toLowerCase() || "";

    const term = searchTerm.toLowerCase();
    return (
      assistantName.includes(term) ||
      assistantEmail.includes(term) ||
      doctorName.includes(term) ||
      doctorEmail.includes(term)
    );
  });

  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">All Assistants</h1>
          <div className="relative w-full md:w-96">
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by assistant or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>
        </div>

        {/* Assistant List */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">No assistants found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredData.map((assistant, index) => (
              (() => {
                const approvalStatus = assistant.approvalStatus || (assistant.isVerified ? 'approved' : 'pending');
                return <div key={assistant._id || index} className="bg-gray-950 rounded-lg shadow-xl p-6 border border-gray-700">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Assistant Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-400" />
                        Assistant Information
                      </h2>
                      <div className="flex items-center gap-2">
                        {assistant.isVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${approvalStatus === 'approved' ? 'text-green-600' : approvalStatus === 'rejected' ? 'text-red-600' : 'text-yellow-400'}`}>
                          {approvalStatus === 'approved' ? 'Approved' : approvalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="font-medium text-white">{assistant.userId?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-300">Assistant ID: {assistant._id}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="h-4 w-4" />
                        {assistant.userId?.email || 'N/A'}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Phone className="h-4 w-4" />
                        {assistant.userId?.phone || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-green-400" />
                      Associated Doctor
                    </h3>

                    <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="font-medium text-white">{assistant.doctorId?.userId?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-300">Doctor ID: {assistant.doctorId?._id}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="h-4 w-4" />
                        {assistant.doctorId?.userId?.email || 'N/A'}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-200">Gender:</span>
                          <p className="text-gray-300 capitalize">{assistant.doctorId?.gender || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-200">Specialization:</span>
                          <p className="text-gray-300">{assistant.doctorId?.specialization || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {approvalStatus !== 'approved' && (
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => onVerificationChange(assistant._id, 'approved')} className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 py-2 rounded-lg">Approve Assistant</button>
                    {approvalStatus !== 'rejected' && <button onClick={() => onVerificationChange(assistant._id, 'rejected')} className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 py-2 rounded-lg">Reject Assistant</button>}
                  </div>
                )}

                {/* Hospital ID */}
                <div className="mt-6 pt-6 border-t border-gray-600">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="font-medium">Hospital ID:</span>
                    <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs font-mono">
                      {assistant.hospitalId}
                    </span>
                  </div>
                </div>
                </div>;
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAssistants;
