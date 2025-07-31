import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, FileSpreadsheet, AlertCircle, Eye } from "lucide-react";
import api from '../services/api';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(JSON.parse(sessionStorage.getItem('authUser')));
    const fetchApprovals = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/approvals');
        setApprovals(res.data.approvals || []);
      } catch (err) {
        setError('Failed to load approvals.');
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingItems = approvals.filter(a => a.status === 'pending');
  const approvedItems = approvals.filter(a => a.status === 'approved');
  const rejectedItems = approvals.filter(a => a.status === 'rejected');

  const handleApprove = async (approvalId) => {
    try {
      const res = await api.put(`/approvals/${approvalId}/approve`);
      setApprovals(prev => prev.map(a => a.id === approvalId ? res.data.approval : a));
    } catch (err) {
      setError('Failed to approve.');
    }
  };
  const handleReject = async (approvalId, rejection_reason = '') => {
    try {
      const res = await api.put(`/approvals/${approvalId}/reject`, { rejection_reason });
      setApprovals(prev => prev.map(a => a.id === approvalId ? res.data.approval : a));
    } catch (err) {
      setError('Failed to reject.');
    }
  };

  const confirmReject = async () => {
    if (rejectReason.trim()) {
      try {
        const res = await api.put(`/approvals/${rejectingId}/reject`, { rejection_reason: rejectReason });
        setApprovals(prev => prev.map(a => a.id === rejectingId ? res.data.approval : a));
        setShowRejectModal(false);
        setRejectReason("");
        setRejectingId(null);
      } catch (err) {
        setError('Failed to reject upload.');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Approvals</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingItems.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedItems.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedItems.length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingItems.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Approvals ({pendingItems.length})
          </h2>
          
          <div className="space-y-4">
            {pendingItems.map((approval) => (
              <div key={approval.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {approval.type === 'inventory_update' ? 'Inventory Update' : 'New Items Upload'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Uploaded by {approval.uploadedBy} on {formatDate(approval.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedApproval(approval)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleApprove(approval.id)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      className="btn-danger flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>File:</strong> {approval.fileName}</p>
                  <p><strong>Changes:</strong> {approval.changes?.length || 0} items</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Approvals History */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">All Approvals</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Uploaded By</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => (
                <tr key={approval.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      {approval.type === 'inventory_update' ? 'Inventory Update' : 'New Items'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{approval.uploadedBy}</td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(approval.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
                      {getStatusIcon(approval.status)}
                      {approval.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedApproval(approval)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Details Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Approval Details</h3>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{selectedApproval.type === 'inventory_update' ? 'Inventory Update' : 'New Items'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Uploaded By</p>
                  <p className="font-medium">{selectedApproval.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{formatDate(selectedApproval.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">File</p>
                  <p className="font-medium">{selectedApproval.fileName}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Changes:</h4>
                <div className="space-y-2">
                  {selectedApproval.changes?.map((change, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      {selectedApproval.type === 'inventory_update' ? (
                        <div>
                          <p className="font-medium">{change.itemName}</p>
                          <div className="text-sm text-gray-600 mt-1">
                            {Object.entries(change.updates).map(([key, value]) => (
                              <p key={key}>• {key}: {value}</p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">{change.item.name}</p>
                          <p className="text-sm text-gray-600">Category: {change.item.category}</p>
                          <p className="text-sm text-gray-600">Price: GHS {change.item.price}</p>
                          <p className="text-sm text-gray-600">Stock: {change.item.stock}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Reject Upload</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this upload:</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Enter rejection reason..."
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setRejectingId(null);
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 btn-danger disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals; 