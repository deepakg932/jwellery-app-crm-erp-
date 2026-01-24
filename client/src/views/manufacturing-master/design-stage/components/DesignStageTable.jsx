import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiEye,
  FiUser,
  FiCalendar,
  FiClock,
  FiRefreshCw,
  FiDollarSign,
  FiEdit2,
  FiFilter,
  FiDownload,
  FiPackage,
} from "react-icons/fi";
import useDesignStages from "@/hooks/useDesignStages";
import UpdateStageModal from "./UpdateStageModal";

const DesignStageTable = () => {
  const {
    designStages,
    loading,
    error,
    fetchDesignStages,
    employees,
    updateStageWithFiles,
  } = useDesignStages();

  console.log("Design stages data:", designStages);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageTypeFilter, setStageTypeFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const statusOptions = [
    { value: "pending", label: "Pending", color: "warning" },
    { value: "in_progress", label: "In Progress", color: "info" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "approved", label: "Approved", color: "success" },
    { value: "hold", label: "On Hold", color: "secondary" },
    { value: "cancelled", label: "Cancelled", color: "danger" },
  ];

  // Load data on component mount
  useEffect(() => {
    fetchDesignStages();
  }, []);

  // Get unique stage types from data
  const getStageTypes = () => {
    const types = new Set();
    designStages.forEach(stage => {
      if (stage.stage_type) {
        types.add(stage.stage_type);
      }
    });
    
    const typeOptions = Array.from(types).map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
    }));
    
    return [{ value: "all", label: "All Types" }, ...typeOptions.sort((a, b) => a.label.localeCompare(b.label))];
  };

  // Filter stages
  const filteredStages = designStages.filter((stage) => {
    const matchesSearch =
      search === "" ||
      (stage.stage_name && stage.stage_name.toLowerCase().includes(search.toLowerCase())) ||
      (stage.job_card_no && stage.job_card_no.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_name && stage.assigned_name.toLowerCase().includes(search.toLowerCase())) ||
      (stage.design_type && stage.design_type.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_department && stage.assigned_department.toLowerCase().includes(search.toLowerCase())) ||
      (stage.stage_type && stage.stage_type.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || stage.status === statusFilter;

    const matchesType =
      stageTypeFilter === "all" || stage.stage_type === stageTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate pagination
  const totalItems = filteredStages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStages = filteredStages.slice(indexOfFirstItem, indexOfLastItem);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return `₹${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending" },
      in_progress: { color: "info", label: "In Progress" },
      completed: { color: "success", label: "Completed" },
      approved: { color: "success", label: "Approved" },
      hold: { color: "secondary", label: "On Hold" },
      cancelled: { color: "danger", label: "Cancelled" },
    };

    const config = statusConfig[status] || {
      color: "secondary",
      label: status,
    };

    return (
      <span className={`badge bg-${config.color} text-white fw-semibold`}>
        {config.label}
      </span>
    );
  };

  // Get stage type badge
  const getStageTypeBadge = (stageType) => {
    const colorMap = {
      design: "primary",
      cad: "info",
      prototype: "warning",
      molding: "secondary",
      casting: "dark",
      assembly: "success",
      polishing: "light",
      quality: "danger",
      casting: "dark", // Added casting since it's in your response
    };

    const label = stageType 
      ? stageType.charAt(0).toUpperCase() + stageType.slice(1).replace('_', ' ')
      : "Unknown";

    return (
      <span className={`badge bg-${colorMap[stageType] || 'secondary'} text-white`}>
        {label}
      </span>
    );
  };

  // Handle update from modal
  const handleUpdateStage = async (stageId, updateData, filesToUpload) => {
    try {
      console.log("handleUpdateStage called with:", {
        stageId,
        updateData,
        filesToUploadCount: filesToUpload?.length || 0
      });
      
      // Call API to update the stage with files
      const result = await updateStageWithFiles(stageId, updateData, filesToUpload || []);
      
      console.log("Update result:", result);
      
      if (result.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating stage:", error);
      return false;
    }
  };

  // Open update modal
  const handleOpenUpdate = (stage) => {
    console.log("Opening update modal for stage:", stage);
    setSelectedStage(stage);
    setShowUpdateModal(true);
  };

  // Close update modal
  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setSelectedStage(null);
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = [
      "Job Card No",
      "Stage Type",
      "Stage Name",
      "Assigned To",
      "Department",
      "Start Date",
      "End Date",
      "Status",
      "Estimated Hours",
      "Actual Hours",
      "Product",
      "Created At"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredStages.map(stage => [
        stage.job_card_no || "",
        stage.stage_type || "",
        stage.stage_name || "",
        stage.assigned_name || "Unassigned",
        stage.assigned_department || "",
        formatDate(stage.start_date),
        formatDate(stage.end_date),
        stage.status || "",
        stage.estimated_hours || "",
        stage.actual_hours || "",
        stage.design_type || "",
        formatDate(stage.created_at)
      ].map(field => `"${field}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `design-stages-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keep ViewStageModal component (updated)
  const ViewStageModal = () => {
    if (!selectedStage) return null;

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
                {selectedStage.stage_name || selectedStage.stage_type} {selectedStage.job_card_no && `- ${selectedStage.job_card_no}`}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStage(null);
                }}
              ></button>
            </div>

            <div className="modal-body">
              {/* Stage Info */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">Stage Type</label>
                    <div>{getStageTypeBadge(selectedStage.stage_type)}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Status</label>
                    <div>{getStatusBadge(selectedStage.status)}</div>
                  </div>
                  {selectedStage.job_card_no && (
                    <div className="mb-3">
                      <label className="form-label text-muted small">Job Card No</label>
                      <div className="fw-bold">{selectedStage.job_card_no}</div>
                    </div>
                  )}
                  {selectedStage.completed_at && (
                    <div className="mb-3">
                      <label className="form-label text-muted small">Completed At</label>
                      <div>{formatDateTime(selectedStage.completed_at)}</div>
                    </div>
                  )}
                  {selectedStage.remarks && (
                    <div className="mb-3">
                      <label className="form-label text-muted small">Remarks</label>
                      <div>{selectedStage.remarks}</div>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">Assigned To</label>
                    <div className="fw-bold">
                      <FiUser className="me-2" />
                      {selectedStage.assigned_name || "Unassigned"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Department</label>
                    <div>{selectedStage.assigned_department || "N/A"}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Dates</label>
                    <div>
                      <div>Start: {formatDate(selectedStage.start_date)}</div>
                      <div>End: {formatDate(selectedStage.end_date) || "Not set"}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Product</label>
                    <div className="fw-bold">
                      <FiPackage className="me-2" />
                      {selectedStage.design_type || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Design Notes */}
              {selectedStage.design_notes && (
                <div className="card mb-3">
                  <div className="card-body">
                    <h6 className="card-title">Design Notes</h6>
                    <p className="mb-0">{selectedStage.design_notes}</p>
                  </div>
                </div>
              )}

              {/* Design Specifications */}
              {selectedStage.design_specifications && (
                <div className="card mb-3">
                  <div className="card-body">
                    <h6 className="card-title">Design Specifications</h6>
                    <p className="mb-0">{selectedStage.design_specifications}</p>
                  </div>
                </div>
              )}

              {/* Time Tracking */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">Time Tracking</h6>
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="small text-muted">Estimated</div>
                          <div className="fw-bold">{selectedStage.estimated_hours || 0} hrs</div>
                        </div>
                        <div>
                          <div className="small text-muted">Actual</div>
                          <div className="fw-bold">{selectedStage.actual_hours || 0} hrs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
        
              </div>

              {/* Design Files */}
              {selectedStage.files && selectedStage.files.length > 0 && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Design Files ({selectedStage.files.length})</h6>
                  </div>
                  <div className="card-body">
                    <div className="list-group">
                      {selectedStage.files.map((file, index) => (
                        <div
                          key={file.id || index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center">
                            <span className="me-3 fs-5">
                              {file.name.includes(".pdf") ? "📄" : 
                               file.name.includes(".dwg") || file.name.includes(".dxf") ? "📐" :
                               file.name.includes(".jpg") || file.name.includes(".png") ? "🖼️" : "📎"}
                            </span>
                            <div>
                              <div className="fw-medium">{file.name}</div>
                              <small className="text-muted">
                                {file.size ? `${(file.size / 1024).toFixed(2)} KB` : "Unknown size"}
                                {file.uploaded_at && ` • ${formatDate(file.uploaded_at)}`}
                                {file.isReference && " • Reference"}
                              </small>
                            </div>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <FiDownload size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Additional Information</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <span className="text-muted">Created:</span>{" "}
                        {formatDateTime(selectedStage.created_at)}
                      </div>
                      <div className="mb-2">
                        <span className="text-muted">Last Updated:</span>{" "}
                        {formatDateTime(selectedStage.updated_at)}
                      </div>
                    </div>
                    <div className="col-md-6">
                      {selectedStage.product_info && (
                        <>
                          <div className="mb-2">
                            <span className="text-muted">Quantity:</span>{" "}
                            {selectedStage.product_info.quantity || 1}
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Unit Price:</span>{" "}
                            {formatCurrency(selectedStage.product_info.unit_price)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStage(null);
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenUpdate(selectedStage);
                }}
              >
                <FiEdit2 className="me-1" /> Update
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get dynamic stage types
  const stageTypeOptions = getStageTypes();

  return (
    <div className="container-fluid py-3">
      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => {}} />
        </div>
      )}

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row align-items-center mb-3">
            <div className="col-md-6">
              <h2 className="h4 fw-bold mb-1">Design Stages</h2>
              <p className="text-muted mb-0">
                Total {designStages.length} stages • Showing {filteredStages.length} filtered
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={exportToCSV}
                disabled={loading}
              >
                <FiDownload size={16} />
                Export CSV
              </button>
              <button
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                onClick={fetchDesignStages}
                disabled={loading}
              >
                <FiRefreshCw size={16} className={loading ? "spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="row align-items-center">
            <div className="col-md-4 mb-2">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search job card, assigned, product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-3 mb-2">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiFilter className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={loading}
                >
                  <option value="all">All Status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-3 mb-2">
              <select
                className="form-select"
                value={stageTypeFilter}
                onChange={(e) => setStageTypeFilter(e.target.value)}
                disabled={loading}
              >
                {stageTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2 mb-2">
              <select
                className="form-select"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                disabled={loading}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Job Card</th>
                <th>Stage</th>
                <th>Assigned To</th>
                <th>Department</th>
                <th>Dates</th>
                <th>Time (Hrs)</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && designStages.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredStages.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    {search || statusFilter !== "all" || stageTypeFilter !== "all"
                      ? "No stages found for your search criteria"
                      : "No design stages available"}
                  </td>
                </tr>
              ) : (
                currentStages.map((stage, index) => (
                  <tr key={stage._id} className={
                    stage.status === 'completed' || stage.status === 'approved' ? 'table-success' :
                    stage.status === 'hold' ? 'table-warning' :
                    stage.status === 'cancelled' ? 'table-danger' : ''
                  }>
                    <td className="fw-medium">{indexOfFirstItem + index + 1}</td>
                    
                    <td>
                      {stage.job_card_no ? (
                        <>
                          <div className="fw-medium">{stage.job_card_no}</div>
                          {stage.design_type && (
                            <small className="text-muted">
                              <FiPackage size={10} className="me-1" />
                              {stage.design_type}
                            </small>
                          )}
                        </>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    
                    <td>
                      <div className="d-flex flex-column">
                        {getStageTypeBadge(stage.stage_type)}
                        <small className="text-muted mt-1">
                          {stage.stage_name || stage.stage_type}
                        </small>
                      </div>
                    </td>
                    
                    <td>
                      <div>
                        <div className="fw-medium d-flex align-items-center">
                          <FiUser size={12} className="me-1" />
                          {stage.assigned_name || "Unassigned"}
                        </div>
                        <small className="text-muted">{stage.assigned_department || "N/A"}</small>
                      </div>
                    </td>

                    <td>
                      <div className="fw-medium">
                        {stage.assigned_department || "N/A"}
                      </div>
                    </td>
                    
                    <td>
                      <div className="small">
                        <div className="d-flex align-items-center mb-1">
                          <FiCalendar size={12} className="me-1 text-primary" />
                          <span>Start: {formatDate(stage.start_date)}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <FiCalendar size={12} className={`me-1 ${stage.end_date ? 'text-success' : 'text-muted'}`} />
                          <span>End: {formatDate(stage.end_date) || "Not set"}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FiClock size={12} className="text-muted" />
                        <div>
                          <div className="small text-muted">Est: {stage.estimated_hours || 0}</div>
                          <div className="small fw-medium">Act: {stage.actual_hours || 0}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td>{getStatusBadge(stage.status)}</td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-outline-info d-flex align-items-center"
                          onClick={() => {
                            setSelectedStage(stage);
                            setShowViewModal(true);
                          }}
                          title="View Details"
                          disabled={loading}
                        >
                          <FiEye size={14} />
                        </button>
                        
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center"
                          onClick={() => handleOpenUpdate(stage)}
                          title="Update Stage"
                          disabled={loading}
                        >
                          <FiEdit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {filteredStages.length > 0 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-top pt-3 mt-3">
              <div className="mb-2 mb-md-0">
                <p className="text-muted mb-0">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems}{" "}
                  entries
                </p>
              </div>

              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || loading}
                >
                  <FiChevronsLeft size={16} />
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <FiChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return pageNum > 0 && pageNum <= totalPages ? (
                    <button
                      key={pageNum}
                      className={`btn btn-sm ${
                        currentPage === pageNum
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </button>
                  ) : null;
                })}

                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  <FiChevronRight size={16} />
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || loading}
                >
                  <FiChevronsRight size={16} />
                </button>
              </div>

              <div className="mt-2 mt-md-0">
                <span className="text-muted">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedStage && <ViewStageModal />}

      {/* UPDATE MODAL */}
      {showUpdateModal && selectedStage && (
        <UpdateStageModal
          selectedStage={selectedStage}
          employees={employees}
          onUpdate={handleUpdateStage}
          onClose={handleCloseUpdate}
          loading={loading}
        />
      )}

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DesignStageTable;