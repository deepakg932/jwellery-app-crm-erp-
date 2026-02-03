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
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiTag,
  FiDollarSign,
  FiCheck,
  FiX,
  FiFileText,
  FiCheckSquare,
} from "react-icons/fi";
import usePackagingStages from "@/hooks/usePackagingStages";
import UpdatePackagingStage from "./UpdatePackagingStage";

const PackagingStageTable = () => {
  const {
    packagingStages,
    packagingMaterials,
    loading,
    error,
    fetchPackagingStages,
    employees,
    updatePackagingStageWithFiles,
  } = usePackagingStages();

  console.log("Packaging Stages:", packagingStages);

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
    { value: "packaging", label: "Packaging", color: "warning", icon: "📦" },
    { value: "labeling", label: "Labeling", color: "info", icon: "🏷️" },
    { value: "quality_check", label: "Quality Check", color: "warning", icon: "🔍" },
    { value: "documentation", label: "Documentation", color: "info", icon: "📄" },
    { value: "completed", label: "Completed", color: "success", icon: "✅" },
    { value: "hold", label: "On Hold", color: "danger", icon: "⏸️" },
  ];

  const materialOptions = [
    { value: "all", label: "All Materials" },
    { value: "box", label: "Box", icon: "📦" },
    { value: "certificate", label: "Certificate", icon: "📃" },
    { value: "cotton", label: "Cotton", icon: "🧵" },
    { value: "additional", label: "Additional", icon: "➕" },
  ];

  // Load data on component mount
  useEffect(() => {
    fetchPackagingStages();
  }, [fetchPackagingStages]);

  // Filter stages
  const filteredStages = packagingStages.filter((stage) => {
    const matchesSearch =
      search === "" ||
      (stage.job_card_no &&
        stage.job_card_no.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_name &&
        stage.assigned_name.toLowerCase().includes(search.toLowerCase())) ||
      (stage.design_type &&
        stage.design_type.toLowerCase().includes(search.toLowerCase())) ||
      (stage.invoice_number &&
        stage.invoice_number.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || stage.status === statusFilter;

    const matchesMaterial =
      materialFilter === "all" ||
      (materialFilter === "box" && stage.box_used) ||
      (materialFilter === "certificate" && stage.certificate_used) ||
      (materialFilter === "cotton" && stage.cotton_used) ||
      (materialFilter === "additional" && (stage.additional_materials?.length > 0 || stage.materials_used?.length > 0));

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
      packaging: { color: "warning", label: "Packaging", icon: "📦" },
      labeling: { color: "info", label: "Labeling", icon: "🏷️" },
      quality_check: { color: "warning", label: "Quality Check", icon: "🔍" },
      documentation: { color: "info", label: "Documentation", icon: "📄" },
      completed: { color: "success", label: "Completed", icon: "✅" },
      hold: { color: "danger", label: "On Hold", icon: "⏸️" },
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

  // Get material badges
  const getMaterialBadges = (stage) => {
    const badges = [];
    
    if (stage.box_used) {
      badges.push(
        <span key="box" className="badge bg-warning me-1 small d-flex align-items-center gap-1">
          <FiBox size={10} /> Box {stage.box_quantity ? `(${stage.box_quantity})` : ''}
        </span>
      );
    }
    
    if (stage.certificate_used) {
      badges.push(
        <span key="certificate" className="badge bg-info me-1 small d-flex align-items-center gap-1">
          <FiTag size={10} /> Certificate {stage.certificate_quantity ? `(${stage.certificate_quantity})` : ''}
        </span>
      );
    }
    
    if (stage.cotton_used) {
      badges.push(
        <span key="cotton" className="badge bg-success me-1 small d-flex align-items-center gap-1">
          <FiPackage size={10} /> Cotton {stage.cotton_quantity ? `(${stage.cotton_quantity}g)` : ''}
        </span>
      );
    }
    
    if (stage.additional_materials?.length > 0 && stage.additional_materials[0]) {
      badges.push(
        <span key="additional" className="badge bg-secondary me-1 small">
          +{stage.additional_materials.length}
        </span>
      );
    }
    
    if (stage.materials_used?.length > 0 && stage.materials_used[0]) {
      badges.push(
        <span key="materials" className="badge bg-primary me-1 small">
          {stage.materials_used.length} items
        </span>
      );
    }
    
    return badges.length > 0 ? badges : <span className="text-muted small">No materials</span>;
  };

  // Handle update from modal
  const handleUpdateStage = async (stageId, updateData, filesToUpload) => {
    try {
      console.log("🔄 handleUpdateStage called for Packaging:", {
        stageId,
        updateDataKeys: Object.keys(updateData),
        filesToUploadCount: filesToUpload?.length || 0,
      });

      const result = await updatePackagingStageWithFiles(
        stageId,
        updateData,
        filesToUpload || [],
      );

      console.log("📊 Packaging Update result:", result);

      if (result.success) {
        console.log("✅ Packaging stage updated successfully");
        fetchPackagingStages(); // Refresh data
        return true;
      } else {
        console.error("❌ Packaging update failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error updating Packaging stage:", error);
      return false;
    }
  };

  // Open update modal
  const handleOpenUpdate = (stage) => {
    console.log("📦 Opening Packaging update modal for stage:", stage);
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
      "Invoice No",
      "Packer",
      "Materials Count",
      "Box Used",
      "Certificate Used",
      "Cotton Used",
      "Packaging Type",
      "Sealing Method",
      "Quality Score",
      "Weight After Packaging",
      "Barcode Generated",
      "Barcode Number",
      "Total Time",
      "Total Cost",
      "Final Price",
      "Status",
      "Start Date",
      "End Date",
      "Completed At",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredStages.map((stage) => {
        const materialCount = 
          (stage.box_used ? 1 : 0) +
          (stage.certificate_used ? 1 : 0) +
          (stage.cotton_used ? 1 : 0) +
          (stage.additional_materials?.length || 0) +
          (stage.materials_used?.length || 0);
        
        return [
          stage.job_card_no || "",
          stage.invoice_number || "",
          stage.assigned_name || "Unassigned",
          materialCount,
          stage.box_used ? "Yes" : "No",
          stage.certificate_used ? "Yes" : "No",
          stage.cotton_used ? "Yes" : "No",
          stage.packaging_type || "",
          stage.sealing_method || "",
          stage.quality_score || "0",
          stage.weight_after_packaging || "",
          stage.barcode_generated ? "Yes" : "No",
          stage.barcode_number || "",
          stage.total_time_spent || "0",
          stage.total_cost || "0",
          stage.final_price || "0",
          stage.status || "",
          formatDate(stage.start_date),
          formatDate(stage.end_date),
          formatDate(stage.completed_at),
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
      `packaging-stages-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View Modal Component
  const ViewStageModal = () => {
    if (!selectedStage) return null;

    // Calculate material count
    const materialCount = 
      (selectedStage.box_used ? 1 : 0) +
      (selectedStage.certificate_used ? 1 : 0) +
      (selectedStage.cotton_used ? 1 : 0) +
      (selectedStage.additional_materials?.length || 0) +
      (selectedStage.materials_used?.length || 0);

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
                <FiPackage className="me-2" />
                Packaging Stage - {selectedStage.job_card_no}
                {selectedStage.invoice_number && (
                  <span className="ms-2 badge bg-primary">
                    {selectedStage.invoice_number}
                  </span>
                )}
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
                      Job Card
                    </label>
                    <div className="fw-bold">
                      <FiPackage className="me-2" />
                      {selectedStage.job_card_no || "N/A"}
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
                      Packaging Type
                    </label>
                    <div className="badge bg-info">
                      {selectedStage.packaging_type?.toUpperCase() || "STANDARD"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Sealing Method
                    </label>
                    <div className="badge bg-secondary">
                      {selectedStage.sealing_method || "Not specified"}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Assigned Packer
                    </label>
                    <div className="fw-bold">
                      <FiUser className="me-2" />
                      {selectedStage.assigned_name || "Unassigned"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Department
                    </label>
                    <div>{selectedStage.assigned_department || "PACKAGING"}</div>
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
                  {selectedStage.barcode_number && (
                    <div className="mb-3">
                      <label className="form-label text-muted small">
                        Barcode
                      </label>
                      <div className="badge bg-success">
                        {selectedStage.barcode_number}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Materials Summary */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0 small fw-bold">
                    <FiBox className="me-2" />
                    Packaging Materials ({materialCount} items)
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {getMaterialBadges(selectedStage)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    {selectedStage.box_used && (
                      <div className="col-md-4 mb-2">
                        <div className="small">
                          <strong>Box:</strong> {selectedStage.box_type || "Standard"}
                          {selectedStage.box_quantity && (
                            <div className="x-small text-muted">
                              Quantity: {selectedStage.box_quantity}
                            </div>
                          )}
                          {selectedStage.box_cost && (
                            <div className="x-small text-muted">
                              Cost: ₹{selectedStage.box_cost}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedStage.certificate_used && (
                      <div className="col-md-4 mb-2">
                        <div className="small">
                          <strong>Certificate:</strong> {selectedStage.certificate_type || "Standard"}
                          {selectedStage.certificate_quantity && (
                            <div className="x-small text-muted">
                              Quantity: {selectedStage.certificate_quantity}
                            </div>
                          )}
                          {selectedStage.certificate_cost && (
                            <div className="x-small text-muted">
                              Cost: ₹{selectedStage.certificate_cost}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedStage.cotton_used && (
                      <div className="col-md-4 mb-2">
                        <div className="small">
                          <strong>Cotton:</strong> {selectedStage.cotton_quantity || "0"}g
                          {selectedStage.cotton_cost && (
                            <div className="x-small text-muted">
                              Cost: ₹{selectedStage.cotton_cost}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Additional Materials */}
                  {(selectedStage.additional_materials?.length > 0 && selectedStage.additional_materials[0]) && (
                    <div className="mt-3">
                      <div className="small fw-bold">Additional Materials:</div>
                      <div className="x-small">
                        {selectedStage.additional_materials.join(", ")}
                      </div>
                    </div>
                  )}
                  
                  {/* Materials Used */}
                  {(selectedStage.materials_used?.length > 0 && selectedStage.materials_used[0]) && (
                    <div className="mt-3">
                      <div className="small fw-bold">Materials Used:</div>
                      <div className="x-small">
                        {selectedStage.materials_used.join(", ")}
                      </div>
                    </div>
                  )}
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
                      <div className="fw-bold fs-5">
                        {formatTime(selectedStage.total_time_spent)}
                      </div>
                      <div className="small text-muted">
                        Total Time
                      </div>
                      <div className="x-small mt-2">
                        <div>Preparation: {formatTime(selectedStage.preparation_time)}</div>
                        <div>Packaging: {formatTime(selectedStage.packaging_time)}</div>
                        <div>Labeling: {formatTime(selectedStage.labeling_time)}</div>
                        <div>Quality: {formatTime(selectedStage.quality_time)}</div>
                        <div>Documentation: {formatTime(selectedStage.documentation_time)}</div>
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
                        Markup: {selectedStage.markup_percentage || 15}%
                      </div>
                      <div className="x-small mt-2">
                        <div>Material: ₹{selectedStage.material_cost || 0}</div>
                        <div>Labour: ₹{selectedStage.labour_cost || 0}</div>
                        <div>Equipment: ₹{selectedStage.equipment_cost || 0}</div>
                        <div>Other: ₹{selectedStage.other_costs || 0}</div>
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
                      <div className="d-flex align-items-center mb-2">
                        <div className={`fw-bold fs-4 ${
                          selectedStage.quality_score >= 95 ? 'text-success' :
                          selectedStage.quality_score >= 90 ? 'text-info' :
                          selectedStage.quality_score >= 85 ? 'text-warning' : 'text-danger'
                        }`}>
                          {selectedStage.quality_score || 0}%
                        </div>
                        <div className="ms-2">
                          {selectedStage.quality_check ? (
                            <FiCheckCircle className="text-success" />
                          ) : (
                            <FiAlertCircle className="text-warning" />
                          )}
                        </div>
                      </div>
                      <div className="small text-muted">
                        {selectedStage.quality_check ? "Quality Check Done" : "Pending"}
                      </div>
                      {selectedStage.quality_remarks && (
                        <div className="x-small mt-2">
                          Remarks: {selectedStage.quality_remarks}
                        </div>
                      )}
                      {selectedStage.weight_after_packaging && (
                        <div className="x-small mt-2">
                          <strong>Weight:</strong> {selectedStage.weight_after_packaging}g
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Surface Quality */}
              {(selectedStage.surface_finish || selectedStage.adhesion_quality || selectedStage.uniformity) && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title small">
                      <FiCheckSquare className="me-1" />
                      Surface Quality
                    </h6>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="small">
                          <strong>Finish:</strong> {selectedStage.surface_finish || "N/A"}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="small">
                          <strong>Adhesion:</strong> {selectedStage.adhesion_quality || "N/A"}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="small">
                          <strong>Uniformity:</strong> {selectedStage.uniformity || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Defects */}
              {(selectedStage.defects_detected?.length > 0 && selectedStage.defects_detected[0]) && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title small text-danger">
                      <FiAlertCircle className="me-1" />
                      Defects Detected
                    </h6>
                    <div className="x-small">
                      {selectedStage.defects_detected.join(", ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Time Breakdown */}
              {selectedStage.time_breakdown && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title small">
                      <FiFileText className="me-1" />
                      Time Breakdown
                    </h6>
                    <p className="mb-0 small">{selectedStage.time_breakdown}</p>
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
                className="btn btn-success btn-sm"
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
                <FiPackage className="me-2" />
                Packaging Stages
              </h2>
              <p className="text-muted mb-0">
                Total {packagingStages.length} stages • Showing{" "}
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
                className="btn btn-outline-success d-flex align-items-center gap-2 btn-sm"
                onClick={fetchPackagingStages}
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
                  placeholder="Search job card, packer, invoice..."
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
                  <FiBox className="text-muted" size={14} />
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
                <th className="small fw-bold">Invoice</th>
                <th className="small fw-bold">Packer</th>
                <th className="small fw-bold">Materials</th>
                <th className="small fw-bold">Time</th>
                <th className="small fw-bold">Cost</th>
                <th className="small fw-bold">Quality</th>
                <th className="small fw-bold">Status</th>
                <th className="small fw-bold text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && packagingStages.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div
                        className="spinner-border text-success"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredStages.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    {search ||
                    statusFilter !== "all" ||
                    materialFilter !== "all"
                      ? "No packaging stages found for your search criteria"
                      : "No packaging stages available"}
                  </td>
                </tr>
              ) : (
                currentStages.map((stage, index) => {
                  // Calculate material count
                  const materialCount = 
                    (stage.box_used ? 1 : 0) +
                    (stage.certificate_used ? 1 : 0) +
                    (stage.cotton_used ? 1 : 0) +
                    (stage.additional_materials?.length || 0) +
                    (stage.materials_used?.length || 0);

                  return (
                    <tr
                      key={stage._id}
                      className={
                        stage.status === "completed"
                          ? "table-success"
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
                        <div className="text-muted x-small">
                          {stage.department || "PACKAGING"}
                        </div>
                      </td>

                      <td>
                        <div className="fw-medium small">
                          {stage.invoice_number ? (
                            <span className="badge bg-primary small">
                              {stage.invoice_number}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </div>
                        <div className="text-muted x-small">
                          {stage.packaging_type || "Standard"}
                        </div>
                      </td>

                      <td>
                        <div>
                          <div className="fw-medium small d-flex align-items-center">
                            <FiUser size={10} className="me-1" />
                            {stage.assigned_name || "Unassigned"}
                          </div>
                          <div className="text-muted x-small">
                            {stage.assigned_department || "PACKAGING"}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {getMaterialBadges(stage)}
                        </div>
                        <div className="x-small text-muted mt-1">
                          {materialCount} materials
                        </div>
                      </td>

                      {/* Time Column */}
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <FiClock size={10} className="text-muted" />
                          <div>
                            <div className="x-small fw-medium">
                              {formatTime(stage.total_time_spent)}
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
                        <div className="d-flex align-items-center gap-1">
                          <span className={`badge ${
                            stage.quality_score >= 95 ? 'bg-success' :
                            stage.quality_score >= 90 ? 'bg-info' :
                            stage.quality_score >= 85 ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {stage.quality_score || 0}%
                          </span>
                          {stage.quality_check ? (
                            <FiCheckCircle size={12} className="text-success" />
                          ) : (
                            <FiAlertCircle size={12} className="text-warning" />
                          )}
                          {stage.barcode_generated && (
                            <FiTag size={12} className="text-info ms-1" title="Barcode Generated" />
                          )}
                        </div>
                      </td>

                      <td>
                        {getStatusBadge(stage.status)}
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
                            className="btn btn-sm btn-outline-success d-flex align-items-center"
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
                          ? "btn-success"
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
        <UpdatePackagingStage
          selectedStage={selectedStage}
          employees={employees}
          packagingMaterials={packagingMaterials}
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

export default PackagingStageTable;