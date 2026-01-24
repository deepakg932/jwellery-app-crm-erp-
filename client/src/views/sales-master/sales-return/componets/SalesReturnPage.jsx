// pages/SalesReturnPage.jsx
import React, { useState, useEffect } from "react";
import {
  FiPackage,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrash2,
  FiEdit,
  FiAlertCircle,
} from "react-icons/fi";
import useSalesReturn from "@/hooks/useSalesReturn";
import ReturnDetailsModal from "./ReturnDetailsModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const SalesReturnPage = () => {
  const {
    saleReturns,
    loading,
    error,
    fetchSaleReturns,
    updateSaleReturnStatus,
    deleteSaleReturn,
  } = useSalesReturn();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [returnToDelete, setReturnToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filter returns - FIXED to handle customer_name from nested object
  const filteredReturns = saleReturns.filter((returnItem) => {
    const customerName =
      returnItem.customer_name ||
      (returnItem.customer_id && returnItem.customer_id.name) ||
      "Unknown Customer";

    const matchesSearch =
      returnItem.return_number?.toLowerCase().includes(search.toLowerCase()) ||
      returnItem.sale_number?.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || returnItem.status === statusFilter;

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
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get customer name from return item
  const getCustomerName = (returnItem) => {
    if (returnItem.customer_name) return returnItem.customer_name;
    if (returnItem.customer_id?.name) return returnItem.customer_id.name;
    return "Unknown Customer";
  };

  // Handle delete click
  const handleDeleteClick = (returnItem) => {
    setReturnToDelete(returnItem);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!returnToDelete) return;

    try {
      console.log("Confirming delete for:", returnToDelete._id);
      setDeleteLoading(true);
      setDeleteError(null);

      // Call delete function from hook
      await deleteSaleReturn(returnToDelete._id);

      // Success - refresh the list to get updated data
      await fetchSaleReturns();

      // Show success message
      setSuccessMessage(
        `Return ${returnToDelete.return_number} deleted successfully!`
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Close modal
      setShowDeleteModal(false);
      setReturnToDelete(null);
    } catch (err) {
      console.error("Delete failed with error:", err);
      setDeleteError(err.message || "Failed to delete return");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setReturnToDelete(null);
    setDeleteError(null);
  };

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="container-fluid py-4">
      {/* Success and Error Messages */}
      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show mb-4"
          role="alert"
        >
          <FiCheckCircle className="me-2" />
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage(null)}
          ></button>
        </div>
      )}

      {deleteError && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-4"
          role="alert"
        >
          <FiAlertCircle className="me-2" />
          {deleteError}
          <button
            type="button"
            className="btn-close"
            onClick={() => setDeleteError(null)}
          ></button>
        </div>
      )}

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
            <div className="col-md-5">
              <div className="d-flex justify-content-end align-items-center">
                <small className="text-muted me-3">
                  Showing {filteredReturns.length} of {saleReturns.length}{" "}
                  returns
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading sales returns...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-4">{error}</div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FiPackage size={48} className="mb-3 opacity-50" />
              <h5>No sales returns found</h5>
              <p className="mb-0">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No returns have been created yet"}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Return No.</th>
                    <th>Sale No.</th>
                    <th>Customer</th>
                    <th>Return Date</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.map((returnItem) => (
                    <tr key={returnItem._id}>
                      <td className="ps-4">
                        <div className="fw-bold text-primary">
                          {returnItem.return_number || "N/A"}
                        </div>
                        {returnItem.reference_no && (
                          <small className="text-muted d-block">
                            Ref: {returnItem.reference_no}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="fw-medium">
                          {returnItem.sale_number || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div>{getCustomerName(returnItem)}</div>
                        {returnItem.customer_id?.mobile && (
                          <small className="text-muted d-block">
                            {returnItem.customer_id.mobile}
                          </small>
                        )}
                      </td>
                      <td>{formatDate(returnItem.return_date)}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="small">
                            {returnItem.items?.length || 0} item(s)
                          </span>
                          {returnItem.items?.length > 0 && (
                            <small className="text-muted">
                              {returnItem.items[0]?.product_id?.name || "Item"}
                              ...
                            </small>
                          )}
                        </div>
                      </td>
                      <td className="fw-bold">
                        {formatCurrency(returnItem.refund_amount)}
                      </td>
                      <td>
                        <span
                          className={`${getStatusBadge(
                            returnItem.status
                          )} text-uppercase`}
                        >
                          {returnItem.status}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
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

                          {/* DELETE BUTTON - ALWAYS SHOW FOR ALL STATUS */}
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteClick(returnItem)}
                            title={`Delete Return (Status: ${returnItem.status})`}
                            disabled={deleteLoading}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {filteredReturns.length > 0 && (
            <div className="table-footer p-3 border-top">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <small className="text-muted">
                    Last updated: {new Date().toLocaleTimeString("en-IN")}
                  </small>
                </div>
                <div className="col-md-6 text-end">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchSaleReturns}
                    disabled={loading}
                  >
                    <FiClock className="me-1" />
                    Refresh
                  </button>
                </div>
              </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && returnToDelete && (
        <DeleteConfirmationModal
          show={showDeleteModal}
          onHide={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
          title="Delete Sale Return"
          message={
            <div>
              <p>
                Are you sure you want to delete return{" "}
                <strong>{returnToDelete.return_number}</strong>?
              </p>
              <div className="alert alert-warning mt-2 mb-0 p-2 small">
                <FiAlertCircle className="me-1" />
                <div>
                  <strong>Status:</strong> {returnToDelete.status.toUpperCase()}
                </div>
                <div>
                  <strong>Customer:</strong> {getCustomerName(returnToDelete)}
                </div>
                <div>
                  <strong>Amount:</strong>{" "}
                  {formatCurrency(returnToDelete.refund_amount)}
                </div>
                <div className="mt-1">
                  This action cannot be undone. All associated data will be
                  permanently removed.
                </div>
              </div>
            </div>
          }
          confirmText={deleteLoading ? "Deleting..." : "Delete"}
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default SalesReturnPage;
