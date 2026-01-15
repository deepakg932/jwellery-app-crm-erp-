import React, { useState } from "react";
import { FiCalendar, FiPackage, FiDollarSign, FiUser, FiMapPin, FiFileText } from "react-icons/fi";
import { AiOutlineFileExcel } from "react-icons/ai";
import { GrDocumentPdf } from "react-icons/gr";

const ViewSaleModal = ({ sale, onClose }) => {
  const [pdfLoading, setPdfLoading] = useState(false);
  
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
      case "approved":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "draft":
        return "bg-secondary";
      case "cancelled":
      case "rejected":
        return "bg-danger";
      case "shipped":
      case "processing":
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
      case "cancelled":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  // Calculate item totals
  const calculateItemTotals = (items) => {
    if (!items || !Array.isArray(items)) return { totalQuantity: 0, totalAmount: 0 };
    
    return items.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const finalTotal = parseFloat(item.final_total) || 0;
      
      return {
        totalQuantity: acc.totalQuantity + quantity,
        totalAmount: acc.totalAmount + finalTotal
      };
    }, { totalQuantity: 0, totalAmount: 0 });
  };

  // Handle PDF download using HTML2Canvas and jsPDF
  const handleDownloadPDF = () => {
    if (!sale.invoice_number && !sale.reference_no) {
      alert("No invoice available for download");
      return;
    }
    
    setPdfLoading(true);
    
    // Create a printable HTML invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${sale.invoice_number || sale.reference_no}</title>
        <style>
          @media print {
            @page { margin: 0; }
            body { margin: 1.6cm; }
          }
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
          }
          .invoice-container {
            border: 2px solid #2c3e50;
            padding: 30px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2c3e50;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .invoice-title {
            font-size: 24px;
            color: #34495e;
            margin: 10px 0;
          }
          .invoice-number {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 10px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .detail-section h3 {
            color: #2c3e50;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .detail-item {
            margin-bottom: 8px;
          }
          .detail-label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 120px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
          }
          .items-table th {
            background-color: #2c3e50;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          .items-table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          .items-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .total-section {
            margin-top: 30px;
            text-align: right;
          }
          .total-row {
            margin: 8px 0;
            font-size: 16px;
          }
          .total-label {
            display: inline-block;
            width: 150px;
            text-align: right;
            margin-right: 20px;
            font-weight: bold;
          }
          .grand-total {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            border-top: 2px solid #2c3e50;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #7f8c8d;
            font-size: 14px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .print-button {
            display: none;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">SALES MANAGEMENT SYSTEM</div>
            <div class="invoice-title">TAX INVOICE</div>
            <div class="invoice-number">Invoice: ${sale.invoice_number || sale.reference_no || 'N/A'}</div>
            <div>Date: ${formatDate(sale.sale_date)}</div>
          </div>
          
          <div class="details-grid">
           
            </div>
            
            <div class="detail-section">
              <h3>Customer Details</h3>
              <div class="detail-item">
                <span class="detail-label">Name:</span> ${getCustomerName(sale.customer_id)}
              </div>
              <div class="detail-item">
                <span class="detail-label">Reference No:</span> ${sale.reference_no || "N/A"}
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span> ${sale.status || "N/A"}
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment:</span> ${sale.payment_status || "Pending"}
              </div>
              ${sale.customer_id?.phone ? `
                <div class="detail-item">
                  <span class="detail-label">Phone:</span> ${sale.customer_id.phone}
                </div>
              ` : ''}
              ${sale.customer_id?.email ? `
                <div class="detail-item">
                  <span class="detail-label">Email:</span> ${sale.customer_id.email}
                </div>
              ` : ''}
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Code</th>
                <th>Qty</th>
                <th>Price</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items?.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product_name || item.product_id?.name || "N/A"}</td>
                  <td>${item.product_code || "N/A"}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price_before_tax)}</td>
                  <td>${item.gst_rate ? `${item.gst_rate}%` : "0%"}</td>
                  <td>${formatCurrency(item.final_total)}</td>
                </tr>
              `).join('') || '<tr><td colspan="7" style="text-align: center;">No items in this sale</td></tr>'}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span>${formatCurrency(sale.subtotal)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Shipping Cost:</span>
              <span>${formatCurrency(sale.shipping_cost)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Discount:</span>
              <span>-${formatCurrency(sale.discount)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Total GST:</span>
              <span>${formatCurrency(sale.total_tax || sale.gst_amount)}</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Grand Total:</span>
              <span>${formatCurrency(sale.total_amount)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Paid Amount:</span>
              <span>${formatCurrency(sale.paid_amount || 0)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Balance Due:</span>
              <span style="color: #e74c3c; font-weight: bold;">
                ${formatCurrency(parseFloat(sale.total_amount || 0) - parseFloat(sale.paid_amount || 0))}
              </span>
            </div>
          </div>
          
          ${sale.sale_note ? `
            <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
              <h4 style="margin-top: 0; color: #2c3e50;">Notes:</h4>
              <p style="margin-bottom: 0;">${sale.sale_note}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="print-button">
            <button onclick="window.print()">Print Invoice</button>
          </div>
        </div>
        
        <script>
          // Auto print after loading
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    // Open the invoice in a new window and trigger print
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Focus on the new window
    printWindow.focus();
    
    setPdfLoading(false);
  };

  // Handle Excel download (CSV format)
  const handleDownloadExcel = () => {
    try {
      // Create sale data for CSV
      const saleData = {
        reference_no: sale.reference_no,
        invoice_number: sale.invoice_number,
        sale_date: formatDate(sale.sale_date),
        customer: getCustomerName(sale.customer_id),
        customer_mobile: sale.customer_id?.mobile || sale.customer_id?.phone || "",
        branch: getBranchName(sale.branch_id),
        status: sale.status,
        payment_status: sale.payment_status,
        items: sale.items?.map(item => ({
          product_name: item.product_name,
          product_code: item.product_code,
          quantity: item.quantity,
          price_before_tax: item.price_before_tax,
          gst_rate: `${item.gst_rate}%`,
          gst_amount: item.gst_amount,
          selling_total: item.selling_total,
          final_total: item.final_total
        })) || [],
        subtotal: sale.subtotal,
        shipping_cost: sale.shipping_cost,
        discount: sale.discount,
        total_tax: sale.total_tax,
        total_amount: sale.total_amount,
        paid_amount: sale.paid_amount,
        balance_amount: sale.balance_amount,
        sale_note: sale.sale_note,
        created_at: formatDate(sale.created_at),
        updated_at: formatDate(sale.updated_at)
      };
      
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add headers
      csvContent += "SALE DETAILS\r\n\r\n";
      csvContent += "Field,Value\r\n";
      csvContent += `Reference No,${saleData.reference_no}\r\n`;
      csvContent += `Invoice No,${saleData.invoice_number || 'N/A'}\r\n`;
      csvContent += `Sale Date,${saleData.sale_date}\r\n`;
      csvContent += `Customer,${saleData.customer}\r\n`;
      csvContent += `Customer Mobile,${saleData.customer_mobile}\r\n`;
      csvContent += `Branch,${saleData.branch}\r\n`;
      csvContent += `Status,${saleData.status}\r\n`;
      csvContent += `Payment Status,${saleData.payment_status}\r\n`;
      csvContent += `\r\n`;
      
      // Add items
      csvContent += `ITEMS\r\n`;
      csvContent += `Product Name,Product Code,Quantity,Price Before Tax,GST Rate,GST Amount,Selling Total,Final Total\r\n`;
      saleData.items.forEach(item => {
        csvContent += `${item.product_name},${item.product_code},${item.quantity},${item.price_before_tax},${item.gst_rate},${item.gst_amount},${item.selling_total},${item.final_total}\r\n`;
      });
      
      csvContent += `\r\n`;
      
      // Add totals
      csvContent += `TOTALS\r\n`;
      csvContent += `Subtotal,${saleData.subtotal}\r\n`;
      csvContent += `Shipping Cost,${saleData.shipping_cost}\r\n`;
      csvContent += `Discount,${saleData.discount}\r\n`;
      csvContent += `Total GST,${saleData.total_tax}\r\n`;
      csvContent += `Total Amount,${saleData.total_amount}\r\n`;
      csvContent += `Paid Amount,${saleData.paid_amount}\r\n`;
      csvContent += `Balance Amount,${saleData.balance_amount}\r\n`;
      csvContent += `\r\n`;
      csvContent += `Sale Note,${saleData.sale_note}\r\n`;
      csvContent += `Created At,${saleData.created_at}\r\n`;
      csvContent += `Updated At,${saleData.updated_at}\r\n`;
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Sale_${sale.reference_no || 'Details'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("Sale exported to CSV successfully");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Failed to export to CSV");
    }
  };

  // Calculate payment information
  const calculatePaymentInfo = () => {
    const totalAmount = sale.total_amount || 0;
    const paidAmount = sale.paid_amount || sale.current_paid || 0;
    const balanceAmount = sale.balance_amount || (totalAmount - paidAmount);
    
    return {
      totalAmount,
      paidAmount,
      balanceAmount,
      paymentPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    };
  };

  const { totalQuantity, totalAmount: itemsTotal } = calculateItemTotals(sale.items);
  const paymentInfo = calculatePaymentInfo();

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
            <div className="d-flex justify-content-between align-items-center w-100">
              <h5 className="modal-title fw-bold fs-5 mb-0">
                Sale Details - {sale.reference_no || "N/A"}
                {sale.invoice_number && (
                  <span className="ms-3 badge bg-primary">
                    Invoice: {sale.invoice_number}
                  </span>
                )}
              </h5>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  title="Print PDF Invoice"
                >
                  {pdfLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <GrDocumentPdf size={16} />
                      <span>PDF</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-success d-flex align-items-center gap-1"
                  onClick={handleDownloadExcel}
                  title="Export to Excel (CSV)"
                >
                  <AiOutlineFileExcel size={16} />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                ></button>
              </div>
            </div>
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
                    <h6 className="card-title fw-bold mb-3 border-bottom pb-2">
                      <FiFileText className="me-2" />
                      Sale Information
                    </h6>
                    <div className="row">
                      <div className="col-6 mb-2">
                        <small className="text-muted">Reference No:</small>
                        <div className="fw-medium text-primary">
                          {sale.reference_no || "N/A"}
                        </div>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted">Invoice No:</small>
                        <div className="fw-medium">
                          {sale.invoice_number ? (
                            <span className="text-success">{sale.invoice_number}</span>
                          ) : (
                            <span className="text-muted">Not Generated</span>
                          )}
                        </div>
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
                      <div className="col-12 mt-2">
                        <small className="text-muted">Sale Note:</small>
                        <div className="fw-medium p-2 bg-light rounded">
                          {sale.sale_note || "No additional notes"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3 border-bottom pb-2">
                      <FiUser className="me-2" />
                      Customer & Branch
                    </h6>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                            <FiUser className="text-primary" size={18} />
                          </div>
                          <div>
                            <div className="fw-medium fs-6">
                              {getCustomerName(sale.customer_id)}
                            </div>
                            {sale.customer_id?.customer_code && (
                              <small className="text-muted">
                                Code: {sale.customer_id.customer_code}
                              </small>
                            )}
                          </div>
                        </div>
                        {sale.customer_id?.phone && (
                          <div className="text-muted small">
                            <strong>Phone:</strong> {sale.customer_id.phone}
                          </div>
                        )}
                        {sale.customer_id?.email && (
                          <div className="text-muted small">
                            <strong>Email:</strong> {sale.customer_id.email}
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-info bg-opacity-10 p-2 me-2">
                            <FiMapPin className="text-info" size={18} />
                          </div>
                          <div>
                            <div className="fw-medium">
                              {getBranchName(sale.branch_id)}
                            </div>
                            {sale.branch_id?.branch_code && (
                              <small className="text-muted">
                                Code: {sale.branch_id.branch_code}
                              </small>
                            )}
                          </div>
                        </div>
                        {sale.branch_id?.address && (
                          <div className="text-muted small mt-2">
                            <strong>Address:</strong> {sale.branch_id.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3 border-bottom pb-2">
                      <FiDollarSign className="me-2" />
                      Payment Information
                    </h6>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div className="text-center">
                          <small className="text-muted d-block">Payment Status</small>
                          <span
                            className={`badge ${getPaymentStatusBadgeClass(
                              sale.payment_status
                            )} fw-medium fs-6 px-3 py-2`}
                          >
                            {sale.payment_status
                              ? sale.payment_status.charAt(0).toUpperCase() +
                                sale.payment_status.slice(1)
                              : "Pending"}
                          </span>
                          {sale.payment_method && (
                            <div className="text-muted small mt-1">
                              Method: {sale.payment_method}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-md-8">
                        <div className="row">
                          <div className="col-4 text-center">
                            <div className="border rounded p-3">
                              <small className="text-muted d-block">Total Amount</small>
                              <div className="fw-bold fs-5">
                                {formatCurrency(paymentInfo.totalAmount)}
                              </div>
                            </div>
                          </div>
                          <div className="col-4 text-center">
                            <div className="border rounded p-3">
                              <small className="text-muted d-block">Paid Amount</small>
                              <div className="fw-bold fs-5 text-success">
                                {formatCurrency(paymentInfo.paidAmount)}
                              </div>
                              {paymentInfo.paymentPercentage > 0 && (
                                <small className="text-success">
                                  ({(paymentInfo.paymentPercentage).toFixed(1)}% paid)
                                </small>
                              )}
                            </div>
                          </div>
                          <div className="col-4 text-center">
                            <div className="border rounded p-3">
                              <small className="text-muted d-block">Balance Due</small>
                              <div className={`fw-bold fs-5 ${
                                paymentInfo.balanceAmount === 0 ? 'text-success' : 'text-danger'
                              }`}>
                                {formatCurrency(paymentInfo.balanceAmount)}
                              </div>
                              {sale.payment_date && (
                                <small className="text-muted">
                                  Paid on: {formatDate(sale.payment_date)}
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                        {sale.payment_notes && (
                          <div className="mt-3">
                            <small className="text-muted">Payment Notes:</small>
                            <div className="fw-medium p-2 bg-light rounded">
                              {sale.payment_notes}
                            </div>
                          </div>
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
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="card-title fw-bold mb-0">
                    <FiPackage className="me-2" />
                    Sale Items ({totalQuantity} items)
                  </h6>
                  <div className="text-muted">
                    Items Total: <span className="fw-bold">{formatCurrency(itemsTotal)}</span>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Product Code</th>
                        <th>Quantity</th>
                        <th className="text-end">Price (before tax)</th>
                        <th className="text-end">GST Rate</th>
                        <th className="text-end">GST Amount</th>
                        <th className="text-end">Selling Total</th>
                        <th className="text-end">Final Total</th>
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
                            </td>
                            <td>
                              <code>{item.product_code || "N/A"}</code>
                            </td>
                            <td>{item.quantity}</td>
                            <td className="text-end">
                              {formatCurrency(item.price_before_tax)}
                            </td>
                            <td className="text-end">
                              {item.gst_rate ? `${item.gst_rate}%` : "0%"}
                            </td>
                            <td className="text-end">
                              {formatCurrency(item.gst_amount)}
                            </td>
                            <td className="text-end">
                              {formatCurrency(item.selling_total)}
                            </td>
                            <td className="text-end fw-bold">
                              {formatCurrency(item.final_total)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-4 text-muted">
                            No items in this sale
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="8" className="text-end fw-bold">Items Total:</td>
                        <td className="text-end fw-bold">
                          {formatCurrency(itemsTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="row">
              <div className="col-md-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3 border-bottom pb-2">
                      <FiDollarSign className="me-2" />
                      Amount Summary
                    </h6>
                    <div className="row">
                      <div className="col-md-6">
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
                            <span className="text-muted">Total GST:</span>
                            <span className="fw-medium">
                              {formatCurrency(sale.total_tax || sale.gst_amount)}
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between">
                            <span className="fw-bold fs-5">Grand Total:</span>
                            <span className="fw-bold fs-5 text-primary">
                              {formatCurrency(sale.total_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="bg-light p-3 rounded h-100">
                          <h6 className="fw-bold mb-3">Export Options</h6>
                          <div className="small text-muted">
                            <div className="mb-2">
                              <strong>PDF/Print Invoice:</strong>
                            </div>
                            <div className="mb-1">
                              • Opens a printable invoice in a new window
                            </div>
                            <div className="mb-1">
                              • Use browser's "Save as PDF" option when printing
                            </div>
                            <div className="mb-3">
                              • Includes all details in professional format
                            </div>
                            <div className="mb-2">
                              <strong>Excel Export:</strong>
                            </div>
                            <div className="mb-1">
                              • Downloads as CSV file
                            </div>
                            <div className="mb-1">
                              • Opens in Excel or any spreadsheet software
                            </div>
                            <div className="mb-1">
                              • Perfect for data analysis and records
                            </div>
                          </div>
                        </div>
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
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-danger d-flex align-items-center gap-2"
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Opening Print View...
                  </>
                ) : (
                  <>
                    <GrDocumentPdf size={16} />
                    Print/PDF Invoice
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={handleDownloadExcel}
              >
                <AiOutlineFileExcel size={16} />
                Export to Excel (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSaleModal;