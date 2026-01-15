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
  FiRepeat,
  FiDollarSign,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddSaleForm from "./AddSaleForm";
import EditSaleForm from "./EditSaleForm";
import ViewSaleModal from "./ViewSaleModal";
import CreateSaleReturnModal from "../../sales-return/componets/CreateSaleReturnModal";
import useSales from "@/hooks/useSales";
import useSalesReturn from "@/hooks/useSalesReturn";

import PaymentStatusUpdateModal from "./PaymentStatusUpdateModal";

const SalesTable = () => {
  const {
    sales,
    loading,
    error,
    addSale,
    updateSale,
    deleteSale,
    fetchSales,
    updateSalePayment,
  } = useSales();

  // Add useSalesReturn hook
  const { createSaleReturn } = useSalesReturn();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false); // New state for payment status modal
  const [selectedSaleForReturn, setSelectedSaleForReturn] = useState(null);
  const [selectedSaleForPaymentUpdate, setSelectedSaleForPaymentUpdate] =
    useState(null); // New state
  const [selectedItem, setSelectedItem] = useState([]);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper function for status badge classes
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "cancelled":
      case "rejected":
        return "bg-danger";
      case "draft":
        return "bg-secondary";
      case "shipped":
      case "processing":
        return "bg-info";
      case "delivered":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  // Helper function for payment status badge classes
  const getPaymentStatusBadgeClass = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case "paid":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "partial":
        return "bg-info";
      case "overdue":
        return "bg-danger";
      case "cancelled":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  // Get payment status options
  const getPaymentStatusOptions = () => {
    return [
      { value: "pending", label: "Pending", color: "warning" },
      { value: "partial", label: "Partial", color: "info" },
      { value: "paid", label: "Paid", color: "success" },
      { value: "overdue", label: "Overdue", color: "danger" },
      { value: "cancelled", label: "Cancelled", color: "secondary" },
    ];
  };

  // Filter sales based on search
  const filteredSales = sales.filter(
    (sale) =>
      sale.reference_no?.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer_id?.customer_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      sale.status?.toLowerCase().includes(search.toLowerCase()) ||
      sale.payment_status?.toLowerCase().includes(search.toLowerCase()) || // Added payment status search
      sale.items?.some(
        (item) =>
          item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.item_name?.toLowerCase().includes(search.toLowerCase())
      )
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination
  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate totals for each sale
  const calculateTotal = (items) => {
    if (!items) return 0;
    return items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const discount = parseFloat(item.discount) || 0;
      const tax = parseFloat(item.tax) || 0;

      const subtotal = quantity * rate;
      const itemTotal = subtotal - discount + tax;

      return total + itemTotal;
    }, 0);
  };

  // Calculate balance amount
  const calculateBalanceAmount = (sale) => {
    // Use balance_amount from API if available
    if (sale.balance_amount !== undefined) {
      return sale.balance_amount;
    }

    // Calculate if not available from API
    const totalAmount =
      sale.grand_total || sale.total_amount || calculateTotal(sale.items) || 0;

    const paidAmount = sale.paid_amount || 0;

    return totalAmount - paidAmount;
  };

  // Add new sale
  const handleAddSale = async (saleData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addSale(saleData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit sale
  const handleEditSale = async (updatedSale) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem?._id });
    try {
      await updateSale(selectedItem._id, updatedSale);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Delete sale
  const handleDeleteSale = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteSale(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Update payment status handler
  const handleUpdatePaymentStatus = async (paymentData) => {
    if (!selectedSaleForPaymentUpdate) return;

    setActionLoading({
      type: "payment_update",
      id: selectedSaleForPaymentUpdate._id,
    });

    try {
      console.log(
        "Updating payment status for sale:",
        selectedSaleForPaymentUpdate._id,
        paymentData
      );

      await updateSalePayment(selectedSaleForPaymentUpdate._id, paymentData);

      // Success message
      alert(
        `Payment status updated to ${paymentData.payment_status.toUpperCase()} successfully!`
      );

      // Close modal and reset
      setShowPaymentStatusModal(false);
      setSelectedSaleForPaymentUpdate(null);

      // Refresh sales data
      fetchSales();
    } catch (error) {
      console.error("Payment status update failed:", error);

      // More specific error message
      if (error.message.includes("Network error")) {
        alert("Network error. Please check your internet connection.");
      } else {
        alert(`Failed to update payment status: ${error.message}`);
      }
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Create sale return
  const handleCreateReturn = async (returnData) => {
    setActionLoading({ type: "return", id: selectedSaleForReturn?._id });
    try {
      await createSaleReturn(returnData);
      alert("Sale return created successfully!");
      setShowReturnModal(false);
      setSelectedSaleForReturn(null);
      fetchSales();
    } catch (error) {
      console.error("Create return failed:", error);
      alert("Return allowed only for completed sales");
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open view modal
  const handleOpenView = (sale) => {
    setSelectedItem(sale);
    setShowViewModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (sale) => {
    setSelectedItem(sale);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (sale) => {
    setSelectedItem(sale);
    setShowDeleteModal(true);
  };

  // Open return modal
  const handleOpenReturn = (sale) => {
    setSelectedSaleForReturn(sale);
    setShowReturnModal(true);
  };

  // Open payment status update modal
  const handleOpenPaymentStatusUpdate = (sale) => {
    setSelectedSaleForPaymentUpdate(sale);
    setShowPaymentStatusModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchSales();
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get item count with details
  const getItemDetails = (items) => {
    if (!items || items.length === 0) return "0 items";

    const itemCount = items.length;
    const quantitySum = items.reduce(
      (sum, item) => sum + (parseFloat(item.quantity) || 0),
      0
    );

    let details = `${itemCount} item${itemCount > 1 ? "s" : ""}`;
    if (quantitySum > 0) details += `, ${quantitySum} qty`;

    return details;
  };

  // Get item names
  const getItemNames = (items) => {
    if (!items || items.length === 0) return "No items";

    const names = items.map((item) => {
      return (
        item.product?.name ||
        item.product_name ||
        item.product_id?.name ||
        "Unknown Item"
      );
    });

    if (names.length <= 2) {
      return names.join(", ");
    } else {
      return `${names[0]}, ${names[1]} +${names.length - 2} more`;
    }
  };

  // Get customer name
  const getCustomerName = (customer) => {
    if (!customer) return "N/A";
    return customer.name || customer.customer_name || "Unknown Customer";
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !selectedItem) return null;

    return (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-3">
            <div className="modal-header border-bottom pb-3">
              <h5 className="modal-title fw-bold fs-5">Delete Sale</h5>
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
                Are you sure you want to delete Sale{" "}
                <strong>{selectedItem?.sale_number}</strong>?
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
                onClick={handleDeleteSale}
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
              <h1 className="h3 fw-bold mb-2">Sales</h1>
              <p className="text-muted mb-0">
                Manage your sales in a table layout
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
                New Sale
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
                  placeholder="Search by Sale number, reference, customer, or item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
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
                <th>Reference No</th>
                <th>Customer</th>
                <th>Sale Date</th>
                <th>Branch</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th> Sale Status</th>
                <th>Payment Status</th>
                <th>Balance Amount</th> {/* NEW COLUMN ADDED */}
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && sales.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-5">
                    {" "}
                    {/* Updated colSpan from 10 to 11 */}
                    <div className="d-flex flex-column align-items-center">
                      <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted">Loading sales data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-5">
                    {" "}
                    {/* Updated colSpan from 10 to 11 */}
                    <div className="d-flex flex-column align-items-center">
                      <FiSearch size={48} className="text-muted mb-3" />
                      <p className="text-muted mb-1">
                        {search
                          ? "No sales found matching your search"
                          : "No sales available"}
                      </p>
                      <small className="text-muted">
                        {search
                          ? "Try different keywords"
                          : "Create a new sale to get started"}
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                currentSales.map((sale, index) => {
                  // Calculate total if not available
                  const total =
                    sale.grand_total ||
                    sale.total_amount ||
                    calculateTotal(sale.items) ||
                    0;

                  // Calculate balance amount
                  const balanceAmount = calculateBalanceAmount(sale);

                  // Get customer info
                  const customerName =
                    sale.customer_name ||
                    getCustomerName(sale.customer_id) ||
                    "Unknown Customer";
                  const customerCode =
                    sale.customer_code || sale.customer_id?.customer_code || "";
                  const customerPhone =
                    sale.customer_phone || sale.customer_id?.phone || "";

                  return (
                    <tr key={sale._id || index} className="hover-row">
                      <td className="text-muted">
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td>
                        <div className="fw-bold text-primary">
                          {sale.reference_no || sale.sale_number || "REF-N/A"}
                        </div>
                        {sale.reference_no?.startsWith("TEMP-") && (
                          <small className="text-warning small">
                            (Pending)
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="fw-medium">{customerName}</div>
                        <div className="text-muted small">
                          {customerPhone && `${customerPhone}`}
                          {customerCode && ` (${customerCode})`}
                        </div>
                        {sale.customer_id?.email && (
                          <div className="text-muted small">
                            {sale.customer_id.email}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="d-flex align-items-center">
                          <FiCalendar className="me-1 text-muted" size={14} />
                          <span className="fw-medium">
                            {formatDate(sale.sale_date)}
                          </span>
                        </div>
                        {sale.due_date && (
                          <small className="text-muted d-block">
                            Due: {formatDate(sale.due_date)}
                          </small>
                        )}
                      </td>

                      <td>
                        <div className="fw-medium">{sale.branch_name}</div>
                      </td>

                      <td>
                        <div className="small">
                          <div
                            className="fw-medium text-truncate"
                            style={{ maxWidth: "200px" }}
                          >
                            {getItemNames(sale.items)}
                          </div>
                          <div className="text-muted">
                            {getItemDetails(sale.items)}
                          </div>
                          {sale.items?.some((item) => item.product_code) && (
                            <div className="text-muted">
                              {sale.items
                                .filter((item) => item.product_code)
                                .slice(0, 2)
                                .map((item) => item.product_code)
                                .join(", ")}
                              {sale.items.filter((item) => item.product_code)
                                .length > 2 && "..."}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="fw-bold text-dark">
                          ₹
                          {total.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        {sale.currency && sale.currency !== "INR" && (
                          <small className="text-muted">{sale.currency}</small>
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge fw-semibold ${getStatusBadgeClass(
                            sale.status
                          )}`}
                        >
                          {sale.status
                            ? sale.status.charAt(0).toUpperCase() +
                              sale.status.slice(1)
                            : "Draft"}
                        </span>
                        {sale.payment_method && (
                          <small className="d-block text-muted mt-1">
                            {sale.payment_method}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span
                            className={`badge fw-semibold ${getPaymentStatusBadgeClass(
                              sale.payment_status
                            )}`}
                          >
                            {sale.payment_status
                              ? sale.payment_status.charAt(0).toUpperCase() +
                                sale.payment_status.slice(1)
                              : "Pending"}
                          </span>
                          {sale.paid_amount !== undefined &&
                            sale.paid_amount > 0 && (
                              <small className="text-muted">
                                Paid: ₹
                                {sale.paid_amount.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </small>
                            )}
                        </div>
                      </td>

                      {/* NEW: Balance Amount Column */}
                      <td>
                        <div className="d-flex flex-column">
                          <div
                            className={`fw-bold ${
                              balanceAmount === 0
                                ? "text-success"
                                : balanceAmount < 0
                                ? "text-danger"
                                : "text-warning"
                            }`}
                          >
                            ₹
                            {balanceAmount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          {balanceAmount > 0 &&
                            sale.payment_status === "partial" && (
                              <small className="text-muted">Due</small>
                            )}
                          {balanceAmount === 0 &&
                            sale.payment_status === "paid" && (
                              <small className="text-success">Fully Paid</small>
                            )}
                          {balanceAmount < 0 && (
                            <small className="text-danger">Overpaid</small>
                          )}
                          {sale.due_date &&
                            balanceAmount > 0 &&
                            new Date(sale.due_date) < new Date() && (
                              <small className="text-danger">Overdue</small>
                            )}
                        </div>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          {/* View Button */}
                          <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                            onClick={() => handleOpenView(sale)}
                            title="View Details"
                            disabled={
                              actionLoading.type &&
                              actionLoading.id === sale._id
                            }
                          >
                            <FiEye size={14} />
                            <span className="d-none d-md-inline">View</span>
                          </button>

                          {/* Payment Status Button */}
                          <button
                            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                            onClick={() => handleOpenPaymentStatusUpdate(sale)}
                            disabled={
                              actionLoading.type &&
                              actionLoading.id === sale._id
                            }
                            title="Update Payment Status"
                          >
                            <FiDollarSign size={14} />
                            <span className="d-none d-md-inline">Payment</span>
                          </button>

                          {/* Return Button */}
                          <button
                            className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                            onClick={() => handleOpenReturn(sale)}
                            disabled={
                              sale.status === "cancelled" ||
                              (actionLoading.type &&
                                actionLoading.id === sale._id)
                            }
                            title="Create Return"
                          >
                            {actionLoading.type === "return" &&
                            actionLoading.id === sale._id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                <span className="d-none d-md-inline">
                                  Returning...
                                </span>
                              </>
                            ) : (
                              <>
                                <FiRepeat size={14} />
                                <span className="d-none d-md-inline">
                                  Return
                                </span>
                              </>
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={() => handleOpenEdit(sale)}
                            disabled={
                              actionLoading.type &&
                              actionLoading.id === sale._id
                            }
                            title="Edit"
                          >
                            {actionLoading.type === "update" &&
                            actionLoading.id === sale._id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                <span className="d-none d-md-inline">
                                  Editing...
                                </span>
                              </>
                            ) : (
                              <>
                                <FiEdit2 size={14} />
                                <span className="d-none d-md-inline">Edit</span>
                              </>
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            onClick={() => handleOpenDelete(sale)}
                            disabled={
                              actionLoading.type &&
                              actionLoading.id === sale._id
                            }
                            title="Delete"
                          >
                            {actionLoading.type === "delete" &&
                            actionLoading.id === sale._id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                <span className="d-none d-md-inline">
                                  Deleting...
                                </span>
                              </>
                            ) : (
                              <>
                                <RiDeleteBin6Line size={14} />
                                <span className="d-none d-md-inline">
                                  Delete
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {filteredSales.length > 0 && (
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
      {/* ADD MODAL */}
      {showAddModal && (
        <AddSaleForm
          key="add-modal"
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSale}
          loading={actionLoading.type === "add"}
        />
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedItem && (
        <ViewSaleModal
          key={`view-modal-${selectedItem._id}`}
          sale={selectedItem}
          onClose={() => {
            setShowViewModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* PAYMENT STATUS UPDATE MODAL */}
      <PaymentStatusUpdateModal
        showModal={showPaymentStatusModal}
        onClose={() => {
          setShowPaymentStatusModal(false);
          setSelectedSaleForPaymentUpdate(null);
        }}
        sale={selectedSaleForPaymentUpdate}
        onUpdate={handleUpdatePaymentStatus}
        loading={
          actionLoading.type === "payment_update" &&
          actionLoading.id === selectedSaleForPaymentUpdate?._id
        }
      />

      {/* RETURN MODAL */}
      {showReturnModal && selectedSaleForReturn && (
        <CreateSaleReturnModal
          key={`return-modal-${selectedSaleForReturn._id}`}
          sale={selectedSaleForReturn}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedSaleForReturn(null);
          }}
          onSave={handleCreateReturn}
          loading={
            actionLoading.type === "return" &&
            actionLoading.id === selectedSaleForReturn._id
          }
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditSaleForm
          key={`edit-modal-${selectedItem._id}`}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleEditSale}
          sale={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
        />
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default SalesTable;
