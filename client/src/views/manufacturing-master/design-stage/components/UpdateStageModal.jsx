import React, { useState, useEffect, useRef } from "react";
import {
  FiCalendar,
  FiClock,
  FiX,
  FiCheck,
  FiUpload,
  FiFile,
  FiTrash2,
  FiUser,
  FiAlertCircle,
  FiDownload,
  FiEye,
  FiEdit,
  FiImage,
  FiArchive,
  FiInfo,
} from "react-icons/fi";

const UpdateStageModal = ({
  selectedStage,
  stageTypes = [],
  statusOptions = [],
  nextStageOptions = [],
  employees = [],
  onUpdate,
  onClose,
  loading = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [designFiles, setDesignFiles] = useState([]);
  const [formData, setFormData] = useState({
    assigned_to: "",
    status: "",
    start_date: "",
    end_date: "",
    estimated_hours: "",
    actual_hours: "",
    // auto_start_next: false,
    stage: "",
    remarks: "",
    design_notes: "",
    design_specifications: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  // Status options
  const defaultStatusOptions = [
    { value: "pending", label: "Pending", color: "warning" },
    { value: "in_progress", label: "In Progress", color: "info" },
    { value: "completed", label: "Completed", color: "success" },
    { value: "approved", label: "Approved", color: "success" },
    { value: "hold", label: "On Hold", color: "secondary" },
    { value: "cancelled", label: "Cancelled", color: "danger" },
  ];

  const defaultNextStageOptions = [
    { value: "cad", label: "CAD Creation" },
    { value: "prototype", label: "Prototype" },
    { value: "molding", label: "Molding" },
    { value: "casting", label: "Casting" },
    { value: "assembly", label: "Assembly" },
    { value: "polishing", label: "Polishing" },
    { value: "quality", label: "Quality Check" },
    { value: "none", label: "No Next Stage" },
  ];

  // Use props or defaults
  const finalStatusOptions =
    statusOptions.length > 0 ? statusOptions : defaultStatusOptions;
  const finalNextStageOptions =
    nextStageOptions.length > 0 ? nextStageOptions : defaultNextStageOptions;

  // Initialize form data when selectedStage changes
  useEffect(() => {
    if (selectedStage) {
      setFormData({
        assigned_to: selectedStage.assigned_to || "",
        status: selectedStage.status || "",
        start_date: selectedStage.start_date
          ? new Date(selectedStage.start_date).toISOString().split("T")[0]
          : "",
        end_date: selectedStage.end_date
          ? new Date(selectedStage.end_date).toISOString().split("T")[0]
          : "",
        estimated_hours: selectedStage.estimated_hours || "",
        actual_hours: selectedStage.actual_hours || "",
        // auto_start_next: selectedStage.auto_start_next || false,
        stage: selectedStage.stage || "",
        remarks: selectedStage.remarks || "",
        design_notes: selectedStage.design_notes || "",
        design_specifications: selectedStage.design_specifications || "",
      });

      // Initialize with existing files
      if (selectedStage.files && Array.isArray(selectedStage.files)) {
        const existingFiles = selectedStage.files
          .filter((file) => file.isExisting || file.isReference)
          .map((file) => ({
            ...file,
            id: file.id || file._id || Math.random().toString(36).substr(2, 9),
            isExisting: true,
            file: null, // Make sure file object is null for existing files
          }));
        setDesignFiles(existingFiles);
      } else {
        setDesignFiles([]);
      }

      setFormErrors({});
    }
  }, [selectedStage]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error if exists
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle textarea change
  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.assigned_to) {
      errors.assigned_to = "Assigned to is required";
    }

    if (!formData.status) {
      errors.status = "Status is required";
    }

    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }

    if (formData.estimated_hours && isNaN(formData.estimated_hours)) {
      errors.estimated_hours = "Estimated hours must be a number";
    }

    if (formData.actual_hours && isNaN(formData.actual_hours)) {
      errors.actual_hours = "Actual hours must be a number";
    }

    if (
      formData.end_date &&
      formData.start_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      errors.end_date = "End date cannot be before start date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return [];

    // Validate file size (max 50MB per file)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    const oversizedFiles = fileList.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setUploadError(
        `Some files exceed 50MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return [];
    }

    // Validate file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "application/octet-stream",
      "application/zip",
      "application/x-rar-compressed",
      "application/x-zip-compressed",
    ];

    const invalidFiles = fileList.filter(
      (file) =>
        !allowedTypes.includes(file.type) &&
        !file.name.match(
          /\.(dwg|dxf|stl|step|iges|stp|obj|3ds|max|fbx|skp|blend|ai|eps|psd|cdr|dwf)$/i
        )
    );

    if (invalidFiles.length > 0) {
      setUploadError(
        `Invalid file types: ${invalidFiles.map((f) => f.name).join(", ")}`
      );
      return [];
    }

    setUploading(true);
    setUploadError("");

    try {
      const newFiles = fileList.map((file) => ({
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file, // Keep the File object for upload
        url: URL.createObjectURL(file),
        uploadDate: new Date(),
        isExisting: false,
      }));

      setDesignFiles((prev) => [...prev, ...newFiles]);
      return newFiles;
    } catch (error) {
      console.error("Error processing files:", error);
      setUploadError("Failed to process files. Please try again.");
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    await handleFileUpload(files);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  };

  // Handle file removal
  const handleRemoveFile = (fileId) => {
    // Clean up URL for files we created
    const fileToRemove = designFiles.find((f) => f.id === fileId);
    if (fileToRemove && fileToRemove.url && !fileToRemove.isExisting) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    setDesignFiles((prev) => prev.filter((file) => file.id !== fileId));

    // Close preview if removing the previewed file
    if (previewFile && previewFile.id === fileId) {
      setPreviewFile(null);
      setPreviewUrl("");
    }
  };

  // Preview file
  const handlePreviewFile = (file) => {
    setPreviewFile(file);
    setPreviewUrl(file.url);
  };

  // Download file
  const handleDownloadFile = (file) => {
    if (file.isExisting || file.isReference) {
      // For existing files, open in new tab
      window.open(file.url, "_blank");
    } else {
      // For new files, create download link
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    const extension = file.name.split(".").pop().toLowerCase();
    const type = file.type || "";

    if (type.includes("image")) return <FiImage className="text-primary" />;
    if (type.includes("pdf")) return <FiFile className="text-danger" />;
    if (type.includes("word") || type.includes("document"))
      return <FiFile className="text-info" />;
    if (type.includes("excel") || type.includes("spreadsheet"))
      return <FiFile className="text-success" />;
    if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("archive")
    )
      return <FiArchive className="text-warning" />;

    const cadExtensions = [
      "dwg",
      "dxf",
      "stl",
      "step",
      "iges",
      "stp",
      "obj",
      "3ds",
      "max",
      "fbx",
      "skp",
      "blend",
    ];
    if (cadExtensions.includes(extension))
      return <FiEdit className="text-secondary" />;

    return <FiFile className="text-muted" />;
  };

  // Get file type label
  const getFileTypeLabel = (file) => {
    const type = file.type || "";
    if (type.includes("image")) return "Image";
    if (type.includes("pdf")) return "PDF";
    if (type.includes("word") || type.includes("document")) return "Document";
    if (type.includes("excel") || type.includes("spreadsheet"))
      return "Spreadsheet";
    if (type.includes("zip") || type.includes("rar")) return "Archive";
    if (file.name.match(/\.(dwg|dxf|stl|step|iges)$/i)) return "CAD File";
    return "File";
  };

  // Calculate total file size
  const totalFileSize = designFiles.reduce(
    (total, file) => total + (file.size || 0),
    0
  );

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Prepare files for upload (only new files that have File objects)
      const filesToUpload = designFiles
        .filter((file) => !file.isExisting && file.file)
        .map((file) => file.file);

      // Prepare update data
      const updateData = {
        ...formData,
        files: designFiles, // Send all files to identify existing ones
      };

      // Call the update function from parent
      if (onUpdate) {
        const success = await onUpdate(
          selectedStage._id,
          updateData,
          filesToUpload
        );
        if (success) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      setUploadError("Failed to update stage. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!selectedStage) return null;

  const isDisabled = loading || uploading;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        overflowY: "auto",
        maxHeight: "100vh",
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content rounded-3"
          style={{ maxHeight: "95vh", overflow: "hidden" }}
        >
          <div
            className="modal-header border-bottom pb-3 sticky-top bg-white"
            style={{ zIndex: 1020 }}
          >
            <h5 className="modal-title fw-bold fs-5">
              <FiEdit className="me-2" />
              Update Stage:{" "}
              {selectedStage.job_card_no || selectedStage.stage_name}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isDisabled}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="modal-body"
              style={{ overflowY: "auto", maxHeight: "calc(90vh - 130px)" }}
            >
              {/* Current Stage Info */}
              <div className="alert alert-info mb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <strong>Current Stage:</strong>{" "}
                    {selectedStage.stage_type?.toUpperCase() || "Design Stage"}
                    {selectedStage.job_card_no && (
                      <span className="ms-2 badge bg-dark">
                        Job Card: {selectedStage.job_card_no}
                      </span>
                    )}
                  </div>
                
                </div>
              </div>

              {/* Basic Information */}
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    <FiUser className="me-1" /> Assigned To{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    name="assigned_to"
                    className={`form-select ${
                      formErrors.assigned_to ? "is-invalid" : ""
                    }`}
                    value={formData.assigned_to}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.role_id?.role_name || "No Role"})
                      </option>
                    ))}
                  </select>
                  {formErrors.assigned_to && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FiAlertCircle className="me-1" />{" "}
                      {formErrors.assigned_to}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Status <span className="text-danger">*</span>
                  </label>
                  <select
                    name="status"
                    className={`form-select ${
                      formErrors.status ? "is-invalid" : ""
                    }`}
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                  >
                    <option value="">Select Status</option>
                    {finalStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.status && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FiAlertCircle className="me-1" /> {formErrors.status}
                    </div>
                  )}
                </div>
              </div>

              {/* Dates Section */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    <FiCalendar className="me-1" /> Start Date{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar size={14} />
                    </span>
                    <input
                      type="date"
                      name="start_date"
                      className={`form-control ${
                        formErrors.start_date ? "is-invalid" : ""
                      }`}
                      value={formData.start_date}
                      onChange={handleInputChange}
                      disabled={isDisabled}
                    />
                  </div>
                  {formErrors.start_date && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FiAlertCircle className="me-1" /> {formErrors.start_date}
                    </div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    <FiCalendar className="me-1" /> End Date
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiCalendar size={14} />
                    </span>
                    <input
                      type="date"
                      name="end_date"
                      className={`form-control ${
                        formErrors.end_date ? "is-invalid" : ""
                      }`}
                      value={formData.end_date}
                      onChange={handleInputChange}
                      min={formData.start_date}
                      disabled={isDisabled}
                    />
                  </div>
                  {formErrors.end_date && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FiAlertCircle className="me-1" /> {formErrors.end_date}
                    </div>
                  )}
                  <small className="text-muted">
                    Leave empty if not completed
                  </small>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    <FiClock className="me-1" /> Estimated Hours
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiClock size={14} />
                    </span>
                    <input
                      type="number"
                      name="estimated_hours"
                      className={`form-control ${
                        formErrors.estimated_hours ? "is-invalid" : ""
                      }`}
                      value={formData.estimated_hours}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      placeholder="e.g., 8.5"
                      disabled={isDisabled}
                    />
                  </div>
                  {formErrors.estimated_hours && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FiAlertCircle className="me-1" />{" "}
                      {formErrors.estimated_hours}
                    </div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-medium">
                    <FiClock className="me-1" /> Actual Hours
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiClock size={14} />
                    </span>
                    <input
                      type="number"
                      name="actual_hours"
                      className={`form-control ${
                        formErrors.actual_hours ? "is-invalid" : ""
                      }`}
                      value={formData.actual_hours}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      placeholder="e.g., 7.0"
                      disabled={isDisabled}
                    />
                  </div>
                  {formErrors.actual_hours && (
                    <div className="invalid-feedback d-flex align-items-center">
                      <FiAlertCircle className="me-1" />{" "}
                      {formErrors.actual_hours}
                    </div>
                  )}
                </div>
              </div>

              {/* Next Stage & Auto Start */}
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Next Stage</label>
                  <select
                    name="stage"
                    className="form-select"
                    value={formData.stage}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                  >
                    <option value="">Select Next Stage</option>
                    {finalNextStageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div className="col-md-6 mb-3 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="auto_start_next"
                      name="auto_start_next"
                      checked={formData.auto_start_next}
                      onChange={handleInputChange}
                      disabled={isDisabled}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="auto_start_next"
                    >
                      Auto start next stage when this stage is completed
                    </label>
                  </div>
                </div> */}
              </div>

              {/* Design Notes & Specifications */}
              <div className="border rounded-3 p-3 mb-4">
                <h6 className="fw-bold mb-3">Design Information</h6>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Design Notes</label>
                    <textarea
                      name="design_notes"
                      className="form-control"
                      rows={3}
                      value={formData.design_notes}
                      onChange={handleTextareaChange}
                      placeholder="Add design notes..."
                      disabled={isDisabled}
                    ></textarea>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">
                      Design Specifications
                    </label>
                    <textarea
                      name="design_specifications"
                      className="form-control"
                      rows={3}
                      value={formData.design_specifications}
                      onChange={handleTextareaChange}
                      placeholder="Add design specifications..."
                      disabled={isDisabled}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Remarks Section */}
              <div className="border rounded-3 p-3 mb-4">
                <h6 className="fw-bold mb-3">Remarks</h6>
                <textarea
                  name="remarks"
                  className="form-control"
                  rows={3}
                  value={formData.remarks}
                  onChange={handleTextareaChange}
                  placeholder="Add any remarks or notes..."
                  disabled={isDisabled}
                ></textarea>
              </div>

              {/* Design Files Upload Section */}
              <div className="border rounded-3 p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 d-flex align-items-center">
                    <FiFile className="me-2" /> Design Files
                    <span className="badge bg-primary ms-2">
                      {designFiles.length} files
                    </span>
                    <span className="badge bg-secondary ms-2">
                      {formatFileSize(totalFileSize)}
                    </span>
                  </h6>
                  <div>
                    <span className="badge bg-success me-2">
                      {designFiles.filter((f) => f.isExisting).length} existing
                    </span>
                    <span className="badge bg-info">
                      {designFiles.filter((f) => !f.isExisting).length} new
                    </span>
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="mb-4">
                  <label className="form-label fw-medium">
                    Upload Design Files
                  </label>
                  <div
                    className="border rounded p-4 text-center bg-light position-relative"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{
                      borderStyle: "dashed",
                      borderColor: "#6c757d",
                      minHeight: "150px",
                      cursor: "pointer",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="designFiles"
                      className="d-none"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.svg,.dwg,.dxf,.stl,.step,.iges,.stp,.obj,.3ds,.max,.fbx,.skp,.blend,.ai,.eps,.psd,.cdr,.zip,.rar,.7z"
                      onChange={handleFileChange}
                      disabled={isDisabled || uploading}
                    />
                    <div className={`${uploading ? "opacity-50" : ""}`}>
                      <FiUpload size={32} className="text-primary mb-2" />
                      <p className="mb-1 fw-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-muted small mb-2">
                        PDF, DOC, XLS, Images, CAD files (DWG, DXF, STL, STEP,
                        IGES), ZIP, RAR
                      </p>
                      <p className="text-muted small">
                        Maximum file size: 50MB per file
                      </p>
                    </div>
                    {uploading && (
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <div
                          className="spinner-border spinner-border-sm text-primary me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Uploading...</span>
                        </div>
                        <span className="text-muted">Processing files...</span>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="alert alert-danger mt-2 py-2">
                      <FiAlertCircle className="me-1" /> {uploadError}
                    </div>
                  )}
                </div>

                {/* Files List */}
                {designFiles.length > 0 && (
                  <div className="mt-3">
                    <h6 className="mb-3">Files ({designFiles.length})</h6>
                    <div
                      className="table-responsive"
                      style={{ maxHeight: "400px", overflowY: "auto" }}
                    >
                      <table className="table table-bordered align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "25%" }}>Type</th>
                            <th style={{ width: "35%" }}>File Name</th>
                            <th style={{ width: "15%" }}>Size</th>
                            <th style={{ width: "15%" }}>Status</th>
                            <th style={{ width: "10%" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {designFiles.map((file) => (
                            <tr key={file.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <span className="me-2">
                                    {getFileIcon(file)}
                                  </span>
                                  <small className="text-muted">
                                    {getFileTypeLabel(file)}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <div
                                  className="fw-medium text-truncate"
                                  style={{ maxWidth: "200px" }}
                                >
                                  {file.name}
                                </div>
                                <small className="text-muted">
                                  {file.isExisting ? "Existing" : "New"} •{" "}
                                  {formatDate(file.uploadDate)}
                                </small>
                              </td>
                              <td>{formatFileSize(file.size)}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    file.isExisting ? "bg-success" : "bg-info"
                                  }`}
                                >
                                  {file.isExisting ? "Existing" : "New"}
                                </span>
                              </td>
                              <td className="text-center">
                                <div className="btn-group btn-group-sm">
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => handlePreviewFile(file)}
                                    title="Preview"
                                  >
                                    <FiEye size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-success"
                                    onClick={() => handleDownloadFile(file)}
                                    title="Download"
                                  >
                                    <FiDownload size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() => handleRemoveFile(file.id)}
                                    title="Remove"
                                    disabled={isDisabled}
                                  >
                                    <FiTrash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {designFiles.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <FiFile size={24} className="mb-2" />
                    <p>No files uploaded yet</p>
                  </div>
                )}
              </div>

              {/* File Preview Modal */}
              {previewFile && previewUrl && (
                <div
                  className="modal fade show d-block"
                  style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1060 }}
                  tabIndex="-1"
                  onClick={() => {
                    setPreviewFile(null);
                    setPreviewUrl("");
                  }}
                >
                  <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">{previewFile.name}</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => {
                            setPreviewFile(null);
                            setPreviewUrl("");
                          }}
                        ></button>
                      </div>
                      <div className="modal-body text-center">
                        {previewFile.type.includes("image") ? (
                          <img
                            src={previewUrl}
                            alt={previewFile.name}
                            className="img-fluid"
                            style={{ maxHeight: "70vh" }}
                          />
                        ) : (
                          <div className="alert alert-info">
                            <FiFile size={48} className="mb-3" />
                            <p>Preview not available for this file type</p>
                            <p className="small">
                              File type: {previewFile.type}
                            </p>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleDownloadFile(previewFile)}
                            >
                              <FiDownload className="me-2" /> Download File
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top pt-3 bg-white">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={isDisabled}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={isDisabled}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiCheck size={16} />
                    Update Stage
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateStageModal;
