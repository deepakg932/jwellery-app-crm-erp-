import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiCalendar,
  FiEye,
  FiRefreshCw,
  FiFileText,
  FiTruck,
  FiBox,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddStockINForm from "./AddPurchaseReceivedForm";
import EditStockINForm from "./EditPurchaseReceivedForm";
import purchaseReceived from "@/hooks/purchaseReceived";

const PurchaseReceivedTable = () => {
  const {
    stockIns,
    loading,
    error,
    createStockIn,
    updateStockIn,
    deleteStockIn,
    fetchStockIns,
    purchaseOrders,
  } = purchaseReceived();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    supplier: "",
    branch: "",
    status: "",
  });

  // Helper function to parse dates
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    return new Date(dateStr);
  };

  // Filter stock ins based on search and filters
  const filteredEntries = stockIns.filter((entry) => {
    const supplierName = entry.supplier_name || 
                       (entry.supplier_id?.supplier_name) || 
                       (entry.supplier_id?.name) || "";
    const poNumber = entry.po_id?.po_number || "";
    
    const matchesSearch =
      supplierName.toLowerCase().includes(search.toLowerCase()) ||
      poNumber.toLowerCase().includes(search.toLowerCase()) ||
      entry.remarks?.toLowerCase().includes(search.toLowerCase());

    // Parse dates for comparison - using received_date instead of purchase_date
    const entryDate = parseDate(entry.received_date || entry.created_at);
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;

    const matchesFilters =
      (!dateFrom || entryDate >= dateFrom) &&
      (!dateTo || entryDate <= dateTo) &&
      (!filters.supplier || entry.supplier_id === filters.supplier) &&
      (!filters.branch || entry.branch_id === filters.branch) &&
      (!filters.status || entry.status === filters.status);

    return matchesSearch && matchesFilters;
  });

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters]);

  // Calculate pagination
  const totalItems = filteredEntries.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = filteredEntries.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Calculate total received quantity/weight for an entry
  const calculateTotalReceived = (entry) => {
    if (!entry.items || !Array.isArray(entry.items)) return 0;

    return entry.items.reduce((total, item) => {
      const receivedQty = parseFloat(item.received_quantity) || 0;
      const receivedWt = parseFloat(item.received_weight) || 0;
      
      return total + (receivedQty > 0 ? receivedQty : receivedWt);
    }, 0);
  };

  // Calculate total ordered quantity/weight for an entry
  const calculateTotalOrdered = (entry) => {
    if (!entry.items || !Array.isArray(entry.items)) return 0;

    return entry.items.reduce((total, item) => {
      const qty = parseFloat(item.ordered_quantity) || 0;
      const weight = parseFloat(item.ordered_weight) || 0;
      return total + (qty > 0 ? qty : weight);
    }, 0);
  };

  // Calculate completion percentage
  const calculateCompletion = (entry) => {
    const ordered = calculateTotalOrdered(entry);
    const received = calculateTotalReceived(entry);

    if (ordered === 0) return 100; // If nothing ordered, consider it 100% complete for manual entries
    return Math.min((received / ordered) * 100, 100);
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case "received":
        return {
          icon: <FiBox size={12} />,
          color: "success",
          label: "Received",
          bgColor: "bg-success-subtle",
          textColor: "text-success",
        };
      case "partially_received":
        return {
          icon: <FiFileText size={12} />,
          color: "info",
          label: "Partially Received",
          bgColor: "bg-info-subtle",
          textColor: "text-info",
        };
      case "pending":
        return {
          icon: <FiCalendar size={12} />,
          color: "warning",
          label: "Pending",
          bgColor: "bg-warning-subtle",
          textColor: "text-warning",
        };
      case "cancelled":
        return {
          icon: <RiDeleteBin6Line size={12} />,
          color: "danger",
          label: "Cancelled",
          bgColor: "bg-danger-subtle",
          textColor: "text-danger",
        };
      default:
        return {
          icon: null,
          color: "secondary",
          label: status || "Unknown",
          bgColor: "bg-secondary-subtle",
          textColor: "text-secondary",
        };
    }
  };

  // Add new stock in entry
  const handleAddStockIn = async (stockInData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await createStockIn(stockInData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add purchase failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit stock in entry
  const handleEditStockIn = async (updatedStockIn) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateStockIn(selectedItem._id, updatedStockIn);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update purchase failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete stock in entry
  const handleDeleteStockIn = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteStockIn(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete purchase failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (entry) => {
    setSelectedItem(entry);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (entry) => {
    setSelectedItem(entry);
    setShowDeleteModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchStockIns();
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format date time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get unique values for filters
  const uniqueSuppliers = [
    ...new Set(stockIns.map((entry) => 
      entry.supplier_id?._id || entry.supplier_id
    )),
  ].filter(Boolean);

  const uniqueStatuses = [
    ...new Set(stockIns.map((entry) => entry.status)),
  ].filter(Boolean);

  // Get PO number by ID
  const getPONumber = (poId) => {
    if (!poId) return "Manual purchase";
    if (typeof poId === 'object') {
      return poId.po_number || `PO-${poId._id?.substring(0, 8)}`;
    }
    return "PO Not Found";
  };

  // Get supplier name
  const getSupplierName = (supplierId) => {
    if (!supplierId) return "Unknown Supplier";
    if (typeof supplierId === 'object') {
      return supplierId.supplier_name || supplierId.name || "Unknown Supplier";
    }
    return "Unknown Supplier";
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
            <h5 className="modal-title fw-bold fs-5">Delete purchase Entry</h5>
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
              Are you sure you want to delete the purchase entry?
            </p>
            <p className="text-muted small">
              This action cannot be undone. purchase contains{" "}
              {selectedItem?.items?.length || 0} items with total value: ₹
              {selectedItem?.total_cost?.toFixed(2) || "0.00"}
            </p>
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
              onClick={handleDeleteStockIn}
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
                "Delete purchase"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // View Details Modal
  const ViewDetailsModal = () => {
    if (!selectedItem) return null;

    const statusInfo = getStatusInfo(selectedItem.status);
    const ordered = calculateTotalOrdered(selectedItem);
    const received = calculateTotalReceived(selectedItem);
    const completion = calculateCompletion(selectedItem);

    return (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-3">
            <div className="modal-header border-bottom pb-3">
              <h5 className="modal-title fw-bold fs-5">Item Received Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setSelectedItem(null);
                }}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {/* Header Info */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3">General Information</h6>
                  <div className="mb-2">
                    <span className="text-muted">Purchase Received ID:</span>
                    <span className="fw-medium ms-2">
                      {selectedItem._id?.substring(0, 8)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">PO Reference:</span>
                    <span className="fw-medium ms-2">
                      {getPONumber(selectedItem.po_id)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Supplier:</span>
                    <span className="fw-medium ms-2">
                      {getSupplierName(selectedItem.supplier_id)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Total Items:</span>
                    <span className="fw-medium ms-2">
                      {selectedItem.items?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3">Status & Dates</h6>
                  <div className="mb-2">
                    <span className="text-muted">Status:</span>
                    <span className={`badge ${statusInfo.bgColor} ${statusInfo.textColor} ms-2`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Received Date:</span>
                    <span className="fw-medium ms-2">
                      {formatDate(selectedItem.received_date)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Total Cost:</span>
                    <span className="fw-medium ms-2">
                      ₹{selectedItem.total_cost?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Completion:</span>
                    <span className="fw-medium ms-2">
                      {completion.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Completion Progress</span>
                  <span className="fw-medium">{completion.toFixed(1)}%</span>
                </div>
                <div className="progress" style={{ height: "10px" }}>
                  <div
                    className={`progress-bar ${statusInfo.bgColor.replace("bg-", "bg-").replace("-subtle", "")}`}
                    role="progressbar"
                    style={{ width: `${completion}%` }}
                    aria-valuenow={completion}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <div className="d-flex justify-content-between mt-2 small text-muted">
                  <span>Ordered: {ordered.toFixed(3)}</span>
                  <span>Received: {received.toFixed(3)}</span>
                  <span>Pending: {(ordered - received).toFixed(3)}</span>
                </div>
              </div>

              {/* Items Table */}
              <h6 className="fw-bold mb-3">Received Items</h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Ordered</th>
                      <th>Received</th>
                      <th>Unit</th>
                      <th>Rate</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItem.items?.map((item, index) => {
                      const inventoryItem = item.inventory_item_id || {};
                      const ordered = parseFloat(item.ordered_quantity) || parseFloat(item.ordered_weight) || 0;
                      const received = parseFloat(item.received_quantity) || parseFloat(item.received_weight) || 0;
                      const unit = item.unit_name || (item.unit_id?.name) || "pcs";
                      const rate = parseFloat(item.cost) || 0;
                      const total = parseFloat(item.total_cost) || 0;
                      const itemStatus = item.status || "pending";
                      
                      return (
                        <tr key={index}>
                          <td>
                            <div className="fw-medium">{inventoryItem.name || "Unknown Item"}</div>
                            <div className="small text-muted">{inventoryItem.item_code || "N/A"}</div>
                          </td>
                          <td>{ordered.toFixed(3)}</td>
                          <td>{received.toFixed(3)}</td>
                          <td>{unit}</td>
                          <td>₹{rate.toFixed(2)}</td>
                          <td>₹{total.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${
                              itemStatus === "received" ? "bg-success" :
                              itemStatus === "partially_received" ? "bg-info" :
                              "bg-warning"
                            }`}>
                              {itemStatus.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Remarks</label>
                    <div className="bg-light p-3 rounded">
                      {selectedItem.remarks || "No remarks"}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-light p-3 rounded">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Items:</span>
                      <span className="fw-medium">{selectedItem.items?.length || 0}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>₹{(selectedItem.total_cost || 0).toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Grand Total:</span>
                      <span className="text-primary">₹{(selectedItem.total_cost || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleOpenEdit(selectedItem)}
              >
                Edit Purchase Received
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              <h1 className="h3 fw-bold mb-2">Purchase Received Items</h1>
              <p className="text-muted mb-0">
                Manage your stock receipts from suppliers and purchase orders
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleRefresh}
                disabled={loading}
              >
                <FiRefreshCw size={18} />
                Refresh
              </button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Purchase Received
              </button>
            </div>
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by PO number, supplier, remarks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="col-md-8">
              <div className="row g-2">
                <div className="col">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    placeholder="From Date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="col">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    placeholder="To Date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="col">
                  <select
                    className="form-select form-select-sm"
                    value={filters.supplier}
                    onChange={(e) =>
                      setFilters({ ...filters, supplier: e.target.value })
                    }
                    disabled={loading}
                  >
                    <option value="">All Suppliers</option>
                    {uniqueSuppliers.map((supplierId, index) => {
                      const entry = stockIns.find((s) => 
                        (s.supplier_id?._id === supplierId) || (s.supplier_id === supplierId)
                      );
                      return (
                        <option key={index} value={supplierId}>
                          {getSupplierName(entry?.supplier_id) || supplierId}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="col">
                  <select
                    className="form-select form-select-sm"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    disabled={loading}
                  >
                    <option value="">All Status</option>
                    {uniqueStatuses.map((status, index) => (
                      <option key={index} value={status}>
                        {status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Items per page selector */}
            <div className="col-md-4 mt-2">
              <div className="d-flex align-items-center">
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
                <th>PO Reference</th>
                <th>Supplier</th>
                <th>Items Count</th>
                <th>Ordered/Received</th>
                <th>Total Cost</th>
                <th>Received Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && stockIns.length === 0 ? (
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
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    {search || Object.values(filters).some((f) => f)
                      ? "No purchase entries found for your search criteria"
                      : "No purchase entries available"}
                  </td>
                </tr>
              ) : (
                currentEntries.map((entry, index) => {
                  const statusInfo = getStatusInfo(entry.status);
                  const ordered = calculateTotalOrdered(entry);
                  const received = calculateTotalReceived(entry);
                  const completion = calculateCompletion(entry);

                  return (
                    <tr key={entry._id || index}>
                      <td>{indexOfFirstItem + index + 1}</td>

                      <td>
                        <div className="fw-medium">
                          {getPONumber(entry.po_id)}
                        </div>
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {getSupplierName(entry.supplier_id)}
                        </div>
                      </td>

                      <td>
                        <div className="text-center">
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            {entry.items?.length || 0} items
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="text-muted small">
                          <div className="d-flex align-items-center gap-1">
                            <FiBox size={12} />
                            <span>
                              Ordered:{" "}
                              {ordered.toLocaleString("en-IN", {
                                minimumFractionDigits: 3,
                              })}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-1 mt-1">
                            <FiTruck size={12} />
                            <span>
                              Received:{" "}
                              {received.toLocaleString("en-IN", {
                                minimumFractionDigits: 3,
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="fw-bold text-primary">
                          ₹
                          {entry.total_cost?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          }) || "0.00"}
                        </span>
                      </td>

                      <td>
                        <span className="badge bg-light text-dark">
                          <FiCalendar className="me-1" size={12} />
                          {formatDate(entry.received_date)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${statusInfo.bgColor} ${statusInfo.textColor} d-flex align-items-center gap-1`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          {/* View Button */}
                          <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                            onClick={() => setSelectedItem(entry)}
                            title="View Details"
                          >
                            <FiEye size={14} />
                            View
                          </button>

                          {/* Edit Button */}
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={() => handleOpenEdit(entry)}
                            disabled={
                              actionLoading.type &&
                              actionLoading.id === entry._id
                            }
                            title="Edit"
                          >
                            {actionLoading.type === "update" &&
                            actionLoading.id === entry._id ? (
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
                                <FiEdit2 size={14} />
                                Edit
                              </>
                            )}
                          </button>

                          {/* Delete Button */}
                          {/* <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            onClick={() => handleOpenDelete(entry)}
                            disabled={
                              actionLoading.type &&
                              actionLoading.id === entry._id
                            }
                            title="Delete"
                          >
                            {actionLoading.type === "delete" &&
                            actionLoading.id === entry._id ? (
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
                                <RiDeleteBin6Line size={14} />
                                Delete
                              </>
                            )}
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {filteredEntries.length > 0 && (
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

      {/* ADD MODAL */}
      {showAddModal && (
        <AddStockINForm
          key="add-modal"
          onClose={() => setShowAddModal(false)}
          onSave={handleAddStockIn}
          loading={actionLoading.type === "add"}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditStockINForm
          key={`edit-modal-${selectedItem._id}`}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleEditStockIn}
          stockIn={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
        />
      )}

      {/* VIEW MODAL */}
      {selectedItem && !showEditModal && !showDeleteModal && (
        <ViewDetailsModal key={`view-modal-${selectedItem._id}`} />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && (
        <DeleteConfirmationModal key={`delete-modal-${selectedItem._id}`} />
      )}
    </div>
  );
};

export default PurchaseReceivedTable;