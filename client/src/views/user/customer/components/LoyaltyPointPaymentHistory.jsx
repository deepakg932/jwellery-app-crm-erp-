// components/loyalty/LoyaltyPointPaymentHistory.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  FiDollarSign,
  FiAward,
  FiCreditCard,
  FiFileText,
  FiFilter,
  FiDownload,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHash,
  FiClock,
  FiTag,
} from "react-icons/fi";
import { RiHistoryLine, RiCopperCoinLine } from "react-icons/ri";
import { FaCoins, FaWallet, FaRegCalendarAlt, FaIdCard, FaStar } from "react-icons/fa";
import useCustomers from "@/hooks/useCustomers";
import { format } from "date-fns";

const LoyaltyPointPaymentHistory = () => {
  const {
    customers,
    customerGroups,
    loading: customersLoading,
  } = useCustomers();

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Search and filter states
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Generate dummy loyalty transaction data using real customers
  const generateLoyaltyData = () => {
    if (!customers.length) return [];

    const transactionTypes = ["earned", "redeemed", "expired"];
    const paymentMethods = ["Cash", "Card", "UPI", "Bank Transfer", "Wallet"];

    const transactions = [];
    const startDate = new Date("2026-02-01");
    const endDate = new Date("2026-02-23");

    // Generate 50 random transactions
    for (let i = 1; i <= 50; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const type =
        transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const date = new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime()),
      );

      let points = 0;
      let amount = 0;

      if (type === "earned") {
        points = Math.floor(Math.random() * 200) + 50;
        amount = points * 50; // Assuming ₹50 per point
      } else if (type === "redeemed") {
        points = Math.floor(Math.random() * 100) + 20;
        amount = points * 50;
      } else {
        points = Math.floor(Math.random() * 50) + 10;
      }

      transactions.push({
        _id: `TRX${i.toString().padStart(6, "0")}`,
        transaction_number: `LPT-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${i.toString().padStart(4, "0")}`,
        customer_id: customer._id,
        customer_name: customer.name,
        customer_mobile: customer.mobile,
        customer_group: customer.customer_group || "General",
        customer_email: customer.email,
        date: date.toISOString(),
        type: type,
        points: points,
        amount: amount,
        payment_method:
          type === "earned"
            ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
            : null,
        bill_number:
          type === "earned"
            ? `BILL-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${i.toString().padStart(4, "0")}`
            : null,
        description:
          type === "earned"
            ? `Points earned on purchase of ₹${amount}`
            : type === "redeemed"
              ? `Points redeemed against purchase of ₹${amount}`
              : `Points expired`,
        expiry_date:
          type === "earned"
            ? new Date(date.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        status: "completed",
        created_at: date.toISOString(),
      });
    }

    // Sort by date descending (newest first)
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Initialize data when customers are loaded
  useEffect(() => {
    if (customers.length > 0) {
      const data = generateLoyaltyData();
      setPaymentHistory(data);
      setFilteredHistory(data);
    }
  }, [customers]);

  // Apply filters
  useEffect(() => {
    let filtered = [...paymentHistory];

    // Tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.type === activeTab);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.customer_name.toLowerCase().includes(searchLower) ||
          item.customer_mobile.includes(search) ||
          item.transaction_number.toLowerCase().includes(searchLower) ||
          (item.bill_number &&
            item.bill_number.toLowerCase().includes(searchLower)),
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);

        switch (dateFilter) {
          case "today":
            return itemDate >= today;
          case "thisWeek":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return itemDate >= weekStart;
          case "thisMonth":
            return (
              itemDate.getMonth() === today.getMonth() &&
              itemDate.getFullYear() === today.getFullYear()
            );
          case "lastMonth":
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            return (
              itemDate.getMonth() === lastMonth.getMonth() &&
              itemDate.getFullYear() === lastMonth.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    // Type filter (if not using tabs)
    if (typeFilter !== "all" && activeTab === "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Customer group filter
    if (groupFilter !== "all") {
      filtered = filtered.filter((item) => item.customer_group === groupFilter);
    }

    setFilteredHistory(filtered);
    setCurrentPage(1);
  }, [search, dateFilter, typeFilter, groupFilter, paymentHistory, activeTab]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMM yyyy");
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "hh:mm a");
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get type badge
  const getTypeBadge = (type) => {
    const config = {
      earned: {
        bg: "success",
        label: "Earned",
        icon: <FaCoins className="me-1" />,
      },
      redeemed: {
        bg: "info",
        label: "Redeemed",
        icon: <FaWallet className="me-1" />,
      },
      expired: {
        bg: "secondary",
        label: "Expired",
        icon: <RiCopperCoinLine className="me-1" />,
      },
    };

    const item = config[type] || config.earned;

    return (
      <span
        className={`badge bg-${item.bg} text-white fw-semibold d-inline-flex align-items-center px-3 py-2 rounded-pill`}
      >
        {item.icon}
        {item.label}
      </span>
    );
  };

  // Get payment method badge
  const getPaymentMethodBadge = (method) => {
    const colors = {
      Cash: "success",
      Card: "primary",
      UPI: "info",
      "Bank Transfer": "warning",
      Wallet: "secondary",
    };

    return method ? (
      <span
        className={`badge bg-${colors[method] || "secondary"} bg-opacity-10 text-${colors[method] || "secondary"} fw-semibold px-3 py-2 rounded-pill`}
      >
        {method}
      </span>
    ) : (
      "-"
    );
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    const totalPointsEarned = paymentHistory
      .filter((t) => t.type === "earned")
      .reduce((sum, t) => sum + t.points, 0);

    const totalPointsRedeemed = paymentHistory
      .filter((t) => t.type === "redeemed")
      .reduce((sum, t) => sum + t.points, 0);

    const totalAmount = paymentHistory
      .filter((t) => t.type !== "expired")
      .reduce((sum, t) => sum + t.amount, 0);

    const uniqueCustomers = new Set(paymentHistory.map((t) => t.customer_id))
      .size;

    return {
      totalPointsEarned,
      totalPointsRedeemed,
      totalAmount,
      uniqueCustomers,
      totalTransactions: paymentHistory.length,
    };
  };

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredHistory.slice(startIndex, endIndex);

  // View customer details
  const viewCustomerDetails = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setShowCustomerModal(true);
    }
  };

  // View transaction details
  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const stats = getSummaryStats();

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header with breadcrumb like in the image */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 text-muted mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-dark">Loyalty</span>
          <span>/</span>
          <span className="text-primary fw-semibold">Payment History</span>
        </div>
        <h1 className="h2 fw-bold mb-0">Loyalty Point Payment History</h1>
        <p className="text-muted">Track and manage all loyalty point transactions</p>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-4"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* Stats Cards like in the image */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                <FaCoins className="text-primary" size={24} />
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Total Points Earned</div>
                <div className="h3 fw-bold mb-0">{stats.totalPointsEarned.toLocaleString()}</div>
                <div className="text-success small">
                  <FaStar className="me-1" size={12} />
                  +{stats.totalPointsEarned} points
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-info bg-opacity-10 p-3 rounded-3 me-3">
                <FaWallet className="text-info" size={24} />
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Total Points Redeemed</div>
                <div className="h3 fw-bold mb-0">{stats.totalPointsRedeemed.toLocaleString()}</div>
                <div className="text-info small">
                  <FaWallet className="me-1" size={12} />
                  {stats.totalPointsRedeemed} points used
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-3 me-3">
                <FiDollarSign className="text-success" size={24} />
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Total Transaction Amount</div>
                <div className="h3 fw-bold mb-0">{formatCurrency(stats.totalAmount)}</div>
                <div className="text-success small">
                  <FiDollarSign className="me-1" size={12} />
                  Total revenue
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-3 me-3">
                <FiUser className="text-warning" size={24} />
              </div>
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Active Customers</div>
                <div className="h3 fw-bold mb-0">{stats.uniqueCustomers}</div>
                <div className="text-warning small">
                  <FiUser className="me-1" size={12} />
                  {stats.totalTransactions} transactions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 py-3">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="fw-bold mb-0">Transaction History</h5>
            </div>
            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    if (customers.length > 0) {
                      const data = generateLoyaltyData();
                      setPaymentHistory(data);
                      setFilteredHistory(data);
                    }
                    setLoading(false);
                  }, 500);
                }}
                disabled={loading || customersLoading}
              >
                <FiRefreshCw size={14} className={loading ? "spin" : ""} />
                Refresh
              </button>
              <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2">
                <FiDownload size={14} />
                Export
              </button>
            </div>
          </div>

          {/* Tabs like in the image */}
          <ul className="nav nav-tabs card-header-tabs mt-3">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "all" ? "active fw-semibold" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Transactions
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "earned" ? "active fw-semibold" : ""}`}
                onClick={() => setActiveTab("earned")}
              >
                <FaCoins className="me-1" size={14} />
                Earned
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "redeemed" ? "active fw-semibold" : ""}`}
                onClick={() => setActiveTab("redeemed")}
              >
                <FaWallet className="me-1" size={14} />
                Redeemed
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "expired" ? "active fw-semibold" : ""}`}
                onClick={() => setActiveTab("expired")}
              >
                <RiCopperCoinLine className="me-1" size={14} />
                Expired
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {/* SEARCH AND FILTERS */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name, mobile, transaction #..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading || customersLoading}
                />
              </div>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                disabled={loading || customersLoading}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                disabled={loading || customersLoading || activeTab !== "all"}
              >
                <option value="all">All Types</option>
                <option value="earned">Earned</option>
                <option value="redeemed">Redeemed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                disabled={loading || customersLoading || !customerGroups.length}
              >
                <option value="all">All Groups</option>
                {customerGroups.map((group) => (
                  <option key={group._id} value={group.customer_group}>
                    {group.customer_group}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <div className="d-flex align-items-center">
                <label className="me-2 text-muted small">Show:</label>
                <select
                  className="form-select form-select-sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  disabled={loading || customersLoading}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>

          {/* TRANSACTIONS TABLE */}
          {loading || customersLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <RiHistoryLine size={48} className="mb-3 opacity-50" />
              <div>No transactions found</div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3">Date & Time</th>
                      <th className="py-3">Transaction #</th>
                      <th className="py-3">Customer</th>
                      <th className="py-3">Group</th>
                      <th className="py-3">Type</th>
                      <th className="py-3 text-center">Points</th>
                      <th className="py-3 text-end">Amount</th>
                      <th className="py-3">Payment Method</th>
                      <th className="py-3">Bill No.</th>
                      <th className="py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((transaction) => (
                      <tr key={transaction._id}>
                        <td>
                          <div className="d-flex flex-column">
                            <span className="fw-medium">
                              {formatDate(transaction.date)}
                            </span>
                            <small className="text-muted d-flex align-items-center gap-1">
                              <FiClock size={12} />
                              {formatTime(transaction.date)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className="fw-medium font-monospace">
                            {transaction.transaction_number}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/customer/${transaction.customer_id}`}
                            className="text-decoration-none"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                                <FiUser size={14} className="text-primary" />
                              </div>
                              <div>
                                <div className="fw-medium text-dark">
                                  {transaction.customer_name}
                                </div>
                                <small className="text-muted d-flex align-items-center gap-1">
                                  <FiPhone size={10} />
                                  {transaction.customer_mobile}
                                </small>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill">
                            {transaction.customer_group}
                          </span>
                        </td>
                        <td>{getTypeBadge(transaction.type)}</td>
                        <td className="text-center">
                          <span
                            className={`fw-bold ${
                              transaction.type === "earned"
                                ? "text-success"
                                : transaction.type === "redeemed"
                                  ? "text-info"
                                  : "text-secondary"
                            }`}
                          >
                            {transaction.type === "earned"
                              ? "+"
                              : transaction.type === "redeemed"
                                ? "-"
                                : ""}
                            {transaction.points}
                          </span>
                        </td>
                        <td className="text-end fw-medium">
                          {transaction.amount > 0 ? (
                            <span className="text-dark">
                              {formatCurrency(transaction.amount)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {getPaymentMethodBadge(transaction.payment_method)}
                        </td>
                        <td>
                          {transaction.bill_number ? (
                            <span className="small font-monospace">
                              {transaction.bill_number}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-circle p-2"
                              onClick={() => viewTransactionDetails(transaction)}
                              title="View Transaction Details"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <FiEye size={14} />
                            </button>
                            <Link
                              to={`/customer/${transaction.customer_id}`}
                              className="btn btn-sm btn-outline-info rounded-circle p-2"
                              title="View Customer Details"
                              style={{ width: "32px", height: "32px" }}
                            >
                              <FiUser size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted small">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredHistory.length)} of{" "}
                  {filteredHistory.length} entries
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <FiChevronsLeft />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft />
                  </button>
                  <span className="btn btn-sm btn-primary">
                    {currentPage}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <FiChevronRight />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <FiChevronsRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showViewModal && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {showCustomerModal && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => {
            setShowCustomerModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* CSS for spinner animation */}
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .nav-tabs .nav-link {
          color: #6c757d;
          border: none;
          padding: 0.75rem 1.5rem;
        }

        .nav-tabs .nav-link:hover {
          color: #0d6efd;
          border: none;
        }

        .nav-tabs .nav-link.active {
          color: #0d6efd;
          background: transparent;
          border-bottom: 2px solid #0d6efd;
        }

        .table th {
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6c757d;
        }

        .badge {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

// Transaction Details Modal Component
const TransactionDetailsModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto", zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <div className="d-flex align-items-center gap-2">
              <RiHistoryLine size={24} className="text-primary" />
              <div>
                <h5 className="modal-title fw-bold fs-5 mb-0">
                  Transaction Details
                </h5>
                <p className="text-muted small mb-0 mt-1">
                  {transaction.transaction_number}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="text-center mb-4">
              <div className="display-6 fw-bold mb-2">
                {transaction.type === "earned"
                  ? "+"
                  : transaction.type === "redeemed"
                    ? "-"
                    : ""}
                {transaction.points} points
              </div>
              <span
                className={`badge bg-${transaction.type === "earned" ? "success" : transaction.type === "redeemed" ? "info" : "secondary"} text-white fw-semibold d-inline-flex align-items-center px-3 py-2 rounded-pill`}
              >
                {transaction.type === "earned" ? <FaCoins className="me-1" /> : transaction.type === "redeemed" ? <FaWallet className="me-1" /> : <RiCopperCoinLine className="me-1" />}
                {transaction.type === "earned" ? "Earned" : transaction.type === "redeemed" ? "Redeemed" : "Expired"}
              </span>
            </div>

            <div className="bg-light p-3 rounded-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Date & Time:</span>
                <span className="fw-medium">
                  {formatDate(transaction.date)}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Transaction #:</span>
                <span className="fw-medium font-monospace">
                  {transaction.transaction_number}
                </span>
              </div>
              {transaction.bill_number && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Bill Number:</span>
                  <span className="fw-medium">{transaction.bill_number}</span>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <span className="text-muted">Status:</span>
                <span className="badge bg-success">Completed</span>
              </div>
            </div>

            <h6 className="fw-bold mb-3">Customer Information</h6>
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Name:</span>
                <span className="fw-medium">{transaction.customer_name}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Mobile:</span>
                <span className="fw-medium">
                  {transaction.customer_mobile}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Group:</span>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                  {transaction.customer_group}
                </span>
              </div>
            </div>

            {transaction.amount > 0 && (
              <>
                <h6 className="fw-bold mb-3">Payment Details</h6>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Amount:</span>
                    <span className="fw-medium">
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  {transaction.payment_method && (
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Payment Method:</span>
                      <span
                        className={`badge bg-${transaction.payment_method === "Cash" ? "success" : transaction.payment_method === "Card" ? "primary" : transaction.payment_method === "UPI" ? "info" : "warning"} bg-opacity-10 text-${transaction.payment_method === "Cash" ? "success" : transaction.payment_method === "Card" ? "primary" : transaction.payment_method === "UPI" ? "info" : "warning"} px-3 py-2 rounded-pill`}
                      >
                        {transaction.payment_method}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="mt-3">
              <div className="text-muted small mb-1">Description</div>
              <p className="mb-0">{transaction.description}</p>
            </div>

            {transaction.expiry_date && (
              <div className="mt-3 text-warning bg-warning bg-opacity-10 p-2 rounded-3">
                <small>
                  <FiCalendar className="me-1" />
                  Points expire on{" "}
                  {format(new Date(transaction.expiry_date), "dd MMM yyyy")}
                </small>
              </div>
            )}
          </div>

          <div className="modal-footer border-top pt-3">
            <Link
              to={`/customer/${transaction.customer_id}`}
              className="btn btn-outline-primary me-2"
              onClick={onClose}
            >
              <FiUser className="me-2" />
              View Customer
            </Link>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Customer Details Modal Component
const CustomerDetailsModal = ({ customer, onClose }) => {
  if (!customer) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto", zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <div className="d-flex align-items-center gap-2">
              <FaIdCard size={24} className="text-primary" />
              <div>
                <h5 className="modal-title fw-bold fs-5 mb-0">
                  Customer Details
                </h5>
                <p className="text-muted small mb-0 mt-1">
                  View complete customer information
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            {/* Customer ID */}
            <div className="bg-light p-3 rounded-3 mb-4">
              <div className="d-flex align-items-center gap-3">
                <FiHash size={20} className="text-primary" />
                <div>
                  <div className="text-muted small">Customer ID</div>
                  <div className="fw-bold font-monospace">{customer._id}</div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      <FiUser className="me-2" />
                      Personal Information
                    </h6>

                    <div className="mb-3">
                      <div className="text-muted small">Full Name</div>
                      <div className="fw-medium">{customer.name}</div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Mobile Number</div>
                      <div className="fw-medium d-flex align-items-center gap-2">
                        <FiPhone size={14} className="text-muted" />
                        {customer.mobile || "N/A"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">WhatsApp Number</div>
                      <div className="fw-medium">
                        {customer.whatsapp_number || "N/A"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Email</div>
                      <div className="fw-medium d-flex align-items-center gap-2">
                        <FiMail size={14} className="text-muted" />
                        {customer.email || "N/A"}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted small">Customer Group</div>
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 rounded-pill">
                        {customer.customer_group || "General"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      <FiMapPin className="me-2" />
                      Address & Documents
                    </h6>

                    <div className="mb-3">
                      <div className="text-muted small">Address</div>
                      <div className="fw-medium">
                        {customer.address || "N/A"}
                        {customer.city && `, ${customer.city}`}
                        {customer.state && `, ${customer.state}`}
                        {customer.pincode && ` - ${customer.pincode}`}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">City</div>
                      <div className="fw-medium">
                        {customer.city || "N/A"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">State</div>
                      <div className="fw-medium">
                        {customer.state || "N/A"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Country</div>
                      <div className="fw-medium">
                        {customer.country || "N/A"}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Pincode</div>
                      <div className="fw-medium">
                        {customer.pincode || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax & Identification */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      <FiFileText className="me-2" />
                      Tax Information
                    </h6>

                    <div className="mb-3">
                      <div className="text-muted small">Tax Number</div>
                      <div className="fw-medium">
                        {customer.tax_number || "N/A"}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted small">Aadhar Number</div>
                      <div className="fw-medium">
                        {customer.aadhar_number || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      <FaCoins className="me-2" />
                      Loyalty Summary
                    </h6>

                    <div className="mb-3">
                      <div className="text-muted small">
                        Total Points Earned
                      </div>
                      <div className="fw-bold text-success">
                        -- points
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">
                        Total Points Redeemed
                      </div>
                      <div className="fw-bold text-info">
                        -- points
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small">Available Points</div>
                      <div className="fw-bold text-primary">
                        -- points
                      </div>
                    </div>

                    <div>
                      <div className="text-muted small">Total Spent</div>
                      <div className="fw-bold">
                        --
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Dates */}
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="text-muted small">Status</div>
                  <span
                    className={`badge bg-${customer.status ? "success" : "danger"} bg-opacity-10 text-${customer.status ? "success" : "danger"} fw-semibold px-3 py-2 rounded-pill`}
                  >
                    {customer.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="text-muted small">Customer Since</div>
                  <div className="fw-medium">
                    {customer.createdAt
                      ? format(new Date(customer.createdAt), "dd MMM yyyy")
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPointPaymentHistory;