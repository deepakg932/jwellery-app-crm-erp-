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
  FiCheckCircle,
  FiPrinter,
  FiUser,
  FiAlertCircle,
  FiPackage,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddJobCardForm from "./AddJobCardForm";
import EditJobCardForm from "./EditJobCardForm";
import useJobCards from "@/hooks/useJobCards";

const JobCardTable = () => {
  const {
    jobCards,
    employees,
    loading,
    error,
    addJobCard,
    updateJobCard,
    deleteJobCard,
    updateJobCardStatus,
    convertToSale,
    fetchJobCards,
    loadingQuotations,
  } = useJobCards();

  console.log(jobCards);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showAddJobCard, setShowAddJobCard] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  console.log(selectedItem);

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending", color: "warning" },
    { value: "in_progress", label: "In Progress", color: "info" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "delivered", label: "Delivered", color: "primary" },
    { value: "cancelled", label: "Cancelled", color: "danger" },
  ];

  // Priority options
  const priorityOptions = [
    { value: "all", label: "All Priority" },
    { value: "low", label: "Low", color: "success" },
    { value: "medium", label: "Medium", color: "warning" },
    { value: "high", label: "High", color: "danger" },
    { value: "urgent", label: "Urgent", color: "danger" },
  ];

  // Filter job cards
  const filteredJobCards = jobCards.filter((jobCard) => {
    // Search filter
    const matchesSearch =
      search === "" ||
      jobCard.job_card_number?.toLowerCase().includes(search.toLowerCase()) ||
      jobCard.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      jobCard.customer_mobile?.includes(search) ||
      jobCard.assigned_name?.toLowerCase().includes(search.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" || jobCard.status === statusFilter;

    // Priority filter
    const matchesPriority =
      priorityFilter === "all" || jobCard.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter]);

  // Calculate pagination
  const totalItems = filteredJobCards.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobCards = filteredJobCards.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  console.log(jobCards);
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

  // Format delivery date with status
  const formatDeliveryDate = (expectedDate, actualDate, status) => {
    if (!expectedDate) return "N/A";

    const expected = new Date(expectedDate);
    const actual = actualDate ? new Date(actualDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expectedDateOnly = new Date(expected);
    expectedDateOnly.setHours(0, 0, 0, 0);

    const diffTime = expectedDateOnly - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (actual) {
      return (
        <div>
          <div>{formatDate(actual)}</div>
          <small className="text-success">Delivered</small>
        </div>
      );
    }

    return (
      <div>
        <div>{formatDate(expected)}</div>
        <small
          className={
            diffDays < 0
              ? "text-danger"
              : diffDays === 0
                ? "text-warning"
                : "text-success"
          }
        >
          {diffDays < 0
            ? `${Math.abs(diffDays)} days overdue`
            : diffDays === 0
              ? "Due Today"
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
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending" },
      in_progress: { color: "info", label: "In Progress" },
      completed: { color: "success", label: "Completed" },
      delivered: { color: "primary", label: "Delivered" },
      cancelled: { color: "danger", label: "Cancelled" },
    };

    const config = statusConfig[status] || {
      color: "secondary",
      label: status,
    };

    return (
      <span className={`badge bg-${config.color} text-white fw-semibold`}>
        {config.label}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: "success", label: "Low" },
      medium: { color: "warning", label: "Medium" },
      high: { color: "danger", label: "High" },
      urgent: { color: "danger", label: "Urgent" },
    };

    const config = priorityConfig[priority] || {
      color: "secondary",
      label: priority,
    };

    return (
      <span className={`badge bg-${config.color} text-white`}>
        {config.label}
      </span>
    );
  };

  // Add new job card
  const handleAddJobCard = async (jobCardData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addJobCard(jobCardData);
      setShowAddJobCard(false);
      setSelectedQuotation(null);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit job card
  const handleEditJobCard = async (updatedJobCard) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateJobCard(selectedItem._id, updatedJobCard);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete job card
  const handleDeleteJobCard = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteJobCard(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Update status
  const handleUpdateStatus = async (jobCardId, status) => {
    setActionLoading({ type: "status", id: jobCardId });
    try {
      await updateJobCardStatus(jobCardId, status);
    } catch (error) {
      console.error("Status update failed:", error);
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
  const handleOpenEdit = (jobCard) => {
    if (jobCard.status === "completed" || jobCard.status === "delivered") {
      alert("Cannot edit a completed or delivered job card");
      return;
    }
    setSelectedItem(jobCard);
    setShowEditModal(true);
  };

  // Open view modal
  const handleOpenView = (jobCard) => {
    setSelectedItem(jobCard);
    setShowViewModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (jobCard) => {
    setSelectedItem(jobCard);
    setShowDeleteModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchJobCards();
  };

  // When creating from quotation
  const handleCreateFromQuotation = () => {
    setSelectedQuotation(null);
    setShowAddJobCard(true);
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

  // View Job Card Modal
  const ViewJobCardModal = () => {
    if (!selectedItem) return null;

    return (
      <div
        className="modal fade show d-block"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          overflowY: "auto",
          maxHeight: "100vh",
        }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            className="modal-content rounded-3"
            style={{ maxHeight: "90vh" }}
          >
            <div className="modal-header border-bottom pb-3 sticky-top bg-white">
              <h5 className="modal-title fw-bold fs-5">Job Card Details</h5>
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
                  <h6 className="fw-bold">
                    Job Card #{selectedItem.job_card_number}
                  </h6>
                  <div className="small text-muted">
                    Created: {formatDate(selectedItem.created_at)}
                  </div>
                </div>
                <div className="col-md-6 text-end">
                  <div className="d-flex flex-column align-items-end gap-1">
                    {getStatusBadge(selectedItem.status)}
                    {getPriorityBadge(selectedItem.priority)}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="card border mb-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">
                    {selectedItem.quotation_number
                      ? "Customer Information"
                      : "Order Information"}
                  </h6>
                  <div className="row">
                    {selectedItem.quotation_number ? (
                      // Quotation job card
                      <>
                        <div className="col-md-6">
                          <div className="mb-2">
                            <span className="text-muted">Name:</span>
                            <span className="fw-medium ms-2">
                              {selectedItem.customer_name}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Mobile:</span>
                            <span className="fw-medium ms-2">
                              {selectedItem.customer_mobile}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-2">
                            <span className="text-muted">Quotation:</span>
                            <span className="fw-medium ms-2">
                              {selectedItem.quotation_number}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Product job card
                      <div className="col-md-12">
                        <div className="alert alert-info mb-0">
                          <div className="d-flex align-items-center">
                            <FiPackage className="me-2" />
                            <div>
                              <strong>Direct Product Order</strong>
                              <div className="small">
                                Created without customer/quotation
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="card border mb-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Job Items</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Description</th>
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
                                <div className="fw-medium">
                                  {item.product_name}
                                </div>
                                <div className="small text-muted">
                                  {item.product_code}
                                </div>
                              </div>
                            </td>
                            <td>
                              <small className="text-muted">
                                {item.description || "No description"}
                              </small>
                            </td>
                            <td className="text-end">{item.quantity}</td>
                            <td className="text-end">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="text-end fw-medium">
                              {formatCurrency(item.total_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Images Section - Add this after the table */}
                  {selectedItem.images && selectedItem.images.length > 0 && (
                    <div className="mt-4">
                      <h6 className="fw-bold mb-3">Job Card Images</h6>
                      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                        {selectedItem.images.map((imageUrl, index) => (
                          <div key={index} className="col">
                            <div className="border rounded p-2 bg-light position-relative">
                              <img
                                src={imageUrl}
                                alt={`Job Card Image ${index + 1}`}
                                className="rounded w-100"
                                style={{
                                  height: "120px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/150?text=Image+Error";
                                }}
                              />
                              <div className="small text-muted text-center mt-1">
                                Image {index + 1}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="row">
                <div className="col-md-6">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Job Details</h6>
                      <div className="mb-2">
                        <span className="text-muted">Job Card Date:</span>
                        <span className="fw-medium ms-2">
                          {formatDate(selectedItem.job_card_date)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Expected Delivery:</span>
                        <span className="fw-medium ms-2">
                          {formatDate(selectedItem.expected_delivery_date)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Actual Delivery:</span>
                        <span className="fw-medium ms-2">
                          {selectedItem.delivery_date
                            ? formatDate(selectedItem.delivery_date)
                            : "Not delivered"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Assigned To:</span>
                        <span className="fw-medium ms-2">
                          {selectedItem.assigned_name}
                        </span>
                      </div>
                      {selectedItem.instructions && (
                        <div className="mb-2">
                          <span className="text-muted">Instructions:</span>
                          <span className="fw-medium ms-2">
                            {selectedItem.instructions}
                          </span>
                        </div>
                      )}
                      {selectedItem.note && (
                        <div className="mb-2">
                          <span className="text-muted">Notes:</span>
                          <span className="fw-medium ms-2">
                            {selectedItem.note}
                          </span>
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
                        <span className="text-muted">Total Amount:</span>
                        <span className="fw-medium">
                          {formatCurrency(selectedItem.total_amount)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Advance Amount:</span>
                        <span className="fw-medium">
                          {formatCurrency(selectedItem.advance_amount)}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Balance Amount:</span>
                        <span className="fw-bold fs-5 text-primary">
                          {formatCurrency(selectedItem.balance_amount)}
                        </span>
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
              {selectedItem.status === "completed" && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleConvertToSale}
                  disabled={
                    actionLoading.type === "convert" &&
                    actionLoading.id === selectedItem._id
                  }
                >
                  {actionLoading.type === "convert" &&
                  actionLoading.id === selectedItem._id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="me-2" />
                      Convert to Sale
                    </>
                  )}
                </button>
              )}
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
            <h5 className="modal-title fw-bold fs-5">Delete Job Card</h5>
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
              Are you sure you want to delete job card{" "}
              <strong>{selectedItem?.job_card_number}</strong>?
            </p>
            <p className="text-muted small">
              Customer: <strong>{selectedItem?.customer_name || "N/A"}</strong>
              <br />
              Status: <strong>{selectedItem?.status}</strong>
              <br />
              Priority: <strong>{selectedItem?.priority}</strong>
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
              onClick={handleDeleteJobCard}
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
              <h1 className="h3 fw-bold mb-2">Job Cards</h1>
              <p className="text-muted mb-0">
                Create and manage job cards for customer orders
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
                onClick={handleCreateFromQuotation}
                disabled={
                  loading || actionLoading.type === "add" || loadingQuotations
                }
              >
                <FiPlus size={18} />
                New Job Card
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
                  placeholder="Search by job card #, customer, assigned..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-2">
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

            <div className="col-md-2">
              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                disabled={loading}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Items per page selector */}
            <div className="col-md-4 ms-auto">
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
                <th>Job Card #</th>
                <th>Customer / Order Type</th>
                <th>Stage Type</th>
                <th>Delivery Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th className="text-end">Amount</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && jobCards.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
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
              ) : filteredJobCards.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    {search ||
                    statusFilter !== "all" ||
                    priorityFilter !== "all"
                      ? "No job cards found for your search criteria"
                      : "No job cards available"}
                  </td>
                </tr>
              ) : (
                currentJobCards.map((jobCard, index) => (
                  <tr
                    key={jobCard._id || index}
                    className={
                      jobCard.status === "completed" ||
                      jobCard.status === "delivered"
                        ? "table-success"
                        : jobCard.quotation_number
                          ? ""
                          : "table-light"
                    }
                  >
                    <td>{indexOfFirstItem + index + 1}</td>

                    <td className="fw-bold">
                      <span
                        className={
                          jobCard.quotation_number
                            ? "text-primary"
                            : "text-secondary"
                        }
                      >
                        {jobCard.job_card_number}
                      </span>
                      {!jobCard.quotation_number && (
                        <span className="badge bg-light text-dark ms-2 small">
                          Product
                        </span>
                      )}
                    </td>

                    {/* CUSTOMER COLUMN - UPDATED */}
                    <td>
                      {jobCard.quotation_number ? (
                        // Quotation job card - show customer details
                        <div>
                          <div className="fw-semibold d-flex align-items-center">
                            <FiUser size={14} className="me-1 text-success" />
                            {jobCard.customer_name || "N/A"}
                          </div>
                          {jobCard.customer_mobile && (
                            <small className="text-muted d-block">
                              📱 {jobCard.customer_mobile}
                            </small>
                          )}
                          <div className="small text-info mt-1 d-flex align-items-center">
                            <FiShoppingCart size={12} className="me-1" />
                            QT-
                            {jobCard.quotation_number?.split("-").pop() || ""}
                          </div>
                        </div>
                      ) : (
                        // Product job card - show product order info
                        <div className="text-center">
                          <div className="text-muted fst-italic d-flex align-items-center justify-content-center">
                            <FiPackage size={14} className="me-1" />
                            Product Order
                          </div>
                          <small className="text-muted">
                            {jobCard.items?.length || 0} item(s)
                          </small>
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="fw-semibold ">{jobCard.stage}</span>
                    </td>

                    <td>
                      {formatDeliveryDate(
                        jobCard.expected_delivery_date,
                        jobCard.delivery_date,
                        jobCard.status,
                      )}
                    </td>

                    <td>{getPriorityBadge(jobCard.priority)}</td>

                    <td>{getStatusBadge(jobCard.status)}</td>

                    <td>
                      <small className="text-muted">
                        {jobCard.assigned_name || "Unassigned"}
                      </small>
                    </td>

                    <td className="text-end fw-bold">
                      {formatCurrency(jobCard.total_amount)}
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                          onClick={() => handleOpenView(jobCard)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === jobCard._id
                          }
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(jobCard)}
                          disabled={
                            (actionLoading.type &&
                              actionLoading.id === jobCard._id) ||
                            jobCard.status === "completed" ||
                            jobCard.status === "delivered"
                          }
                          title="Edit"
                        >
                          {actionLoading.type === "update" &&
                          actionLoading.id === jobCard._id ? (
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
                        {/* 
                        <button
                          className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                          onClick={() => {
                            if (jobCard.status !== "completed") {
                              handleUpdateStatus(jobCard._id, "completed");
                            } else {
                              handleConvertToSale(jobCard._id);
                            }
                          }}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === jobCard._id
                          }
                          title={
                            jobCard.status === "completed"
                              ? "Convert to Sale"
                              : "Mark as Completed"
                          }
                        >
                          {actionLoading.type === "status" &&
                          actionLoading.id === jobCard._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Updating...
                            </>
                          )
                          }
                        </button> */}

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(jobCard)}
                          disabled={
                            actionLoading.type &&
                            actionLoading.id === jobCard._id
                          }
                          title="Delete"
                        >
                          {actionLoading.type === "delete" &&
                          actionLoading.id === jobCard._id ? (
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
          {filteredJobCards.length > 0 && (
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
      {showAddJobCard && (
        <AddJobCardForm
          onClose={() => {
            setShowAddJobCard(false);
            setSelectedQuotation(null);
          }}
          onSave={handleAddJobCard}
          loading={actionLoading.type === "add"}
          quotationData={selectedQuotation}
        />
      )}

      {showEditModal && selectedItem && (
        <EditJobCardForm
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleEditJobCard}
          jobCardData={selectedItem}
          employees={employees}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
        />
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedItem && <ViewJobCardModal />}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
    </div>
  );
};

export default JobCardTable;
