// components/ReturnDetailsModal.jsx
import React from "react";
import { FiX, FiPackage, FiUser, FiCalendar, FiDollarSign } from "react-icons/fi";

const ReturnDetailsModal = ({ returnItem, onClose }) => {
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              <FiPackage className="me-2" />
              Return Details - {returnItem.return_number}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            {/* Return Information */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">
                      <FiUser className="me-2" />
                      Return Information
                    </h6>
                    <div className="mb-2">
                      <small className="text-muted">Return Number:</small>
                      <div className="fw-bold">{returnItem.return_number}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Sale Number:</small>
                      <div>{returnItem.sale_number}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Reference No:</small>
                      <div>{returnItem.reference_no}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Return Date:</small>
                      <div>
                        {new Date(returnItem.return_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">
                      <FiDollarSign className="me-2" />
                      Financial Details
                    </h6>
                    <div className="mb-2">
                      <small className="text-muted">Total Amount:</small>
                      <div className="fw-bold">
                        {formatCurrency(returnItem.total_amount)}
                      </div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Refund Amount:</small>
                      <div className="fw-bold text-primary">
                        {formatCurrency(returnItem.refund_amount)}
                      </div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Return Type:</small>
                      <div className="text-capitalize">
                        {returnItem.return_type}
                      </div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Status:</small>
                      <div>
                        <span className={`badge ${
                          returnItem.status === "approved" ? "bg-success" :
                          returnItem.status === "rejected" ? "bg-danger" :
                          returnItem.status === "pending" ? "bg-warning" :
                          "bg-primary"
                        }`}>
                          {returnItem.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="card border-0 bg-light mb-4">
              <div className="card-body">
                <h6 className="card-title fw-bold mb-3">Customer Information</h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <small className="text-muted">Customer Name:</small>
                      <div className="fw-medium">{returnItem.customer_name}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <small className="text-muted">Reason for Return:</small>
                      <div>{returnItem.reason}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Items */}
            <div className="card border-0 bg-light mb-4">
              <div className="card-body">
                <h6 className="card-title fw-bold mb-3">Returned Items</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Code</th>
                        <th>Original Qty</th>
                        <th>Returned Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnItem.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product_name}</td>
                          <td>{item.product_code}</td>
                          <td className="text-center">{item.original_quantity}</td>
                          <td className="text-center">{item.return_quantity}</td>
                          <td>{formatCurrency(item.selling_total)}</td>
                          <td className="fw-medium">
                            {formatCurrency(item.final_total * (item.return_quantity / item.original_quantity))}
                          </td>
                          <td>{item.return_reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Notes */}
            {returnItem.notes && (
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">Additional Notes</h6>
                  <p>{returnItem.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              <FiX className="me-1" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailsModal;