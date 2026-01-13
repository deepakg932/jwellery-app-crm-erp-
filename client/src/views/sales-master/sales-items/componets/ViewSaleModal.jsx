import React from "react";
import { FiCalendar, FiPackage, FiDollarSign, FiUser, FiMapPin } from "react-icons/fi";

const ViewSaleModal = ({ sale, onClose }) => {
  if (!sale) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get customer name
  const getCustomerName = (customer) => {
    if (!customer) return "N/A";
    return customer.name || customer.customer_name || "Unknown Customer";
  };

  // Get branch name
  const getBranchName = (branch) => {
    if (!branch) return "N/A";
    return branch.branch_name || branch.name || "Unknown Branch";
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "draft":
        return "bg-secondary";
      case "cancelled":
        return "bg-danger";
      case "approved":
        return "bg-primary";
      case "shipped":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

  // Get payment status badge class
  const getPaymentStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "partial":
        return "bg-info";
      case "overdue":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

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
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content rounded-3"
          style={{ maxHeight: "95vh", overflow: "hidden" }}
        >
          <div
            className="modal-header border-bottom pb-3 sticky-top bg-white"
            style={{ zIndex: 1020 }}
          >
            <h5 className="modal-title fw-bold fs-5">
              Sale Details - {sale.sale_number || "N/A"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div
            className="modal-body"
            style={{ overflowY: "auto", maxHeight: "calc(90vh - 130px)" }}
          >
            {/* Header Info */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">Sale Information</h6>
                    <div className="row">
                      <div className="col-6 mb-2">
                        <small className="text-muted">Sale Number:</small>
                        <div className="fw-medium">{sale.sale_number || "N/A"}</div>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted">Reference No:</small>
                        <div className="fw-medium">{sale.reference_no || "N/A"}</div>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted">Sale Date:</small>
                        <div className="fw-medium">
                          <FiCalendar className="me-1" size={14} />
                          {formatDate(sale.sale_date)}
                        </div>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted">Status:</small>
                        <div>
                          <span
                            className={`badge ${getStatusBadgeClass(sale.status)} fw-medium`}
                          >
                            {sale.status
                              ? sale.status.charAt(0).toUpperCase() +
                                sale.status.slice(1)
                              : "Draft"}
                          </span>
                        </div>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted">Payment Status:</small>
                        <div>
                          <span
                            className={`badge ${getPaymentStatusBadgeClass(
                              sale.payment_status
                            )} fw-medium`}
                          >
                            {sale.payment_status
                              ? sale.payment_status.charAt(0).toUpperCase() +
                                sale.payment_status.slice(1)
                              : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">Customer & Branch</h6>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <small className="text-muted">Customer:</small>
                        <div className="fw-medium">
                          <FiUser className="me-1" size={14} />
                          {getCustomerName(sale.customer_id)}
                        </div>
                        {sale.customer_id?.phone && (
                          <small className="text-muted">
                            Phone: {sale.customer_id.phone}
                          </small>
                        )}
                        {sale.customer_id?.email && (
                          <div className="text-muted small">
                            Email: {sale.customer_id.email}
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <small className="text-muted">Branch:</small>
                        <div className="fw-medium">
                          <FiMapPin className="me-1" size={14} />
                          {getBranchName(sale.branch_id)}
                        </div>
                        {sale.branch_id?.address && (
                          <small className="text-muted">
                            Address: {sale.branch_id.address}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sale Items */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h6 className="card-title fw-bold mb-3">Sale Items</h6>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Rate</th>
                        <th>Discount</th>
                        <th>Tax</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.items && sale.items.length > 0 ? (
                        sale.items.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <div className="fw-medium">
                                {item.product_name || item.product_id?.name || "N/A"}
                              </div>
                              <div className="small text-muted">
                                {item.product_code || item.product_id?.product_code || ""}
                              </div>
                            </td>
                            <td>{item.quantity}</td>
                            <td>{item.unit_id?.name || item.unit_id || "N/A"}</td>
                            <td className="text-end">
                              {formatCurrency(item.rate)}
                            </td>
                            <td className="text-end">
                              {formatCurrency(item.discount)}
                            </td>
                            <td className="text-end">
                              {formatCurrency(item.tax)}
                            </td>
                            <td className="text-end fw-bold">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4 text-muted">
                            No items in this sale
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="row">
              <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">Notes</h6>
                    <div className="bg-light p-3 rounded">
                      {sale.sale_note || "No additional notes"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">Amount Summary</h6>
                    <div className="bg-light p-3 rounded">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Subtotal:</span>
                        <span className="fw-medium">
                          {formatCurrency(sale.subtotal)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Shipping Cost:</span>
                        <span className="fw-medium">
                          {formatCurrency(sale.shipping_cost)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Discount:</span>
                        <span className="fw-medium text-danger">
                          -{formatCurrency(sale.discount)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">VAT ({sale.vat || 0}%):</span>
                        <span className="fw-medium">
                          {formatCurrency(
                            ((sale.total_amount || 0) * (parseFloat(sale.vat) || 0)) / 100
                          )}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold fs-5">Grand Total:</span>
                        <span className="fw-bold fs-5 text-primary">
                          {formatCurrency(sale.grand_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top pt-3 bg-white">
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

export default ViewSaleModal;