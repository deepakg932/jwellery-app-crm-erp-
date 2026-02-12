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
  FiDroplet,
  FiTool,
  FiShield,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiXCircle,
  FiPlay,
  FiPause,
} from "react-icons/fi";
import useCastingStages from "@/hooks/useCastingStages";
import UpdateCastingStage from "./UpdateCastingStage";

const CastingStageTable = () => {
  const {
    castingStages,
    materials,
    units,
    loading,
    laborCosts,
    error,
    fetchCastingStages,
    stockMovements,
    availableMaterials,
    getPurityOptions,
    employees,
    updateCastingStageWithFiles,
  } = useCastingStages();

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
    { value: "material_preparation", label: "Material Preparation", color: "info", icon: "⚗️" },
    { value: "mold_making", label: "Mold Making", color: "info", icon: "🫧" },
    { value: "burnout", label: "Burnout", color: "warning", icon: "🔥" },
    { value: "casting", label: "Casting", color: "warning", icon: "🌡️" },
    { value: "cooling", label: "Cooling", color: "info", icon: "❄️" },
    { value: "devesting", label: "Devesting", color: "info", icon: "🔨" },
    { value: "quality_check", label: "Quality Check", color: "warning", icon: "🔍" },
    { value: "completed", label: "Completed", color: "success", icon: "✅" },
    { value: "hold", label: "On Hold", color: "danger", icon: "⏸️" },
    { value: "rework", label: "Rework", color: "danger", icon: "🔄" },
  ];

  const materialOptions = [
    { value: "all", label: "All Materials" },
    { value: "gold", label: "Gold", color: "warning", icon: "💰" },
    { value: "silver", label: "Silver", color: "secondary", icon: "⚪" },
    { value: "platinum", label: "Platinum", color: "light", icon: "🔘" },
    { value: "palladium", label: "Palladium", color: "dark", icon: "⚫" },
    { value: "brass", label: "Brass", color: "info", icon: "🟡" },
    { value: "bronze", label: "Bronze", color: "warning", icon: "🟤" },
  ];

  // Load data on component mount
  useEffect(() => {
    fetchCastingStages();
  }, [fetchCastingStages]);

  // Filter stages
  const filteredStages = castingStages.filter((stage) => {
    const matchesSearch =
      search === "" ||
      (stage.job_card_no &&
        stage.job_card_no.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_name &&
        stage.assigned_name.toLowerCase().includes(search.toLowerCase())) ||
      (stage.design_type &&
        stage.design_type.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || stage.status === statusFilter;

    const matchesMaterial =
      materialFilter === "all" || stage.material_type === materialFilter;

    return matchesSearch && matchesStatus && matchesMaterial;
  });

  // Calculate pagination
  const totalItems = filteredStages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStages = filteredStages.slice(indexOfFirstItem, indexOfLastItem);

  console.log(currentStages)

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

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const option = statusOptions.find(opt => opt.value === status) || {
      color: "secondary",
      label: status,
      icon: "⚙️"
    };

    return (
      <span className={`badge bg-${option.color} text-white fw-semibold d-flex align-items-center gap-1`}>
        <span>{option.icon}</span>
        <span>{option.label}</span>
      </span>
    );
  };

  // Get material badge
  const getMaterialBadge = (materialType) => {
    const option = materialOptions.find(opt => opt.value === materialType) || {
      color: "secondary",
      label: materialType || "N/A",
      icon: "⚙️"
    };

    return (
      <span
        className={`badge bg-${option.color} ${option.color === 'light' ? 'text-dark' : 'text-white'} fw-semibold d-flex align-items-center gap-1`}
      >
        <span>{option.icon}</span>
        <span>{option.label.toUpperCase()}</span>
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { color: "danger", icon: "🔴", label: "High" },
      medium: { color: "warning", icon: "🟡", label: "Medium" },
      low: { color: "success", icon: "🟢", label: "Low" },
      urgent: { color: "danger", icon: "🚨", label: "Urgent" },
    };

    const config = priorityConfig[priority] || {
      color: "secondary",
      icon: "⚪",
      label: priority || "Medium"
    };

    return (
      <span className={`badge bg-${config.color} text-white x-small`}>
        {config.icon} {config.label}
      </span>
    );
  };

  // Calculate material usage percentage
  const calculateMaterialUsage = (stage) => {
    const issued = parseFloat(stage.material_issued_qty) || 0;
    const used = parseFloat(stage.material_used_qty) || 0;
    
    if (issued === 0) return { percent: 0, used, issued };
    
    const percent = (used / issued) * 100;
    return { 
      percent: percent.toFixed(1), 
      used, 
      issued,
      wastage: parseFloat(stage.material_wastage_qty) || 0,
      returned: parseFloat(stage.material_returned_qty) || 0
    };
  };

  // Calculate efficiency
  const calculateEfficiency = (stage) => {
    const labour = parseFloat(stage.labour_hours) || 0;
    const actual = parseFloat(stage.actual_hours) || 0;
    
    if (actual === 0) return 0;
    
    const efficiency = (labour / actual) * 100;
    return efficiency.toFixed(1);
  };

  // Handle update from modal
  const handleUpdateStage = async (stageId, updateData, filesToUpload) => {
    try {
      console.log("🔄 handleUpdateStage called for Casting:", {
        stageId,
        updateDataKeys: Object.keys(updateData),
        filesToUploadCount: filesToUpload?.length || 0,
      });

      const result = await updateCastingStageWithFiles(
        stageId,
        updateData,
        filesToUpload || [],
      );

      console.log("📊 Casting Update result:", result);

      if (result.success) {
        console.log("✅ Casting stage updated successfully");
        return true;
      } else {
        console.error("❌ Casting update failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error updating Casting stage:", error);
      return false;
    }
  };

  // Open update modal
  const handleOpenUpdate = (stage) => {
    console.log("📂 Opening Casting update modal for stage:", stage);
    setSelectedStage(stage);
    setShowUpdateModal(true);
  };

  // Close update modal
  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setSelectedStage(null);
  };

  // View details
  const handleViewDetails = (stage) => {
    setSelectedStage(stage);
    setShowViewModal(true);
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = [
      "Job Card No",
      "Product",
      "Assigned Karigar",
      "Material Type",
      "Purity",
      "Issued (g)",
      "Used (g)",
      "Returned (g)",
      "Wastage (g)",
      "Wastage Type",
      "Casting Method",
      "Status",
      "Labour Hours",
      "Actual Hours",
      "Total Time",
      "Surface Quality",
      "Porosity Level",
      "Rework Required",
      "Material Cost",
      "Labour Cost",
      "Total Cost",
      "Final Price",
      "Markup %",
      "Start Date",
      "End Date",
      "Completed At",
      "Priority",
      "Remarks",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredStages.map((stage) =>
        [
          stage.job_card_no || "",
          stage.design_type || "",
          stage.assigned_name || "",
          stage.material_type || "",
          stage.purity || "",
          stage.material_issued_qty || "0",
          stage.material_used_qty || "0",
          stage.material_returned_qty || "0",
          stage.material_wastage_qty || "0",
          stage.material_wastage_type || "",
          stage.casting_method || "",
          stage.status || "",
          stage.labour_hours || "0",
          stage.actual_hours || "0",
          stage.total_time_spent || "0",
          stage.surface_quality || "",
          stage.porosity_level || "",
          stage.rework_required ? "Yes" : "No",
          stage.material_cost || "0",
          stage.labour_cost || "0",
          stage.total_cost || "0",
          stage.final_price || "0",
          stage.markup_percentage || "0",
          formatDate(stage.start_date),
          formatDate(stage.end_date),
          formatDate(stage.completed_at),
          stage.priority || "",
          `"${(stage.remarks || "").replace(/"/g, '""')}"`,
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
      `casting-stages-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View Modal Component
  const ViewStageModal = () => {
    if (!selectedStage) return null;

    const materialUsage = calculateMaterialUsage(selectedStage);
    const efficiency = calculateEfficiency(selectedStage);

    return (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxHeight: "90vh", margin: "20px auto" }}>
          <div className="modal-content rounded-3" style={{ maxHeight: "85vh" }}>
            <div className="modal-header border-bottom pb-3 sticky-top bg-white">
              <div>
                <h5 className="modal-title fw-bold fs-5 mb-1">
                  <FiTool className="me-2" />
                  Casting Stage Details
                </h5>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="badge bg-primary">
                    {selectedStage.job_card_no}
                  </span>
                  {getStatusBadge(selectedStage.status)}
                  {selectedStage.priority && (
                    <span className="badge bg-danger">
                      {selectedStage.priority.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStage(null);
                }}
              ></button>
            </div>

            <div className="modal-body" style={{ overflowY: "auto" }}>
              {/* Summary Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Material Usage</h6>
                          <div className="d-flex align-items-center">
                            <h4 className="mb-0">{materialUsage.percent}%</h4>
                          </div>
                        </div>
                        <FiDroplet className="text-warning" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        {materialUsage.used}g / {materialUsage.issued}g
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Time Efficiency</h6>
                          <div className="d-flex align-items-center">
                            <h4 className="mb-0">{efficiency}%</h4>
                          </div>
                        </div>
                        <FiClock className="text-info" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        {selectedStage.actual_hours || 0} hrs spent
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Cost</h6>
                          <h4 className="mb-0">₹{selectedStage.total_cost || 0}</h4>
                        </div>
                        <FiTrendingUp className="text-success" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Final: ₹{selectedStage.final_price || 0}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Quality</h6>
                          <div className="d-flex align-items-center gap-1">
                            <span className={`badge ${
                              selectedStage.surface_quality === 'excellent' ? 'bg-success' :
                              selectedStage.surface_quality === 'good' ? 'bg-info' :
                              selectedStage.surface_quality === 'average' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {selectedStage.surface_quality || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <FiShield className="text-success" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Porosity: {selectedStage.porosity_level || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 small fw-bold">Basic Information</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-6 mb-2">
                          <small className="text-muted">Product</small>
                          <div className="fw-medium">
                            <FiPackage size={12} className="me-1" />
                            {selectedStage.design_type || "N/A"}
                          </div>
                        </div>
                        <div className="col-6 mb-2">
                          <small className="text-muted">Assigned Karigar</small>
                          <div className="fw-medium">
                            <FiUser size={12} className="me-1" />
                            {selectedStage.assigned_name || "Unassigned"}
                          </div>
                        </div>
                        <div className="col-6 mb-2">
                          <small className="text-muted">Department</small>
                          <div>{selectedStage.department || "CASTING"}</div>
                        </div>
                        <div className="col-6 mb-2">
                          <small className="text-muted">Casting Method</small>
                          <div>{selectedStage.casting_method || "N/A"}</div>
                        </div>
                        <div className="col-6 mb-2">
                          <small className="text-muted">Mold Type</small>
                          <div>{selectedStage.mold_type || "N/A"}</div>
                        </div>
                        <div className="col-6 mb-2">
                          <small className="text-muted">Next Stage</small>
                          <div className="badge bg-info">
                            {selectedStage.next_stage || "Not set"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 small fw-bold">Timeline</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-6 mb-2">
                          <small className="text-muted">Start Date</small>
                          <div className="fw-medium">
                            <FiCalendar size={12} className="me-1" />
                            {formatDate(selectedStage.start_date)}
                          </div>
                        </div>
                        <div className="col-6 mb-2">
                          <small className="text-muted">End Date</small>
                          <div>
                            {selectedStage.end_date ? formatDate(selectedStage.end_date) : "Not set"}
                          </div>
                        </div>
                        {selectedStage.completed_at && (
                          <div className="col-12 mb-2">
                            <small className="text-muted">Completed At</small>
                            <div className="text-success">
                              {formatDate(selectedStage.completed_at)} {formatTime(selectedStage.completed_at)}
                            </div>
                          </div>
                        )}
                        <div className="col-6 mb-2">
                          <small className="text-muted">Labour Hours</small>
                          <div className="fw-medium">
                            {selectedStage.labour_hours || 0} hrs
                          </div>
                        </div>
                        <div className="col-6 mb-2">
                          <small className="text-muted">Actual Hours</small>
                          <div className="fw-medium">
                            {selectedStage.actual_hours || 0} hrs
                          </div>
                        </div>
                        <div className="col-12 mb-2">
                          <small className="text-muted">Total Time Spent</small>
                          <div className="fw-bold">
                            {selectedStage.total_time_spent || 0} hrs
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Material Details */}
              <div className="card mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 small fw-bold">Material Details</h6>
                  {selectedStage.material_type && (
                    <div>{getMaterialBadge(selectedStage.material_type)}</div>
                  )}
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Material Type</small>
                        <div className="fw-medium">
                          {selectedStage.material_type || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Purity</small>
                        <div className="fw-medium">
                          {selectedStage.purity || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Material Code</small>
                        <div className="fw-medium">
                          {selectedStage.material_code || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center p-2 border rounded">
                        <div className="fw-bold fs-4">{selectedStage.material_issued_qty || 0}</div>
                        <small className="text-muted">Issued (g)</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-2 border rounded bg-light">
                        <div className="fw-bold fs-4 text-success">{selectedStage.material_used_qty || 0}</div>
                        <small className="text-muted">Used (g)</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-2 border rounded">
                        <div className="fw-bold fs-4 text-info">{selectedStage.material_returned_qty || 0}</div>
                        <small className="text-muted">Returned (g)</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-2 border rounded">
                        <div className={`fw-bold fs-4 ${
                          parseFloat(selectedStage.material_wastage_qty || 0) > 5 ? 'text-danger' : 'text-warning'
                        }`}>
                          {selectedStage.material_wastage_qty || 0}
                        </div>
                        <small className="text-muted">Wastage (g)</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="progress" style={{ height: "20px" }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${Math.min(100, materialUsage.percent)}%` }}
                      >
                        Used ({materialUsage.percent}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Details */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0 small fw-bold">Cost Breakdown</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Material Cost</small>
                        <div className="fw-medium">₹{selectedStage.material_cost || 0}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Labour Cost</small>
                        <div className="fw-medium">₹{selectedStage.labour_cost || 0}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Equipment Cost</small>
                        <div className="fw-medium">₹{selectedStage.equipment_cost || 0}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Consumables</small>
                        <div className="fw-medium">₹{selectedStage.consumables_cost || 0}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Gas Cost</small>
                        <div className="fw-medium">₹{selectedStage.gas_cost || 0}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Other Costs</small>
                        <div className="fw-medium">₹{selectedStage.other_costs || 0}</div>
                      </div>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <small className="text-muted">Total Cost</small>
                        <div className="fw-bold fs-5">₹{selectedStage.total_cost || 0}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <small className="text-muted">Markup ({selectedStage.markup_percentage || 0}%)</small>
                        <div className="fw-bold fs-5 text-success">₹{selectedStage.final_price || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Details */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0 small fw-bold">Quality Metrics</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Surface Quality</small>
                        <div>
                          <span className={`badge ${
                            selectedStage.surface_quality === 'excellent' ? 'bg-success' :
                            selectedStage.surface_quality === 'good' ? 'bg-info' :
                            selectedStage.surface_quality === 'average' ? 'bg-warning' : 'bg-secondary'
                          }`}>
                            {selectedStage.surface_quality || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Dimensional Accuracy</small>
                        <div>
                          <span className={`badge ${
                            selectedStage.dimensional_accuracy === 'within_tolerance' ? 'bg-success' :
                            selectedStage.dimensional_accuracy === 'slight_deviation' ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {selectedStage.dimensional_accuracy || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Porosity Level</small>
                        <div>
                          <span className={`badge ${
                            selectedStage.porosity_level === 'none' ? 'bg-success' :
                            selectedStage.porosity_level === 'low' ? 'bg-info' :
                            selectedStage.porosity_level === 'medium' ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {selectedStage.porosity_level || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedStage.rework_required && (
                    <div className="alert alert-danger py-2">
                      <FiAlertCircle className="me-1" /> 
                      <strong>Rework Required:</strong> {selectedStage.rework_reason || "No reason specified"}
                    </div>
                  )}
                  
                  {selectedStage.defects && (
                    <div>
                      <small className="text-muted">Defects Description</small>
                      <p className="mb-0 small">{selectedStage.defects}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks */}
              {selectedStage.remarks && (
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 small fw-bold">Remarks</h6>
                  </div>
                  <div className="card-body">
                    <p className="mb-0 small">{selectedStage.remarks}</p>
                  </div>
                </div>
              )}

              {/* Files */}
              {selectedStage.files && selectedStage.files.length > 0 && (
                <div className="card">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 small fw-bold">Files ({selectedStage.files.length})</h6>
                    <span className="badge bg-info">
                      Version: {selectedStage.file_version || "1.0"}
                    </span>
                  </div>
                  <div className="card-body p-2">
                    <div className="list-group list-group-flush">
                      {selectedStage.files.map((file, index) => (
                        <div
                          key={file._id || file.id || index}
                          className="list-group-item d-flex justify-content-between align-items-center py-2 px-3"
                        >
                          <div className="d-flex align-items-center">
                            <span className="me-3">
                              {file.name?.includes('.jpg') || file.name?.includes('.png') || file.name?.includes('.jpeg') ? '📷' :
                               file.name?.includes('.mp4') || file.name?.includes('.avi') || file.name?.includes('.mov') ? '🎥' :
                               file.name?.includes('.pdf') ? '📄' :
                               file.name?.includes('.stl') || file.name?.includes('.step') || file.name?.includes('.3dm') ? '🖨️' : '📎'}
                            </span>
                            <div>
                              <div className="fw-medium small text-truncate" style={{ maxWidth: '300px' }}>
                                {file.name || `File ${index + 1}`}
                              </div>
                              <div className="text-muted x-small">
                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                                {file.category ? ` • ${file.category}` : ''}
                                {file.uploadDate ? ` • ${formatDate(file.uploadDate)}` : ''}
                              </div>
                            </div>
                          </div>
                          <div>
                            {file.url && (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                <FiDownload size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
                <FiEdit2 className="me-1" size={14} /> Update
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
                <FiTool className="me-2" />
                Casting Stages
              </h2>
              <p className="text-muted mb-0">
                Total {castingStages.length} stages • Showing{" "}
                {filteredStages.length} filtered
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
                onClick={fetchCastingStages}
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
                      {option.icon} {option.label}
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
                      {option.icon} {option.label}
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

            <div className="col-md-3 mb-2">
              <div className="text-end">
                <span className="text-muted small">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
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
                <th className="small fw-bold text-center">#</th>
                <th className="small fw-bold">Job Card</th>
                {/* <th className="small fw-bold">Product</th> */}
                <th className="small fw-bold">Karigar</th>
                <th className="small fw-bold">Material</th>
                <th className="small fw-bold">Material Balance</th>
                <th className="small fw-bold">Time</th>
                <th className="small fw-bold">Cost</th>
                <th className="small fw-bold">Status</th>
                <th className="small fw-bold">Next Stage</th>
                <th className="small fw-bold text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && castingStages.length === 0 ? (
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
                      ? "No casting stages found for your search criteria"
                      : "No casting stages available"}
                  </td>
                </tr>
              ) : (
                currentStages.map((stage, index) => {
                  const materialUsage = calculateMaterialUsage(stage);
                  const efficiency = calculateEfficiency(stage);

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
                      <td className="fw-medium small text-center">
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td>
                        <div className="fw-medium small">
                          {stage.job_card_no || "N/A"}
                        </div>
                        <div className="text-muted x-small">
                          {getPriorityBadge(stage.priority)}
                          {stage.job_card?.stage && (
                            <span className="ms-1">
                              • Stage: {stage.job_card.stage}
                            </span>
                          )}
                        </div>
                      </td>
{/* 
                      <td>
                        <div className="fw-medium small">
                          <FiPackage size={10} className="me-1" />
                          {stage.design_type || "N/A"}
                        </div>
                        <div className="text-muted x-small">
                          {stage.casting_method && `Method: ${stage.casting_method}`}
                          {stage.mold_type && ` • Mold: ${stage.mold_type}`}
                        </div>
                      </td> */}

                      <td>
                        <div>
                          <div className="fw-medium small d-flex align-items-center">
                            <FiUser size={10} className="me-1" />
                            {stage.assigned_name || "Unassigned"}
                          </div>
                          <div className="text-muted x-small">
                            {stage.assigned_department || "CASTING"}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex flex-column gap-1">
                          {getMaterialBadge(stage.material_type)}
                          {stage.purity && (
                            <span className="badge bg-light text-dark x-small">
                              {stage.purity}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Material Balance Column */}
                      <td>
                        <div className="small">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="x-small text-muted">Issued:</span>
                            <span className="fw-medium">
                              {stage.material_issued_qty || 0}
                            </span>
                             <span className="fw-medium ">
                              {stage.material_unit}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span className="x-small text-muted">Used:</span>
                            <span className="fw-medium  text-success">
                              {stage.material_used_qty || 0}
                            </span>
                             <span className="fw-medium  text-success">
                              {stage.material_unit}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="x-small text-muted">Returned:</span>
                            <span className="fw-medium text-info">
                              {stage.material_returned_qty || 0}
                            </span>
                             <span className="fw-medium  text-success">
                              {stage.material_unit}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="x-small text-muted">Wastage:</span>
                            <span
                              className={`fw-medium ${
                                parseFloat(stage.material_wastage_qty || 0) > 5
                                  ? "text-danger"
                                  : "text-warning"
                              }`}
                            >
                              {stage.material_wastage_qty || 0}
                            </span>
                             <span className="fw-medium  text-success">
                              {stage.material_unit}
                            </span>
                          </div>
                          <div
                            className="progress mt-1"
                            style={{ height: "3px" }}
                          >
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${Math.min(100, materialUsage.percent)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="x-small text-muted text-center">
                            {materialUsage.percent}% usage
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center gap-1 mb-1">
                            <FiClock size={10} className="text-muted" />
                            <span className="small">
                              Labour: {stage.labour_hours || 0} hrs
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <span className={`small ${efficiency >= 100 ? 'text-success' : 'text-warning'}`}>
                              Efficiency: {efficiency}%
                            </span>
                          </div>
                          {stage.total_time_spent > 0 && (
                            <div className="x-small text-muted">
                              Total: {stage.total_time_spent} hrs
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="fw-medium small">
                          ₹{stage.total_cost || 0}
                        </div>
                        <div className="text-success x-small">
                          Final: ₹{stage.final_price || 0}
                        </div>
                        <div className="x-small text-muted">
                          Markup: {stage.markup_percentage || 0}%
                        </div>
                      </td>

                      <td>
                        <div className="d-flex flex-column gap-1">
                          {getStatusBadge(stage.status)}
                          <div className="d-flex gap-1">
                            <span
                              className={`badge ${
                                stage.surface_quality === "excellent"
                                  ? "bg-success"
                                  : stage.surface_quality === "good"
                                    ? "bg-info"
                                    : stage.surface_quality === "average"
                                      ? "bg-warning"
                                      : "bg-secondary"
                              } x-small`}
                            >
                              Q: {stage.surface_quality?.charAt(0) || "N"}
                            </span>
                            {stage.rework_required && (
                              <span className="badge bg-danger x-small">
                                Rework
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="badge bg-info">
                          {stage.next_stage || "Not set"}
                        </div>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center"
                            onClick={() => handleViewDetails(stage)}
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
        <UpdateCastingStage
          selectedStage={selectedStage}
          employees={employees}
          materials={materials}
          units={units}
          availableMaterials={availableMaterials}
          stockMovements={stockMovements}
          laborCosts={laborCosts}
          onUpdate={handleUpdateStage}
          onClose={handleCloseUpdate}
          loading={loading}
          getPurityOptions={getPurityOptions}
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
        .table td, .table th {
          vertical-align: middle;
        }
        .progress-bar {
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default CastingStageTable;