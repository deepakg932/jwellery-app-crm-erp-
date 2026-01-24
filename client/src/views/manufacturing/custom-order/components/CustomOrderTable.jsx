import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiFileText,
  FiEye,
  FiPrinter,
  FiCheckCircle,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import CustomOrderForm from "./AddCustomOrder";
import useCustomOrders from "@/hooks/useCustomOrders";
import useQuotations from "@/hooks/useQuotations";
import AddQuotationForm from "@/views/manufacturing/quotations/components/AddQuotationForm";

const CustomOrderTable = () => {
  const {
    customOrders,
    customers,
    customerGroups,
    loading,
    error,
    units,
    addCustomer,
    addCustomOrder,
    updateCustomOrder,
    deleteCustomOrder,
    fetchCustomOrders,
    fetchCustomers,
  } = useCustomOrders();

  const {
    quotations,
    fetchQuotations,
    customers: quotationCustomers,
    loading: quotationsLoading,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    convertToSale,
  } = useQuotations();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddQuotationModal, setShowAddQuotationModal] = useState(false);
  const [showViewQuotationModal, setShowViewQuotationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  const [customerQuotations, setCustomerQuotations] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtered orders
  const filteredOrders = customOrders.filter(
    (order) =>
      order.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_mobile?.includes(search) ||
      order.purity?.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Load quotations for each customer
  useEffect(() => {
    const loadCustomerQuotations = () => {
      const quotationsByCustomer = {};

      quotations.forEach((quotation) => {
        const customerId = quotation.customer_id?._id || quotation.customer_id;
        if (customerId) {
          if (!quotationsByCustomer[customerId]) {
            quotationsByCustomer[customerId] = [];
          }
          quotationsByCustomer[customerId].push(quotation);
        }
      });

      setCustomerQuotations(quotationsByCustomer);
    };

    if (quotations.length > 0) {
      loadCustomerQuotations();
    }
  }, [quotations]);

  // Calculate pagination
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

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

  // Format delivery date
  const formatDeliveryDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
            ? "Overdue"
            : diffDays === 0
            ? "Today"
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

  // Get quotations for a specific customer
  const getCustomerQuotations = (customerId) => {
    return customerQuotations[customerId] || [];
  };

  // Handle add quotation
  const handleAddQuotation = async (quotationData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "add_quotation", id: selectedItem._id });
    try {
      console.log("Creating quotation with data:", quotationData);

      const result = await addQuotation(quotationData);
      console.log("Quotation created successfully:", result);

      await fetchQuotations();

      setShowAddQuotationModal(false);
      setSelectedItem(null);

      alert("Quotation created successfully!");
    } catch (error) {
      console.error("Failed to add quotation:", error);
      alert(`Failed to create quotation: ${error.message || error}`);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle view quotations
  const handleViewQuotations = (order) => {
    const customerId = order.customer_id;
    const customerQuotationList = getCustomerQuotations(customerId);

    if (customerQuotationList.length === 0) {
      alert("No quotations found for this customer");
      return;
    }

    // Set the selected item for context
    setSelectedItem(order);

    // For now, show the first quotation
    // You might want to create a list modal to select which quotation to view
    setSelectedQuotation(customerQuotationList[0]);
    setShowViewQuotationModal(true);
  };

  // Handle customer addition from form
  const handleAddCustomer = async (customerData) => {
    try {
      // Format customer data for API
      const apiData = {
        ...customerData,
        name: customerData.customer_name?.trim(),
        mobile: customerData.mobile?.trim() || customerData.phone?.trim() || "",
        customer_group_id: customerData.customer_group_id,
        status: customerData.status ? "active" : "inactive",
      };

      console.log("Adding customer from order form:", apiData);

      // Call addCustomer from your hook
      const newCustomer = await addCustomer(apiData);

      // Refresh customers list
      if (fetchCustomers) {
        await fetchCustomers();
      }

      return newCustomer;
    } catch (error) {
      console.error("Failed to add customer:", error);
      throw error;
    }
  };

    // Add new order
  const handleAddOrder = async (orderData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addCustomOrder(orderData);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Edit order
  const handleEditOrder = async (updatedOrder) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateCustomOrder(selectedItem._id, updatedOrder);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

    // Delete order
  const handleDeleteOrder = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteCustomOrder(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };
  // Handle convert to sale
  const handleConvertToSale = async () => {
    if (!selectedQuotation) return;

    setActionLoading({ type: "convert", id: selectedQuotation._id });
    try {
      await convertToSale(selectedQuotation._id);
      await fetchQuotations();
      alert("Quotation converted to sale successfully!");
    } catch (error) {
      console.error("Convert failed:", error);
      alert(`Failed to convert quotation: ${error.message || error}`);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open add quotation modal
  const handleOpenAddQuotation = (order) => {
    setSelectedItem(order);
    setShowAddQuotationModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (order) => {
    setSelectedItem(order);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (order) => {
    setSelectedItem(order);
    setShowDeleteModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchCustomOrders();
    fetchQuotations();
  };

  // Get status badge for quotations
  const getQuotationStatusBadge = (status, expiryDate) => {
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

  // Get status badge for custom orders
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending" },
      design: { color: "info", label: "Design" },
      making: { color: "info", label: "Making" },
      stone_setting: { color: "info", label: "Stone Setting" },
      polishing: { color: "info", label: "Polishing" },
      quality_check: { color: "primary", label: "Quality Check" },
      ready: { color: "success", label: "Ready" },
      completed: { color: "success", label: "Completed" },
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

  // Quotation badge for customer
  const getQuotationBadge = (customerId) => {
    const quotations = getCustomerQuotations(customerId);
    if (quotations.length === 0) {
      return null;
    }

    const activeQuotations = quotations.filter(
      (q) => q.status !== "converted" && q.status !== "expired"
    );

    return (
      <span
        className="badge bg-info ms-2"
        title={`${quotations.length} quotation(s)`}
      >
        {activeQuotations.length > 0
          ? `${activeQuotations.length} Active QTN`
          : `${quotations.length} QTN`}
      </span>
    );
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
            <h5 className="modal-title fw-bold fs-5">Delete Custom Order</h5>
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
              Are you sure you want to delete custom order{" "}
              <strong>{selectedItem?.order_number}</strong>?
            </p>
            <p className="text-muted small">
              Customer: <strong>{selectedItem?.customer_name || "N/A"}</strong>
              <br />
              Weight: <strong>{selectedItem?.weight} g</strong>
              <br />
              Purity: <strong>{selectedItem?.purity || "N/A"}</strong>
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
              onClick={handleDeleteOrder}
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

  // View Quotation Modal
  const ViewQuotationModal = () => {
    if (!selectedQuotation || !selectedItem) return null;

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
              <h5 className="modal-title fw-bold fs-5">Quotation Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShowViewQuotationModal(false);
                  setSelectedQuotation(null);
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
                    Quotation #
                    {selectedQuotation.quotation_number ||
                      selectedQuotation.reference_no}
                  </h6>
                  <div className="small text-muted">
                    Created: {formatDate(selectedQuotation.created_at)}
                  </div>
                </div>
                <div className="col-md-6 text-end">
                  {getQuotationStatusBadge(
                    selectedQuotation.status,
                    selectedQuotation.expiry_date
                  )}
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
                        <span className="fw-medium ms-2">
                          {selectedQuotation.customer_name ||
                            selectedItem.customer_name}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Mobile:</span>
                        <span className="fw-medium ms-2">
                          {selectedQuotation.customer_mobile ||
                            selectedItem.customer_mobile}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <span className="text-muted">Code:</span>
                        <span className="fw-medium ms-2">
                          {selectedQuotation.customer_code || "N/A"}
                        </span>
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
                        {selectedQuotation.items?.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div>
                                <div className="fw-medium">
                                  {item.product_name || "Product"}
                                </div>
                                <div className="small text-muted">
                                  {item.product_code || "N/A"}
                                </div>
                              </div>
                            </td>
                            <td className="text-end">{item.quantity || 0}</td>
                            <td className="text-end">
                              {formatCurrency(
                                item.unit_price || item.price || 0
                              )}
                            </td>
                            <td className="text-end fw-medium">
                              {formatCurrency(
                                item.subtotal || item.net_price || 0
                              )}
                            </td>
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
                        <span className="fw-medium ms-2">
                          {formatDate(selectedQuotation.quotation_date)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Expiry Date:</span>
                        <span className="fw-medium ms-2">
                          {formatDate(selectedQuotation.expiry_date)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Branch:</span>
                        <span className="fw-medium ms-2">
                          {selectedQuotation.branch_name || "N/A"}
                        </span>
                      </div>
                      {selectedQuotation.note && (
                        <div className="mb-2">
                          <span className="text-muted">Notes:</span>
                          <span className="fw-medium ms-2">
                            {selectedQuotation.note}
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
                        <span className="text-muted">Subtotal:</span>
                        <span className="fw-medium">
                          {formatCurrency(selectedQuotation.subtotal)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Tax:</span>
                        <span className="fw-medium">
                          {formatCurrency(selectedQuotation.tax_amount)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Shipping:</span>
                        <span className="fw-medium">
                          {formatCurrency(selectedQuotation.shipping_cost)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Discount:</span>
                        <span className="fw-medium text-danger">
                          -{formatCurrency(selectedQuotation.discount)}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Grand Total:</span>
                        <span className="fw-bold fs-5 text-primary">
                          {formatCurrency(selectedQuotation.grand_total)}
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
                  setShowViewQuotationModal(false);
                  setSelectedQuotation(null);
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
              {selectedQuotation.status !== "converted" && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleConvertToSale}
                  disabled={
                    actionLoading.type === "convert" &&
                    actionLoading.id === selectedQuotation._id
                  }
                >
                  {actionLoading.type === "convert" &&
                  actionLoading.id === selectedQuotation._id ? (
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

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Custom Orders</h1>
              <p className="text-muted mb-0">
                Manage custom jewelry orders with weight, purity, and delivery
                tracking
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleRefresh}
                disabled={loading || quotationsLoading}
              >
                Refresh
              </button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                New Custom Order
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
                  placeholder="Search by order #, customer, purity..."
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
                <th>Order #</th>
                <th>Customer</th>
                <th>Weight (g)</th>
                <th>Purity</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && customOrders.length === 0 ? (
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
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    {search
                      ? "No custom orders found for your search"
                      : "No custom orders available"}
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, index) => (
                  <tr key={order._id || index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td className="fw-bold text-primary">
                      {order.order_number}
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold d-flex align-items-center">
                          {order.customer_name || "N/A"}
                       
                        </div>
                        <small className="text-muted">
                            {getQuotationBadge(order.customer_id)}
                        </small>
                      </div>
                    </td>
                    <td className="fw-semibold">{order.weight} g</td>
                    <td>
                      <span className="badge bg-light text-dark fw-semibold">
                        {order.purity || "N/A"}
                      </span>
                    </td>
                    <td>{formatDeliveryDate(order.delivery_date)}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <span className="text-muted small">
                        {formatDate(order.created_at)}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        {/* Add Quotation Button */}
                        <button
                          className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                          onClick={() => handleOpenAddQuotation(order)}
                          disabled={
                            actionLoading.type && actionLoading.id === order._id
                          }
                          title="Create Quotation for this customer"
                        >
                          <FiFileText size={16} />
                          Add Quotation
                        </button>

                        {/* View Quotations Button */}
                        <button
                          className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                          onClick={() => handleViewQuotations(order)}
                          disabled={
                            actionLoading.type && actionLoading.id === order._id
                          }
                          title="View customer's quotations"
                        >
                          <FiEye size={16} />
                          View Quotations
                        </button>

                        {/* Edit Button */}
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(order)}
                          disabled={
                            actionLoading.type && actionLoading.id === order._id
                          }
                        >
                          <FiEdit2 size={16} />
                          Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(order)}
                          disabled={
                            actionLoading.type && actionLoading.id === order._id
                          }
                        >
                          <RiDeleteBin6Line size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {filteredOrders.length > 0 && (
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

      {/* ADD QUOTATION MODAL */}
      {showAddQuotationModal && selectedItem && (
        <AddQuotationForm
          onClose={() => {
            setShowAddQuotationModal(false);
            setSelectedItem(null);
          }}
          onSave={handleAddQuotation}
          initialCustomerId={selectedItem.customer_id}
          loading={actionLoading.type === "add_quotation"}
        />
      )}

      {/* VIEW QUOTATION MODAL */}
      {showViewQuotationModal && selectedQuotation && <ViewQuotationModal />}

      {/* OTHER MODALS */}
      {showAddModal && (
        <CustomOrderForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAddOrder}
          onAddCustomer={handleAddCustomer}
          loading={actionLoading.type === "add"}
          customers={customers}
          units={units}
          customerGroups={customerGroups}
          mode="add"
        />
      )}

      {showEditModal && selectedItem && (
        <CustomOrderForm
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleEditOrder}
          onAddCustomer={handleAddCustomer}
          order={selectedItem}
          customers={customers}
          units={units}
          customerGroups={customerGroups}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
          mode="edit"
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
    </div>
  );
};

export default CustomOrderTable;
