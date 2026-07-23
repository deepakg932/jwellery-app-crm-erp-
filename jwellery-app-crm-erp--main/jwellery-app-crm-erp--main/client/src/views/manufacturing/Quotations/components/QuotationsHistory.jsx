// components/quotations/QuotationsHistory.jsx
import React, { useState, useEffect } from "react";
import {
  FiEye,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiRefreshCw,
  FiCalendar,
  FiUser,
  FiPackage,
  FiDollarSign,
  FiFileText,
} from "react-icons/fi";
import { RiHistoryLine } from "react-icons/ri";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

const QuotationsHistory = () => {
  const [actualQuotation, setActualQuotation] = useState(null);
  const [previousQuotations, setPreviousQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);

  // Search and filter states
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch quotations history
  const fetchQuotationsHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getQuotationsHistory();
      console.log("Fetching quotations history from:", url);

      const res = await axios.get(url);
      console.log("Quotations History API Response:", res.data);

      if (res.data?.success) {
        const data = res.data.data;
        setActualQuotation(data.actual_quotation);
        setPreviousQuotations(data.previous_quotations || []);
      } else {
        throw new Error(res.data?.message || "Failed to fetch quotations history");
      }
    } catch (err) {
      console.error("Fetch quotations history error:", err);
      
      if (err.response) {
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
        setError(errorMessage);
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to load quotations history. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate days difference
  const getDaysDifference = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get status based on expiry date
  const getQuotationStatus = (expiryDate) => {
    if (!expiryDate) return "active";
    const daysLeft = getDaysDifference(expiryDate);
    
    if (daysLeft < 0) return "expired";
    if (daysLeft === 0) return "expiring-today";
    if (daysLeft <= 7) return "expiring-soon";
    return "active";
  };

  // Get status badge
  const getStatusBadge = (expiryDate) => {
    const status = getQuotationStatus(expiryDate);
    const daysLeft = getDaysDifference(expiryDate);
    
    const statusConfig = {
      expired: { color: "danger", label: "Expired" },
      "expiring-today": { color: "warning", label: "Expires Today" },
      "expiring-soon": { color: "warning", label: `${daysLeft} days left` },
      active: { color: "success", label: `${daysLeft} days left` },
    };

    const config = statusConfig[status] || { color: "secondary", label: "N/A" };

    return (
      <span className={`badge bg-${config.color} text-white fw-semibold`}>
        {config.label}
      </span>
    );
  };

  // Filter quotations (only actual quotations for table)
  const filteredQuotations = actualQuotation ? [actualQuotation] : [];

  // Get unique customers for filter (from all quotations)
  const allQuotations = actualQuotation ? [actualQuotation, ...previousQuotations] : [...previousQuotations];
  const uniqueCustomers = [
    ...new Map(
      allQuotations
        .filter(q => q.customer)
        .map(q => [q.customer.id, q.customer])
    ).values()
  ];

  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  // Initialize
  useEffect(() => {
    fetchQuotationsHistory();
  }, []);

  // View Quotation Modal
  const ViewQuotationModal = () => {
    if (!actualQuotation) return null;

    // Get the most recent previous quotation for comparison
    const previousQuotation = previousQuotations.length > 0 ? previousQuotations[0] : null;

    return (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto", maxHeight: "100vh" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content rounded-3" style={{ maxHeight: "90vh" }}>
            <div className="modal-header border-bottom pb-3 sticky-top bg-white">
              <div className="d-flex justify-content-between align-items-center w-100">
                <div>
                  <h5 className="modal-title fw-bold fs-5 mb-0">
                    <RiHistoryLine className="me-2" />
                    Quotation Comparison
                  </h5>
                  <p className="text-muted small mb-0 mt-1">
                    Showing current and previous quotation comparison
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                  aria-label="Close"
                ></button>
              </div>
            </div>

            <div className="modal-body" style={{ overflowY: "auto" }}>
              {/* Two Column Comparison Header */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card border-primary border-2">
                    <div className="card-body">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="fw-bold mb-0 text-primary">
                          Current Quotation
                        </h6>
                        <span className="badge bg-primary">Latest</span>
                      </div>
                      <div className="fw-bold fs-4">{actualQuotation.quotation_number}</div>
                      <div className="small text-muted">
                        Created: {formatDate(actualQuotation.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-secondary">
                    <div className="card-body">
                      <h6 className="fw-bold mb-2 text-secondary">
                        Previous Version
                      </h6>
                      {previousQuotation ? (
                        <>
                          <div className="fw-bold fs-4">{previousQuotation.quotation_number}</div>
                          <div className="small text-muted">
                            Created: {formatDate(previousQuotation.createdAt)}
                          </div>
                        </>
                      ) : (
                        <div className="text-muted fst-italic">
                          No previous quotation available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info Comparison */}
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">
                        <FiUser className="me-2" />
                        Customer Information
                      </h6>
                      <div className="row">
                        <div className="col-md-6 border-end">
                          <div className="mb-3">
                            <div className="text-muted small">Customer Name</div>
                            <div className="fw-medium">
                              {actualQuotation.customer?.name || "N/A"}
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="text-muted small">Mobile Number</div>
                            <div className="fw-medium">
                              {actualQuotation.customer?.mobile || "N/A"}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted small">Quotation Date</div>
                            <div className="fw-medium">
                              {formatDate(actualQuotation.quotation_date)}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          {previousQuotation ? (
                            <>
                              <div className="mb-3">
                                <div className="text-muted small">Customer Name</div>
                                <div className="fw-medium">
                                  {previousQuotation.customer?.name || "N/A"}
                                  {previousQuotation.customer?.name === actualQuotation.customer?.name ? (
                                    <span className="badge bg-success ms-2">Same</span>
                                  ) : (
                                    <span className="badge bg-warning ms-2">Changed</span>
                                  )}
                                </div>
                              </div>
                              <div className="mb-3">
                                <div className="text-muted small">Mobile Number</div>
                                <div className="fw-medium">
                                  {previousQuotation.customer?.mobile || "N/A"}
                                  {previousQuotation.customer?.mobile === actualQuotation.customer?.mobile ? (
                                    <span className="badge bg-success ms-2">Same</span>
                                  ) : (
                                    <span className="badge bg-warning ms-2">Changed</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted small">Quotation Date</div>
                                <div className="fw-medium">
                                  {formatDate(previousQuotation.quotation_date)}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-4 text-muted">
                              <FiFileText size={48} />
                              <div className="mt-2">No previous quotation</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Comparison */}
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">
                        <FiPackage className="me-2" />
                        Items Comparison
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th className="text-center">Current Qty</th>
                              <th className="text-center">Prev Qty</th>
                              <th className="text-center">Qty Change</th>
                              <th className="text-center">Current Price</th>
                              <th className="text-center">Prev Price</th>
                              <th className="text-center">Price Change</th>
                              <th className="text-center">Current Total</th>
                              <th className="text-center">Prev Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {actualQuotation.items?.map((currentItem, index) => {
                              const previousItem = previousQuotation?.items?.[index];
                              const qtyChange = previousItem 
                                ? calculatePercentageChange(currentItem.quantity, previousItem.quantity)
                                : null;
                              const priceChange = previousItem 
                                ? calculatePercentageChange(currentItem.unit_price, previousItem.unit_price)
                                : null;

                              return (
                                <tr key={index}>
                                  <td>
                                    <div className="fw-medium">{currentItem.product_name}</div>
                                  </td>
                                  <td className="text-center fw-medium">
                                    {currentItem.quantity}
                                  </td>
                                  <td className="text-center">
                                    {previousItem ? previousItem.quantity : "-"}
                                  </td>
                                  <td className="text-center">
                                    {qtyChange !== null ? (
                                      <span className={`badge ${qtyChange > 0 ? "bg-success" : qtyChange < 0 ? "bg-danger" : "bg-secondary"}`}>
                                        {qtyChange > 0 ? "+" : ""}{qtyChange}%
                                      </span>
                                    ) : "-"}
                                  </td>
                                  <td className="text-center fw-medium">
                                    {formatCurrency(currentItem.unit_price)}
                                  </td>
                                  <td className="text-center">
                                    {previousItem ? formatCurrency(previousItem.unit_price) : "-"}
                                  </td>
                                  <td className="text-center">
                                    {priceChange !== null ? (
                                      <span className={`badge ${priceChange > 0 ? "bg-success" : priceChange < 0 ? "bg-danger" : "bg-secondary"}`}>
                                        {priceChange > 0 ? "+" : ""}{priceChange}%
                                      </span>
                                    ) : "-"}
                                  </td>
                                  <td className="text-center fw-medium text-primary">
                                    {formatCurrency(currentItem.subtotal)}
                                  </td>
                                  <td className="text-center">
                                    {previousItem ? formatCurrency(previousItem.subtotal) : "-"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Summary Comparison */}
              <div className="row">
                <div className="col-md-6">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">
                        <FiDollarSign className="me-2" />
                        Current Quotation Summary
                      </h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Subtotal:</span>
                        <span className="fw-medium">{formatCurrency(actualQuotation.subtotal)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Tax:</span>
                        <span className="fw-medium">{formatCurrency(actualQuotation.tax_amount)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Shipping:</span>
                        <span className="fw-medium">{formatCurrency(actualQuotation.shipping_cost)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Discount:</span>
                        <span className="fw-medium text-danger">-{formatCurrency(actualQuotation.discount)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Grand Total:</span>
                        <span className="fw-bold fs-5 text-primary">{formatCurrency(actualQuotation.grand_total)}</span>
                      </div>
                      <div className="mt-3">
                        <div className="text-muted small">Expiry Date:</div>
                        <div className="fw-medium">
                          {formatDate(actualQuotation.expiry_date)}
                          {" • "}
                          {getStatusBadge(actualQuotation.expiry_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">
                        <FiDollarSign className="me-2" />
                        Previous Quotation Summary
                      </h6>
                      {previousQuotation ? (
                        <>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Subtotal:</span>
                            <div className="text-end">
                              <div className="fw-medium">{formatCurrency(previousQuotation.subtotal)}</div>
                              {calculatePercentageChange(actualQuotation.subtotal, previousQuotation.subtotal) !== null && (
                                <div className={`small ${actualQuotation.subtotal > previousQuotation.subtotal ? "text-success" : actualQuotation.subtotal < previousQuotation.subtotal ? "text-danger" : "text-muted"}`}>
                                  {actualQuotation.subtotal > previousQuotation.subtotal ? "↑" : actualQuotation.subtotal < previousQuotation.subtotal ? "↓" : "→"}
                                  {calculatePercentageChange(actualQuotation.subtotal, previousQuotation.subtotal)}%
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Tax:</span>
                            <div className="text-end">
                              <div className="fw-medium">{formatCurrency(previousQuotation.tax_amount)}</div>
                              {calculatePercentageChange(actualQuotation.tax_amount, previousQuotation.tax_amount) !== null && (
                                <div className={`small ${actualQuotation.tax_amount > previousQuotation.tax_amount ? "text-success" : actualQuotation.tax_amount < previousQuotation.tax_amount ? "text-danger" : "text-muted"}`}>
                                  {actualQuotation.tax_amount > previousQuotation.tax_amount ? "↑" : actualQuotation.tax_amount < previousQuotation.tax_amount ? "↓" : "→"}
                                  {calculatePercentageChange(actualQuotation.tax_amount, previousQuotation.tax_amount)}%
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Shipping:</span>
                            <div className="text-end">
                              <div className="fw-medium">{formatCurrency(previousQuotation.shipping_cost)}</div>
                              {calculatePercentageChange(actualQuotation.shipping_cost, previousQuotation.shipping_cost) !== null && (
                                <div className={`small ${actualQuotation.shipping_cost > previousQuotation.shipping_cost ? "text-success" : actualQuotation.shipping_cost < previousQuotation.shipping_cost ? "text-danger" : "text-muted"}`}>
                                  {actualQuotation.shipping_cost > previousQuotation.shipping_cost ? "↑" : actualQuotation.shipping_cost < previousQuotation.shipping_cost ? "↓" : "→"}
                                  {calculatePercentageChange(actualQuotation.shipping_cost, previousQuotation.shipping_cost)}%
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Discount:</span>
                            <div className="text-end">
                              <div className="fw-medium text-danger">-{formatCurrency(previousQuotation.discount)}</div>
                              {calculatePercentageChange(actualQuotation.discount, previousQuotation.discount) !== null && (
                                <div className={`small ${actualQuotation.discount > previousQuotation.discount ? "text-success" : actualQuotation.discount < previousQuotation.discount ? "text-danger" : "text-muted"}`}>
                                  {actualQuotation.discount > previousQuotation.discount ? "↑" : actualQuotation.discount < previousQuotation.discount ? "↓" : "→"}
                                  {calculatePercentageChange(actualQuotation.discount, previousQuotation.discount)}%
                                </div>
                              )}
                            </div>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">Grand Total:</span>
                            <div className="text-end">
                              <div className="fw-bold fs-5 text-secondary">{formatCurrency(previousQuotation.grand_total)}</div>
                              {calculatePercentageChange(actualQuotation.grand_total, previousQuotation.grand_total) !== null && (
                                <div className={`small ${actualQuotation.grand_total > previousQuotation.grand_total ? "text-success" : actualQuotation.grand_total < previousQuotation.grand_total ? "text-danger" : "text-muted"}`}>
                                  {actualQuotation.grand_total > previousQuotation.grand_total ? "↑" : actualQuotation.grand_total < previousQuotation.grand_total ? "↓" : "→"}
                                  {calculatePercentageChange(actualQuotation.grand_total, previousQuotation.grand_total)}%
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="text-muted small">Expiry Date:</div>
                            <div className="fw-medium">
                              {formatDate(previousQuotation.expiry_date)}
                              {" • "}
                              {getStatusBadge(previousQuotation.expiry_date)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4 text-muted">
                          <FiFileText size={48} />
                          <div className="mt-2">No previous quotation summary available</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Comparison */}
              {(actualQuotation.notes || (previousQuotation && previousQuotation.notes)) && (
                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="card border">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Current Notes</h6>
                        <p className={!actualQuotation.notes ? "text-muted fst-italic" : ""}>
                          {actualQuotation.notes || "No notes"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Previous Notes</h6>
                        <p className={!previousQuotation?.notes ? "text-muted fst-italic" : ""}>
                          {previousQuotation?.notes || "No notes"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowViewModal(false)}
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
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")} />
        </div>
      )}

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3">
                <RiHistoryLine size={32} className="text-primary" />
                <div>
                  <h1 className="h3 fw-bold mb-1">Current Quotation</h1>
                  <p className="text-muted mb-0">
                    View current quotation with previous version comparison
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={fetchQuotationsHistory}
                disabled={loading}
              >
                <FiRefreshCw size={18} className={loading ? "spin" : ""} />
                Refresh
              </button>
              {actualQuotation && (
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={() => setShowViewModal(true)}
                  disabled={loading}
                >
                  <RiHistoryLine size={18} />
                  View Comparison
                </button>
              )}
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
                  placeholder="Search by quotation #, customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading || !actualQuotation}
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loading || !actualQuotation}
              >
                <option value="all">All Dates</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={customerFilter}
                onChange={(e) => {
                  setCustomerFilter(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loading || uniqueCustomers.length === 0}
              >
                <option value="all">All Customers</option>
                {uniqueCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.mobile})
                  </option>
                ))}
              </select>
            </div>

            {/* Items per page selector */}
            <div className="col-md-2 ms-auto">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CURRENT QUOTATION TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Current Quotation Details</h5>
            {actualQuotation && (
              <span className="badge bg-primary">
                Latest Version
              </span>
            )}
          </div>
        </div>
        
        <div className="card-body">
          {loading && !actualQuotation ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : !actualQuotation ? (
            <div className="text-center py-5 text-muted">
              No current quotation found
            </div>
          ) : (
            <div className="row">
              <div className="col-md-12">
                <div className="card border-primary border-2">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="mb-3">
                          <div className="text-muted small">Quotation Number</div>
                          <div className="fw-bold fs-5">{actualQuotation.quotation_number}</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="mb-3">
                          <div className="text-muted small">Customer Name</div>
                          <div className="fw-medium">
                            {actualQuotation.customer?.name || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="mb-3">
                          <div className="text-muted small">Mobile</div>
                          <div className="fw-medium">
                            {actualQuotation.customer?.mobile || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="mb-3">
                          <div className="text-muted small">Quotation Date</div>
                          <div className="fw-medium">
                            {formatDate(actualQuotation.quotation_date)}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="mb-3">
                          <div className="text-muted small">Expiry Status</div>
                          <div>
                            {getStatusBadge(actualQuotation.expiry_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <div className="text-muted small">Items Count</div>
                          <div className="fw-medium">
                            {actualQuotation.items?.length || 0} items
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <div className="text-muted small">Grand Total</div>
                          <div className="fw-bold fs-4 text-primary">
                            {formatCurrency(actualQuotation.grand_total)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex justify-content-end">
                          <button
                            className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={() => setShowViewModal(true)}
                          >
                            <RiHistoryLine />
                            Compare with Previous Version
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && <ViewQuotationModal />}

      {/* CSS for spinner animation */}
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QuotationsHistory;