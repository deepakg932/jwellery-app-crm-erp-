import React, { useRef } from "react";
import { 
  FiCalendar, 
  FiPackage, 
  FiDollarSign, 
  FiFileText, 
  FiTruck, 
  FiPercent, 
  FiCreditCard,
  FiDownload,
  FiPrinter,
  FiFile,
  FiFileText as FiExcel
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const ViewPurchaseOrderModal = ({ purchaseOrder, onClose }) => {
  const modalRef = useRef(null);

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

  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    const currencyMap = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return currencyMap[currency] || '₹';
  };

  // Format currency
  const formatCurrency = (amount, currency = purchaseOrder.currency || 'INR') => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${parseFloat(amount || 0).toFixed(2)}`;
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
      case 'paid':
        return 'bg-success';
      case 'partial':
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

  // Calculate totals
  const calculateTotals = () => {
    const itemsTotal = purchaseOrder.items?.reduce((total, item) => {
      return total + (parseFloat(item.total) || calculateItemTotal(item));
    }, 0) || 0;

    const vatAmount = (itemsTotal * (parseFloat(purchaseOrder.vat) || 0)) / 100;
    const discountAmount = parseFloat(purchaseOrder.discount) || 0;
    const shippingCost = parseFloat(purchaseOrder.shipping_cost) || 0;

    return {
      subtotal: itemsTotal,
      vat: vatAmount,
      discount: discountAmount,
      shipping: shippingCost,
      grandTotal: itemsTotal + vatAmount - discountAmount + shippingCost
    };
  };

  const totals = calculateTotals();

  // Function to generate and download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add company logo and header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("PURCHASE ORDER INVOICE", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`PO Number: ${purchaseOrder.order_number || "N/A"}`, 14, 35);
    doc.text(`Date: ${formatDate(purchaseOrder.order_date)}`, 14, 42);
    doc.text(`Reference: ${purchaseOrder.reference_no || "N/A"}`, 14, 49);
    
    // Supplier info
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("Supplier Details:", 14, 65);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    const supplierName = purchaseOrder.supplier?.name || purchaseOrder.supplier?.supplier_name || "N/A";
    const supplierPhone = purchaseOrder.supplier?.phone || "";
    const supplierEmail = purchaseOrder.supplier?.email || "";
    const supplierAddress = purchaseOrder.supplier?.address || "";
    
    doc.text(supplierName, 14, 72);
    if (supplierPhone) doc.text(`Phone: ${supplierPhone}`, 14, 79);
    if (supplierEmail) doc.text(`Email: ${supplierEmail}`, 14, 86);
    if (supplierAddress) doc.text(`Address: ${supplierAddress}`, 14, 93);
    
    // Company info on right
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("Company Details:", 140, 65);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Your Company Name", 140, 72);
    doc.text("Your Company Address", 140, 79);
    doc.text("Phone: +1234567890", 140, 86);
    doc.text("Email: info@company.com", 140, 93);
    
    // Table headers
    const tableColumn = ["#", "Item", "Qty/Weight", "Unit", "Rate", "Total"];
    const tableRows = [];
    
    // Add items to table
    purchaseOrder.items?.forEach((item, index) => {
      const itemName = item.inventory_item_id?.name || item.inventory_item?.name || item.item_name || "Unknown Item";
      const quantity = item.quantity ? `${item.quantity}` : "";
      const weight = item.weight ? `${item.weight}` : "";
      const unit = item.unit_id?.name || "";
      const rate = formatCurrency(item.rate);
      const total = formatCurrency(item.total || calculateItemTotal(item));
      
      const qtyWeight = quantity || weight;
      
      tableRows.push([
        index + 1,
        itemName,
        qtyWeight,
        unit,
        rate,
        total
      ]);
    });
    
    // Add table
    doc.autoTable({
      startY: 105,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 105 }
    });
    
    // Get final Y position after table
    const finalY = doc.lastAutoTable.finalY || 150;
    
    // Add summary section
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("Summary", 14, finalY + 15);
    
    doc.setFontSize(10);
    doc.text("Subtotal:", 130, finalY + 15);
    doc.text(formatCurrency(totals.subtotal), 180, finalY + 15, { align: "right" });
    
    doc.text(`VAT (${purchaseOrder.vat || 0}%):`, 130, finalY + 22);
    doc.text(formatCurrency(totals.vat), 180, finalY + 22, { align: "right" });
    
    doc.text("Discount:", 130, finalY + 29);
    doc.text(`-${formatCurrency(totals.discount)}`, 180, finalY + 29, { align: "right" });
    
    doc.text("Shipping Cost:", 130, finalY + 36);
    doc.text(formatCurrency(totals.shipping), 180, finalY + 36, { align: "right" });
    
    // Grand Total
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Grand Total:", 130, finalY + 45);
    doc.text(formatCurrency(totals.grandTotal), 180, finalY + 45, { align: "right" });
    
    // Add currency conversion if applicable
    if (purchaseOrder.exchange_rate && purchaseOrder.exchange_rate !== 1) {
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      const convertedAmount = totals.grandTotal * (purchaseOrder.exchange_rate || 1);
      doc.text(`Converted to INR: ₹${convertedAmount.toFixed(2)}`, 130, finalY + 52);
      doc.text(`Exchange Rate: ${purchaseOrder.exchange_rate}:1`, 130, finalY + 58);
    }
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your business!", 105, finalY + 70, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, finalY + 75, { align: "center" });
    
    // Save the PDF
    const fileName = `Purchase_Order_${purchaseOrder.order_number || purchaseOrder._id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Function to generate and download Excel
  const downloadExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Invoice Summary Sheet
    const summaryData = [
      ["PURCHASE ORDER INVOICE"],
      [],
      ["PO Number:", purchaseOrder.order_number || "N/A"],
      ["Order Date:", formatDate(purchaseOrder.order_date)],
      ["Reference No:", purchaseOrder.reference_no || "N/A"],
      ["Supplier:", purchaseOrder.supplier?.name || purchaseOrder.supplier?.supplier_name || "N/A"],
      ["Status:", purchaseOrder.status?.toUpperCase() || "DRAFT"],
      ["Currency:", purchaseOrder.currency || "INR"],
      ["Exchange Rate:", purchaseOrder.exchange_rate || 1],
      [],
      ["INVOICE SUMMARY"],
      ["Subtotal:", totals.subtotal],
      [`VAT (${purchaseOrder.vat || 0}%):`, totals.vat],
      ["Discount:", -totals.discount],
      ["Shipping Cost:", totals.shipping],
      ["Grand Total:", totals.grandTotal],
      [],
      ["Payment Status:", purchaseOrder.payment_status?.toUpperCase() || "PENDING"],
      ["Branch:", purchaseOrder.branch_id?.branch_name || purchaseOrder.branch_id || "N/A"],
      [],
      ["Notes:", purchaseOrder.notes || ""]
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Invoice Summary");
    
    // Items Sheet
    const itemsHeader = [
      ["S.No", "Item Code", "Item Name", "Quantity", "Weight", "Unit", "Rate", "Total", "Expected Date"]
    ];
    
    const itemsData = purchaseOrder.items?.map((item, index) => [
      index + 1,
      item.item_code || "",
      item.inventory_item_id?.name || item.inventory_item?.name || item.item_name || "",
      item.quantity || "",
      item.weight || "",
      item.unit_id?.name || "",
      item.rate || 0,
      item.total || calculateItemTotal(item),
      item.expected_date ? formatDate(item.expected_date) : ""
    ]) || [];
    
    const itemsWs = XLSX.utils.aoa_to_sheet([...itemsHeader, ...itemsData]);
    XLSX.utils.book_append_sheet(wb, itemsWs, "Order Items");
    
    // Supplier Details Sheet
    const supplierData = [
      ["SUPPLIER DETAILS"],
      [],
      ["Name:", purchaseOrder.supplier?.name || purchaseOrder.supplier?.supplier_name || "N/A"],
      ["Phone:", purchaseOrder.supplier?.phone || ""],
      ["Email:", purchaseOrder.supplier?.email || ""],
      ["Address:", purchaseOrder.supplier?.address || ""],
      [],
      ["COMPANY DETAILS"],
      [],
      ["Name:", "Your Company Name"],
      ["Address:", "Your Company Address"],
      ["Phone:", "+1234567890"],
      ["Email:", "info@company.com"],
      ["Website:", "www.company.com"]
    ];
    
    const supplierWs = XLSX.utils.aoa_to_sheet(supplierData);
    XLSX.utils.book_append_sheet(wb, supplierWs, "Contact Details");
    
    // Generate and download Excel file
    const fileName = `Purchase_Order_${purchaseOrder.order_number || purchaseOrder._id}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Function to print the invoice
  const printInvoice = () => {
    const printContent = modalRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <html>
        <head>
          <title>Purchase Order Invoice - ${purchaseOrder.order_number || purchaseOrder._id}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            @media print {
              body { padding: 20px; }
              .no-print { display: none !important; }
              .modal-content { border: none; box-shadow: none; }
              .table { border: 1px solid #dee2e6; }
              .bg-light { background-color: #f8f9fa !important; }
              .text-primary { color: #0d6efd !important; }
              .fw-bold { font-weight: bold !important; }
            }
            .invoice-header {
              border-bottom: 2px solid #0d6efd;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .summary-box {
              border: 1px solid #dee2e6;
              border-radius: 5px;
              padding: 15px;
              background-color: #f8f9fa;
            }
          </style>
        </head>
        <body>
          <div class="container-fluid">
            <div class="row mb-4">
              <div class="col-12">
                <div class="invoice-header">
                  <h1 class="text-center">PURCHASE ORDER INVOICE</h1>
                  <p class="text-center text-muted">${purchaseOrder.order_number || "N/A"} | ${formatDate(purchaseOrder.order_date)}</p>
                </div>
              </div>
            </div>
            
            <!-- Supplier and Company Info -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header bg-primary text-white">
                    <h6 class="mb-0">Supplier Information</h6>
                  </div>
                  <div class="card-body">
                    <p class="mb-1"><strong>Name:</strong> ${purchaseOrder.supplier?.name || purchaseOrder.supplier?.supplier_name || "N/A"}</p>
                    ${purchaseOrder.supplier?.phone ? `<p class="mb-1"><strong>Phone:</strong> ${purchaseOrder.supplier.phone}</p>` : ''}
                    ${purchaseOrder.supplier?.email ? `<p class="mb-1"><strong>Email:</strong> ${purchaseOrder.supplier.email}</p>` : ''}
                    ${purchaseOrder.supplier?.address ? `<p class="mb-1"><strong>Address:</strong> ${purchaseOrder.supplier.address}</p>` : ''}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header bg-dark text-white">
                    <h6 class="mb-0">Company Information</h6>
                  </div>
                  <div class="card-body">
                    <p class="mb-1"><strong>Your Company Name</strong></p>
                    <p class="mb-1">Your Company Address</p>
                    <p class="mb-1">Phone: +1234567890</p>
                    <p class="mb-1">Email: info@company.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Order Items Table -->
            <div class="row mb-4">
              <div class="col-12">
                <h5 class="mb-3">Order Items</h5>
                <table class="table table-bordered">
                  <thead class="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Item Name</th>
                      <th>Quantity/Weight</th>
                      <th>Unit</th>
                      <th>Rate</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${purchaseOrder.items?.map((item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.inventory_item_id?.name || item.inventory_item?.name || item.item_name || "Unknown Item"}</td>
                        <td>${item.quantity || item.weight || "0"}</td>
                        <td>${item.unit_id?.name || "N/A"}</td>
                        <td>${formatCurrency(item.rate)}</td>
                        <td>${formatCurrency(item.total || calculateItemTotal(item))}</td>
                      </tr>
                    `).join('') || '<tr><td colspan="6" class="text-center">No items found</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Summary -->
            <div class="row">
              <div class="col-md-8">
                ${purchaseOrder.notes ? `
                  <div class="card mb-3">
                    <div class="card-header">
                      <h6 class="mb-0">Notes</h6>
                    </div>
                    <div class="card-body">
                      <p class="mb-0">${purchaseOrder.notes}</p>
                    </div>
                  </div>
                ` : ''}
              </div>
              <div class="col-md-4">
                <div class="summary-box">
                  <h6 class="mb-3 border-bottom pb-2">Invoice Summary</h6>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>VAT (${purchaseOrder.vat || 0}%):</span>
                    <span>${formatCurrency(totals.vat)}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Discount:</span>
                    <span class="text-danger">-${formatCurrency(totals.discount)}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Shipping Cost:</span>
                    <span>${formatCurrency(totals.shipping)}</span>
                  </div>
                  <hr />
                  <div class="d-flex justify-content-between">
                    <strong>Grand Total:</strong>
                    <strong class="text-primary">${formatCurrency(totals.grandTotal)}</strong>
                  </div>
                  ${purchaseOrder.exchange_rate && purchaseOrder.exchange_rate !== 1 ? `
                    <div class="mt-2 small">
                      <div class="d-flex justify-content-between">
                        <span>In INR (Converted):</span>
                        <span>₹${(totals.grandTotal * (purchaseOrder.exchange_rate || 1)).toFixed(2)}</span>
                      </div>
                      <div class="text-muted">
                        Exchange Rate: ${purchaseOrder.exchange_rate}:1
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="row mt-4 pt-3 border-top">
              <div class="col-12 text-center">
                <p class="text-muted mb-0">Thank you for your business!</p>
                <p class="text-muted small">Generated on: ${new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div class="no-print text-center mt-4">
            <button onclick="window.print()" class="btn btn-primary me-2">
              Print Invoice
            </button>
            <button onclick="window.close()" class="btn btn-secondary">
              Close
            </button>
          </div>
        </body>
      </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      ref={modalRef}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              Purchase Order Invoice
            </h5>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                onClick={printInvoice}
                title="Print Invoice"
              >
                <FiPrinter size={14} />
                Print
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                onClick={downloadPDF}
                title="Download PDF"
              >
                <FiFile size={14} />
                PDF
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                onClick={downloadExcel}
                title="Download Excel"
              >
                <FiExcel size={14} />
                Excel
              </button>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
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
                        <small className="text-muted d-block">Reference No.</small>
                        <span>{purchaseOrder.reference_no || "N/A"}</span>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">Currency</small>
                        <span>{purchaseOrder.currency || "INR"}</span>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">Exchange Rate</small>
                        <span>{purchaseOrder.exchange_rate || 1}:1</span>
                      </div>
                      <div className="col-6 mb-2">
                        <small className="text-muted d-block">Payment Status</small>
                        <span className={`badge ${getStatusColor(purchaseOrder.payment_status)}`}>
                          {purchaseOrder.payment_status?.toUpperCase() || "PENDING"}
                        </span>
                      </div>
                      {purchaseOrder.branch_id && (
                        <div className="col-6 mb-2">
                          <small className="text-muted d-block">Branch</small>
                          <span>{purchaseOrder.branch_id.branch_name || purchaseOrder.branch_id}</span>
                        </div>
                      )}
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
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>Qty/Weight</th>
                      <th>Unit</th>
                      <th>Rate</th>
                      <th>Profit Margin</th>
                      <th>Selling Price</th>
                      <th>Discount</th>
                      <th>Tax</th>
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
                              {item.item_code || "N/A"}
                            </div>
                          </td>
                          <td>
                            <div className="fw-medium">
                              {item.inventory_item_id?.name || item.inventory_item?.name || item.item_name || "Unknown Item"}
                            </div>
                          </td>
                          <td>
                            {item.quantity ? (
                              <span className="badge bg-info">{item.quantity}</span>
                            ) : item.weight ? (
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
                            <span className="text-success">{parseFloat(item.profit_margin || 0).toFixed(2)}%</span>
                          </td>
                          <td>
                            <span className="fw-medium">{formatCurrency(item.selling_price || 0)}</span>
                          </td>
                          <td>
                            <span className="text-danger">{formatCurrency(item.discount_amount || 0)}</span>
                          </td>
                          <td>
                            <span className="text-warning">{formatCurrency(item.tax_amount || 0)}</span>
                          </td>
                          <td>
                            {item.expected_date ? (
                              <span className="small">{formatDate(item.expected_date)}</span>
                            ) : (
                              <span className="text-muted">Not set</span>
                            )}
                          </td>
                          <td className="text-end fw-bold">
                            {formatCurrency(item.total || calculateItemTotal(item))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="text-center py-4 text-muted">
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
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>
                        <FiPercent size={12} className="me-1" />
                        VAT ({purchaseOrder.vat || 0}%):
                      </span>
                      <span>{formatCurrency(totals.vat)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Discount:</span>
                      <span>-{formatCurrency(totals.discount)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>
                        <FiTruck size={12} className="me-1" />
                        Shipping Cost:
                      </span>
                      <span>{formatCurrency(totals.shipping)}</span>
                    </div>
                    <hr className="my-3 opacity-25" />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold fs-5">Grand Total:</span>
                      <span className="fw-bold fs-4">
                        {formatCurrency(totals.grandTotal)}
                      </span>
                    </div>
                    
                    {purchaseOrder.exchange_rate && purchaseOrder.exchange_rate !== 1 && (
                      <div className="mt-3 pt-2 border-top opacity-75">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small>Converted to INR:</small>
                          <small>₹{(totals.grandTotal * (purchaseOrder.exchange_rate || 1)).toFixed(2)}</small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small>Exchange Rate:</small>
                          <small>{purchaseOrder.exchange_rate}:1</small>
                        </div>
                      </div>
                    )}
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
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary d-flex align-items-center gap-1"
                onClick={printInvoice}
              >
                <FiPrinter size={16} />
                Print
              </button>
              <button
                type="button"
                className="btn btn-success d-flex align-items-center gap-1"
                onClick={downloadPDF}
              >
                <FiDownload size={16} />
                Download PDF
              </button>
              <button
                type="button"
                className="btn btn-info d-flex align-items-center gap-1 text-white"
                onClick={downloadExcel}
              >
                <FiExcel size={16} />
                Download Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseOrderModal;