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
  FiDroplet,
  FiTool,
  FiShield,
  FiZap,
  FiLayers,
  FiAlertCircle,
  FiCheckCircle,
  FiDollarSign,
  FiThermometer,
  FiBattery,
} from "react-icons/fi";
import usePlatingStages from "@/hooks/usePlatingStages";
import UpdatePlatingStage from "./UpdatePlatingStage";

const PlatingStageTable = () => {
  const {
    platingStages,
    materials,
    loading,
    error,
    fetchPlatingStages,
    employees,
    updatePlatingStageWithFiles,
  } = usePlatingStages();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const statusOptions = [
    { value: "not_started", label: "Not Started", color: "secondary", icon: "⏳" },
    { value: "preparation", label: "Preparation", color: "info", icon: "🛠️" },
    { value: "cleaning", label: "Cleaning", color: "info", icon: "🧹" },
    { value: "plating", label: "Plating", color: "warning", icon: "⚡" },
    { value: "rinsing", label: "Rinsing", color: "info", icon: "💧" },
    { value: "drying", label: "Drying", color: "info", icon: "🌬️" },
    { value: "quality_check", label: "Quality Check", color: "warning", icon: "🔍" },
    { value: "completed", label: "Completed", color: "success", icon: "✅" },
    { value: "hold", label: "On Hold", color: "danger", icon: "⏸️" },
    { value: "rework", label: "Rework", color: "danger", icon: "🔄" },
  ];

  const materialOptions = [
    { value: "all", label: "All Materials" },
    { value: "rhodium", label: "Rhodium", color: "light", icon: "⚪" },
    { value: "gold", label: "Gold", color: "warning", icon: "💰" },
    { value: "rose_gold", label: "Rose Gold", color: "danger", icon: "🌹" },
    { value: "white_gold", label: "White Gold", color: "light", icon: "⚪" },
    { value: "silver", label: "Silver", color: "secondary", icon: "⚪" },
    { value: "copper", label: "Copper", color: "warning", icon: "🔶" },
    { value: "nickel", label: "Nickel", color: "dark", icon: "⚫" },
    { value: "palladium", label: "Palladium", color: "info", icon: "🔵" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low", color: "info", icon: "⬇️" },
    { value: "medium", label: "Medium", color: "warning", icon: "↔️" },
    { value: "high", label: "High", color: "danger", icon: "⬆️" },
  ];

  // Load data on component mount
  useEffect(() => {
    fetchPlatingStages();
  }, [fetchPlatingStages]);

  // Filter stages
  const filteredStages = platingStages.filter((stage) => {
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
      statusFilter === "all" || stage.status === statusFilter;

    const matchesMaterial =
      materialFilter === "all" || 
      stage.material_name?.toLowerCase().includes(materialFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesMaterial;
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
      not_started: { color: "secondary", label: "Not Started", icon: "⏳" },
      preparation: { color: "info", label: "Preparation", icon: "🛠️" },
      cleaning: { color: "info", label: "Cleaning", icon: "🧹" },
      plating: { color: "warning", label: "Plating", icon: "⚡" },
      rinsing: { color: "info", label: "Rinsing", icon: "💧" },
      drying: { color: "info", label: "Drying", icon: "🌬️" },
      quality_check: { color: "warning", label: "Quality Check", icon: "🔍" },
      completed: { color: "success", label: "Completed", icon: "✅" },
      hold: { color: "danger", label: "On Hold", icon: "⏸️" },
      rework: { color: "danger", label: "Rework", icon: "🔄" },
    };

    const config = statusConfig[status] || {
      color: "secondary",
      label: status,
      icon: "⚙️",
    };

    return (
      <span className={`badge bg-${config.color} text-white fw-semibold d-flex align-items-center gap-1`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // Get material badge
  const getMaterialBadge = (materialName) => {
    const materialConfig = {
      rhodium: { color: "light", icon: "⚪", label: "Rhodium", textColor: "dark" },
      gold: { color: "warning", icon: "💰", label: "Gold" },
      "rose gold": { color: "danger", icon: "🌹", label: "Rose Gold" },
      "white gold": { color: "light", icon: "⚪", label: "White Gold", textColor: "dark" },
      silver: { color: "secondary", icon: "⚪", label: "Silver" },
      copper: { color: "warning", icon: "🔶", label: "Copper" },
      nickel: { color: "dark", icon: "⚫", label: "Nickel" },
      palladium: { color: "info", icon: "🔵", label: "Palladium" },
    };

    const config = materialConfig[materialName?.toLowerCase()] || {
      color: "secondary",
      icon: "🧪",
      textColor: "white",
      label: materialName || "N/A",
    };

    return (
      <span
        className={`badge bg-${config.color} text-${config.textColor || "white"} fw-semibold d-flex align-items-center gap-1`}
      >
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
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

  // Get surface finish badge
  const getFinishBadge = (finish) => {
    const finishConfig = {
      excellent: { color: "success", label: "Excellent", icon: "🌟" },
      good: { color: "info", label: "Good", icon: "👍" },
      average: { color: "warning", label: "Average", icon: "⚖️" },
      poor: { color: "danger", label: "Poor", icon: "👎" },
    };

    const config = finishConfig[finish] || {
      color: "secondary",
      label: finish || "N/A",
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
      console.log("🔄 handleUpdateStage called for Plating:", {
        stageId,
        updateDataKeys: Object.keys(updateData),
        filesToUploadCount: filesToUpload?.length || 0,
      });

      const result = await updatePlatingStageWithFiles(
        stageId,
        updateData,
        filesToUpload || [],
      );

      console.log("📊 Plating Update result:", result);

      if (result.success) {
        console.log("✅ Plating stage updated successfully");
        fetchPlatingStages(); // Refresh data
        return true;
      } else {
        console.error("❌ Plating update failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error updating Plating stage:", error);
      return false;
    }
  };

  // Open update modal
  const handleOpenUpdate = (stage) => {
    console.log("📂 Opening Plating update modal for stage:", stage);
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
      "Karigar",
      "Email",
      "Material",
      "Material Code",
      "Quantity",
      "Unit",
      "Plating Type",
      "Thickness (μm)",
      "Current Density",
      "Voltage",
      "Plating Time",
      "Temperature",
      "pH Level",
      "Labour Hours",
      "Actual Hours",
      "Total Time",
      "Status",
      "Job Card Status",
      "Next Stage",
      "Surface Finish",
      "Adhesion",
      "Uniformity",
      "Total Cost",
      "Final Price",
      "Start Date",
      "End Date",
      "Completed At",
      "Remarks",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredStages.map((stage) =>
        [
          stage.job_card_no || "",
          stage.design_type || "",
          stage.job_card_priority || "",
          stage.assigned_name || "Unassigned",
          stage.assigned_email || "",
          stage.material_name || "",
          stage.material_code || "",
          stage.material_used_qty || "0",
          stage.material_unit || "",
          stage.plating_type || "",
          stage.plating_thickness || "",
          stage.current_density || "",
          stage.voltage_applied || "",
          stage.plating_time || "",
          stage.bath_temperature || "",
          stage.ph_level || "",
          stage.labour_hours || "0",
          stage.actual_hours || "0",
          stage.total_time_spent || "0",
          stage.status || "",
          stage.job_card_status || "",
          stage.next_stage || "",
          stage.surface_finish || "",
          stage.adhesion_quality || "",
          stage.uniformity || "",
          stage.total_cost || "0",
          stage.final_price || "0",
          formatDate(stage.start_date),
          formatDate(stage.end_date),
          formatDate(stage.completed_at),
          stage.remarks || "",
        ]
          .map((field) => `"${field}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `plating-stages-${new Date().toISOString().split("T")[0]}.csv`,
    );
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
                <FiLayers className="me-2" />
                Plating Stage - {selectedStage.job_card_no}
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
                    <div>{getStatusBadge(selectedStage.status)}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Material
                    </label>
                    <div className="d-flex align-items-center gap-2">
                      {getMaterialBadge(selectedStage.material_name)}
                      <span className="badge bg-light text-dark">
                        {selectedStage.material_used_qty || "0"} {selectedStage.material_unit || "ml"}
                      </span>
                    </div>
                    {selectedStage.material_code && (
                      <div className="x-small text-muted mt-1">
                        Code: {selectedStage.material_code}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Assigned Karigar
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
                    <label className="form-label text-muted small">
                      Department
                    </label>
                    <div>{selectedStage.assigned_department || "PLATING"}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Dates</label>
                    <div>
                      <div>Start: {formatDate(selectedStage.start_date)}</div>
                      <div>
                        End: {formatDate(selectedStage.end_date) || "Not set"}
                      </div>
                      {selectedStage.completed_at && (
                        <div className="text-success small">
                          <FiCheckCircle className="me-1" />
                          Completed: {formatDate(selectedStage.completed_at)}
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

              {/* Plating Process Details */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0 small fw-bold">
                    <FiZap className="me-2" />
                    Plating Process Details
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center">
                        <div className="fw-bold fs-4">
                          {selectedStage.plating_type || "N/A"}
                        </div>
                        <div className="small text-muted">Plating Type</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <div className="fw-bold fs-4 text-success">
                          {selectedStage.plating_thickness || "N/A"}μm
                        </div>
                        <div className="small text-muted">Thickness</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <div className="fw-bold fs-4 text-warning">
                          {selectedStage.current_density || "N/A"} A/dm²
                        </div>
                        <div className="small text-muted">Current Density</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <div className="fw-bold fs-4 text-primary">
                          {selectedStage.voltage_applied || "N/A"} V
                        </div>
                        <div className="small text-muted">Voltage</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <div className="small">
                        <FiThermometer className="me-1" />
                        <strong>Bath Temperature:</strong> {selectedStage.bath_temperature || "N/A"}°C
                      </div>
                      <div className="small">
                        <FiDroplet className="me-1" />
                        <strong>pH Level:</strong> {selectedStage.ph_level || "N/A"}
                      </div>
                      <div className="small">
                        <FiClock className="me-1" />
                        <strong>Plating Time:</strong> {selectedStage.plating_time || "N/A"} min
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="small">
                        <FiShield className="me-1" />
                        <strong>Adhesion:</strong> {selectedStage.adhesion_quality || "N/A"}
                      </div>
                      <div className="small">
                        <FiTool className="me-1" />
                        <strong>Uniformity:</strong> {selectedStage.uniformity || "N/A"}
                      </div>
                      <div className="small">
                        <FiAlertCircle className="me-1" />
                        <strong>Defects:</strong> {selectedStage.defects || "None"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time & Quality Summary */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title small">
                        <FiClock className="me-1" />
                        Time Tracking
                      </h6>
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="small text-muted">Labour</div>
                          <div className="fw-bold">
                            {formatTime(selectedStage.labour_hours)}
                          </div>
                        </div>
                        <div>
                          <div className="small text-muted">Actual</div>
                          <div className="fw-bold">
                            {formatTime(selectedStage.actual_hours)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="small text-muted">
                          Total: {formatTime(selectedStage.total_time_spent)}
                        </div>
                        <div className="x-small mt-1">
                          <div>Prep: {formatTime(selectedStage.preparation_time)}</div>
                          <div>Clean: {formatTime(selectedStage.cleaning_time)}</div>
                          <div>Plate: {formatTime(selectedStage.plating_time_track)}</div>
                          <div>Rinse: {formatTime(selectedStage.rinsing_time)}</div>
                          <div>Dry: {formatTime(selectedStage.drying_time)}</div>
                          <div>QC: {formatTime(selectedStage.quality_check_time)}</div>
                        </div>
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
                        Final Price: ₹{selectedStage.final_price || 0}
                      </div>
                      <div className="small">
                        Markup: {selectedStage.markup_percentage || 25}%
                      </div>
                      <div className="x-small mt-2">
                        <div>Material: ₹{selectedStage.material_cost || 0}</div>
                        <div>Labour: ₹{selectedStage.labour_cost || 0}</div>
                        <div>Equipment: ₹{selectedStage.equipment_cost || 0}</div>
                        <div>Chemical: ₹{selectedStage.chemical_cost || 0}</div>
                        <div>Electricity: ₹{selectedStage.electricity_cost || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title small">
                        <FiShield className="me-1" />
                        Quality Metrics
                      </h6>
                      <div className="small mb-1">
                        Surface: {getFinishBadge(selectedStage.surface_finish)}
                      </div>
                      <div className="small mb-1">
                        Adhesion:{" "}
                        <span className="badge bg-info">
                          {selectedStage.adhesion_quality || "N/A"}
                        </span>
                      </div>
                      <div className="small mb-1">
                        Uniformity:{" "}
                        <span className="badge bg-warning">
                          {selectedStage.uniformity || "N/A"}
                        </span>
                      </div>
                      {selectedStage.rework_required && (
                        <div className="mt-2 small text-danger">
                          <FiAlertCircle className="me-1" /> Rework Required
                          {selectedStage.rework_reason && (
                            <div className="x-small">Reason: {selectedStage.rework_reason}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {(selectedStage.remarks || selectedStage.time_breakdown) && (
                <div className="card mb-4">
                  <div className="card-body">
                    {selectedStage.remarks && (
                      <div className="mb-3">
                        <h6 className="card-title small">Remarks</h6>
                        <p className="mb-0 small">{selectedStage.remarks}</p>
                      </div>
                    )}
                    {selectedStage.time_breakdown && (
                      <div>
                        <h6 className="card-title small">Time Breakdown</h6>
                        <p className="mb-0 small">{selectedStage.time_breakdown}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Files */}
              {selectedStage.files && selectedStage.files.length > 0 && (
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title small">
                      <FiDownload className="me-1" />
                      Files ({selectedStage.files.length})
                    </h6>
                    <div className="small">
                      Version: {selectedStage.file_version || "1.0"}
                      {selectedStage.file_revisions > 0 && (
                        <span className="ms-2">
                          Revisions: {selectedStage.file_revisions}
                        </span>
                      )}
                    </div>
                    <div className="x-small text-muted">
                      Status: {selectedStage.file_status || "draft"}
                    </div>
                    <div className="x-small text-muted">
                      Backup: {selectedStage.backup_location || "Not specified"}
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
                <FiLayers className="me-2" />
                Plating Stages
              </h2>
              <p className="text-muted mb-0">
                Total {platingStages.length} stages • Showing{" "}
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
                onClick={fetchPlatingStages}
                disabled={loading}
              >
                <FiRefreshCw size={14} className={loading ? "spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="row align-items-center">
            <div className="col-md-3 mb-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" size={14} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search job card, karigar, product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-2 mb-2">
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
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiDroplet className="text-muted" size={14} />
                </span>
                <select
                  className="form-select border-start-0"
                  value={materialFilter}
                  onChange={(e) => setMaterialFilter(e.target.value)}
                  disabled={loading}
                >
                  {materialOptions.map((option) => (
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
                <th className="small fw-bold">Karigar</th>
                <th className="small fw-bold">Material</th>
                <th className="small fw-bold">Plating Details</th>
                <th className="small fw-bold">Time</th>
                <th className="small fw-bold">Cost</th>
                <th className="small fw-bold">Status</th>
                <th className="small fw-bold">Next Stage</th>
                <th className="small fw-bold text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && platingStages.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-4">
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
                  <td colSpan="11" className="text-center py-4 text-muted">
                    {search ||
                    statusFilter !== "all" ||
                    materialFilter !== "all"
                      ? "No plating stages found for your search criteria"
                      : "No plating stages available"}
                  </td>
                </tr>
              ) : (
                currentStages.map((stage, index) => {
                  return (
                    <tr
                      key={stage._id}
                      className={
                        stage.status === "completed"
                          ? "table-success"
                          : stage.status === "rework" || stage.status === "hold"
                            ? "table-warning"
                            : stage.status === "quality_check"
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
                          <span>{stage.department || "PLATING"}</span>
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
                          {stage.plating_type
                            ? `Type: ${stage.plating_type}`
                            : ""}
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
                        <div>
                          {getMaterialBadge(stage.material_name)}
                          <div className="mt-1 x-small">
                            {stage.material_used_qty ? `${stage.material_used_qty} ${stage.material_unit}` : ""}
                          </div>
                          {stage.material_code && (
                            <div className="x-small text-muted">
                              {stage.material_code}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Plating Details Column */}
                      <td>
                        <div className="small">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="x-small text-muted">Type:</span>
                            <span className="fw-medium">
                              {stage.plating_type || "N/A"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span className="x-small text-muted">Thickness:</span>
                            <span className="fw-medium text-success">
                              {stage.plating_thickness || "N/A"}μm
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="x-small text-muted">Current:</span>
                            <span className="fw-medium text-warning">
                              {stage.current_density || "N/A"} A/dm²
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <FiClock size={10} className="text-muted" />
                          <div>
                            <div className="x-small text-muted">
                              Labour: {formatTime(stage.labour_hours)}
                            </div>
                            <div className="x-small fw-medium">
                              Actual: {formatTime(stage.actual_hours)}
                            </div>
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
                          <span className="x-small">
                            {getFinishBadge(stage.surface_finish)}
                          </span>
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
        <UpdatePlatingStage
          selectedStage={selectedStage}
          employees={employees}
          materials={materials}
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

export default PlatingStageTable;