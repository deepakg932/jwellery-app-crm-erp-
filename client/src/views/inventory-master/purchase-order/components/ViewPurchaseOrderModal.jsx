import React from "react";
import { FiCalendar, FiPackage, FiDollarSign, FiFileText } from "react-icons/fi";

const ViewPurchaseOrderModal = ({ purchaseOrder, onClose }) => {
  if (!purchaseOrder) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'draft':
        return 'bg-secondary';
      case 'pending':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-danger';
      case 'approved':
        return 'bg-primary';
      case 'shipped':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const weight = parseFloat(item.weight) || 0;
    const rate = parseFloat(item.rate) || 0;
    const amount = quantity > 0 ? quantity : weight;
    return amount * rate;
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              Purchase Order Details
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            {/* Header Information */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Order Information</h6>
                    <div className="row">
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">PO Number</small>
                        <span className="fw-bold">{purchaseOrder.order_number || "N/A"}</span>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">Status</small>
                        <span className={`badge ${getStatusColor(purchaseOrder.status)}`}>
                          {purchaseOrder.status ? purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1) : "Draft"}
                        </span>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">
                          <FiCalendar className="me-1" size={12} />
                          Order Date
                        </small>
                        <span>{formatDate(purchaseOrder.order_date)}</span>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">Created On</small>
                        <span>{formatDate(purchaseOrder.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Supplier Information</h6>
                    {purchaseOrder.supplier ? (
                      <div>
                        <div className="mb-2">
                          <small className="text-muted d-block">Supplier Name</small>
                          <span className="fw-bold">{purchaseOrder.supplier.name || purchaseOrder.supplier.supplier_name || "N/A"}</span>
                        </div>
                        {purchaseOrder.supplier.phone && (
                          <div className="mb-2">
                            <small className="text-muted d-block">Phone</small>
                            <span>{purchaseOrder.supplier.phone}</span>
                          </div>
                        )}
                        {purchaseOrder.supplier.email && (
                          <div className="mb-2">
                            <small className="text-muted d-block">Email</small>
                            <span>{purchaseOrder.supplier.email}</span>
                          </div>
                        )}
                        {purchaseOrder.supplier.address && (
                          <div>
                            <small className="text-muted d-block">Address</small>
                            <span className="small">{purchaseOrder.supplier.address}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted">No supplier information available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <FiPackage className="me-2" />
                <h6 className="fw-bold mb-0">Order Items</h6>
                <span className="badge bg-primary ms-2">
                  {purchaseOrder.items?.length || 0} items
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Weight</th>
                      <th>Unit</th>
                      <th>Rate</th>
                      <th>Expected Date</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.items && purchaseOrder.items.length > 0 ? (
                      purchaseOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="fw-medium">
                              {item.inventory_item_id?.name || item.inventory_item?.name || "Unknown Item"}
                            </div>
                            {item.inventory_item_id?._id && (
                              <div className="text-muted small">
                                ID: {item.inventory_item_id._id.substring(0, 8)}...
                              </div>
                            )}
                          </td>
                          <td>
                            {item.quantity ? (
                              <span className="badge bg-info">{item.quantity}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {item.weight ? (
                              <span className="badge bg-warning">{item.weight}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {item.unit_id?.name ? (
                              <span className="badge bg-light text-dark">{item.unit_id.name}</span>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            <span className="fw-medium">{formatCurrency(item.rate || 0)}</span>
                          </td>
                          <td>
                            {item.expected_date ? (
                              <span className="small">{formatDate(item.expected_date)}</span>
                            ) : (
                              <span className="text-muted">Not set</span>
                            )}
                          </td>
                          <td className="text-end fw-bold">
                            {formatCurrency(calculateItemTotal(item))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">
                          No items found in this purchase order
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="row">
              <div className="col-md-8">
                {purchaseOrder.notes && (
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <FiFileText className="me-2" />
                        <h6 className="fw-bold mb-0">Notes</h6>
                      </div>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {purchaseOrder.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <div className="card border-0 bg-primary text-white">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Order Summary</h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(purchaseOrder.total_amount || 0)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Tax:</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Shipping:</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <hr className="my-3 opacity-25" />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold fs-5">Total:</span>
                      <span className="fw-bold fs-4">
                        {formatCurrency(purchaseOrder.total_amount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {purchaseOrder.createdAt && (
              <div className="mt-4 pt-3 border-top">
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">Created At:</small>
                    <div>{formatDate(purchaseOrder.createdAt)}</div>
                  </div>
                  {purchaseOrder.updatedAt && (
                    <div className="col-md-6">
                      <small className="text-muted">Last Updated:</small>
                      <div>{formatDate(purchaseOrder.updatedAt)}</div>
                    </div>
                  )}
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
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                // You can add print functionality here
                window.print();
              }}
            >
              Print / Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseOrderModal;