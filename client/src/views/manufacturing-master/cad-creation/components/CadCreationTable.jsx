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
    laborCosts,
    employees,
    updateCadStageWithFiles,
    updateCadStageSimple, // For testing
  } = useCadStages();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  console.log(cadStages);
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
      (stage.stage_name &&
        stage.stage_name.toLowerCase().includes(search.toLowerCase())) ||
      (stage.job_card_no &&
        stage.job_card_no.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_name &&
        stage.assigned_name.toLowerCase().includes(search.toLowerCase())) ||
      (stage.design_type &&
        stage.design_type.toLowerCase().includes(search.toLowerCase())) ||
      (stage.assigned_department &&
        stage.assigned_department.toLowerCase().includes(search.toLowerCase()));

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
        filesToUploadCount: filesToUpload?.length || 0,
      });

      // Method 1: Full update with files
      const result = await updateCadStageWithFiles(
        stageId,
        updateData,
        filesToUpload || [],
      );

      console.log("📊 CAD Update result:", result);

      // Return the result object as-is (with success property)
      return result; // ← JUST RETURN THE RESULT OBJECT
    } catch (error) {
      console.error("Error updating CAD stage:", error);
      return {
        success: false,
        error: error.message || "An error occurred",
      };
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
      "Created At",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredStages.map((stage) =>
        [
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
          formatDate(stage.created_at),
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
      `cad-stages-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View Modal Component
  const ViewStageModal = () => {
    if (!selectedStage) return null;

    // Helper function to get cost breakdown from raw data
    const getLaborBreakdown = () => {
      if (
        selectedStage.labor_cost_breakdown &&
        Array.isArray(selectedStage.labor_cost_breakdown)
      ) {
        return selectedStage.labor_cost_breakdown;
      }

      if (
        selectedStage.labor_cost_breakdown_raw &&
        Array.isArray(selectedStage.labor_cost_breakdown_raw)
      ) {
        try {
          // Parse the stringified JSON if needed
          const parsed = JSON.parse(
            selectedStage.labor_cost_breakdown_raw[0] || "[]",
          );
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error("Error parsing labor breakdown:", e);
          return [];
        }
      }

      return [];
    };

    // Get selected labor cost IDs
    const selectedLaborIds = selectedStage.selected_labor_costs || [];

    // Calculate efficiency
    const efficiency =
      selectedStage.estimated_hours && selectedStage.total_time_spent
        ? (
            (selectedStage.estimated_hours / selectedStage.total_time_spent) *
            100
          ).toFixed(1)
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
              <div>
                <h5 className="modal-title fw-bold fs-5 mb-1">
                  CAD Creation - {selectedStage.job_card_no || "N/A"}
                </h5>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="badge bg-primary">
                    <FiBox className="me-1" /> Department: CAD
                  </span>
                  {selectedStage.cad_software && (
                    <span className="badge bg-info">
                      <FiPackage className="me-1" />{" "}
                      {selectedStage.cad_software}
                    </span>
                  )}
                  <span className="badge bg-secondary">
                    Version: v{selectedStage.file_version || "1.0"}
                  </span>
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

            <div className="modal-body">
              {/* Basic Info Section */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3 border-bottom pb-2">
                    Basic Information
                  </h6>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Job Card No
                    </label>
                    <div className="fw-bold">
                      {selectedStage.job_card_no || "N/A"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Assigned To
                    </label>
                    <div className="fw-bold d-flex align-items-center">
                      <FiUser className="me-2" />
                      {selectedStage.assigned_name || "Unassigned"}
                      {selectedStage.assigned_to?.email && (
                        <span className="ms-2 text-muted small">
                          ({selectedStage.assigned_to.email})
                        </span>
                      )}
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
                      CAD Software
                    </label>
                    <div>{selectedStage.cad_software || "N/A"}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Complexity Level
                    </label>
                    <div>{selectedStage.complexity_level || "N/A"}</div>
                  </div>
                </div>

                <div className="col-md-6">
                  <h6 className="fw-bold mb-3 border-bottom pb-2">
                    Dates & Time
                  </h6>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Start Date
                    </label>
                    <div className="fw-bold d-flex align-items-center">
                      <FiCalendar className="me-2" />
                      {formatDate(selectedStage.start_date)}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      End Date
                    </label>
                    <div className="fw-bold d-flex align-items-center">
                      <FiCalendar className="me-2" />
                      {formatDate(selectedStage.end_date) || "Not set"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Completed At
                    </label>
                    <div className="fw-bold">
                      {formatDate(selectedStage.completed_at) ||
                        "Not completed"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Created At
                    </label>
                    <div>{formatDate(selectedStage.createdAt)}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">
                      Last Updated
                    </label>
                    <div>{formatDate(selectedStage.updatedAt)}</div>
                  </div>
                </div>
              </div>

              {/* Time Tracking Section */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0 fw-bold">⏱️ Time Tracking</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-2">
                      <div className="text-center">
                        <div className="text-muted small">Estimated Hours</div>
                        <div className="fw-bold fs-5">
                          {selectedStage.estimated_hours || 0}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-2">
                      <div className="text-center">
                        <div className="text-muted small">Actual Hours</div>
                        <div className="fw-bold fs-5">
                          {selectedStage.actual_hours || 0}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-2">
                      <div className="text-center">
                        <div className="text-muted small">Total Time Spent</div>
                        <div className="fw-bold fs-5">
                          {selectedStage.total_time_spent || 0} hrs
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-2">
                      <div className="text-center">
                        <div className="text-muted small">Efficiency</div>
                        <div
                          className={`fw-bold fs-5 ${parseFloat(efficiency) > 100 ? "text-success" : "text-danger"}`}
                        >
                          {efficiency}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-4">
                      <div className="small text-muted">Design Time</div>
                      <div className="fw-medium">
                        {selectedStage.design_time || 0} hrs
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="small text-muted">3D Modeling</div>
                      <div className="fw-medium">
                        {selectedStage.modeling_time || 0} hrs
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="small text-muted">Rendering</div>
                      <div className="fw-medium">
                        {selectedStage.rendering_time || 0} hrs
                      </div>
                    </div>
                    <div className="col-md-4 mt-2">
                      <div className="small text-muted">Revision Time</div>
                      <div className="fw-medium">
                        {selectedStage.revision_time || 0} hrs
                      </div>
                    </div>
                    <div className="col-md-4 mt-2">
                      <div className="small text-muted">Review Time</div>
                      <div className="fw-medium">
                        {selectedStage.review_time || 0} hrs
                      </div>
                    </div>
                  </div>

                  {selectedStage.time_breakdown && (
                    <div className="mt-3">
                      <div className="small text-muted">
                        Time Breakdown Details
                      </div>
                      <div className="border rounded p-2 bg-light small">
                        {selectedStage.time_breakdown}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Tracking Section */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0 fw-bold">💰 Cost Tracking</h6>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <div className="small text-muted">Material Cost</div>
                      <div className="fw-bold">
                        ₹{selectedStage.material_cost || 0}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="small text-muted">Labor Cost</div>
                      <div className="fw-bold">
                        ₹{selectedStage.labor_cost || 0}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="small text-muted">Software Cost</div>
                      <div className="fw-bold">
                        ₹{selectedStage.software_cost || 0}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="small text-muted">Machine Cost</div>
                      <div className="fw-bold">
                        ₹{selectedStage.machine_cost || 0}
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="small text-muted">Other Costs</div>
                      <div className="fw-bold">
                        ₹{selectedStage.other_costs || 0}
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="small text-muted">Total Cost</div>
                      <div className="fw-bold">
                        ₹{selectedStage.total_cost || 0}
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="small text-muted">Markup</div>
                      <div className="fw-bold">
                        {selectedStage.markup_percentage || 0}%
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="small text-muted">Final Price</div>
                      <div className="fw-bold text-success">
                        ₹{selectedStage.final_price || 0}
                      </div>
                    </div>
                  </div>

                  {/* Labor Cost Breakdown */}
                  {selectedLaborIds.length > 0 && (
                    <div className="mt-3">
                      <h6 className="fw-bold small mb-2">
                        Selected Labor Costs ({selectedLaborIds.length})
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="small">Cost ID</th>
                              <th className="small">Name</th>
                              <th className="small">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedLaborIds.map((id, index) => (
                              <tr key={index}>
                                <td className="small font-monospace">{id}</td>
                                <td className="small">Labor Cost</td>
                                <td className="small">
                                  <span className="badge bg-secondary">
                                    Direct Cost
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Detailed Labor Breakdown */}
                  {getLaborBreakdown().length > 0 && (
                    <div className="mt-3">
                      <h6 className="fw-bold small mb-2">
                        Labor Cost Breakdown
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="small">Name</th>
                              <th className="small">Type</th>
                              <th className="small">Amount</th>
                              <th className="small">Unit</th>
                              <th className="small">Total</th>
                              <th className="small">Stage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getLaborBreakdown().map((item, index) => (
                              <tr key={index}>
                                <td className="small fw-medium">
                                  {item.name || "Labor Cost"}
                                </td>
                                <td className="small">
                                  <span
                                    className={`badge ${item.type === "Direct Cost" ? "bg-primary" : "bg-info"}`}
                                  >
                                    {item.type || "N/A"}
                                  </span>
                                </td>
                                <td className="small">
                                  ₹{item.cost_amount || 0}
                                </td>
                                <td className="small">
                                  <span className="badge bg-secondary">
                                    {item.unit || "unit"}
                                  </span>
                                </td>
                                <td className="small fw-bold">
                                  ₹{item.total_cost || 0}
                                </td>
                                <td className="small">{item.stage || "CAD"}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-active">
                            <tr>
                              <td
                                colSpan="4"
                                className="small fw-bold text-end"
                              >
                                Total Labor Cost:
                              </td>
                              <td className="small fw-bold" colSpan="2">
                                ₹{selectedStage.labor_cost || 0}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <div className="small text-muted">Cost Status</div>
                      <div>
                        <span
                          className={`badge ${
                            selectedStage.cost_status === "estimated"
                              ? "bg-warning"
                              : selectedStage.cost_status === "calculated"
                                ? "bg-info"
                                : selectedStage.cost_status === "finalized"
                                  ? "bg-success"
                                  : selectedStage.cost_status === "approved"
                                    ? "bg-success"
                                    : "bg-secondary"
                          }`}
                        >
                          {selectedStage.cost_status?.toUpperCase() ||
                            "ESTIMATED"}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="small text-muted">Currency</div>
                      <div className="fw-medium">
                        {selectedStage.cost_currency || "INR"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* File & Remarks Section */}
              <div className="row">
                {/* File Info */}
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-bold">📎 File Information</h6>
                    </div>
                    <div className="card-body">
                      <div className="row mb-2">
                        <div className="col-6">
                          <div className="small text-muted">File Status</div>
                          <div className="fw-medium">
                            {selectedStage.file_status || "draft"}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="small text-muted">
                            Current Version
                          </div>
                          <div className="fw-medium">
                            v{selectedStage.file_version || "1.0"}
                          </div>
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-6">
                          <div className="small text-muted">File Revisions</div>
                          <div className="fw-medium">
                            {selectedStage.file_revisions || 0}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="small text-muted">Total Files</div>
                          <div className="fw-medium">
                            {selectedStage.files?.length || 0}
                          </div>
                        </div>
                      </div>

                      {/* CAD Files */}
                      {selectedStage.files &&
                        selectedStage.files.length > 0 && (
                          <div className="mt-3">
                            <h6 className="fw-bold small mb-2">CAD Files</h6>
                            <div className="list-group">
                              {selectedStage.files
                                .slice(0, 5)
                                .map((file, index) => (
                                  <div
                                    key={file.id || index}
                                    className="list-group-item d-flex justify-content-between align-items-center py-1 px-2"
                                  >
                                    <div className="d-flex align-items-center">
                                      <span className="me-2">
                                        {file.name?.includes(".3dm")
                                          ? "🦏"
                                          : file.name?.includes(".stl")
                                            ? "🔶"
                                            : file.name?.includes(".step")
                                              ? "📦"
                                              : file.name?.includes(".blend")
                                                ? "🌀"
                                                : file.name?.includes(".dwg")
                                                  ? "📐"
                                                  : "📎"}
                                      </span>
                                      <div className="small">
                                        <div
                                          className="fw-medium text-truncate"
                                          style={{ maxWidth: "150px" }}
                                        >
                                          {file.name || `File ${index + 1}`}
                                        </div>
                                        <small className="text-muted">
                                          {file.size
                                            ? `${(file.size / 1024).toFixed(2)} KB`
                                            : "Unknown size"}
                                        </small>
                                      </div>
                                    </div>
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
                                ))}
                              {selectedStage.files.length > 5 && (
                                <div className="list-group-item text-center py-1">
                                  <small className="text-muted">
                                    +{selectedStage.files.length - 5} more files
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-bold">📝 Remarks & Notes</h6>
                    </div>
                    <div className="card-body">
                      {selectedStage.remarks ? (
                        <div className="border rounded p-3 bg-light h-100">
                          <p
                            className="mb-0 small"
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            {selectedStage.remarks}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center text-muted py-5">
                          <FiPackage size={32} className="mb-2" />
                          <p className="mb-0 small">No remarks available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
                <FiEdit2 className="me-1" size={12} /> Update CAD Stage
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
              <h2 className="h4 fw-bold mb-1">CAD Creation Stages</h2>
              <p className="text-muted mb-0">
                Total {cadStages.length} stages • Showing{" "}
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
                  <td colSpan="9" className="text-center py-4 text-muted">
                    {search || statusFilter !== "all"
                      ? "No CAD stages found for your search criteria"
                      : "No CAD creation stages available"}
                  </td>
                </tr>
              ) : (
                currentStages.map((stage, index) => (
                  <tr
                    key={stage._id}
                    className={
                      stage.status === "completed" ||
                      stage.status === "approved"
                        ? "table-success"
                        : stage.status === "hold"
                          ? "table-warning"
                          : stage.status === "cancelled"
                            ? "table-danger"
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
                        {stage.department || "CAD"}
                      </div>
                    </td>

                    {/* <td>
                      <div className="fw-medium small">
                        <FiPackage size={10} className="me-1" />
                        {stage.design_type || "N/A"}
                      </div>
                      <div className="text-muted x-small">
                        {stage.material ? `Material: ${stage.material}` : ""}
                      </div>
                    </td> */}

                    <td>
                      <div>
                        <div className="fw-medium small d-flex align-items-center">
                          <FiUser size={10} className="me-1" />
                          {stage.assigned_name || "Unassigned"}
                        </div>
                        <div className="text-muted x-small">
                          {stage.assigned_department || "CAD"}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="small">
                        <div className="d-flex align-items-center mb-1">
                          <FiCalendar size={10} className="me-1 text-primary" />
                          <span className="x-small">
                            Start: {formatDate(stage.start_date)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <FiCalendar
                            size={10}
                            className={`me-1 ${stage.end_date ? "text-success" : "text-muted"}`}
                          />
                          <span className="x-small">
                            End: {formatDate(stage.end_date) || "Not set"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <FiClock size={10} className="text-muted" />
                        <div>
                          <div className="x-small text-muted">
                            Est: {stage.estimated_hours || 0}
                          </div>
                          <div className="x-small fw-medium">
                            Act: {stage.actual_hours || 0}
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
          laborCosts={laborCosts}
        />
      )}

      {/* Add CSS for spinner animation */}
      <style jsx>{`
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

export default CadCreationTable;
