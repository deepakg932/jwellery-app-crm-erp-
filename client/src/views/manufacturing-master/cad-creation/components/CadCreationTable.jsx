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
  FiEdit2,
  FiFilter,
  FiDownload,
  FiPackage,
  FiBox,
} from "react-icons/fi";
import useCadStages from "@/hooks/useCadStages";
import UpdateCadCreation from "./UpdateCadCreation";

const CadCreationTable = () => {
  const {
    cadStages,
    loading,
    error,
    fetchCadStages,
    employees,
    updateCadStageWithFiles,
    updateCadStageSimple, // For testing
  } = useCadStages();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  console.log(cadStages)
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
    fetchCadStages();
  }, [fetchCadStages]);

  // Filter stages
  const filteredStages = cadStages.filter((stage) => {
    const matchesSearch =
      search === "" ||
      (stage.stage_name && stage.stage_name.toLowerCase().includes(search.toLowerCase())) ||
      (stage.job_card_no && stage.job_card_no.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_name && stage.assigned_name.toLowerCase().includes(search.toLowerCase())) ||
      (stage.design_type && stage.design_type.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_department && stage.assigned_department.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || stage.status === statusFilter;

    return matchesSearch && matchesStatus;
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

  // ✅ **FIXED: Handle update from modal**
  const handleUpdateStage = async (stageId, updateData, filesToUpload) => {
    try {
      console.log("🔄 handleUpdateStage called for CAD:", {
        stageId,
        updateDataKeys: Object.keys(updateData),
        filesToUploadCount: filesToUpload?.length || 0
      });
      
      // Method 1: Full update with files
      const result = await updateCadStageWithFiles(
        stageId,
        updateData,
        filesToUpload || []
      );
      
      // Method 2: Simple update (for testing - uncomment below)
      /*
      const result = await updateCadStageSimple(stageId, {
        assigned_to: updateData.assigned_to,
        status: updateData.status,
        start_date: updateData.start_date,
        remarks: updateData.remarks || "Updated",
        department: "CAD"
      });
      */
      
      console.log("📊 CAD Update result:", result);
      
      if (result.success) {
        console.log("✅ CAD stage updated successfully");
        return true;
      } else {
        console.error("❌ CAD update failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error updating CAD stage:", error);
      return false;
    }
  };

  // Open update modal
  const handleOpenUpdate = (stage) => {
    console.log("📂 Opening CAD update modal for stage:", stage);
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
      "Product",
      "Assigned To",
      "Department",
      "Start Date",
      "End Date",
      "Status",
      "Estimated Hours",
      "Actual Hours",
      "CAD Software",
      "Complexity",
      "Total Cost",
      "Final Price",
      "Created At"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredStages.map(stage => [
        stage.job_card_no || "",
        stage.design_type || "",
        stage.assigned_name || "Unassigned",
        stage.assigned_department || "",
        formatDate(stage.start_date),
        formatDate(stage.end_date),
        stage.status || "",
        stage.estimated_hours || "",
        stage.actual_hours || "",
        stage.cad_software || "",
        stage.complexity_level || "",
        stage.total_cost || "0",
        stage.final_price || "0",
        formatDate(stage.created_at)
      ].map(field => `"${field}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `cad-stages-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View Modal Component
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
                CAD Creation - {selectedStage.job_card_no || selectedStage.stage_name}
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
                    <label className="form-label text-muted small">Product</label>
                    <div className="fw-bold">
                      <FiPackage className="me-2" />
                      {selectedStage.design_type || "N/A"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Status</label>
                    <div>{getStatusBadge(selectedStage.status)}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">CAD Software</label>
                    <div>{selectedStage.cad_software || "N/A"}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Complexity</label>
                    <div>{selectedStage.complexity_level || "N/A"}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Job Card ID</label>
                    <div className="text-muted">{selectedStage.job_card_id || "N/A"}</div>
                  </div>
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
                    <div>{selectedStage.assigned_department || "CAD"}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Dates</label>
                    <div>
                      <div>Start: {formatDate(selectedStage.start_date)}</div>
                      <div>End: {formatDate(selectedStage.end_date) || "Not set"}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Stage ID</label>
                    <div className="text-muted small">{selectedStage._id}</div>
                  </div>
                </div>
              </div>

              {/* Cost & Time Summary */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title small">Time Tracking</h6>
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
                      <div className="mt-2 small text-muted">
                        Total: {selectedStage.total_time_spent || 0} hrs
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title small">Cost Summary</h6>
                      <div className="fw-bold fs-5">
                        ₹{selectedStage.total_cost || 0}
                      </div>
                      <div className="small text-muted">
                        Final Price: ₹{selectedStage.final_price || 0}
                      </div>
                      <div className="small">
                        Markup: {selectedStage.markup_percentage || 30}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title small">File Info</h6>
                      <div className="small">
                        Version: v{selectedStage.file_version || "1.0"}
                      </div>
                      <div className="small">
                        Revisions: {selectedStage.file_revisions || 0}
                      </div>
                      <div className="small">
                        Status: {selectedStage.file_status || "draft"}
                      </div>
                      <div className="small">
                        Files: {selectedStage.files?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {selectedStage.remarks && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title small">Remarks</h6>
                    <p className="mb-0 small">{selectedStage.remarks}</p>
                  </div>
                </div>
              )}

              {/* CAD Files */}
              {selectedStage.files && selectedStage.files.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0 small">CAD Files ({selectedStage.files.length})</h6>
                  </div>
                  <div className="card-body p-2">
                    <div className="list-group">
                      {selectedStage.files.slice(0, 3).map((file, index) => (
                        <div
                          key={file.id || index}
                          className="list-group-item d-flex justify-content-between align-items-center py-1 px-2"
                        >
                          <div className="d-flex align-items-center">
                            <span className="me-2">
                              {file.name.includes(".dwg") ? "📐" : 
                               file.name.includes(".stl") ? "🔶" :
                               file.name.includes(".step") ? "📦" : "📎"}
                            </span>
                            <div className="small">
                              <div className="fw-medium text-truncate" style={{maxWidth: '200px'}}>
                                {file.name}
                              </div>
                              <small className="text-muted">
                                {file.size ? `${(file.size / 1024).toFixed(2)} KB` : "Unknown size"}
                              </small>
                            </div>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <FiDownload size={12} />
                          </a>
                        </div>
                      ))}
                      {selectedStage.files.length > 3 && (
                        <div className="list-group-item text-center py-1">
                          <small className="text-muted">
                            +{selectedStage.files.length - 3} more files
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStage(null);
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenUpdate(selectedStage);
                }}
              >
                <FiEdit2 className="me-1" size={12} /> Update
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-3">
      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError("")} />
        </div>
      )}

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row align-items-center mb-3">
            <div className="col-md-6">
              <h2 className="h4 fw-bold mb-1">CAD Creation Stages</h2>
              <p className="text-muted mb-0">
                Total {cadStages.length} stages • Showing {filteredStages.length} filtered
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2 btn-sm"
                onClick={exportToCSV}
                disabled={loading}
              >
                <FiDownload size={14} />
                Export CSV
              </button>
              <button
                className="btn btn-outline-primary d-flex align-items-center gap-2 btn-sm"
                onClick={fetchCadStages}
                disabled={loading}
              >
                <FiRefreshCw size={14} className={loading ? "spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={() => console.log("Test update")}
                title="Debug Info"
              >
                🐛 Debug
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="row align-items-center">
            <div className="col-md-4 mb-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" size={14} />
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
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiFilter className="text-muted" size={14} />
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
                className="form-select form-select-sm"
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
        <div className="card-body table-responsive p-0">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="small fw-bold">#</th>
                <th className="small fw-bold">Job Card</th>
                <th className="small fw-bold">Product</th>
                <th className="small fw-bold">Assigned To</th>
                <th className="small fw-bold">Dates</th>
                <th className="small fw-bold">Hours</th>
                <th className="small fw-bold">Cost</th>
                <th className="small fw-bold">Status</th>
                <th className="small fw-bold text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && cadStages.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredStages.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    {search || statusFilter !== "all"
                      ? "No CAD stages found for your search criteria"
                      : "No CAD creation stages available"}
                  </td>
                </tr>
              ) : (
                currentStages.map((stage, index) => (
                  <tr key={stage._id} className={
                    stage.status === 'completed' || stage.status === 'approved' ? 'table-success' :
                    stage.status === 'hold' ? 'table-warning' :
                    stage.status === 'cancelled' ? 'table-danger' : ''
                  }>
                    <td className="fw-medium small">{indexOfFirstItem + index + 1}</td>
                    
                    <td>
                      <div className="fw-medium small">{stage.job_card_no || "N/A"}</div>
                      <div className="text-muted x-small">{stage.department || "CAD"}</div>
                    </td>
                    
                    <td>
                      <div className="fw-medium small">
                        <FiPackage size={10} className="me-1" />
                        {stage.design_type || "N/A"}
                      </div>
                      <div className="text-muted x-small">
                        {stage.material ? `Material: ${stage.material}` : ""}
                      </div>
                    </td>
                    
                    <td>
                      <div>
                        <div className="fw-medium small d-flex align-items-center">
                          <FiUser size={10} className="me-1" />
                          {stage.assigned_name || "Unassigned"}
                        </div>
                        <div className="text-muted x-small">{stage.assigned_department || "CAD"}</div>
                      </div>
                    </td>
                    
                    <td>
                      <div className="small">
                        <div className="d-flex align-items-center mb-1">
                          <FiCalendar size={10} className="me-1 text-primary" />
                          <span className="x-small">Start: {formatDate(stage.start_date)}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <FiCalendar size={10} className={`me-1 ${stage.end_date ? 'text-success' : 'text-muted'}`} />
                          <span className="x-small">End: {formatDate(stage.end_date) || "Not set"}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <FiClock size={10} className="text-muted" />
                        <div>
                          <div className="x-small text-muted">Est: {stage.estimated_hours || 0}</div>
                          <div className="x-small fw-medium">Act: {stage.actual_hours || 0}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="fw-medium small">
                        ₹{stage.total_cost || 0}
                      </div>
                      <div className="text-success x-small">
                        Final: ₹{stage.final_price || 0}
                      </div>
                    </td>
                    
                    <td>
                      <div className="d-flex flex-column gap-1">
                        {getStatusBadge(stage.status)}
                        <span className="badge bg-secondary x-small">
                          v{stage.file_version || "1.0"}
                        </span>
                      </div>
                    </td>

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
                          <FiEye size={12} />
                        </button>
                        
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center"
                          onClick={() => handleOpenUpdate(stage)}
                          title="Update Stage"
                          disabled={loading}
                        >
                          <FiEdit2 size={12} />
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
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center border-top pt-3 mt-3 px-3">
              <div className="mb-2 mb-md-0">
                <p className="text-muted mb-0 small">
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
                  <FiChevronsLeft size={14} />
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <FiChevronLeft size={14} />
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
                  <FiChevronRight size={14} />
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || loading}
                >
                  <FiChevronsRight size={14} />
                </button>
              </div>

              <div className="mt-2 mt-md-0">
                <span className="text-muted small">
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
        <UpdateCadCreation
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
        .x-small {
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default CadCreationTable;