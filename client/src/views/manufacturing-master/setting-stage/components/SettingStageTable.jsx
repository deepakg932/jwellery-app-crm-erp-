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
  FiAperture,
  FiHexagon,
  FiTarget,
  FiGrid,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiZap,
  FiScissors,
} from "react-icons/fi";
import useSettingStages from "@/hooks/useSettingStages";
import UpdateSettingStage from "./UpdateSettingStage";

const SettingStageTable = () => {
  const {
    settingStages,
    materials,
    stones,
    units,
    loading,
    error,
    fetchSettingStages,
    employees,
    updateSettingStageWithFiles,
  } = useSettingStages();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stoneFilter, setStoneFilter] = useState("all");
  const [settingTypeFilter, setSettingTypeFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const statusOptions = [
    { value: "not_started", label: "Not Started", color: "secondary", icon: "⏳" },
    { value: "stone_selection", label: "Stone Selection", color: "info", icon: "💎" },
    { value: "seat_preparation", label: "Seat Preparation", color: "info", icon: "🔨" },
    { value: "stone_setting", label: "Stone Setting", color: "warning", icon: "⚡" },
    { value: "prong_shaping", label: "Prong Shaping", color: "warning", icon: "🛡️" },
    { value: "bezel_setting", label: "Bezel Setting", color: "warning", icon: "🔲" },
    { value: "pave_setting", label: "Pave Setting", color: "warning", icon: "✨" },
    { value: "channel_setting", label: "Channel Setting", color: "warning", icon: "🛤️" },
    { value: "polishing", label: "Polishing", color: "info", icon: "💎" },
    { value: "quality_check", label: "Quality Check", color: "warning", icon: "🔍" },
    { value: "completed", label: "Completed", color: "success", icon: "✅" },
    { value: "hold", label: "On Hold", color: "danger", icon: "⏸️" },
    { value: "rework", label: "Rework", color: "danger", icon: "🔄" },
  ];

  const stoneOptions = [
    { value: "all", label: "All Stones", icon: "💎" },
    { value: "diamond", label: "Diamond", icon: "💎", color: "light" },
    { value: "ruby", label: "Ruby", icon: "🔴", color: "danger" },
    { value: "sapphire", label: "Sapphire", icon: "🔵", color: "primary" },
    { value: "emerald", label: "Emerald", icon: "🟢", color: "success" },
    { value: "pearl", label: "Pearl", icon: "⚪", color: "light" },
    { value: "gemstone", label: "Gemstone", icon: "💎", color: "warning" },
  ];

  const settingTypeOptions = [
    { value: "all", label: "All Setting Types", icon: "🔧" },
    { value: "prong", label: "Prong Setting", icon: "🛡️", color: "primary" },
    { value: "bezel", label: "Bezel Setting", icon: "🔲", color: "info" },
    { value: "pave", label: "Pave Setting", icon: "✨", color: "warning" },
    { value: "channel", label: "Channel Setting", icon: "🛤️", color: "success" },
    { value: "flush", label: "Flush Setting", icon: "⬜", color: "secondary" },
    { value: "tension", label: "Tension Setting", icon: "⚡", color: "danger" },
  ];

  // Load data on component mount
  useEffect(() => {
    fetchSettingStages();
  }, [fetchSettingStages]);

  // Filter stages
  const filteredStages = settingStages.filter((stage) => {
    const matchesSearch =
      search === "" ||
      (stage.job_card_no &&
        stage.job_card_no.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_name &&
        stage.assigned_name.toLowerCase().includes(search.toLowerCase())) ||
      (stage.design_type &&
        stage.design_type.toLowerCase().includes(search.toLowerCase())) ||
      (stage.stone_item_code &&
        stage.stone_item_code.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || stage.status === statusFilter;

    const matchesStone =
      stoneFilter === "all" || stage.stone_type === stoneFilter;

    const matchesSettingType =
      settingTypeFilter === "all" || stage.setting_type === settingTypeFilter;

    return matchesSearch && matchesStatus && matchesStone && matchesSettingType;
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

  // Get stone badge
  const getStoneBadge = (stoneType) => {
    const option = stoneOptions.find(opt => opt.value === stoneType) || {
      color: "secondary",
      label: stoneType || "N/A",
      icon: "💎"
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

  // Get setting type badge
  const getSettingTypeBadge = (settingType) => {
    const option = settingTypeOptions.find(opt => opt.value === settingType) || {
      color: "secondary",
      label: settingType || "N/A",
      icon: "🔧"
    };

    return (
      <span className={`badge bg-${option.color} text-white fw-semibold d-flex align-items-center gap-1 x-small`}>
        <span>{option.icon}</span>
        <span>{option.label}</span>
      </span>
    );
  };

  // Get precision badge
  const getPrecisionBadge = (precision) => {
    const precisionConfig = {
      high: { color: "success", icon: "🎯", label: "High" },
      medium: { color: "warning", icon: "🎯", label: "Medium" },
      low: { color: "secondary", icon: "🎯", label: "Low" },
    };

    const config = precisionConfig[precision] || {
      color: "secondary",
      icon: "🎯",
      label: precision || "Standard"
    };

    return (
      <span className={`badge bg-${config.color} text-white x-small`}>
        {config.icon} {config.label}
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

  // Calculate stone breakage percentage
  const calculateStoneBreakagePercent = (stage) => {
    const quantity = parseFloat(stage.stone_quantity) || 0;
    const breakage = parseFloat(stage.stone_breakage) || 0;
    
    if (quantity === 0) return 0;
    
    const percent = (breakage / quantity) * 100;
    return percent.toFixed(1);
  };

  // Calculate efficiency
  const calculateEfficiency = (stage) => {
    const labour = parseFloat(stage.labour_hours) || 0;
    const actual = parseFloat(stage.actual_hours) || 0;
    
    if (actual === 0) return 0;
    
    const efficiency = (labour / actual) * 100;
    return efficiency.toFixed(1);
  };

  // Calculate stone cost percentage
  const calculateStoneCostPercent = (stage) => {
    const total = parseFloat(stage.total_cost) || 0;
    const stone = parseFloat(stage.stone_cost_total) || 0;
    
    if (total === 0) return 0;
    
    const percent = (stone / total) * 100;
    return percent.toFixed(1);
  };

  // Handle update from modal
  const handleUpdateStage = async (stageId, updateData, filesToUpload) => {
    try {
      console.log("🔄 handleUpdateStage called for Setting:", {
        stageId,
        updateDataKeys: Object.keys(updateData),
        filesToUploadCount: filesToUpload?.length || 0,
      });

      const result = await updateSettingStageWithFiles(
        stageId,
        updateData,
        filesToUpload || [],
      );

      console.log("📊 Setting Update result:", result);

      if (result.success) {
        console.log("✅ Setting stage updated successfully");
        return true;
      } else {
        console.error("❌ Setting update failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error updating Setting stage:", error);
      return false;
    }
  };

  // Open update modal
  const handleOpenUpdate = (stage) => {
    console.log("📂 Opening Setting update modal for stage:", stage);
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
      "Assigned Setter",
      "Stone Type",
      "Stone Item Code",
      "Stone Quantity",
      "Stone Cost",
      "Stone Total Cost",
      "Stone Breakage",
      "Stone Breakage Reason",
      "Setting Type",
      "Setting Method",
      "Tool Used",
      "Precision Level",
      "Stone Secure",
      "Prong Count",
      "Bezel Thickness",
      "Labour Hours",
      "Actual Hours",
      "Setting Time",
      "Quality Check Time",
      "Total Time Spent",
      "Status",
      "Material Cost",
      "Labour Cost",
      "Tool Cost",
      "Other Costs",
      "Total Cost",
      "Final Price",
      "Markup %",
      "Cost Currency",
      "Cost Status",
      "Next Stage",
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
          stage.stone_type || "",
          stage.stone_item_code || "",
          stage.stone_quantity || "0",
          stage.stone_cost || "0",
          stage.stone_cost_total || "0",
          stage.stone_breakage || "0",
          stage.stone_breakage_reason || "",
          stage.setting_type || "",
          stage.setting_method || "",
          stage.tool_used || "",
          stage.precision_level || "",
          stage.stone_secure ? "Yes" : "No",
          stage.prong_count || "0",
          stage.bezel_thickness || "0",
          stage.labour_hours || "0",
          stage.actual_hours || "0",
          stage.setting_time || "0",
          stage.quality_check_time || "0",
          stage.total_time_spent || "0",
          stage.status || "",
          stage.material_cost || "0",
          stage.labour_cost || "0",
          stage.tool_cost || "0",
          stage.other_costs || "0",
          stage.total_cost || "0",
          stage.final_price || "0",
          stage.markup_percentage || "0",
          stage.cost_currency || "INR",
          stage.cost_status || "estimated",
          stage.next_stage || "",
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
      `setting-stages-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View Modal Component
  const ViewStageModal = () => {
    if (!selectedStage) return null;

    const stoneBreakagePercent = calculateStoneBreakagePercent(selectedStage);
    const efficiency = calculateEfficiency(selectedStage);
    const stoneCostPercent = calculateStoneCostPercent(selectedStage);

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
                  <FiAperture className="me-2" />
                  Stone Setting Stage Details
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
                          <h6 className="text-muted mb-1">Stone Breakage</h6>
                          <div className="d-flex align-items-center">
                            <h4 className="mb-0">{stoneBreakagePercent}%</h4>
                          </div>
                        </div>
                        <FiAlertCircle className="text-warning" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        {selectedStage.stone_breakage || 0} of {selectedStage.stone_quantity || 0} stones
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
                          <h6 className="text-muted mb-1">Total Cost</h6>
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
                          <h6 className="text-muted mb-1">Stone Cost</h6>
                          <div className="d-flex align-items-center gap-1">
                            <span className="badge bg-primary">
                              {stoneCostPercent}%
                            </span>
                          </div>
                        </div>
                        <FiAperture className="text-primary" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        ₹{selectedStage.stone_cost_total || 0}
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
                          <small className="text-muted">Assigned Setter</small>
                          <div className="fw-medium">
                            <FiUser size={12} className="me-1" />
                            {selectedStage.assigned_name || "Unassigned"}
                          </div>
                        </div>
                        <div className="col-6 mb-2">
                          <small className="text-muted">Department</small>
                          <div>{selectedStage.department || "SETTING"}</div>
                        </div>
                        <div className="col-6 mb-2">
                          <small className="text-muted">Setting Method</small>
                          <div className="badge bg-secondary">
                            {selectedStage.setting_method || "Manual"}
                          </div>
                        </div>
                        <div className="col-6 mb-2">
                          <small className="text-muted">Tool Used</small>
                          <div>{selectedStage.tool_used || "N/A"}</div>
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

              {/* Stone Details */}
              <div className="card mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 small fw-bold">Stone Details</h6>
                  {selectedStage.stone_type && (
                    <div>{getStoneBadge(selectedStage.stone_type)}</div>
                  )}
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Stone ID</small>
                        <div className="fw-medium">
                          {selectedStage.stone_id || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Stone Item Code</small>
                        <div className="fw-medium">
                          {selectedStage.stone_item_code || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Stone Type</small>
                        <div className="fw-medium">
                          {selectedStage.stone_type || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center p-2 border rounded">
                        <div className="fw-bold fs-4">{selectedStage.stone_quantity || 0}</div>
                        <small className="text-muted">Quantity</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-2 border rounded bg-light">
                        <div className="fw-bold fs-4 text-success">₹{selectedStage.stone_cost || 0}</div>
                        <small className="text-muted">Unit Cost</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-2 border rounded">
                        <div className="fw-bold fs-4">₹{selectedStage.stone_cost_total || 0}</div>
                        <small className="text-muted">Total Cost</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center p-2 border rounded">
                        <div className={`fw-bold fs-4 ${
                          parseFloat(selectedStage.stone_breakage || 0) > 0 ? 'text-danger' : 'text-success'
                        }`}>
                          {selectedStage.stone_breakage || 0}
                        </div>
                        <small className="text-muted">Breakage</small>
                      </div>
                    </div>
                  </div>
                  
                  {selectedStage.stone_breakage > 0 && (
                    <div className="mt-3 alert alert-warning py-2">
                      <FiAlertCircle className="me-1" />
                      <strong>Breakage Reason:</strong> {selectedStage.stone_breakage_reason || "Not specified"}
                    </div>
                  )}
                </div>
              </div>

              {/* Setting Details */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0 small fw-bold">Setting Details</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Setting Type</small>
                        <div>
                          {getSettingTypeBadge(selectedStage.setting_type)}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Precision Level</small>
                        <div>
                          {getPrecisionBadge(selectedStage.precision_level)}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Stone Secure</small>
                        <div>
                          <span className={`badge ${selectedStage.stone_secure ? 'bg-success' : 'bg-danger'}`}>
                            {selectedStage.stone_secure ? 'Secure' : 'Loose'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Prong Count</small>
                        <div className="fw-medium">
                          {selectedStage.prong_count || 0}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Bezel Thickness</small>
                        <div className="fw-medium">
                          {selectedStage.bezel_thickness || 0} mm
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <small className="text-muted">Setting Time</small>
                        <div className="fw-medium">
                          {selectedStage.setting_time || 0} hrs
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
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
                        <small className="text-muted">Tool Cost</small>
                        <div className="fw-medium">₹{selectedStage.tool_cost || 0}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Other Costs</small>
                        <div className="fw-medium">₹{selectedStage.other_costs || 0}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-2">
                        <small className="text-muted">Stone Cost</small>
                        <div className="fw-medium text-primary">₹{selectedStage.stone_cost_total || 0}</div>
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
                  
                  <div className="mt-3">
                    <small className="text-muted">Cost Status</small>
                    <div className="badge bg-warning">
                      {selectedStage.cost_status || "estimated"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Breakdown */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0 small fw-bold">Time Breakdown</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="text-center p-2 border rounded">
                        <div className="fw-bold fs-4">{selectedStage.setting_time || 0}</div>
                        <small className="text-muted">Setting Time (hrs)</small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-center p-2 border rounded bg-light">
                        <div className="fw-bold fs-4">{selectedStage.quality_check_time || 0}</div>
                        <small className="text-muted">Quality Check (hrs)</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row mt-3">
                    <div className="col-md-12">
                      <div className="mb-2">
                        <small className="text-muted">Time Breakdown Details</small>
                        <div className="fw-medium">{selectedStage.time_breakdown || "N/A"}</div>
                      </div>
                    </div>
                  </div>
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
                <FiAperture className="me-2" />
                Stone Setting Stages
              </h2>
              <p className="text-muted mb-0">
                Total {settingStages.length} stages • Showing{" "}
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
                onClick={fetchSettingStages}
                disabled={loading}
              >
                <FiRefreshCw size={14} className={loading ? "spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="row align-items-center">
            <div className="col-md-2 mb-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" size={14} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search job card, setter, stone..."
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
                  <FiAperture className="text-muted" size={14} />
                </span>
                <select
                  className="form-select border-start-0"
                  value={stoneFilter}
                  onChange={(e) => setStoneFilter(e.target.value)}
                  disabled={loading}
                >
                  {stoneOptions.map((option) => (
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
                  <FiTool className="text-muted" size={14} />
                </span>
                <select
                  className="form-select border-start-0"
                  value={settingTypeFilter}
                  onChange={(e) => setSettingTypeFilter(e.target.value)}
                  disabled={loading}
                >
                  {settingTypeOptions.map((option) => (
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

            <div className="col-md-2 mb-2">
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
                <th className="small fw-bold">Product</th>
                <th className="small fw-bold">Setter</th>
                <th className="small fw-bold">Stone Details</th>
                <th className="small fw-bold">Stone Tracking</th>
                <th className="small fw-bold">Setting Details</th>
                <th className="small fw-bold">Time</th>
                <th className="small fw-bold">Cost</th>
                <th className="small fw-bold">Status</th>
                <th className="small fw-bold text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && settingStages.length === 0 ? (
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
                    stoneFilter !== "all" ||
                    settingTypeFilter !== "all"
                      ? "No setting stages found for your search criteria"
                      : "No setting stages available"}
                  </td>
                </tr>
              ) : (
                currentStages.map((stage, index) => {
                  const stoneBreakagePercent = calculateStoneBreakagePercent(stage);
                  const efficiency = calculateEfficiency(stage);
                  const stoneCostPercent = calculateStoneCostPercent(stage);

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

                      <td>
                        <div className="fw-medium small">
                          <FiPackage size={10} className="me-1" />
                          {stage.design_type || "N/A"}
                        </div>
                        <div className="text-muted x-small">
                          {stage.stone_item_code && `Stone: ${stage.stone_item_code}`}
                        </div>
                      </td>

                      <td>
                        <div>
                          <div className="fw-medium small d-flex align-items-center">
                            <FiUser size={10} className="me-1" />
                            {stage.assigned_name || "Unassigned"}
                          </div>
                          <div className="text-muted x-small">
                            {stage.assigned_department || "SETTING"}
                          </div>
                        </div>
                      </td>

                      {/* Stone Details Column */}
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {getStoneBadge(stage.stone_type)}
                          <div className="x-small">
                            <div className="fw-medium">Code: {stage.stone_item_code || "N/A"}</div>
                            <div className="text-muted">Qty: {stage.stone_quantity || 0}</div>
                          </div>
                        </div>
                      </td>

                      {/* Stone Tracking Column */}
                      <td>
                        <div className="small">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="x-small text-muted">Unit Cost:</span>
                            <span className="fw-medium">
                              ₹{stage.stone_cost || 0}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span className="x-small text-muted">Total Cost:</span>
                            <span className="fw-medium text-primary">
                              ₹{stage.stone_cost_total || 0}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="x-small text-muted">Breakage:</span>
                            <span
                              className={`fw-medium ${
                                parseFloat(stage.stone_breakage || 0) > 0
                                  ? "text-danger"
                                  : "text-success"
                              }`}
                            >
                              {stage.stone_breakage || 0}
                            </span>
                          </div>
                          <div
                            className="progress mt-1"
                            style={{ height: "3px" }}
                          >
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${100 - Math.min(100, stoneBreakagePercent)}%`,
                              }}
                            ></div>
                            <div
                              className="progress-bar bg-danger"
                              style={{
                                width: `${Math.min(100, stoneBreakagePercent)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="x-small text-muted text-center">
                            {stoneBreakagePercent}% breakage
                          </div>
                        </div>
                      </td>

                      {/* Setting Details Column */}
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {getSettingTypeBadge(stage.setting_type)}
                          <div className="d-flex gap-1">
                            {getPrecisionBadge(stage.precision_level)}
                            <span className={`badge ${stage.stone_secure ? 'bg-success' : 'bg-danger'} x-small`}>
                              {stage.stone_secure ? 'Secure' : 'Loose'}
                            </span>
                          </div>
                          <div className="x-small text-muted">
                            {stage.setting_method || "Manual"}
                            {stage.prong_count ? ` • ${stage.prong_count} prongs` : ''}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center gap-1 mb-1">
                            <FiClock size={10} className="text-muted" />
                            <span className="small">
                              Setting: {stage.setting_time || 0} hrs
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
                          Stones: {stoneCostPercent}% of total
                        </div>
                      </td>

                      <td>
                        <div className="d-flex flex-column gap-1">
                          {getStatusBadge(stage.status)}
                          <div className="d-flex gap-1">
                            <span className="badge bg-secondary x-small">
                              {stage.cost_status || "estimated"}
                            </span>
                          </div>
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
        <UpdateSettingStage
          selectedStage={selectedStage}
          employees={employees}
          materials={materials}
          stones={stones}
          units={units}
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

export default SettingStageTable;