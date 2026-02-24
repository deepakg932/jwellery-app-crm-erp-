// components/repairs/ViewRepairModal.jsx
import React, { useState } from "react";
import {
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiFileText,
  FiTool,
  FiPackage,
  FiPrinter,
  FiDownload,
  FiCreditCard,
  FiShoppingBag,
  FiTag,
  FiFile,
  FiImage,
  FiX,
  FiZoomIn,
  FiZoomOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { BsTools } from "react-icons/bs";

const ViewRepairModal = ({ repair, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!repair) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format short date (for display in gallery)
  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending", icon: "⏳" },
      received: { color: "info", label: "Received", icon: "📥" },
      in_progress: { color: "primary", label: "In Progress", icon: "🔧" },
      ready_for_delivery: { color: "success", label: "Ready for Delivery", icon: "✅" },
      delivered: { color: "success", label: "Delivered", icon: "🚚" },
      cancelled: { color: "danger", label: "Cancelled", icon: "❌" },
    };

    const config = statusConfig[status] || { color: "secondary", label: status, icon: "📝" };

    return (
      <span className={`badge bg-${config.color} text-white fw-semibold`}>
        {config.icon} {config.label}
      </span>
    );
  };

  // Get account badge
  const getAccountBadge = (account) => {
    const accountConfig = {
      cash: { color: "success", label: "Cash" },
      card: { color: "info", label: "Card" },
      upi: { color: "primary", label: "UPI" },
      bank_transfer: { color: "info", label: "Bank Transfer" },
      credit: { color: "warning", label: "Credit" },
      multiple: { color: "secondary", label: "Multiple" },
    };

    const config = accountConfig[account] || { color: "secondary", label: account };

    return (
      <span className={`badge bg-${config.color}-subtle text-${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Get payment status badge
  const getPaymentStatusBadge = (paymentStatus) => {
    const config = {
      paid: { color: "success", label: "Paid" },
      partial: { color: "warning", label: "Partial" },
      unpaid: { color: "danger", label: "Unpaid" },
    }[paymentStatus] || { color: "secondary", label: paymentStatus || "Unknown" };

    return (
      <span className={`badge bg-${config.color}-subtle text-${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Get product type indicator
  const getProductTypeIndicator = (repairData) => {
    if (repairData.product_id && repairData.sale_item_id) {
      return (
        <div className="d-flex align-items-center gap-2">
          <FiShoppingBag className="text-primary" />
          <span className="small">From Sales Item</span>
        </div>
      );
    } else {
      return (
        <div className="d-flex align-items-center gap-2">
          <FiTool className="text-warning" />
          <span className="small">Custom Product</span>
        </div>
      );
    }
  };

  // Handle image click
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsFullscreen(true);
    setZoomLevel(1);
  };

  // Close image viewer
  const closeImageViewer = () => {
    setSelectedImage(null);
    setIsFullscreen(false);
    setZoomLevel(1);
  };

  // Navigate to next/previous image
  const navigateImage = (direction) => {
    const images = repair.repair_images || [];
    if (images.length === 0) return;

    const currentIndex = images.findIndex(img => 
      (typeof img === 'string' ? img : img.url) === selectedImage.url
    );

    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % images.length;
      setSelectedImage(images[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      setSelectedImage(images[prevIndex]);
    }
  };

  // Zoom in/out
  const handleZoom = (direction) => {
    if (direction === 'in') {
      setZoomLevel(prev => Math.min(prev + 0.25, 3));
    } else {
      setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    }
  };

  // Reset zoom
  const resetZoom = () => {
    setZoomLevel(1);
  };

  // Image Viewer Component
  const ImageViewer = () => {
    if (!selectedImage || !isFullscreen) return null;

    const imageUrl = typeof selectedImage === 'string' ? selectedImage : selectedImage.url;
    const imageName = typeof selectedImage === 'string' 
      ? `Repair Image` 
      : selectedImage.filename || selectedImage.name || 'Repair Image';

    return (
      <div className="image-viewer-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Top Controls */}
        <div className="d-flex justify-content-between align-items-center w-100 px-4 py-3" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
        }}>
          <div className="text-white fw-medium">
            <FiImage className="me-2" />
            {imageName}
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-light"
              onClick={resetZoom}
              title="Reset Zoom"
            >
              <FiZoomOut />
            </button>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => handleZoom('out')}
              title="Zoom Out"
            >
              <FiZoomOut />
            </button>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => handleZoom('in')}
              title="Zoom In"
            >
              <FiZoomIn />
            </button>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={closeImageViewer}
              title="Close"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="d-flex align-items-center justify-content-center w-100 h-100">
          {/* Previous Button */}
          {(repair.repair_images || []).length > 1 && (
            <button
              className="btn btn-lg btn-outline-light rounded-circle me-3"
              onClick={() => navigateImage('prev')}
              style={{
                position: 'absolute',
                left: '20px',
                zIndex: 10000,
              }}
            >
              <FiChevronLeft size={24} />
            </button>
          )}

          {/* Image */}
          <div className="text-center">
            <img
              src={imageUrl}
              alt={imageName}
              style={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s ease',
                cursor: zoomLevel > 1 ? 'grab' : 'pointer',
              }}
              onClick={resetZoom}
              onDragStart={(e) => e.preventDefault()}
            />
            {zoomLevel !== 1 && (
              <div className="text-white mt-3">
                <small>Zoom: {Math.round(zoomLevel * 100)}%</small>
              </div>
            )}
          </div>

          {/* Next Button */}
          {(repair.repair_images || []).length > 1 && (
            <button
              className="btn btn-lg btn-outline-light rounded-circle ms-3"
              onClick={() => navigateImage('next')}
              style={{
                position: 'absolute',
                right: '20px',
                zIndex: 10000,
              }}
            >
              <FiChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Bottom Info */}
        <div className="text-white text-center mt-3" style={{
          position: 'absolute',
          bottom: '20px',
          left: 0,
          right: 0,
        }}>
          <small>
            {repair.repair_images && repair.repair_images.length > 1 && (
              <>
                Image {(repair.repair_images.findIndex(img => 
                  (typeof img === 'string' ? img : img.url) === imageUrl
                ) + 1)} of {repair.repair_images.length}
                <span className="mx-2">•</span>
              </>
            )}
            Click image to reset zoom • Use mouse wheel to pan when zoomed
          </small>
        </div>
      </div>
    );
  };

  // Safe string function for PDF
  const safeString = (str) => {
    return str ? String(str) : "N/A";
  };

  // Safe uppercase function for PDF
  const safeUppercase = (str) => {
    return str ? String(str).toUpperCase() : "N/A";
  };

  // Generate PDF with images
  const generatePDF = () => {
    try {
      // Dynamically import jsPDF to avoid build issues
      import('jspdf').then(({ default: jsPDF }) => {
        const doc = new jsPDF();
        
        // Add company header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("JEWELRY REPAIR INVOICE", 105, 15, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Authorized Repair Center", 105, 22, { align: 'center' });
        
        // Add repair details header
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text(`Repair Number: ${safeString(repair.repair_number)}`, 14, 35);
        doc.text(`Invoice: ${safeString(repair.invoice_number)}`, 14, 42);
        doc.text(`Date: ${formatDate(repair.created_at)}`, 150, 35);
        doc.text(`Status: ${safeUppercase(repair.status)}`, 150, 42);
        
        // Add horizontal line
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 50, 196, 50);
        
        // Customer Information
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        doc.text("CUSTOMER INFORMATION", 14, 60);
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Name: ${safeString(repair.customer_id?.name || repair.customer_name)}`, 14, 68);
        doc.text(`Mobile: ${safeString(repair.customer_id?.mobile || repair.customer_mobile)}`, 14, 74);
        
        // Product Information
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        doc.text("PRODUCT INFORMATION", 14, 82);
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Product Name: ${safeString(repair.product_name)}`, 14, 90);
        if (repair.product_module) {
          doc.text(`Model/Module: ${safeString(repair.product_module)}`, 14, 96);
        }
        doc.text(`Problem: ${safeString(repair.problem_description)}`, 14, 102);
        
        // Add images section if available
        if (repair.repair_images && repair.repair_images.length > 0) {
          doc.setFontSize(11);
          doc.setTextColor(40, 40, 40);
          doc.text("REPAIR IMAGES", 14, 112);
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`${repair.repair_images.length} image(s) attached`, 14, 118);
        }
        
        // Employee & Dates
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        doc.text("SERVICE DETAILS", 14, 125);
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Assigned To: ${safeString(repair.employee_id?.name || repair.employee_name)}`, 14, 133);
        doc.text(`Receiving Date: ${formatDate(repair.receiving_date)}`, 14, 139);
        if (repair.delivery_date) {
          doc.text(`Delivery Date: ${formatDate(repair.delivery_date)}`, 14, 145);
        }
        
        // Financial Summary - Manual table
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        doc.text("FINANCIAL SUMMARY", 14, 155);
        
        // Draw table manually
        const startY = 160;
        const lineHeight = 8;
        
        // Table header
        doc.setFillColor(60, 60, 60);
        doc.rect(14, startY, 182, lineHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text("Description", 20, startY + 5);
        doc.text("Amount (₹)", 180, startY + 5, { align: 'right' });
        
        // Table rows
        doc.setTextColor(0, 0, 0);
        let currentY = startY + lineHeight;
        
        // Row 1: Repair Charge
        doc.rect(14, currentY, 182, lineHeight);
        doc.text("Repair Charge", 20, currentY + 5);
        doc.text(formatCurrency(repair.repair_charge || 0).replace('₹', ''), 180, currentY + 5, { align: 'right' });
        
        currentY += lineHeight;
        
        // Row 2: Paid Amount
        doc.rect(14, currentY, 182, lineHeight);
        doc.text("Paid Amount", 20, currentY + 5);
        doc.text(formatCurrency(repair.paid_amount || 0).replace('₹', ''), 180, currentY + 5, { align: 'right' });
        
        currentY += lineHeight;
        
        // Row 3: Due Amount
        doc.rect(14, currentY, 182, lineHeight);
        doc.text("Due Amount", 20, currentY + 5);
        doc.text(formatCurrency(repair.due_amount || 0).replace('₹', ''), 180, currentY + 5, { align: 'right' });
        
        currentY += lineHeight + 5;
        
        // Payment Information
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Payment Account: ${safeUppercase(repair.account)}`, 14, currentY);
        doc.text(`Payment Status: ${safeUppercase(repair.payment_status)}`, 14, currentY + 6);
        currentY += 12;
        
        if (repair.note) {
          doc.text(`Notes: ${safeString(repair.note)}`, 14, currentY);
          currentY += 6;
        }
        
        // Add footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text("Thank you for choosing our repair service.", 105, pageHeight - 20, { align: 'center' });
        doc.text(`Repair Images: ${repair.repair_images?.length || 0} attached`, 105, pageHeight - 15, { align: 'center' });
        doc.text("Generated on: " + new Date().toLocaleString(), 105, pageHeight - 10, { align: 'center' });
        
        // Save the PDF
        doc.save(`Repair-Invoice-${repair.invoice_number || repair.repair_number || 'unknown'}.pdf`);
      }).catch(error => {
        console.error("Error loading jsPDF:", error);
        alert("Failed to load PDF generator. Please try again.");
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Get repair images array
  const repairImages = repair.repair_images || [];

  return (
    <>
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto", maxHeight: "100vh" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-3" style={{ maxHeight: "90vh" }}>
            <div className="modal-header border-bottom pb-3 sticky-top bg-white">
              <div>
                <h5 className="modal-title fw-bold fs-5">
                  <BsTools className="me-2" />
                  Repair Details
                </h5>
                {repair.invoice_number && (
                  <div className="small text-primary mt-1">
                    <FiFile className="me-1" />
                    Invoice: {repair.invoice_number}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body" style={{ overflowY: "auto" }}>
              {/* Header Info */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold text-primary">Repair #{repair.repair_number || "N/A"}</h6>
                  <div className="small text-muted">
                    <FiCalendar className="me-1" />
                    Created: {formatDate(repair.created_at)}
                    {repair.updated_at && (
                      <>
                        <br />
                        <FiCalendar className="me-1" />
                        Updated: {formatDate(repair.updated_at)}
                      </>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-end gap-2 mb-2">
                    {getStatusBadge(repair.status || "pending")}
                    {getPaymentStatusBadge(repair.payment_status || "unpaid")}
                  </div>
                  <div className="text-end">
                    {getProductTypeIndicator(repair)}
                  </div>
                </div>
              </div>

              {/* NEW: Repair Images Gallery */}
              {repairImages.length > 0 && (
                <div className="card border mb-4">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">
                      <FiImage className="me-2" />
                      Repair Images ({repairImages.length})
                    </h6>
                    <small className="text-muted">Click to view fullscreen</small>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {repairImages.map((image, index) => {
                        const imageUrl = typeof image === 'string' ? image : image.url;
                        const imageName = typeof image === 'string' 
                          ? `Image ${index + 1}` 
                          : image.filename || image.name || `Image ${index + 1}`;
                        
                        return (
                          <div key={index} className="col-md-4 col-6">
                            <div 
                              className="card border overflow-hidden cursor-pointer"
                              onClick={() => handleImageClick(image)}
                              style={{ transition: 'transform 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <div className="position-relative">
                                <img
                                  src={imageUrl}
                                  alt={imageName}
                                  className="img-fluid"
                                  style={{
                                    height: "180px",
                                    width: "100%",
                                    objectFit: "cover",
                                    borderBottom: "1px solid #dee2e6"
                                  }}
                                />
                                <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-50 text-white">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-truncate">{imageName}</small>
                                    <FiZoomIn size={14} />
                                  </div>
                                </div>
                              </div>
                              <div className="card-body p-2">
                                <div className="small text-muted">
                                  Image {index + 1} of {repairImages.length}
                                </div>
                                {typeof image !== 'string' && image.size && (
                                  <div className="small text-muted">
                                    Size: {(image.size / 1024).toFixed(1)} KB
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Information Card */}
              {repair.invoice_number && (
                <div className="card border mb-4">
                  <div className="card-header bg-light">
                    <h6 className="fw-bold mb-0">
                      <FiFile className="me-2" />
                      Invoice Information
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <span className="text-muted">Invoice Number:</span>
                          <div className="fw-medium text-primary">{repair.invoice_number}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <span className="text-muted">Invoice ID:</span>
                          <div className="fw-medium text-muted small">{repair.invoice_id || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Information */}
              <div className="card border mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0">
                    <FiPackage className="me-2" />
                    Product Information
                  </h6>
                  {repair.sale_item_id && (
                    <div className="d-flex align-items-center gap-2">
                      <FiTag className="text-primary" />
                      <small className="text-primary">From Sales Item</small>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <span className="text-muted">Product Name:</span>
                        <div className="fw-medium">{repair.product_name || "N/A"}</div>
                      </div>
                      {repair.product_module && (
                        <div className="mb-3">
                          <span className="text-muted">Product Module:</span>
                          <div className="fw-medium">{repair.product_module}</div>
                        </div>
                      )}
                      {repair.product_id && (
                        <div className="mb-3">
                          <span className="text-muted">Product ID:</span>
                          <div className="fw-medium text-muted small">{repair.product_id}</div>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <span className="text-muted">Problem Description:</span>
                        <div className="fw-medium" style={{ whiteSpace: "pre-wrap" }}>
                          {repair.problem_description || "No description provided"}
                        </div>
                      </div>
                      {repair.sale_item_id && (
                        <div className="mb-3">
                          <span className="text-muted">Sale Item ID:</span>
                          <div className="fw-medium text-muted small">{repair.sale_item_id}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Employee Information */}
              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h6 className="fw-bold mb-0">
                    <FiUser className="me-2" />
                    Customer & Employee Details
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Customer Information</h6>
                      <div className="mb-2">
                        <span className="text-muted">Name:</span>
                        <span className="fw-medium ms-2">
                          {repair.customer_id?.name || repair.customer_name || "N/A"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Mobile:</span>
                        <span className="fw-medium ms-2">
                          {repair.customer_id?.mobile || repair.customer_mobile || "N/A"}
                        </span>
                      </div>
                      {/* <div className="mb-2">
                        <span className="text-muted">Customer ID:</span>
                        <span className="fw-medium ms-2 text-muted small">
                          {repair.customer_id?._id || "N/A"}
                        </span>
                      </div> */}
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Service Details</h6>
                      <div className="mb-2">
                        <span className="text-muted">Assigned Employee:</span>
                        <span className="fw-medium ms-2">
                          {repair.employee_id?.name || repair.employee_name || "N/A"}
                        </span>
                      </div>
                      {repair.employee_id?.role_id?.role_name && (
                        <div className="mb-2">
                          <span className="text-muted">Employee Role:</span>
                          <span className="fw-medium ms-2">
                            <span className="badge bg-primary">
                              {repair.employee_id.role_id.role_name}
                            </span>
                          </span>
                        </div>
                      )}
                      {repair.employee_id?.email && (
                        <div className="mb-2">
                          <span className="text-muted">Email:</span>
                          <span className="fw-medium ms-2 text-primary">
                            {repair.employee_id.email}
                          </span>
                        </div>
                      )}
                      {repair.employee_id?.phone && (
                        <div className="mb-2">
                          <span className="text-muted">Phone:</span>
                          <span className="fw-medium ms-2">
                            {repair.employee_id.phone}
                          </span>
                        </div>
                      )}
                      <div className="mb-2">
                        <span className="text-muted">Payment Account:</span>
                        <span className="fw-medium ms-2">{getAccountBadge(repair.account || "cash")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates & Financial Information */}
              <div className="card border mb-4">
                <div className="card-header bg-light">
                  <h6 className="fw-bold mb-0">
                    <FiCalendar className="me-2" />
                    Dates & Financial Details
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Timeline</h6>
                      <div className="mb-2">
                        <span className="text-muted">Receiving Date:</span>
                        <span className="fw-medium ms-2">{formatDate(repair.receiving_date)}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Expected Delivery:</span>
                        <span className="fw-medium ms-2">
                          {repair.delivery_date ? formatDate(repair.delivery_date) : "Not set"}
                          {repair.delivery_date && new Date(repair.delivery_date) < new Date() && (
                            <span className="text-danger ms-2">(Overdue)</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Financial Summary</h6>
                      <div className="mb-2">
                        <span className="text-muted">Repair Charge:</span>
                        <span className="fw-medium ms-2">{formatCurrency(repair.repair_charge || 0)}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Paid Amount:</span>
                        <span className="fw-medium ms-2 text-success">
                          {formatCurrency(repair.paid_amount || 0)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Due Amount:</span>
                        <span className="fw-medium ms-2 text-danger">
                          {formatCurrency(repair.due_amount || 0)}
                        </span>
                      </div>
                      {repair.invoice_number && (
                        <div className="mb-2">
                          <span className="text-muted">Invoice Number:</span>
                          <span className="fw-medium ms-2 text-primary">
                            {repair.invoice_number}
                          </span>
                        </div>
                      )}
                      {repair.payment_status === 'partial' && (
                        <div className="alert alert-warning mt-2 py-2">
                          <FiCreditCard className="me-2" />
                          <small>
                            Partial Payment: {formatCurrency(repair.paid_amount || 0)} paid, 
                            {formatCurrency(repair.due_amount || 0)} pending
                          </small>
                        </div>
                      )}
                      {(!repair.payment_status || repair.payment_status === 'unpaid') && repair.due_amount > 0 && (
                        <div className="alert alert-danger mt-2 py-2">
                          <FiCreditCard className="me-2" />
                          <small>Full payment pending: {formatCurrency(repair.due_amount || 0)}</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {repair.note && (
                <div className="card border mb-4">
                  <div className="card-header bg-light">
                    <h6 className="fw-bold mb-0">
                      <FiFileText className="me-2" />
                      Additional Notes
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="fw-medium" style={{ whiteSpace: "pre-wrap" }}>
                      {repair.note}
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="card border">
                <div className="card-header bg-light">
                  <h6 className="fw-bold mb-0">
                    <FiTool className="me-2" />
                    Repair Summary
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <div className="text-center p-3 border rounded bg-light">
                        <div className="text-muted small">Status</div>
                        <div className="fw-bold mt-2">{getStatusBadge(repair.status || "pending")}</div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-center p-3 border rounded bg-light">
                        <div className="text-muted small">Payment Status</div>
                        <div className="fw-bold mt-2">{getPaymentStatusBadge(repair.payment_status || "unpaid")}</div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-center p-3 border rounded bg-light">
                        <div className="text-muted small">Payment Account</div>
                        <div className="fw-bold mt-2">{getAccountBadge(repair.account || "cash")}</div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-center p-3 border rounded bg-light">
                        <div className="text-muted small">Images</div>
                        <div className="fw-bold mt-2">
                          <FiImage className="me-1" />
                          {repairImages.length}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional IDs */}
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <div className="p-2 border rounded">
                        <small className="text-muted">Repair ID:</small>
                        <div className="small text-truncate">{repair._id || "N/A"}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-2 border rounded">
                        <small className="text-muted">Invoice ID:</small>
                        <div className="small text-truncate">{repair.invoice_id || "N/A"}</div>
                      </div>
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
              <button
                type="button"
                className="btn btn-primary"
                onClick={generatePDF}
              >
                <FiDownload className="me-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      <ImageViewer />
    </>
  );
};

export default ViewRepairModal;