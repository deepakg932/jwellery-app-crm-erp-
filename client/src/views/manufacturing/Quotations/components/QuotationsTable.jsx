// components/quotations/QuotationsTable.jsx
import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiEye,
  FiFileText,
  FiCheckCircle,
  FiPrinter,
  FiMail,
  FiCopy,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddQuotationForm from "./AddQuotationForm";
import EditQuotationForm from "./EditQuotationForm";
import useQuotations from "@/hooks/useQuotations";

const QuotationsTable = () => {
  const {
    quotations,
    customers,
    items,
    branches,
    loading,
    error,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    fetchQuotations,
    convertToSale,
  } = useQuotations();
console.log(quotations)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
    { value: "converted", label: "Converted" },
  ];

  // Filter quotations
  const filteredQuotations = quotations.filter((quotation) => {
    // Search filter
    const matchesSearch =
      search === "" ||
      quotation.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      quotation.customer_mobile?.includes(search) ||
      quotation.branch_name?.toLowerCase().includes(search.toLowerCase());

    // Status filter
    const isExpired = quotation.expiry_date && new Date(quotation.expiry_date) < new Date();
    const matchesStatus =
      statusFilter === "all" ||
      quotation.status === statusFilter ||
      (statusFilter === "expired" && isExpired && quotation.status !== "converted");

    return matchesSearch && matchesStatus;
  });

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Calculate pagination
  const totalItems = filteredQuotations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuotations = filteredQuotations.slice(indexOfFirstItem, indexOfLastItem);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format expiry date with status
  const formatExpiryDate = (expiryDate, status) => {
    if (!expiryDate) return "N/A";
    
    const date = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (status === "converted") {
      return (
        <div>
          <div>{date.toLocaleDateString("en-IN")}</div>
          <small className="text-success">Converted to Sale</small>
        </div>
      );
    }

    return (
      <div>
        <div>{date.toLocaleDateString("en-IN")}</div>
        <small
          className={
            diffDays < 0
              ? "text-danger"
              : diffDays <= 3
              ? "text-warning"
              : "text-success"
          }
        >
          {diffDays < 0
            ? "Expired"
            : diffDays === 0
            ? "Expires Today"
            : `${diffDays} days left`}
        </small>
      </div>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get status badge
  const getStatusBadge = (status, expiryDate) => {
    const isExpired = expiryDate && new Date(expiryDate) < new Date();
    
    const statusConfig = {
      draft: { color: "secondary", label: "Draft" },
      sent: { color: "info", label: "Sent" },
      accepted: { color: "success", label: "Accepted" },
      rejected: { color: "danger", label: "Rejected" },
      expired: { color: "warning", label: "Expired" },
      converted: { color: "primary", label: "Converted" },
    };

    let config;
    if (status === "converted") {
      config = statusConfig.converted;
    } else if (isExpired) {
      config = statusConfig.expired;
    } else {
      config = statusConfig[status] || { color: "secondary", label: status };
    }

    return (
      <span className={`badge bg-${config.color} text-white fw-semibold`}>
        {config.label}
      </span>
    );
  };

  // Add new quotation
  const handleAddQuotation = async (quotationData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addQuotation(quotationData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit quotation
  const handleEditQuotation = async (updatedQuotation) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateQuotation(selectedItem._id, updatedQuotation);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete quotation
  const handleDeleteQuotation = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteQuotation(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Convert to sale
  const handleConvertToSale = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "convert", id: selectedItem._id });
    try {
      await convertToSale(selectedItem._id);
      setSelectedItem(null);
    } catch (error) {
      console.error("Convert failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (quotation) => {
   
    setSelectedItem(quotation);
    setShowEditModal(true);
  };

  // Open view modal
  const handleOpenView = (quotation) => {
    setSelectedItem(quotation);
    setShowViewModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (quotation) => {
    setSelectedItem(quotation);
    setShowDeleteModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchQuotations();
  };

  // Pagination handlers
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // View Quotation Modal
  const ViewQuotationModal = () => {
    if (!selectedItem) return null;

    return (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto", maxHeight: "100vh" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-3" style={{ maxHeight: "90vh" }}>
            <div className="modal-header border-bottom pb-3 sticky-top bg-white">
              <h5 className="modal-title fw-bold fs-5">Quotation Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedItem(null);
                }}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body" style={{ overflowY: "auto" }}>
              {/* Header Info */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold">Quotation #{selectedItem.reference_no}</h6>
                  <div className="small text-muted">
                    Created: {formatDate(selectedItem.created_at)}
                  </div>
                </div>
                <div className="col-md-6 text-end">
                  {getStatusBadge(selectedItem.status, selectedItem.expiry_date)}
                </div>
              </div>

              {/* Customer Info */}
              <div className="card border mb-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Customer Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <span className="text-muted">Name:</span>
                        <span className="fw-medium ms-2">{selectedItem.customer_name}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Mobile:</span>
                        <span className="fw-medium ms-2">{selectedItem.customer_mobile}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <span className="text-muted">Code:</span>
                        <span className="fw-medium ms-2">{selectedItem.customer_code || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="card border mb-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Quotation Items</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th className="text-end">Qty</th>
                          <th className="text-end">Price</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItem.items?.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div>
                                <div className="fw-medium">{item.product_name}</div>
                                <div className="small text-muted">{item.product_code}</div>
                              </div>
                            </td>
                            <td className="text-end">{item.quantity}</td>
                            <td className="text-end">{formatCurrency(item.unit_price || item.price)}</td>
                            <td className="text-end fw-medium">{formatCurrency(item.subtotal || item.net_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="row">
                <div className="col-md-6">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Quotation Details</h6>
                      <div className="mb-2">
                        <span className="text-muted">Quotation Date:</span>
                        <span className="fw-medium ms-2">{formatDate(selectedItem.quotation_date)}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Expiry Date:</span>
                        <span className="fw-medium ms-2">{formatDate(selectedItem.expiry_date)}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Branch:</span>
                        <span className="fw-medium ms-2">{selectedItem.branch_name}</span>
                      </div>
                      {selectedItem.note && (
                        <div className="mb-2">
                          <span className="text-muted">Notes:</span>
                          <span className="fw-medium ms-2">{selectedItem.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Amount Summary</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Subtotal:</span>
                        <span className="fw-medium">{formatCurrency(selectedItem.subtotal)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Tax:</span>
                        <span className="fw-medium">{formatCurrency(selectedItem.tax_amount)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Shipping:</span>
                        <span className="fw-medium">{formatCurrency(selectedItem.shipping_cost)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Discount:</span>
                        <span className="fw-medium text-danger">-{formatCurrency(selectedItem.discount)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Grand Total:</span>
                        <span className="fw-bold fs-5 text-primary">{formatCurrency(selectedItem.grand_total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedItem(null);
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => window.print()}
              >
                <FiPrinter className="me-2" />
                Print
              </button>
             
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Quotation</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={actionLoading.type === "delete"}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete quotation{" "}
              <strong>{selectedItem?.reference_no}</strong>?
            </p>
            <p className="text-muted small">
              Customer: <strong>{selectedItem?.customer_name || "N/A"}</strong>
              <br />
              Amount: <strong>{formatCurrency(selectedItem?.grand_total)}</strong>
              <br />
              Status: <strong>{selectedItem?.status}</strong>
            </p>
            <p className="text-muted small">This action cannot be undone.</p>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={actionLoading.type === "delete"}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteQuotation}
              disabled={actionLoading.type === "delete"}
            >
              {actionLoading.type === "delete" ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* Error Display */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-4"
          role="alert"
        >
          {error}
          <button type="button" className="btn-close" onClick={() => {}} />
        </div>
      )}

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Quotations</h1>
              <p className="text-muted mb-0">
                Create and manage price quotations for customers
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                New Quotation
              </button>
            </div>
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="row align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by quotation #, customer, branch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={loading}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Items per page selector */}
            <div className="col-md-3 ms-auto">
              <div className="d-flex align-items-center justify-content-end">
                <label className="me-2 text-muted small">Show:</label>
                <select
                  className="form-select form-select-sm w-auto"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  disabled={loading}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className="ms-2 text-muted small">entries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Quotation #</th>
                <th>Customer</th>
                <th>Branch</th>
                <th>Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th className="text-end">Amount</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && quotations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    {search || statusFilter !== "all"
                      ? "No quotations found for your search criteria"
                      : "No quotations available"}
                  </td>
                </tr>
              ) : (
                currentQuotations.map((quotation, index) => (
                  <tr 
                    key={quotation._id || index}
                    className={quotation.status === "converted" ? "table-success" : ""}
                  >
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td className="fw-bold text-primary">
                      {quotation.quotation_number}
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">
                          {quotation.customer_name || "N/A"}
                        </div>
                        <small className="text-muted">
                          {quotation.customer_mobile}
                          {quotation.customer_code && ` (${quotation.customer_code})`}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark fw-semibold">
                        {quotation.branch_name || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted small">
                        {formatDate(quotation.quotation_date)}
                      </span>
                    </td>
                    <td>
                      {formatExpiryDate(quotation.expiry_date, quotation.status)}
                    </td>
                    <td>
                      {getStatusBadge(quotation.status, quotation.expiry_date)}
                    </td>
                    <td className="text-end fw-bold">
                      {formatCurrency(quotation.grand_total)}
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                          onClick={() => handleOpenView(quotation)}
                          disabled={
                            actionLoading.type && actionLoading.id === quotation._id
                          }
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(quotation)}
                          disabled={
                            actionLoading.type && actionLoading.id === quotation._id
                          }
                          title="Edit"
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === quotation._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Editing...
                            </>
                          ) : (
                            <>
                              <FiEdit2 size={16} />
                              Edit
                            </>
                          )}
                        </button>

                        {/* <button
                          className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                          onClick={() => {
                            setSelectedItem(quotation);
                            handleConvertToSale();
                          }}
                          disabled={
                            actionLoading.type && actionLoading.id === quotation._id ||
                            quotation.status === "converted" ||
                            (quotation.expiry_date && new Date(quotation.expiry_date) < new Date())
                          }
                          title="Convert to Sale"
                        >
                          {actionLoading.type === "convert" &&
                          actionLoading.id === quotation._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Converting...
                            </>
                          ) : (
                            <>
                              <FiCheckCircle size={16} />
                              Convert
                            </>
                          )}
                        </button> */}

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(quotation)}
                          disabled={
                            actionLoading.type && actionLoading.id === quotation._id
                          }
                          title="Delete"
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === quotation._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <RiDeleteBin6Line size={16} />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {filteredQuotations.length > 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-top pt-3 mt-3">
              <div className="mb-2 mb-md-0">
                <p className="text-muted mb-0">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems}{" "}
                  entries
                </p>
              </div>

              <div className="d-flex align-items-center gap-1">
                {/* First Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1 || loading}
                  aria-label="First page"
                >
                  <FiChevronsLeft size={16} />
                </button>

                {/* Previous Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1 || loading}
                  aria-label="Previous page"
                >
                  <FiChevronLeft size={16} />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`btn btn-sm ${
                      currentPage === pageNumber
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => goToPage(pageNumber)}
                    disabled={loading}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={
                      currentPage === pageNumber ? "page" : undefined
                    }
                  >
                    {pageNumber}
                  </button>
                ))}

                {/* Next Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || loading}
                  aria-label="Next page"
                >
                  <FiChevronRight size={16} />
                </button>

                {/* Last Page */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages || loading}
                  aria-label="Last page"
                >
                  <FiChevronsRight size={16} />
                </button>
              </div>

              {/* Page info */}
              <div className="mt-2 mt-md-0">
                <span className="text-muted">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showAddModal && (
        <AddQuotationForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAddQuotation}
          loading={actionLoading.type === "add"}
          customers={customers}
          items={items}
          branches={branches}
        />
      )}

      {showEditModal && selectedItem && (
        <EditQuotationForm
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleEditQuotation}
          quotation={selectedItem}
          customers={customers}
          items={items}
          branches={branches}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
        />
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedItem && <ViewQuotationModal />}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
    </div>
  );
};

export default QuotationsTable;