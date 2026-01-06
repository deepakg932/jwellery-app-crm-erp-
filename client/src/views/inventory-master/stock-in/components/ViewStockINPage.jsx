import React from "react";
import { 
  FiCalendar, 
  FiPackage, 
  FiDollarSign, 
  FiFileText, 
  FiPrinter,
  FiDownload,
  FiX 
} from "react-icons/fi";
import { FaWarehouse, FaTruck } from "react-icons/fa";

const ViewStockINPage = ({ grn, onClose }) => {
  if (!grn) return null;

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
      case 'received':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  // Get track by method
  const getTrackBy = (item) => {
    return item.track_by || "quantity";
  };

  // Get received value based on track_by
  const getReceivedValue = (item) => {
    const trackBy = getTrackBy(item);
    if (trackBy === "quantity") {
      return item.received_qty || item.quantity || 0;
    } else if (trackBy === "weight") {
      return item.received_weight || item.weight || 0;
    }
    return 0;
  };

  // Get unit display
  const getUnitDisplay = (item) => {
    return item.unit || item.unit_name || "pcs";
  };

  // Get item details display
  const getItemDetails = (item) => {
    const details = [];
    if (item.metal_type) details.push(`Metal: ${item.metal_type}`);
    if (item.metal_purity) details.push(`Purity: ${item.metal_purity}`);
    if (item.stone_type) details.push(`Stone: ${item.stone_type}`);
    if (item.stone_purity) details.push(`Stone Purity: ${item.stone_purity}`);
    if (item.material_type) details.push(`Material: ${item.material_type}`);
    return details;
  };

  // Get ordered value for comparison
  const getOrderedValue = (item) => {
    const trackBy = getTrackBy(item);
    if (trackBy === "quantity") {
      return item.ordered_quantity || 0;
    } else if (trackBy === "weight") {
      return item.ordered_weight || 0;
    }
    return 0;
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
              Goods Receipt Note Details
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
                    <h6 className="fw-bold mb-3">
                      <FaTruck className="me-2" />
                      GRN Information
                    </h6>
                    <div className="row">
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">GRN Number</small>
                        <span className="fw-bold">{grn.grn_number || "N/A"}</span>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">Status</small>
                        <span className={`badge ${getStatusColor(grn.status)}`}>
                          {grn.status ? grn.status.charAt(0).toUpperCase() + grn.status.slice(1) : "Draft"}
                        </span>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">
                          <FiCalendar className="me-1" size={12} />
                          GRN Date
                        </small>
                        <span>{formatDate(grn.grn_date)}</span>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">Created On</small>
                        <span>{formatDate(grn.createdAt)}</span>
                      </div>
                      {grn.po_id && (
                        <div className="col-12 mb-2">
                          <small className="text-muted d-block">PO Reference</small>
                          <span className="fw-bold text-primary">
                            {grn.po_reference?.po_number || 
                             grn.po_reference?.order_number || 
                             (typeof grn.po_id === 'object' ? grn.po_id.po_number : `PO-${grn.po_id}`)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      <FaWarehouse className="me-2" />
                      Supplier & Branch Information
                    </h6>
                    <div className="row">
                      <div className="col-12 mb-2">
                        <small className="text-muted d-block">Supplier</small>
                        <span className="fw-bold">
                          {grn.supplier?.name || 
                           grn.supplier?.supplier_name || 
                           (typeof grn.supplier_id === 'object' ? grn.supplier_id.name : "N/A")}
                        </span>
                        {grn.supplier?.phone && (
                          <div className="text-muted small">
                            Phone: {grn.supplier.phone}
                          </div>
                        )}
                        {grn.supplier?.email && (
                          <div className="text-muted small">
                            Email: {grn.supplier.email}
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <small className="text-muted d-block">Branch</small>
                        <span className="fw-bold">
                          {grn.branch?.name || 
                           grn.branch?.branch_name || 
                           (typeof grn.branch_id === 'object' ? grn.branch_id.name : "N/A")}
                        </span>
                        {grn.branch?.address && (
                          <div className="text-muted small">
                            {grn.branch.address}
                          </div>
                        )}
                        {grn.branch?.phone && (
                          <div className="text-muted small">
                            Phone: {grn.branch.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Received Items */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <FiPackage className="me-2" />
                <h6 className="fw-bold mb-0">Received Items</h6>
                <span className="badge bg-primary ms-2">
                  {grn.items?.length || 0} items
                </span>
                <span className="badge bg-info ms-2">
                  Total: {formatCurrency(grn.total_cost || 0)}
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Name</th>
                      <th>SKU</th>
                      <th>Track By</th>
                      <th>Unit</th>
                      <th>Ordered</th>
                      <th>Received</th>
                      <th>Details</th>
                      <th>Cost per Unit</th>
                      <th>Total Cost</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grn.items && grn.items.length > 0 ? (
                      grn.items.map((item, index) => {
                        const trackBy = getTrackBy(item);
                        const receivedValue = getReceivedValue(item);
                        const orderedValue = getOrderedValue(item);
                        const unitDisplay = getUnitDisplay(item);
                        const itemDetails = getItemDetails(item);
                        
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <div className="fw-medium">
                                {item.inventory_item_id?.item_name || 
                                 item.inventory_item_id?.name || 
                                 item.inventory_item?.name || 
                                 item.inventory_item_name || 
                                 "Unknown Item"}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {item.inventory_item_id?.sku_code || 
                                 item.sku_code || 
                                 "N/A"}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${trackBy === 'quantity' ? 'bg-info' : 'bg-warning'}`}>
                                {trackBy}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {unitDisplay}
                              </span>
                            </td>
                            <td>
                              <div className="text-muted small">
                                {orderedValue} {trackBy === 'weight' ? 'gms' : ''}
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${trackBy === 'quantity' ? 'bg-primary' : 'bg-warning'}`}>
                                {receivedValue} {trackBy === 'weight' ? 'gms' : ''}
                              </span>
                            </td>
                            <td>
                              {itemDetails.length > 0 ? (
                                <div className="small">
                                  {itemDetails.map((detail, i) => (
                                    <div key={i} className="text-muted">
                                      {detail}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="fw-bold">
                              {formatCurrency(item.cost || 0)}
                            </td>
                            <td className="fw-bold text-success">
                              {formatCurrency(item.total_cost || 0)}
                            </td>
                            <td>
                              {item.remarks ? (
                                <span className="small">{item.remarks}</span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="11" className="text-center py-4 text-muted">
                          No items found in this GRN
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
                {grn.remarks && (
                  <div className="card border-0 bg-light">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <FiFileText className="me-2" />
                        <h6 className="fw-bold mb-0">Remarks</h6>
                      </div>
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {grn.remarks}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <div className="card border-0 bg-primary text-white">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      <FiDollarSign className="me-2" />
                      GRN Summary
                    </h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Total Items:</span>
                      <span>{grn.items?.length || 0}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Total Quantity:</span>
                      <span>
                        {grn.items?.reduce((sum, item) => {
                          if (item.track_by === "quantity" || !item.track_by) {
                            return sum + (parseFloat(item.received_qty) || parseFloat(item.quantity) || 0);
                          }
                          return sum;
                        }, 0) || 0}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Total Weight:</span>
                      <span>
                        {grn.items?.reduce((sum, item) => {
                          if (item.track_by === "weight") {
                            return sum + (parseFloat(item.received_weight) || parseFloat(item.weight) || 0);
                          }
                          return sum;
                        }, 0) || 0} gms
                      </span>
                    </div>
                    <hr className="my-3 opacity-25" />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold fs-5">Total Cost:</span>
                      <span className="fw-bold fs-4">
                        {formatCurrency(grn.total_cost || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {grn.createdAt && (
              <div className="mt-4 pt-3 border-top">
                <div className="row">
                  <div className="col-md-4">
                    <small className="text-muted">Created At:</small>
                    <div>{formatDate(grn.createdAt)}</div>
                  </div>
                  {grn.updatedAt && (
                    <div className="col-md-4">
                      <small className="text-muted">Last Updated:</small>
                      <div>{formatDate(grn.updatedAt)}</div>
                    </div>
                  )}
                  {grn.received_by && (
                    <div className="col-md-4">
                      <small className="text-muted">Received By:</small>
                      <div>{grn.received_by}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={onClose}
            >
              <FiX size={16} />
              Close
            </button>
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => window.print()}
            >
              <FiPrinter size={16} />
              Print
            </button>
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => {
                // Add download functionality here
                alert("Download functionality to be implemented");
              }}
            >
              <FiDownload size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStockINPage;