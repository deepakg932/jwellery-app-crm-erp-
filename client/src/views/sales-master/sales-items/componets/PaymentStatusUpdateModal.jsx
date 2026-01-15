// PaymentStatusUpdateModal.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { FiDollarSign, FiPlus } from "react-icons/fi";

const PaymentStatusUpdateModal = ({
  showModal,
  onClose,
  sale,
  onUpdate,
  loading = false,
}) => {
  const [paymentForm, setPaymentForm] = useState({
    payment_status: "pending",
    additional_payment: 0, // Changed to additional payment
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "",
    payment_notes: "",
  });

  // Helper function to get customer name
  const getCustomerName = (customer) => {
    if (!customer) return "N/A";
    return customer.name || customer.customer_name || "Unknown Customer";
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

  // Initialize form when sale changes
  useEffect(() => {
    if (sale) {
      // Get values from sale object
      const totalAmount = sale.total_amount || 0;
      const currentPaidAmount = sale.current_paid || sale.paid_amount || 0;
      const remainingBalance = totalAmount - currentPaidAmount;
      
      // Parse payment date or use today's date
      let paymentDate = new Date().toISOString().split("T")[0];
      if (sale.payment_date) {
        const date = new Date(sale.payment_date);
        if (!isNaN(date.getTime())) {
          paymentDate = date.toISOString().split("T")[0];
        }
      }

      setPaymentForm({
        payment_status: sale.payment_status || "pending",
        additional_payment: 0, // Start with 0 for additional payment
        payment_date: paymentDate,
        payment_method: sale.payment_method || "",
        payment_notes: sale.payment_notes || "",
      });
    }
  }, [sale]);

  if (!showModal || !sale) return null;

  const totalAmount = sale.total_amount || 0;
  const currentPaidAmount = sale.current_paid || sale.paid_amount || 0;
  const balanceAmount = sale.balance_amount || (totalAmount - currentPaidAmount);
  
  // Calculate new totals based on additional payment
  const additionalPayment = paymentForm.additional_payment || 0;
  const newTotalPaid = currentPaidAmount + additionalPayment;
  const newBalance = totalAmount - newTotalPaid;
  const maxAdditionalPayment = balanceAmount; // Can't pay more than balance

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      const numValue = parseFloat(value) || 0;
      
      setPaymentForm((prev) => ({
        ...prev,
        [name]: Math.min(numValue, maxAdditionalPayment), // Limit to remaining balance
      }));
    } else {
      setPaymentForm((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Auto-adjust payment when status changes
      if (name === "payment_status") {
        if (value === "paid") {
          // Pay full remaining balance
          setPaymentForm((prev) => ({
            ...prev,
            additional_payment: balanceAmount,
          }));
        } else if (value === "pending") {
          // No additional payment
          setPaymentForm((prev) => ({
            ...prev,
            additional_payment: 0,
          }));
        }
      }
    }
  };

  // Handle additional payment change
  const handleAdditionalPaymentChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    const limitedValue = Math.min(value, maxAdditionalPayment);
    
    setPaymentForm((prev) => ({
      ...prev,
      additional_payment: limitedValue,
    }));

    // Auto-update payment status
    let newPaymentStatus = paymentForm.payment_status;
    if (newTotalPaid >= totalAmount) {
      newPaymentStatus = "paid";
    } else if (additionalPayment > 0) {
      newPaymentStatus = "partial";
    } else if (currentPaidAmount === 0 && additionalPayment === 0) {
      newPaymentStatus = "pending";
    } else if (currentPaidAmount > 0 && additionalPayment === 0) {
      newPaymentStatus = "partial"; // Already had some payment
    }
    
    setPaymentForm((prev) => ({
      ...prev,
      payment_status: newPaymentStatus,
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (sale) {
      // Calculate new total paid amount
      const newPaidAmount = currentPaidAmount + paymentForm.additional_payment;
      
      const validatedForm = {
        payment_status: paymentForm.payment_status,
        paid_amount: newPaidAmount, // Send total paid amount to backend
        current_paid: newPaidAmount, // For consistency
        payment_date: paymentForm.payment_date,
        payment_method: paymentForm.payment_method,
        payment_notes: paymentForm.payment_notes,
        additional_payment: paymentForm.additional_payment, // Optional: track additional
      };
      
      onUpdate(validatedForm);
    }
  };

  // Reset form when closing
  const handleClose = () => {
    setPaymentForm({
      payment_status: "pending",
      additional_payment: 0,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "",
      payment_notes: "",
    });
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              <FiDollarSign className="me-2" />
              Record Payment
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="mb-4 p-3 bg-light rounded">
              <p className="mb-1">
                <strong>Sale:</strong>{" "}
                {sale.reference_no || sale.sale_number || "N/A"}
              </p>
              <p className="mb-1">
                <strong>Customer:</strong> {getCustomerName(sale.customer_id)}
              </p>
              
              <div className="border-top pt-2 mt-2">
                <div className="d-flex justify-content-between mb-1">
                  <span>Total Amount:</span>
                  <strong>₹{totalAmount.toLocaleString("en-IN", { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}</strong>
                </div>
                
                <div className="d-flex justify-content-between mb-1">
                  <span>Already Paid:</span>
                  <strong className="text-success">
                    ₹{currentPaidAmount.toLocaleString("en-IN", { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </strong>
                </div>
                
                <div className="d-flex justify-content-between mb-1">
                  <span>Current Balance:</span>
                  <strong className="text-warning">
                    ₹{balanceAmount.toLocaleString("en-IN", { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </strong>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mb-3">
              <label className="form-label fw-medium">Payment Status *</label>
              <select
                className="form-select"
                name="payment_status"
                value={paymentForm.payment_status}
                onChange={handleInputChange}
                disabled={loading}
              >
                {getPaymentStatusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small className="text-muted">
                Selecting "Paid" will pay the full remaining balance
              </small>
            </div>

            {/* Additional Payment Amount */}
            <div className="mb-3">
              <label className="form-label fw-medium">
                <FiPlus className="me-1" />
                Additional Payment (₹) *
              </label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input
                  type="number"
                  className="form-control"
                  name="additional_payment"
                  value={paymentForm.additional_payment}
                  onChange={handleAdditionalPaymentChange}
                  min="0"
                  max={maxAdditionalPayment}
                  step="0.01"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setPaymentForm(prev => ({
                      ...prev,
                      additional_payment: balanceAmount,
                      payment_status: "paid"
                    }));
                  }}
                  disabled={loading || balanceAmount <= 0}
                >
                  Pay Full
                </button>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <small className="text-muted">
                  Maximum: ₹{maxAdditionalPayment.toLocaleString("en-IN", { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </small>
                <small className="text-primary">
                  Additional payment entered
                </small>
              </div>
            </div>

            {/* Payment Date */}
            <div className="mb-3">
              <label className="form-label fw-medium">Payment Date *</label>
              <input
                type="date"
                className="form-control"
                name="payment_date"
                value={paymentForm.payment_date}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            {/* Payment Method */}
            <div className="mb-3">
              <label className="form-label fw-medium">Payment Method</label>
              <select
                className="form-select"
                name="payment_method"
                value={paymentForm.payment_method}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Payment Notes */}
            <div className="mb-3">
              <label className="form-label fw-medium">Notes (Optional)</label>
              <textarea
                className="form-control"
                name="payment_notes"
                value={paymentForm.payment_notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Add payment notes (e.g., cheque number, UPI reference)"
                disabled={loading}
              ></textarea>
            </div>

            {/* Payment Summary */}
            <div className="alert alert-success mt-3">
              <h6 className="mb-2">Payment Summary</h6>
              <div className="d-flex justify-content-between mb-1">
                <span>Current Paid:</span>
                <strong>₹{currentPaidAmount.toLocaleString("en-IN", { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Additional Payment:</span>
                <strong className="text-primary">
                  + ₹{additionalPayment.toLocaleString("en-IN", { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </strong>
              </div>
              <div className="d-flex justify-content-between mb-2 border-top pt-2">
                <span>New Total Paid:</span>
                <strong className="text-success">
                  ₹{newTotalPaid.toLocaleString("en-IN", { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>New Balance:</span>
                <strong className={
                  newBalance === 0 
                    ? 'text-success' 
                    : newBalance > 0 
                      ? 'text-warning' 
                      : 'text-danger'
                }>
                  ₹{newBalance.toLocaleString("en-IN", { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </strong>
              </div>
            </div>

            {/* Example Calculation */}
            <div className="alert alert-info small mt-3">
              <strong>Example:</strong>
              <div className="mt-1">
                <div>If current paid = ₹62,901.84 and balance = ₹300,000.00</div>
                <div>Entering ₹200,000.00 here will result in:</div>
                <div>• New total paid = ₹262,901.84</div>
                <div>• New balance = ₹100,000.00</div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || paymentForm.additional_payment === 0}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Recording Payment...
                </>
              ) : (
                "Record Payment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusUpdateModal;