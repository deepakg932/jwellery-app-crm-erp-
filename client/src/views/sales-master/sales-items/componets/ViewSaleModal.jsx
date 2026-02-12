import React, { useState } from "react";
import {
  FiCalendar,
  FiPackage,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiFileText,
  FiRefreshCw,
  FiFile,
  FiImage, // Added this import
} from "react-icons/fi";
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
        return "bg-danger";
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

  // Calculate item totals from the sale items
  const calculateItemTotals = () => {
    if (!sale.items || !Array.isArray(sale.items)) {
      return { totalQuantity: 0, itemsTotal: 0 };
    }

    const totals = sale.items.reduce(
      (acc, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const finalTotal = parseFloat(item.final_total) || 0;

        return {
          totalQuantity: acc.totalQuantity + quantity,
          itemsTotal: acc.itemsTotal + finalTotal,
        };
      },
      { totalQuantity: 0, itemsTotal: 0 },
    );

    return totals;
  };

  // Calculate payment information from sale data
  const calculatePaymentInfo = () => {
    const totalAmount = sale.total_amount || 0;
    const paidAmount = sale.paid_amount || sale.current_paid || 0;
    const balanceAmount = sale.balance_amount || totalAmount - paidAmount;

    return {
      totalAmount,
      paidAmount,
      balanceAmount,
      paymentPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
    };
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (!sale.reference_no) {
      alert("No sale reference available for download");
      return;
    }

    setPdfLoading(true);

    // Extract customer information from the sale object
    const customerName = sale.customer_name || "Unknown Customer";
    const customerMobile = sale.customer_mobile || "";
    const customerCode = sale.customer_code || "";

    // Extract branch information
    const branchName = sale.branch_name || "Unknown Branch";
    const branchCode = sale.branch_code || "";

    // Extract sold by information
    const soldByName =
      sale.sold_by_name || sale.sold_by?.name || "Unknown Employee";

    // Get exchange image URL if exists
    const exchangeImageUrl = sale.exchange_details?.fullImageUrl || "";

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
          .exchange-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .exchange-image {
            max-width: 200px;
            max-height: 200px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">SALES MANAGEMENT SYSTEM</div>
            <div class="invoice-title">TAX INVOICE</div>
            ${
              sale.invoice_number
                ? `
              <div class="invoice-number">
                Invoice No: ${sale.invoice_number}<br>
                Reference No: ${sale.reference_no}
              </div>
            `
                : `
              <div class="invoice-number">Reference: ${sale.reference_no}</div>
            `
            }
            <div>Date: ${formatDate(sale.sale_date)}</div>
          </div>
          
          <div class="details-grid">
            <div class="detail-section">
              <h3>Sale Details</h3>
              ${
                sale.invoice_number
                  ? `
                <div class="detail-item">
                  <span class="detail-label">Invoice No:</span> ${sale.invoice_number}
                </div>
              `
                  : ""
              }
              <div class="detail-item">
                <span class="detail-label">Reference No:</span> ${sale.reference_no}
              </div>
              <div class="detail-item">
                <span class="detail-label">Sale Date:</span> ${formatDate(sale.sale_date)}
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span> ${sale.status}
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Status:</span> ${sale.payment_status}
              </div>
              <div class="detail-item">
                <span class="detail-label">Branch:</span> ${branchName}
                ${branchCode ? ` (${branchCode})` : ""}
              </div>
              <div class="detail-item">
                <span class="detail-label">Sold By:</span> ${soldByName}
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Customer Details</h3>
              <div class="detail-item">
                <span class="detail-label">Name:</span> ${customerName}
              </div>
              ${
                customerMobile
                  ? `
                <div class="detail-item">
                  <span class="detail-label">Mobile:</span> ${customerMobile}
                </div>
              `
                  : ""
              }
              ${
                customerCode
                  ? `
                <div class="detail-item">
                  <span class="detail-label">Customer Code:</span> ${customerCode}
                </div>
              `
                  : ""
              }
            </div>
          </div>
          
          ${
            sale.is_exchange
              ? `
            <div class="exchange-info">
              <h3 style="margin-top: 0; color: #856404;">
                Exchange Sale
              </h3>
              <div class="detail-item">
                <span class="detail-label">Item Name:</span> ${sale.exchange_details?.item_name || "N/A"}
              </div>
              <div class="detail-item">
                <span class="detail-label">Weight:</span> ${sale.exchange_details?.weight || 0}
              </div>
              <div class="detail-item">
                <span class="detail-label">Unit:</span> ${sale.exchange_details?.unit_name || "N/A"}
              </div>
              <div class="detail-item">
                <span class="detail-label">Weight in Grams:</span> ${sale.exchange_details?.weight_in_gram || 0} g
              </div>
              <div class="detail-item">
                <span class="detail-label">Actual Rate:</span> ₹${sale.exchange_details?.actual_rate || 0}
              </div>
              <div class="detail-item">
                <span class="detail-label">Calculated Value:</span> ₹${sale.exchange_details?.calculated_value || 0}
              </div>
              <div class="detail-item">
                <span class="detail-label">Exchange Amount:</span> ₹${parseFloat(
                  sale.exchange_amount || 0,
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              ${
                sale.exchange_details?.fullImageUrl
                  ? `
                <div class="detail-item">
                  <span class="detail-label">Exchange Image:</span><br>
                  <img src="${sale.exchange_details.fullImageUrl}" alt="Exchange Item" class="exchange-image" onerror="this.style.display='none';">
                </div>
              `
                  : ""
              }
              ${
                sale.exchange_note
                  ? `
                <div class="detail-item">
                  <span class="detail-label">Exchange Note:</span> ${sale.exchange_note}
                </div>
              `
                  : ""
              }
            </div>
          `
              : ""
          }
          
          <table class="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price (before tax)</th>
                <th>GST Rate</th>
                <th>GST Amount</th>
                <th>Selling Total</th>
                <th>Final Total</th>
              </tr>
            </thead>
            <tbody>
              ${
                sale.items
                  ?.map(
                    (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product_name || "N/A"}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price_before_tax)}</td>
                  <td>${item.gst_rate ? `${item.gst_rate}%` : "0%"}</td>
                  <td>${formatCurrency(item.gst_amount)}</td>
                  <td>${formatCurrency(item.selling_total)}</td>
                  <td>${formatCurrency(item.final_total)}</td>
                </tr>
              `,
                  )
                  .join("") ||
                '<tr><td colspan="8" style="text-align: center;">No items in this sale</td></tr>'
              }
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
              <span>${formatCurrency(sale.total_tax)}</span>
            </div>
            
            ${
              sale.is_exchange
                ? `
              <div class="total-row">
                <span class="total-label">Before Exchange:</span>
                <span>${formatCurrency(
                  parseFloat(sale.subtotal || 0) +
                    parseFloat(sale.total_tax || 0) +
                    parseFloat(sale.shipping_cost || 0) -
                    parseFloat(sale.discount || 0),
                )}</span>
              </div>
              <div class="total-row">
                <span class="total-label" style="color: #856404;">Exchange Deduction:</span>
                <span style="color: #856404;">-${formatCurrency(sale.exchange_amount)}</span>
              </div>
            `
                : ""
            }
            
            <div class="total-row grand-total">
              <span class="total-label">Total Amount:</span>
              <span>${formatCurrency(sale.total_amount)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Paid Amount:</span>
              <span>${formatCurrency(sale.paid_amount || sale.current_paid || 0)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Balance Amount:</span>
              <span style="color: #e74c3c; font-weight: bold;">
                ${formatCurrency(sale.balance_amount)}
              </span>
            </div>
          </div>
          
          ${
            sale.sale_note
              ? `
            <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
              <h4 style="margin-top: 0; color: #2c3e50;">Sale Notes:</h4>
              <p style="margin-bottom: 0;">${sale.sale_note}</p>
            </div>
          `
              : ""
          }
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <script>
          // Auto print after loading
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    // Open the invoice in a new window and trigger print
    const printWindow = window.open("", "_blank", "width=800,height=600");
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
        invoice_number: sale.invoice_number,
        reference_no: sale.reference_no,
        sale_date: formatDate(sale.sale_date),
        customer: sale.customer_name,
        customer_mobile: sale.customer_mobile,
        customer_code: sale.customer_code,
        branch: sale.branch_name,
        branch_code: sale.branch_code,
        sold_by: sale.sold_by_name,
        status: sale.status,
        payment_status: sale.payment_status,
        is_exchange: sale.is_exchange ? "Yes" : "No",
        exchange_details: sale.exchange_details || {},
        exchange_amount: sale.exchange_amount || 0,
        exchange_note: sale.exchange_note || "",
        items: sale.items || [],
        subtotal: sale.subtotal,
        shipping_cost: sale.shipping_cost,
        discount: sale.discount,
        total_tax: sale.total_tax,
        total_amount: sale.total_amount,
        current_paid: sale.current_paid,
        balance_amount: sale.balance_amount,
        paid_amount: sale.paid_amount,
        sale_note: sale.sale_note,
        created_at: formatDate(sale.created_at),
        updated_at: formatDate(sale.updated_at),
      };

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";

      // Add headers
      csvContent += "SALE DETAILS\r\n\r\n";
      csvContent += "Field,Value\r\n";
      csvContent += `Invoice No,${saleData.invoice_number || "N/A"}\r\n`;
      csvContent += `Reference No,${saleData.reference_no}\r\n`;
      csvContent += `Sale Date,${saleData.sale_date}\r\n`;
      csvContent += `Customer,${saleData.customer}\r\n`;
      csvContent += `Customer Mobile,${saleData.customer_mobile}\r\n`;
      csvContent += `Customer Code,${saleData.customer_code}\r\n`;
      csvContent += `Branch,${saleData.branch}\r\n`;
      csvContent += `Branch Code,${saleData.branch_code}\r\n`;
      csvContent += `Sold By,${saleData.sold_by}\r\n`;
      csvContent += `Status,${saleData.status}\r\n`;
      csvContent += `Payment Status,${saleData.payment_status}\r\n`;
      csvContent += `Exchange Sale,${saleData.is_exchange}\r\n`;
      if (saleData.is_exchange === "Yes") {
        csvContent += `Exchange Item Name,${saleData.exchange_details.item_name}\r\n`;
        csvContent += `Exchange Weight,${saleData.exchange_details.weight}\r\n`;
        csvContent += `Exchange Unit,${saleData.exchange_details.unit}\r\n`;
        csvContent += `Exchange Weight (g),${saleData.exchange_details.weight_in_gram}\r\n`;
        csvContent += `Exchange Actual Rate,${saleData.exchange_details.actual_rate}\r\n`;
        csvContent += `Exchange Calculated Value,${saleData.exchange_details.calculated_value}\r\n`;
        csvContent += `Exchange Amount,${saleData.exchange_amount}\r\n`;
        csvContent += `Exchange Image,${saleData.exchange_details.fullImageUrl || ""}\r\n`;
        csvContent += `Exchange Note,${saleData.exchange_note}\r\n`;
      }
      csvContent += `\r\n`;

      // Add items
      csvContent += `ITEMS\r\n`;
      csvContent += `Product Name,Quantity,Price Before Tax,GST Rate,GST Amount,Selling Total,Final Total\r\n`;
      saleData.items.forEach((item) => {
        csvContent += `${item.product_name},${item.quantity},${item.price_before_tax},${item.gst_rate},${item.gst_amount},${item.selling_total},${item.final_total}\r\n`;
      });

      csvContent += `\r\n`;

      // Add totals
      csvContent += `FINANCIAL SUMMARY\r\n`;
      csvContent += `Subtotal,${saleData.subtotal}\r\n`;
      csvContent += `Shipping Cost,${saleData.shipping_cost}\r\n`;
      csvContent += `Discount,${saleData.discount}\r\n`;
      csvContent += `Total GST,${saleData.total_tax}\r\n`;
      csvContent += `Exchange Amount,${saleData.exchange_amount}\r\n`;
      csvContent += `Total Amount,${saleData.total_amount}\r\n`;
      csvContent += `Current Paid,${saleData.current_paid}\r\n`;
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
      link.setAttribute(
        "download",
        `${sale.invoice_number || sale.reference_no}_Sale_${
          new Date().toISOString().split("T")[0]
        }.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Sale exported to CSV successfully");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Failed to export to CSV");
    }
  };

  const { totalQuantity, itemsTotal } = calculateItemTotals();
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
                Sale Details - {sale.reference_no}
                {sale.has_invoice && sale.invoice_number && (
                  <span className="ms-2 badge bg-success">
                    <FiFile className="me-1" size={14} />
                    Invoice: {sale.invoice_number}
                  </span>
                )}
                {sale.is_exchange && (
                  <span className="ms-2 badge bg-warning">
                    <FiRefreshCw className="me-1" size={14} />
                    Exchange Sale
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
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
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
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3 border-bottom pb-2">
                      <FiFileText className="me-2" />
                      Sale Information
                    </h6>
                    <div className="row">
                      <div className="col-12 mb-2">
                        <small className="text-muted">Reference No:</small>
                        <div className="fw-medium text-primary">
                          {sale.reference_no}
                        </div>
                      </div>
                      {sale.has_invoice && sale.invoice_number && (
                        <div className="col-12 mb-2">
                          <small className="text-muted">Invoice No:</small>
                          <div className="fw-medium text-success">
                            <FiFile className="me-1" size={14} />
                            {sale.invoice_number}
                          </div>
                        </div>
                      )}
                      <div className="col-12 mb-2">
                        <small className="text-muted">Sale Date:</small>
                        <div className="fw-medium">
                          <FiCalendar className="me-1" size={14} />
                          {formatDate(sale.sale_date)}
                        </div>
                      </div>
                      <div className="col-12 mb-2">
                        <small className="text-muted">Status:</small>
                        <div>
                          <span
                            className={`badge ${getStatusBadgeClass(
                              sale.status,
                            )} fw-medium`}
                          >
                            {(sale.status || "draft").charAt(0).toUpperCase() +
                              (sale.status || "draft").slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="col-12 mb-2">
                        <small className="text-muted">Sold By:</small>
                        <div className="fw-medium">{sale.sold_by_name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3 border-bottom pb-2">
                      <FiUser className="me-2" />
                      Customer Details
                    </h6>
                    <div className="row">
                      <div className="col-12 mb-2">
                        <div className="d-flex align-items-center mb-2">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                            <FiUser className="text-primary" size={18} />
                          </div>
                          <div>
                            <div className="fw-medium fs-6">
                              {sale.customer_name}
                            </div>
                            {sale.customer_code && (
                              <small className="text-muted">
                                Code: {sale.customer_code}
                              </small>
                            )}
                          </div>
                        </div>
                        {sale.customer_mobile && (
                          <div className="text-muted small">
                            <strong>Mobile:</strong> {sale.customer_mobile}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3 border-bottom pb-2">
                      <FiMapPin className="me-2" />
                      Branch Details
                    </h6>
                    <div className="row">
                      <div className="col-12">
                        <div className="d-flex align-items-center mb-2">
                          <div className="rounded-circle bg-info bg-opacity-10 p-2 me-2">
                            <FiMapPin className="text-info" size={18} />
                          </div>
                          <div>
                            <div className="fw-medium">{sale.branch_name}</div>
                            {sale.branch_code && (
                              <small className="text-muted">
                                Code: {sale.branch_code}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Information */}
            {sale.is_exchange && (
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card border-warning border-2">
                    <div className="card-body bg-warning bg-opacity-10">
                      <h6 className="card-title fw-bold mb-3 text-warning">
                        <FiRefreshCw className="me-2" />
                        Exchange Sale Details
                      </h6>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <small className="text-muted">Exchange Amount:</small>
                          <div className="fw-bold fs-5 text-warning">
                            {formatCurrency(sale.exchange_amount || 0)}
                          </div>
                        </div>
                        <div className="col-md-8">
                          <small className="text-muted">Exchange Note:</small>
                          <div className="fw-medium p-2 bg-white rounded border">
                            {sale.exchange_note || "No exchange notes provided"}
                          </div>
                        </div>
                      </div>
                      
                      {/* Exchange Image Section - ADDED THIS */}
                      {sale.exchange_details?.fullImageUrl && (
                        <div className="mt-4">
                          <h6 className="fw-bold mb-3">
                            <FiImage className="me-2" />
                            Exchange Item Image
                          </h6>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="border rounded p-3 bg-white">
                                <img
                                  src={sale.exchange_details.fullImageUrl}
                                  alt="Exchange Item"
                                  className="img-fluid rounded"
                                  style={{
                                    maxHeight: "200px",
                                    objectFit: "contain",
                                  }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://via.placeholder.com/200x200?text=Image+Not+Available";
                                  }}
                                />
                                <div className="text-center small text-muted mt-2">
                                  Exchange Item: {sale.exchange_details.item_name || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="p-3">
                                <h6 className="fw-bold mb-3">Exchange Item Details</h6>
                                <div className="row">
                                  <div className="col-6 mb-2">
                                    <small className="text-muted">Item Name:</small>
                                    <div className="fw-medium">
                                      {sale.exchange_details.item_name || "N/A"}
                                    </div>
                                  </div>
                                  <div className="col-6 mb-2">
                                    <small className="text-muted">Weight:</small>
                                    <div className="fw-medium">
                                      {sale.exchange_details.weight || 0}
                                    </div>
                                  </div>
                                  <div className="col-6 mb-2">
                                    <small className="text-muted">Unit:</small>
                                    <div className="fw-medium">
                                      {sale.exchange_details.unit_name || "N/A"}
                                    </div>
                                  </div>
                                  <div className="col-6 mb-2">
                                    <small className="text-muted">Weight (g):</small>
                                    <div className="fw-medium">
                                      {sale.exchange_details.weight_in_gram || 0} g
                                    </div>
                                  </div>
                                  <div className="col-6 mb-2">
                                    <small className="text-muted">Actual Rate:</small>
                                    <div className="fw-medium">
                                      ₹{sale.exchange_details.actual_rate || 0}
                                    </div>
                                  </div>
                                  <div className="col-6 mb-2">
                                    <small className="text-muted">Calculated Value:</small>
                                    <div className="fw-medium">
                                      ₹{sale.exchange_details.calculated_value || 0}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="alert alert-info mt-3 mb-0">
                        <div className="d-flex align-items-center">
                          <FiRefreshCw className="me-2" size={18} />
                          <div>
                            <strong>Calculation:</strong> Total Amount =
                            (Subtotal + Shipping + Tax - Discount) - Exchange
                            Amount
                            <br />
                            <small>
                              Exchange amount has been deducted from the final
                              total.
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                          <small className="text-muted d-block">
                            Payment Status
                          </small>
                          <span
                            className={`badge ${getPaymentStatusBadgeClass(
                              sale.payment_status,
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
                              <small className="text-muted d-block">
                                Total Amount
                              </small>
                              <div className="fw-bold fs-5">
                                {formatCurrency(paymentInfo.totalAmount)}
                              </div>
                            </div>
                          </div>
                          <div className="col-4 text-center">
                            <div className="border rounded p-3">
                              <small className="text-muted d-block">
                                Paid Amount
                              </small>
                              <div className="fw-bold fs-5 text-success">
                                {formatCurrency(paymentInfo.paidAmount)}
                              </div>
                              {paymentInfo.paymentPercentage > 0 && (
                                <small className="text-success">
                                  ({paymentInfo.paymentPercentage.toFixed(1)}%
                                  paid)
                                </small>
                              )}
                            </div>
                          </div>
                          <div className="col-4 text-center">
                            <div className="border rounded p-3">
                              <small className="text-muted d-block">
                                Balance Amount
                              </small>
                              <div
                                className={`fw-bold fs-5 ${
                                  paymentInfo.balanceAmount === 0
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              >
                                {formatCurrency(paymentInfo.balanceAmount)}
                              </div>
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
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
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
                                {item.product_name || "N/A"}
                              </div>
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
                          <td
                            colSpan="8"
                            className="text-center py-4 text-muted"
                          >
                            No items in this sale
                          </td>
                        </tr>
                      )}
                    </tbody>
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
                              {formatCurrency(sale.total_tax)}
                            </span>
                          </div>

                          {sale.is_exchange && (
                            <>
                              <div className="d-flex justify-content-between mb-2 border-top pt-2 mt-2">
                                <span className="text-muted">
                                  Before Exchange:
                                </span>
                                <span className="fw-medium">
                                  {formatCurrency(
                                    parseFloat(sale.subtotal || 0) +
                                      parseFloat(sale.total_tax || 0) +
                                      parseFloat(sale.shipping_cost || 0) -
                                      parseFloat(sale.discount || 0),
                                  )}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted text-warning">
                                  <FiRefreshCw className="me-1" size={14} />
                                  Exchange Deduction:
                                </span>
                                <span className="fw-medium text-warning">
                                  -{formatCurrency(sale.exchange_amount)}
                                </span>
                              </div>
                            </>
                          )}

                          <hr />
                          <div className="d-flex justify-content-between">
                            <span className="fw-bold fs-5">Total Amount:</span>
                            <span className="fw-bold fs-5 text-primary">
                              {formatCurrency(sale.total_amount)}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mt-2">
                            <span className="fw-bold">Current Paid:</span>
                            <span className="fw-bold text-success">
                              {formatCurrency(sale.current_paid)}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mt-2">
                            <span className="fw-bold">Balance Amount:</span>
                            <span
                              className={`fw-bold ${sale.balance_amount === 0 ? "text-success" : "text-danger"}`}
                            >
                              {formatCurrency(sale.balance_amount)}
                            </span>
                          </div>
                        </div>

                        {sale.sale_note && (
                          <div className="mt-3">
                            <h6 className="fw-bold mb-2">Sale Notes</h6>
                            <div className="p-3 bg-light rounded border">
                              {sale.sale_note}
                            </div>
                          </div>
                        )}
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
                            <div className="mb-1">• Downloads as CSV file</div>
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
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
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