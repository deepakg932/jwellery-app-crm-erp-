// components/loyalty/LoyaltyPointPaymentHistory.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom"; // Add useParams
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
import axios from "axios"; // Make sure to import axios
import { API_ENDPOINTS } from "@/api/api"; // Import your API endpoints

const LoyaltyPointPaymentHistory = () => {
  const { customerId, id: idFromParams } = useParams();
  const id = customerId || idFromParams;

  const {
    customers,
    customerGroups,
    loading: customersLoading,
  } = useCustomers();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [fetchingCustomer, setFetchingCustomer] = useState(true);

  // Fetch single customer details based on ID from URL
  useEffect(() => {
    const fetchSingleCustomer = async () => {
      if (!id) {
        setFetchingCustomer(false);
        return;
      }

    try {
      setFetchingCustomer(true);
      setError("");
      
      // Fetch single customer by ID
      const url = API_ENDPOINTS.getCustomerById(id);
      console.log("Fetching customer with ID:", id);
      console.log("API URL:", url);
      
      const res = await axios.get(url);
      console.log("Single Customer Response:", res.data);

      let customerData = null;

      // Handle different response structures
      if (res.data?.success && res.data.data) {
        customerData = res.data.data;
      } else if (res.data?.data) {
        customerData = res.data.data;
      } else if (res.data) {
        customerData = res.data;
      }

      if (customerData) {
        const mappedCustomer = {
          _id: customerData._id || customerData.id,
          name: customerData.name || "",
          customer_group_id: customerData.customer_group_id?._id || customerData.customer_group_id || "",
          customer_group_id_obj: customerData.customer_group_id || null,
          customer_group: customerData.customer_group_id?.customer_group || customerData.customer_group || "",
          mobile: customerData.mobile || "",
          whatsapp_number: customerData.whatsapp_number || "",
          email: customerData.email || "",
          tax_number: customerData.tax_number || "",
          aadhar_number: customerData.aadhar_number || "",
          address: customerData.address || "",
          city: customerData.city || "",
          state: customerData.state || "",
          country: customerData.country || "",
          pincode: customerData.pincode || "",
          status: customerData.status === "active",
          createdAt: customerData.createdAt || "",
          total_sales: customerData.total_sales || 0,
          total_paid: customerData.total_paid || 0,
          total_balance: customerData.total_balance || 0,
          total_orders: customerData.total_orders || 0,
          last_sale_date: customerData.last_sale_date || null,
          last_sale_items: customerData.last_sale_items || [],
          last_sale_total_quantity: customerData.last_sale_total_quantity || 0,
        };
        
        setCustomerDetails(mappedCustomer);
        console.log("Mapped customer details:", mappedCustomer);
      } else {
        setError("Customer not found");
      }
    } catch (err) {
      console.error("Error fetching customer:", err);
      setError(err.response?.data?.message || "Failed to load customer details");
    } finally {
      setFetchingCustomer(false);
    }
  };

  console.log("Fetching customer with ID from URL:", id);
  fetchSingleCustomer();
}, [id]); // Add id to dependency array

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

  // View customer details (now using already fetched customer)
  const viewCustomerDetails = () => {
    if (customerDetails) {
      setSelectedCustomer(customerDetails);
      setShowCustomerModal(true);
    }
  };

  // Show loading state
  if (fetchingCustomer) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading customer details...</span>
        </div>
        <p className="mt-2">Loading customer details...</p>
      </div>
    );
  }

  // Show error if customer not found
  if (!customerDetails && !fetchingCustomer) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <h4>Customer Not Found</h4>
          <p>The customer with ID {id} could not be found.</p>
          <Link to="/customers" className="btn btn-primary">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header with breadcrumb and customer info */}
      <div className="mb-4">
        {/* <div className="d-flex align-items-center gap-2 text-muted mb-2">
          <Link to="/" className="text-decoration-none text-muted">Home</Link>
          <span>/</span>
          <Link to="/customers" className="text-decoration-none text-muted">Customers</Link>
          <span>/</span>
          <span className="text-primary fw-semibold">Profile</span>
        </div> */}
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 fw-bold mb-1">{customerDetails?.name}'s Profile and Financial History</h1>
            <div className="d-flex align-items-center gap-3">
              <p className="text-muted mb-0">
                <FiPhone className="me-1" size={14} />
                {customerDetails?.mobile}
              </p>
              {customerDetails?.email && (
                <p className="text-muted mb-0">
                  <FiMail className="me-1" size={14} />
                  {customerDetails?.email}
                </p>
              )}
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                {customerDetails?.customer_group || "General"}
              </span>
            </div>
          </div>
          <button className="btn btn-outline-primary" onClick={viewCustomerDetails}>
            <FiUser className="me-2" />
            View Customer Profile
          </button>
        </div>
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

      {/* Simple customer profile (no stats) */}
      <div className="mb-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3">
              <div>
                <div className="text-muted small">Customer</div>
                <div className="h5 fw-bold mb-0">{customerDetails?.name}</div>
                <div className="text-muted small">{customerDetails?.mobile} {customerDetails?.email ? ` • ${customerDetails.email}` : ""}</div>
              </div>
              <div className="ms-auto text-end">
                <div className="text-muted small">Group</div>
                <div className="fw-medium">{customerDetails?.customer_group || "General"}</div>
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
              <h5 className="fw-bold mb-0">Financial Summary for {customerDetails?.name}</h5>
            </div>
          </div>
        </div>

        <div className="card-body">
          {loading || fetchingCustomer ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <div className="text-muted small">Total Sales</div>
                    <div className="h4 fw-bold text-success mb-1">{formatCurrency(customerDetails?.total_sales || 0)}</div>
                    <small className="text-muted">{customerDetails?.total_orders || 0} orders</small>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <div className="text-muted small">Total Paid</div>
                    <div className="h4 fw-bold text-info mb-1">{formatCurrency(customerDetails?.total_paid || 0)}</div>
                    <small className="text-muted">Amount received</small>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <div className="text-muted small">Outstanding Balance</div>
                    <div className="h4 fw-bold text-warning mb-1">{formatCurrency(customerDetails?.total_balance || 0)}</div>
                    <small className="text-muted">Amount pending</small>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <div className="text-muted small">Customer Since</div>
                    <div className="h5 fw-bold mb-1">{formatDate(customerDetails?.createdAt)}</div>
                    <small className="text-muted">Registration date</small>
                  </div>
                </div>
              </div>
              {customerDetails?.last_sale_date && (
                <>
                  <div className="col-md-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <div className="text-muted small">Last Sale Date</div>
                        <div className="h5 fw-bold mb-1">{formatDate(customerDetails?.last_sale_date)}</div>
                        <small className="text-muted">{customerDetails?.last_sale_total_quantity || 0} items</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <div className="text-muted small">Last Sale Items</div>
                        <div className="fw-medium">
                          {customerDetails?.last_sale_items?.map((item, idx) => (
                            <div key={idx} className="small mb-1">
                              • {item.product_name} {item.quantity > 1 ? `(qty: ${item.quantity})` : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
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
      `}</style>
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
            {/* <div className="bg-light p-3 rounded-3 mb-4">
              <div className="d-flex align-items-center gap-3">
                <FiHash size={20} className="text-primary" />
                <div>
                  <div className="text-muted small">Customer ID</div>
                  <div className="fw-bold font-monospace">{customer._id}</div>
                </div>
              </div>
            </div> */}

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