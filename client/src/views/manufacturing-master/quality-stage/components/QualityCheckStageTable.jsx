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
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiShield,
  FiBarChart2,
  FiAlertCircle,
  FiDollarSign,
  FiTool,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
import useQualityCheckStages from "@/hooks/useQualityCheckStages";
import UpdateQualityCheckStage from "./UpdateQualityCheckStage";

const QualityCheckStageTable = () => {
  const {
    qualityStages,
    employees,
    loading,
    error,
    fetchQualityStages,
    updateQualityStageWithFiles,
  } = useQualityCheckStages();

  console.log("Quality Stages Data:", qualityStages);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const statusOptions = [
    { value: "pending", label: "Pending", color: "secondary", icon: "⏳" },
    { value: "in_progress", label: "In Progress", color: "info", icon: "🔍" },
    { value: "passed", label: "Passed", color: "success", icon: "✅" },
    { value: "failed", label: "Failed", color: "danger", icon: "❌" },
    { value: "rework", label: "Rework Required", color: "warning", icon: "🔄" },
    { value: "hold", label: "On Hold", color: "danger", icon: "⏸️" },
    { value: "completed", label: "Completed", color: "success", icon: "🏁" },
  ];

  // Load data on component mount
  useEffect(() => {
    fetchQualityStages();
  }, [fetchQualityStages]);

  // Filter stages
  const filteredStages = qualityStages.filter((stage) => {
    const matchesSearch =
      search === "" ||
      (stage.job_card_no &&
        stage.job_card_no.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_name &&
        stage.assigned_name.toLowerCase().includes(search.toLowerCase())) ||
      (stage.design_type &&
        stage.design_type.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_email &&
        stage.assigned_email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || stage.overall_status === statusFilter;

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
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format time
  const formatTime = (hours) => {
    if (!hours) return "0h";
    return `${hours}h`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "secondary", label: "Pending", icon: "⏳" },
      in_progress: { color: "info", label: "In Progress", icon: "🔍" },
      passed: { color: "success", label: "Passed", icon: "✅" },
      failed: { color: "danger", label: "Failed", icon: "❌" },
      rework: { color: "warning", label: "Rework", icon: "🔄" },
      hold: { color: "danger", label: "On Hold", icon: "⏸️" },
      completed: { color: "success", label: "Completed", icon: "🏁" },
    };

    const config = statusConfig[status] || {
      color: "secondary",
      label: status,
      icon: "❓",
    };

    return (
      <span className={`badge bg-${config.color} text-white fw-semibold d-flex align-items-center gap-1`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // Get quality score badge
  const getQualityScoreBadge = (passRate) => {
    const score = parseFloat(passRate) || 0;
    if (score >= 95) {
      return <span className="badge bg-success">Excellent ({score}%)</span>;
    } else if (score >= 90) {
      return <span className="badge bg-info">Good ({score}%)</span>;
    } else if (score >= 85) {
      return <span className="badge bg-warning">Average ({score}%)</span>;
    } else {
      return <span className="badge bg-danger">Poor ({score}%)</span>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: "info", label: "Low", icon: "⬇️" },
      medium: { color: "warning", label: "Medium", icon: "↔️" },
      high: { color: "danger", label: "High", icon: "⬆️" },
    };

    const config = priorityConfig[priority] || {
      color: "secondary",
      label: priority || "N/A",
      icon: "⚙️",
    };

    return (
      <span className={`badge bg-${config.color} text-white fw-semibold d-flex align-items-center gap-1`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // Handle update from modal
  const handleUpdateStage = async (stageId, updateData, filesToUpload) => {
    try {
      console.log("🔄 handleUpdateStage called for Quality Check:", {
        stageId,
        updateDataKeys: Object.keys(updateData),
        filesToUploadCount: filesToUpload?.length || 0,
      });

      const result = await updateQualityStageWithFiles(
        stageId,
        updateData,
        filesToUpload || [],
      );

      console.log("📊 Quality Check Update result:", result);

      if (result.success) {
        console.log("✅ Quality Check stage updated successfully");
        fetchQualityStages(); // Refresh data
        return true;
      } else {
        console.error("❌ Quality Check update failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error updating Quality Check stage:", error);
      return false;
    }
  };

  // Open update modal
  const handleOpenUpdate = (stage) => {
    console.log("📂 Opening Quality Check update modal for stage:", stage);
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
      "Priority",
      "Inspector",
      "Email",
      "Check Points Count",
      "Overall Status",
      "Pass Rate",
      "Batch Size",
      "Accepted Qty",
      "Rejected Qty",
      "Defects Count",
      "Critical Defects",
      "Major Defects",
      "Minor Defects",
      "Inspection Method",
      "Rework Required",
      "Certificate Issued",
      "Certificate Number",
      "Surface Finish",
      "Adhesion Quality",
      "Uniformity",
      "Next Stage",
      "Total Cost",
      "Total Time",
      "Start Date",
      "End Date",
      "Approved By",
      "Approval Date",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredStages.map((stage) => {
        const passRate = stage.batch_size > 0 
          ? ((stage.accepted_quantity / stage.batch_size) * 100).toFixed(1)
          : "0";
        
        return [
          stage.job_card_no || "",
          stage.design_type || "",
          stage.job_card_priority || "",
          stage.assigned_name || "Unassigned",
          stage.assigned_email || "",
          (stage.check_points || []).length,
          stage.overall_status || "",
          passRate,
          stage.batch_size || 0,
          stage.accepted_quantity || 0,
          stage.rejected_quantity || 0,
          stage.defects_count || 0,
          stage.critical_defects || 0,
          stage.major_defects || 0,
          stage.minor_defects || 0,
          stage.inspection_method || "",
          stage.rework_required ? "Yes" : "No",
          stage.certificate_issued ? "Yes" : "No",
          stage.certificate_number || "",
          stage.surface_finish || "",
          stage.adhesion_quality || "",
          stage.uniformity || "",
          stage.next_stage || "",
          stage.total_cost || "0",
          stage.total_time_spent || "0",
          formatDate(stage.start_date),
          formatDate(stage.end_date),
          stage.approved_by || "",
          formatDate(stage.approval_date),
        ]
          .map((field) => `"${field}"`)
          .join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `quality-check-stages-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View Modal Component
  const ViewStageModal = () => {
    if (!selectedStage) return null;

    // Calculate statistics
    const passRate = selectedStage.batch_size > 0 
      ? ((selectedStage.accepted_quantity / selectedStage.batch_size) * 100).toFixed(1)
      : "0";

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
                <FiShield className="me-2" />
                Quality Check Stage - {selectedStage.job_card_no}
                <span className="ms-2">
                  {getPriorityBadge(selectedStage.job_card_priority)}
                </span>
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
                    <label className="form-label text-muted small">
                      Product
                    </label>
                    <div className="fw-bold">
                      <FiPackage className="me-2" />
                      {selectedStage.design_type || "N/A"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Job Card Status
                    </label>
                    <div>
                      <span className="badge bg-info">
                        {selectedStage.job_card_status || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Status
                    </label>
                    <div>{getStatusBadge(selectedStage.overall_status)}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Department
                    </label>
                    <div>{selectedStage.assigned_department || "QUALITY_CHECK"}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Assigned Inspector
                    </label>
                    <div className="fw-bold">
                      <FiUser className="me-2" />
                      {selectedStage.assigned_name || "Unassigned"}
                    </div>
                    <div className="small text-muted">
                      {selectedStage.assigned_email || ""}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Dates</label>
                    <div>
                      <div>Start: {formatDate(selectedStage.start_date)}</div>
                      <div>
                        End: {formatDate(selectedStage.end_date) || "Not set"}
                      </div>
                      {selectedStage.approval_date && (
                        <div className="text-success small">
                          <FiCheckCircle className="me-1" />
                          Approved: {formatDate(selectedStage.approval_date)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Next Stage
                    </label>
                    <div className="badge bg-info">
                      {selectedStage.next_stage || selectedStage.job_card_stage || "Not set"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Summary */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0 small fw-bold">
                    <FiBarChart2 className="me-2" />
                    Quality Summary
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center">
                        <div className="fw-bold fs-4">
                          {selectedStage.batch_size || 0}
                        </div>
                        <div className="small text-muted">Batch Size</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <div className="fw-bold fs-4 text-success">
                          {selectedStage.accepted_quantity || 0}
                        </div>
                        <div className="small text-muted">Accepted</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <div className="fw-bold fs-4 text-danger">
                          {selectedStage.rejected_quantity || 0}
                        </div>
                        <div className="small text-muted">Rejected</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <div className="fw-bold fs-4">
                          {passRate}%
                        </div>
                        <div className="small text-muted">Pass Rate</div>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-4">
                      <div className="small">
                        <strong>Inspection Method:</strong> {selectedStage.inspection_method || "Visual"}
                      </div>
                      <div className="small">
                        <strong>Sample Size:</strong> {selectedStage.sample_size || 1}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="small">
                        <strong>Surface Finish:</strong> {selectedStage.surface_finish || "N/A"}
                      </div>
                      <div className="small">
                        <strong>Adhesion:</strong> {selectedStage.adhesion_quality || "N/A"}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="small">
                        <strong>Uniformity:</strong> {selectedStage.uniformity || "N/A"}
                      </div>
                      <div className="small">
                        <strong>Tools Used:</strong> {(selectedStage.measuring_tools_used || []).join(", ") || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Defects & Details Summary */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title small">
                        <FiAlertCircle className="me-1" />
                        Defects Summary
                      </h6>
                      <div className="small mb-1">
                        Total: <span className="fw-bold">{selectedStage.defects_count || 0}</span>
                      </div>
                      <div className="small mb-1">
                        Critical: <span className="fw-bold text-danger">{selectedStage.critical_defects || 0}</span>
                      </div>
                      <div className="small mb-1">
                        Major: <span className="fw-bold text-warning">{selectedStage.major_defects || 0}</span>
                      </div>
                      <div className="small">
                        Minor: <span className="fw-bold text-info">{selectedStage.minor_defects || 0}</span>
                      </div>
                      {(selectedStage.defects_detected || []).length > 0 && (
                        <div className="mt-2 x-small">
                          Defects: {(selectedStage.defects_detected || []).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title small">
                        <FiClock className="me-1" />
                        Time Tracking
                      </h6>
                      <div className="fw-bold fs-5">
                        {formatTime(selectedStage.total_time_spent)}
                      </div>
                      <div className="small text-muted">
                        Total Time
                      </div>
                      <div className="x-small mt-2">
                        <div>Preparation: {formatTime(selectedStage.preparation_time)}</div>
                        <div>Inspection: {formatTime(selectedStage.inspection_time)}</div>
                        <div>Documentation: {formatTime(selectedStage.documentation_time)}</div>
                        <div>Approval: {formatTime(selectedStage.approval_time)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title small">
                        <FiDollarSign className="me-1" />
                        Cost Summary
                      </h6>
                      <div className="fw-bold fs-5">
                        ₹{selectedStage.total_cost || 0}
                      </div>
                      <div className="small text-muted">
                        Total Cost
                      </div>
                      <div className="x-small mt-2">
                        <div>Inspection: ₹{selectedStage.inspection_cost || 0}</div>
                        <div>Labour: ₹{selectedStage.labour_cost || 0}</div>
                        <div>Equipment: ₹{selectedStage.equipment_cost || 0}</div>
                        <div>Certification: ₹{selectedStage.certification_cost || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Check Points Details */}
              {(selectedStage.check_points || []).length > 0 && (
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 small fw-bold">
                      <FiCheck className="me-2" />
                      Check Points Details ({selectedStage.check_points.length} points)
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {selectedStage.check_points.map((point, index) => {
                        const pointConfig = {
                          dimensions: { icon: "📐", label: "Dimensions", color: "primary" },
                          weight: { icon: "⚖️", label: "Weight", color: "info" },
                          purity: { icon: "🧪", label: "Purity", color: "warning" },
                          finish: { icon: "✨", label: "Finish", color: "success" },
                          assembly: { icon: "⚙️", label: "Assembly", color: "secondary" },
                          marking: { icon: "🏷️", label: "Marking", color: "dark" },
                          polish: { icon: "🔍", label: "Polish", color: "light", textColor: "dark" },
                          stones: { icon: "💎", label: "Stones", color: "info" },
                          color: { icon: "🎨", label: "Color", color: "danger" },
                          packaging: { icon: "📦", label: "Packaging", color: "success" },
                        };
                        
                        const config = pointConfig[point.toLowerCase()] || { 
                          icon: "✅", 
                          label: point, 
                          color: "secondary" 
                        };
                        
                        return (
                          <div key={index} className="col-6 col-md-4 mb-2">
                            <span className={`badge bg-${config.color} ${config.textColor ? `text-${config.textColor}` : 'text-white'} me-1`}>
                              {config.icon}
                            </span>
                            <span className="small">{config.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Quality Checks Details */}
                    <div className="row mt-3">
                      {selectedStage.dimensions_check && (
                        <div className="col-md-6 mb-2">
                          <div className="small">
                            <strong>Dimensions:</strong> {selectedStage.dimensions_tolerance || "N/A"}
                            {selectedStage.dimensions_notes && (
                              <div className="x-small text-muted">Notes: {selectedStage.dimensions_notes}</div>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedStage.weight_check && (
                        <div className="col-md-6 mb-2">
                          <div className="small">
                            <strong>Weight:</strong> {selectedStage.weight_tolerance || "N/A"}
                            {selectedStage.weight_notes && (
                              <div className="x-small text-muted">Notes: {selectedStage.weight_notes}</div>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedStage.purity_check && (
                        <div className="col-md-6 mb-2">
                          <div className="small">
                            <strong>Purity:</strong> {selectedStage.purity_verified || "N/A"}
                            {selectedStage.purity_certificate_no && (
                              <div className="x-small text-muted">Cert: {selectedStage.purity_certificate_no}</div>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedStage.finish_check && (
                        <div className="col-md-6 mb-2">
                          <div className="small">
                            <strong>Finish:</strong> {selectedStage.finish_quality || "N/A"}
                            {selectedStage.finish_defects && (
                              <div className="x-small text-muted">Defects: {selectedStage.finish_defects}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Certificate & Approval Info */}
              {(selectedStage.certificate_issued || selectedStage.approved_by) && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title small">
                      <FiFileText className="me-1" />
                      Certificate & Approval
                    </h6>
                    <div className="row">
                      {selectedStage.certificate_issued && (
                        <div className="col-md-6">
                          <div className="small">
                            <strong>Certificate Issued:</strong> Yes
                            {selectedStage.certificate_number && (
                              <div className="x-small text-muted">
                                Number: {selectedStage.certificate_number}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedStage.approved_by && (
                        <div className="col-md-6">
                          <div className="small">
                            <strong>Approved By:</strong> {selectedStage.approved_by}
                            {selectedStage.approval_date && (
                              <div className="x-small text-muted">
                                Date: {formatDate(selectedStage.approval_date)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {(selectedStage.remarks || selectedStage.rework_reason) && (
                <div className="card mb-4">
                  <div className="card-body">
                    {selectedStage.remarks && (
                      <div className="mb-3">
                        <h6 className="card-title small">Remarks</h6>
                        <p className="mb-0 small">{selectedStage.remarks}</p>
                      </div>
                    )}
                    {selectedStage.rework_reason && (
                      <div>
                        <h6 className="card-title small text-danger">
                          <FiAlertTriangle className="me-1" />
                          Rework Reason
                        </h6>
                        <p className="mb-0 small text-danger">{selectedStage.rework_reason}</p>
                      </div>
                    )}
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
        <div
          className="alert alert-danger alert-dismissible fade show mb-3"
          role="alert"
        >
          <strong>Error:</strong> {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row align-items-center mb-3">
            <div className="col-md-6">
              <h2 className="h4 fw-bold mb-1">
                <FiShield className="me-2" />
                Quality Check Stages
              </h2>
              <p className="text-muted mb-0">
                Total {qualityStages.length} stages • Showing{" "}
                {filteredStages.length} filtered • {totalItems} records
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
                onClick={fetchQualityStages}
                disabled={loading}
              >
                <FiRefreshCw size={14} className={loading ? "spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
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
                  placeholder="Search job card, inspector, product..."
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

            <div className="col-md-2 mb-2">
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
                <th className="small fw-bold">Inspector</th>
                <th className="small fw-bold">Check Points</th>
                <th className="small fw-bold">Quality Score</th>
                <th className="small fw-bold">Defects</th>
                <th className="small fw-bold">Time</th>
                <th className="small fw-bold">Cost</th>
                <th className="small fw-bold">Status</th>
                <th className="small fw-bold">Next Stage</th>
                <th className="small fw-bold text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && qualityStages.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredStages.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-4 text-muted">
                    {search || statusFilter !== "all"
                      ? "No quality check stages found for your search criteria"
                      : "No quality check stages available"}
                  </td>
                </tr>
              ) : (
                currentStages.map((stage, index) => {
                  // Calculate statistics
                  const passRate = stage.batch_size > 0 
                    ? ((stage.accepted_quantity / stage.batch_size) * 100).toFixed(1)
                    : "0";

                  return (
                    <tr
                      key={stage._id}
                      className={
                        stage.overall_status === "passed"
                          ? "table-success"
                          : stage.overall_status === "failed" || stage.overall_status === "rework"
                            ? "table-warning"
                            : stage.overall_status === "in_progress"
                              ? "table-info"
                              : ""
                      }
                    >
                      <td className="fw-medium small">
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td>
                        <div className="fw-medium small">
                          {stage.job_card_no || "N/A"}
                        </div>
                        <div className="text-muted x-small d-flex align-items-center gap-1">
                          <span>{stage.department || "QUALITY_CHECK"}</span>
                          {stage.job_card_priority && (
                            <span>
                              {getPriorityBadge(stage.job_card_priority)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="fw-medium small">
                          <FiPackage size={10} className="me-1" />
                          {stage.design_type || "N/A"}
                        </div>
                        <div className="text-muted x-small">
                          {stage.job_card_status ? `Status: ${stage.job_card_status}` : ""}
                        </div>
                      </td>

                      <td>
                        <div>
                          <div className="fw-medium small d-flex align-items-center">
                            <FiUser size={10} className="me-1" />
                            {stage.assigned_name || "Unassigned"}
                          </div>
                          <div className="text-muted x-small">
                            {stage.assigned_email || ""}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="small">
                          <span className="badge bg-primary">
                            {(stage.check_points || []).length} points
                          </span>
                          <div className="text-muted x-small mt-1">
                            {stage.inspection_method || "Visual"}
                          </div>
                        </div>
                      </td>

                      <td>
                        {getQualityScoreBadge(passRate)}
                        <div className="x-small text-muted mt-1">
                          {stage.accepted_quantity || 0}/{stage.batch_size || 0}
                        </div>
                      </td>

                      <td>
                        <div className="small">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="x-small text-muted">Total:</span>
                            <span className={`fw-medium ${
                              stage.defects_count > 0 ? 'text-danger' : 'text-success'
                            }`}>
                              {stage.defects_count || 0}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="x-small text-muted">Critical:</span>
                            <span className="fw-medium text-danger">
                              {stage.critical_defects || 0}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <FiClock size={10} className="text-muted" />
                          <div className="fw-medium small">
                            {formatTime(stage.total_time_spent)}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="fw-medium small">
                          ₹{stage.total_cost || 0}
                        </div>
                        <div className="text-muted x-small">
                          {stage.cost_status || "Estimated"}
                        </div>
                      </td>

                      <td>
                        <div className="d-flex flex-column gap-1">
                          {getStatusBadge(stage.overall_status)}
                          {stage.rework_required && (
                            <span className="badge bg-warning x-small">
                              <FiAlertTriangle size={10} className="me-1" /> Rework
                            </span>
                          )}
                          {stage.certificate_issued && (
                            <span className="badge bg-success x-small">
                              <FiCheck size={10} className="me-1" /> Certified
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="badge bg-info">
                          {stage.next_stage || stage.job_card_stage || "Not set"}
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
                  );
                })
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
        <UpdateQualityCheckStage
          selectedStage={selectedStage}
          employees={employees}
          onUpdate={handleUpdateStage}
          onClose={handleCloseUpdate}
          loading={loading}
        />
      )}

      {/* Add CSS for spinner animation */}
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .x-small {
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default QualityCheckStageTable;