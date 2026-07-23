import React, { useState } from "react";
import { FiX, FiEye, FiDownload, FiPrinter, FiMail } from "react-icons/fi";
import axios from "axios";

const ViewCustomOrderModal = ({ order, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloading, setDownloading] = useState(false);

  if (!order) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get file type
const getFileType = (fileUrl) => {
  if (fileUrl.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i)) {
    return 'Video File';
  } else if (fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp|jfif)$/i)) {
    return 'Image File';
  } else if (fileUrl.match(/\.(pdf)$/i)) {
    return 'PDF Document';
  } else if (fileUrl.match(/\.(doc|docx)$/i)) {
    return 'Word Document';
  } else {
    return 'File';
  }
};

// Update download function to handle different file types
const downloadFile = async (fileUrl, fileName) => {
  try {
    setDownloading(true);
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download file');
  } finally {
    setDownloading(false);
  }
};

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "in_progress":
      case "making":
      case "design":
      case "stone_setting":
      case "polishing":
      case "quality_check":
        return "primary";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      case "ready":
        return "info";
      default:
        return "secondary";
    }
  };

  // Handle image download
  const downloadImage = async (imageUrl, imageName) => {
    try {
      setDownloading(true);
      const response = await axios.get(imageUrl, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        imageName || `design-image-${Date.now()}.jpg`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image");
    } finally {
      setDownloading(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    const printContent = document.getElementById("print-content").innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Details - ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .print-header { text-align: center; margin-bottom: 30px; }
            .print-section { margin-bottom: 20px; }
            .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .print-label { font-weight: bold; color: #666; }
            .print-value { margin-bottom: 10px; }
            .print-images { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
            .print-image { max-width: 200px; max-height: 200px; }
            .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .text-success { color: #28a745; }
            .text-warning { color: #ffc107; }
            .text-danger { color: #dc3545; }
            .text-primary { color: #007bff; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <>
      {/* Main Modal */}
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content rounded-3">
            {/* Header */}
            <div className="modal-header border-bottom pb-3 bg-light">
              <div className="d-flex justify-content-between align-items-center w-100">
                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    Order #{order.order_number}
                  </h5>
                  <small className="text-muted">
                    Created on {formatDate(order.created_at || order.createdAt)}
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handlePrint}
                    title="Print"
                  >
                    <FiPrinter size={16} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-close"
                    onClick={onClose}
                    aria-label="Close"
                  ></button>
                </div>
              </div>
            </div>

            {/* Content for printing */}
            <div id="print-content" className="d-none">
              <div className="print-header">
                <h2>Custom Order Details</h2>
                <h3>Order #{order.order_number}</h3>
              </div>
              <div className="print-grid">
                <div className="print-section">
                  <div className="print-label">Order Number:</div>
                  <div className="print-value">{order.order_number}</div>

                  <div className="print-label">Customer:</div>
                  <div className="print-value">
                    {order.customer_name || order.customer_id?.name}
                  </div>

                  <div className="print-label">Contact:</div>
                  <div className="print-value">
                    {order.customer_mobile || order.customer_id?.mobile}
                  </div>
                </div>

                <div className="print-section">
                  <div className="print-label">Status:</div>
                  <div className="print-value">
                    <span
                      className={`status-badge text-${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="print-label">Order Date:</div>
                  <div className="print-value">
                    {formatDate(order.order_date || order.created_at)}
                  </div>

                  <div className="print-label">Delivery Date:</div>
                  <div className="print-value">
                    {formatDate(order.delivery_date)}
                  </div>
                </div>

                <div className="print-section">
                  <div className="print-label">Weight:</div>
                  <div className="print-value">
                    {order.weight} {order.unit_code || "g"}
                  </div>

                  <div className="print-label">Purity:</div>
                  <div className="print-value">{order.purity}</div>

                  <div className="print-label">Notes:</div>
                  <div className="print-value">
                    {order.notes || "No additional notes"}
                  </div>
                </div>
              </div>
              // In your ViewCustomOrderModal component, update the image
              rendering section:
              {order.images && order.images.length > 0 && (
                <div>
                  <h6 className="text-muted mb-3">
                    Design Files ({order.images.length})
                  </h6>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                    {order.images.map((fileUrl, index) => {
                      const fileUrlStr =
                        typeof fileUrl === "string" ? fileUrl : fileUrl.url;
                      const fileName =
                        fileUrlStr.split("/").pop() || `file-${index + 1}`;
                      const isVideo = fileUrlStr.match(
                        /\.(mp4|mov|avi|wmv|flv|mkv)$/i,
                      );
                      const isImage = fileUrlStr.match(
                        /\.(jpg|jpeg|png|gif|bmp|webp|jfif)$/i,
                      );

                      return (
                        <div key={index} className="col">
                          <div className="card border h-100">
                            <div className="position-relative">
                              {isImage ? (
                                <img
                                  src={fileUrlStr}
                                  alt={`Design ${index + 1}`}
                                  className="card-img-top"
                                  style={{
                                    height: "180px",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    setSelectedFile({
                                      url: fileUrlStr,
                                      name: fileName,
                                      type: "image",
                                    })
                                  }
                                />
                              ) : isVideo ? (
                                <div
                                  className="card-img-top bg-dark d-flex align-items-center justify-content-center"
                                  style={{ height: "180px", cursor: "pointer" }}
                                  onClick={() =>
                                    setSelectedFile({
                                      url: fileUrlStr,
                                      name: fileName,
                                      type: "video",
                                    })
                                  }
                                >
                                  <div className="text-center text-white">
                                    <i className="bi bi-play-circle display-4"></i>
                                    <div className="mt-2">Video File</div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
                                  style={{ height: "180px" }}
                                >
                                  <div className="text-center text-white">
                                    <i className="bi bi-file-earmark display-4"></i>
                                    <div className="mt-2">Other File</div>
                                  </div>
                                </div>
                              )}
                              <div className="position-absolute top-0 end-0 m-2">
                                <div className="btn-group btn-group-sm">
                                  <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() =>
                                      setSelectedFile({
                                        url: fileUrlStr,
                                        name: fileName,
                                        type: isVideo
                                          ? "video"
                                          : isImage
                                            ? "image"
                                            : "file",
                                      })
                                    }
                                    title="View"
                                  >
                                    <FiEye size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() =>
                                      downloadFile(fileUrlStr, fileName)
                                    }
                                    disabled={downloading}
                                    title="Download"
                                  >
                                    <FiDownload size={14} />
                                  </button>
                                </div>
                              </div>
                              <div className="position-absolute bottom-0 start-0 m-2">
                                <span className="badge bg-dark bg-opacity-75">
                                  {isVideo
                                    ? "Video"
                                    : isImage
                                      ? "Image"
                                      : "File"}{" "}
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="card-body p-2">
                              <small className="text-muted d-block text-truncate">
                                {fileName}
                              </small>
                              <small className="text-muted">
                                {getFileType(fileUrlStr)}
                              </small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="row">
                {/* Left Column - Order Details */}
                <div className="col-lg-8">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      {/* Order Status Badge */}
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                          <span
                            className={`badge bg-${getStatusColor(order.status)} px-3 py-2 fs-6`}
                          >
                            {order.status?.toUpperCase()}
                          </span>
                          {order.delivery_date && (
                            <div className="mt-2">
                              <small className="text-muted">
                                Delivery Date:
                              </small>
                              <div className="fw-bold">
                                {formatDate(order.delivery_date)}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-end">
                          <small className="text-muted">Order Date</small>
                          <div className="fw-bold">
                            {formatDate(order.order_date || order.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <h6 className="text-muted mb-2">
                            Customer Information
                          </h6>
                          <div className="d-flex align-items-center mb-3">
                            <div
                              className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{ width: "50px", height: "50px" }}
                            >
                              <span className="text-white fw-bold fs-5">
                                {(order.customer_name ||
                                  order.customer_id?.name ||
                                  "C")[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h5 className="mb-1">
                                {order.customer_name || order.customer_id?.name}
                              </h5>
                              <div className="text-muted">
                                <div>
                                  <i className="bi bi-telephone me-1"></i>
                                  {order.customer_mobile ||
                                    order.customer_id?.mobile}
                                </div>
                                {order.customer_email && (
                                  <div>
                                    <i className="bi bi-envelope me-1"></i>
                                    {order.customer_email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <h6 className="text-muted mb-2">
                            Order Specifications
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-sm table-borderless">
                              <tbody>
                                <tr>
                                  <td className="text-muted" width="40%">
                                    Weight:
                                  </td>
                                  <td className="fw-bold">
                                    {order.weight} {order.unit_code || "g"}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Purity:</td>
                                  <td className="fw-bold">{order.purity}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Unit:</td>
                                  <td className="fw-bold">
                                    {order.unit_name} ({order.unit_code})
                                    {order.unit_conversion_factor && (
                                      <small className="text-muted ms-2">
                                        (CF: {order.unit_conversion_factor})
                                      </small>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="mb-4">
                          <h6 className="text-muted mb-2">Additional Notes</h6>
                          <div className="card bg-light border">
                            <div className="card-body">
                              <p className="mb-0">{order.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Images Section */}
                      {order.images && order.images.length > 0 && (
                        <div>
                          <h6 className="text-muted mb-3">
                            Design Images ({order.images.length})
                          </h6>
                          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                            {order.images.map((img, index) => {
                              const imageUrl =
                                typeof img === "string" ? img : img.url;
                              const imageName = `design-${index + 1}-${order.order_number}`;

                              return (
                                <div key={index} className="col">
                                  <div className="card border h-100">
                                    <div className="position-relative">
                                      <img
                                        src={imageUrl}
                                        alt={`Design ${index + 1}`}
                                        className="card-img-top"
                                        style={{
                                          height: "180px",
                                          objectFit: "cover",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          setSelectedImage({
                                            url: imageUrl,
                                            name: imageName,
                                          })
                                        }
                                      />
                                      <div className="position-absolute top-0 end-0 m-2">
                                        <div className="btn-group btn-group-sm">
                                          <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={() =>
                                              setSelectedImage({
                                                url: imageUrl,
                                                name: imageName,
                                              })
                                            }
                                            title="View"
                                          >
                                            <FiEye size={14} />
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={() =>
                                              downloadImage(imageUrl, imageName)
                                            }
                                            disabled={downloading}
                                            title="Download"
                                          >
                                            <FiDownload size={14} />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="position-absolute bottom-0 start-0 m-2">
                                        <span className="badge bg-dark bg-opacity-75">
                                          Image {index + 1}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="card-body p-2">
                                      <small className="text-muted d-block text-truncate">
                                        {imageName}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Timeline & Actions */}
                <div className="col-lg-4 mt-3 mt-lg-0">
                  {/* Timeline */}
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-header bg-white border-bottom">
                      <h6 className="mb-0">Order Timeline</h6>
                    </div>
                    <div className="card-body">
                      <div className="timeline">
                        <div className="timeline-item">
                          <div className="timeline-marker bg-primary"></div>
                          <div className="timeline-content">
                            <h6 className="mb-1">Order Created</h6>
                            <p className="text-muted mb-0">
                              {formatDate(order.created_at || order.createdAt)}
                            </p>
                          </div>
                        </div>
                        {order.updated_at !== order.created_at && (
                          <div className="timeline-item">
                            <div className="timeline-marker bg-info"></div>
                            <div className="timeline-content">
                              <h6 className="mb-1">Last Updated</h6>
                              <p className="text-muted mb-0">
                                {formatDate(
                                  order.updated_at || order.updatedAt,
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="timeline-item">
                          <div className="timeline-marker bg-warning"></div>
                          <div className="timeline-content">
                            <h6 className="mb-1">Expected Delivery</h6>
                            <p className="text-muted mb-0">
                              {formatDate(order.delivery_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom">
                      <h6 className="mb-0">Quick Actions</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={handlePrint}
                        >
                          <FiPrinter className="me-2" />
                          Print Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top pt-3">
              <div className="w-100 d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Order ID: {order._id}</small>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0">
                <div className="d-flex justify-content-between align-items-center w-100">
                  <h5 className="modal-title text-white mb-0">
                    {selectedImage.name}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedImage(null)}
                    aria-label="Close"
                  ></button>
                </div>
              </div>
              <div className="modal-body text-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="img-fluid rounded shadow-lg"
                  style={{ maxHeight: "70vh", maxWidth: "100%" }}
                />
                <div className="mt-4">
                  <button
                    type="button"
                    className="btn btn-light me-2"
                    onClick={() =>
                      downloadImage(selectedImage.url, selectedImage.name)
                    }
                    disabled={downloading}
                  >
                    <FiDownload className="me-2" />
                    {downloading ? "Downloading..." : "Download"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for timeline */}
      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        .timeline::before {
          content: "";
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e9ecef;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        .timeline-marker {
          position: absolute;
          left: -30px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
        }
        .timeline-content {
          margin-left: 0;
        }
      `}</style>
    </>
  );
};

export default ViewCustomOrderModal;
