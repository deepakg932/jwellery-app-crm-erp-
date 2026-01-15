// pages/SalesReturnPage.jsx
import React, { useState } from "react";
import {
  FiPackage,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import useSalesReturn from "@/hooks/useSalesReturn";
import ReturnDetailsModal from "./ReturnDetailsModal";

const SalesReturnPage = () => {
  const {
    saleReturns,
    loading,
    error,
    fetchSaleReturns,
    updateSaleReturnStatus,
  } = useSalesReturn();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter returns
  const filteredReturns = saleReturns.filter(returnItem => {
    const matchesSearch = 
      returnItem.return_number?.toLowerCase().includes(search.toLowerCase()) ||
      returnItem.sale_number?.toLowerCase().includes(search.toLowerCase()) ||
      returnItem.customer_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status badge colors
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "badge bg-success";
      case "rejected":
        return "badge bg-danger";
      case "pending":
        return "badge bg-warning";
      case "completed":
        return "badge bg-primary";
      default:
        return "badge bg-secondary";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN")}`;
  };

  // Handle status update
  const handleStatusUpdate = async (returnId, newStatus) => {
    try {
      await updateSaleReturnStatus(returnId, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">
                <FiPackage className="me-2" />
                Sales Returns
              </h1>
              <p className="text-muted mb-0">
                Manage sales returns and refunds
              </p>
            </div>
            <div className="col-md-6 text-end">
              <button
                className="btn btn-outline-secondary me-2"
                onClick={fetchSaleReturns}
                disabled={loading}
              >
                Refresh
              </button>
              <button className="btn btn-outline-primary">
                <FiDownload className="me-1" />
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by return no, sale no, or customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text">
                  <FiFilter />
                </span>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FiPackage size={48} className="mb-3" />
              <p>No sales returns found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Return No.</th>
                    <th>Sale No.</th>
                    <th>Customer</th>
                    <th>Return Date</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.map((returnItem) => (
                    <tr key={returnItem._id}>
                      <td>
                        <div className="fw-bold text-primary">
                          {returnItem.return_number}
                        </div>
                        <small className="text-muted">
                          Ref: {returnItem.reference_no}
                        </small>
                      </td>
                      <td>
                        <div className="fw-medium">
                          {returnItem.sale_number}
                        </div>
                      </td>
                      <td>
                        <div>{returnItem.customer_name}</div>
                      </td>
                      <td>{formatDate(returnItem.return_date)}</td>
                      <td>
                        <div className="small">
                          {returnItem.items.length} item(s)
                        </div>
                      </td>
                      <td className="fw-bold">
                        {formatCurrency(returnItem.refund_amount)}
                      </td>
                      <td>
                        <span className={getStatusBadge(returnItem.status)}>
                          {returnItem.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-info"
                            onClick={() => {
                              setSelectedReturn(returnItem);
                              setShowDetailsModal(true);
                            }}
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          
                          {returnItem.status === "pending" && (
                            <>
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleStatusUpdate(returnItem._id, "approved")}
                                title="Approve"
                              >
                                <FiCheckCircle />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleStatusUpdate(returnItem._id, "rejected")}
                                title="Reject"
                              >
                                <FiXCircle />
                              </button>
                            </>
                          )}
                          
                          {returnItem.status === "approved" && (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleStatusUpdate(returnItem._id, "completed")}
                              title="Mark as Completed"
                            >
                              <FiClock />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReturn && (
        <ReturnDetailsModal
          returnItem={selectedReturn}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedReturn(null);
          }}
        />
      )}
    </div>
  );
};

export default SalesReturnPage;