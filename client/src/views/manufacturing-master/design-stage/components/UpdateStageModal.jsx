import React, { useState, useEffect, useRef } from "react";
import {
  FiUser,
  FiBox,
  FiClock,
  FiCheck,
  FiUpload,
  FiFile,
  FiTrash2,
  FiAlertCircle,
  FiDownload,
  FiEye,
  FiEdit,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiBarChart2,
  FiPercent,
  FiCpu,
  FiRefreshCw,
  FiInfo,
  FiPlus,
  FiMinus,
  FiChevronDown,
  FiChevronUp,
  FiSave,
  FiLayers,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiGrid,
  FiDatabase,
  FiTool,
  FiSettings,
  FiX,
  FiImage,
  FiArchive,
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
    stage: "",
    remarks: "",
    design_notes: "",
    design_specifications: "",
    stage_type: "",

    // Cost Tracking Fields
    material_cost: "",
    labor_cost: "",
    other_costs: "",
    total_cost: "",
    cost_currency: "INR",
    cost_status: "estimated",
    markup_percentage: "0",
    final_price: "",

    // Time Tracking Fields
    preparation_time: "",
    processing_time: "",
    finishing_time: "",
    inspection_time: "",
    packaging_time: "",
    total_time_spent: "",
    time_breakdown: "",

    // File Tracking Fields
    file_version: "1.0",
    file_revisions: 0,
    source_files: [],
    output_files: [],
    file_status: "draft",
    backup_location: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    cost: false,
    time: false,
    files: false,
  });

  // Status options
  const defaultStatusOptions = [
    { value: "draft", label: "Draft", color: "secondary", icon: "✏️" },
    { value: "in_progress", label: "In Progress", color: "info", icon: "⚡" },
    {
      value: "first_review",
      label: "First Review",
      color: "warning",
      icon: "👁️",
    },
    {
      value: "client_review",
      label: "Client Review",
      color: "warning",
      icon: "👤",
    },
    { value: "revisions", label: "Revisions", color: "warning", icon: "🔄" },
    { value: "finalized", label: "Finalized", color: "success", icon: "✅" },
    { value: "approved", label: "Approved", color: "success", icon: "👍" },
    { value: "hold", label: "On Hold", color: "danger", icon: "⏸️" },
    { value: "cancelled", label: "Cancelled", color: "danger", icon: "❌" },
  ];

  // Next Stage Options
  const defaultNextStageOptions = [
    { value: "cad", label: "CAD Creation", icon: "🖥️" },
    { value: "casting", label: "Casting", icon: "🔥" },
    { value: "filing", label: "Filing", icon: "🛠️" },
    { value: "setting", label: "Setting", icon: "🧱" },
    { value: "polishing", label: "Polishing", icon: "✨" },
    { value: "plating", label: "Plating", icon: "🔧" },
    { value: "quality", label: "Quality Check", icon: "🔍" },
    { value: "packaging", label: "Packaging", icon: "📦" },
    { value: "none", label: "No Next Stage", icon: "🏁" },
  ];

  // Stage Type specific options
  const stageTypeOptions = [
    { value: "design", label: "Design", icon: "🎨" },
    { value: "cad", label: "CAD", icon: "🖥️" },
    { value: "prototype", label: "Prototype", icon: "🛠️" },
    { value: "molding", label: "Molding", icon: "🧱" },
    { value: "casting", label: "Casting", icon: "🔥" },
    { value: "assembly", label: "Assembly", icon: "🔧" },
    { value: "polishing", label: "Polishing", icon: "✨" },
    { value: "quality", label: "Quality", icon: "🔍" },
    { value: "packaging", label: "Packaging", icon: "📦" },
  ];

  // Cost Status Options
  const costStatusOptions = [
    { value: "estimated", label: "Estimated", color: "warning", icon: "📊" },
    { value: "calculated", label: "Calculated", color: "info", icon: "🧮" },
    { value: "finalized", label: "Finalized", color: "success", icon: "✅" },
    { value: "approved", label: "Approved", color: "success", icon: "👍" },
  ];

  // File Status Options
  const fileStatusOptions = [
    { value: "draft", label: "Draft", icon: "📄" },
    { value: "work_in_progress", label: "Work in Progress", icon: "⚙️" },
    { value: "under_review", label: "Under Review", icon: "👁️" },
    { value: "revised", label: "Revised", icon: "🔄" },
    { value: "final", label: "Final", icon: "✅" },
    { value: "archived", label: "Archived", icon: "📦" },
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
        stage: selectedStage.stage || "",
        remarks: selectedStage.remarks || "",
        design_notes: selectedStage.design_notes || "",
        design_specifications: selectedStage.design_specifications || "",
        stage_type: selectedStage.stage_type || "",

        // Cost Tracking
        material_cost: selectedStage.material_cost || "",
        labor_cost: selectedStage.labor_cost || "",
        other_costs: selectedStage.other_costs || "",
        total_cost: selectedStage.total_cost || "",
        cost_currency: selectedStage.cost_currency || "INR",
        cost_status: selectedStage.cost_status || "estimated",
        markup_percentage: selectedStage.markup_percentage || "0",
        final_price: selectedStage.final_price || "",

        // Time Tracking
        preparation_time: selectedStage.preparation_time || "",
        processing_time: selectedStage.processing_time || "",
        finishing_time: selectedStage.finishing_time || "",
        inspection_time: selectedStage.inspection_time || "",
        packaging_time: selectedStage.packaging_time || "",
        total_time_spent: selectedStage.total_time_spent || "",
        time_breakdown: selectedStage.time_breakdown || "",

        // File Tracking
        file_version: selectedStage.file_version || "1.0",
        file_revisions: selectedStage.file_revisions || 0,
        source_files: selectedStage.source_files || [],
        output_files: selectedStage.output_files || [],
        file_status: selectedStage.file_status || "draft",
        backup_location: selectedStage.backup_location || "",
      });

      // Initialize design files
      if (selectedStage.files && Array.isArray(selectedStage.files)) {
        const existingFiles = selectedStage.files
          .filter((file) => file.isExisting || file.isReference)
          .map((file) => ({
            ...file,
            id: file.id || file._id || Math.random().toString(36).substr(2, 9),
            isExisting: true,
            file: null,
            category: file.category || "output",
            version: file.version || "1.0",
          }));
        setDesignFiles(existingFiles);
      } else {
        setDesignFiles([]);
      }

      setFormErrors({});

      // Calculate total cost and time
      calculateTotalCost();
      calculateTotalTime();
    }
  }, [selectedStage]);

  const calculateTotalCost = () => {
    const material = Number(formData.material_cost) || 0;
    const labor = Number(formData.labor_cost) || 0;
    const other = Number(formData.other_costs) || 0;
    const markup = Number(formData.markup_percentage) || 0;

    const total = material + labor + other;
    const markupAmount = (total * markup) / 100;
    const finalPrice = total + markupAmount;

    setFormData((prev) => ({
      ...prev,
      total_cost: total.toFixed(2),
      final_price: finalPrice.toFixed(2),
    }));
  };

  const calculateTotalTime = () => {
    const preparation = parseFloat(formData.preparation_time) || 0;
    const processing = parseFloat(formData.processing_time) || 0;
    const finishing = parseFloat(formData.finishing_time) || 0;
    const inspection = parseFloat(formData.inspection_time) || 0;
    const packaging = parseFloat(formData.packaging_time) || 0;

    const total = preparation + processing + finishing + inspection + packaging;

    setFormData((prev) => ({
      ...prev,
      total_time_spent: total.toFixed(1),
      estimated_hours: total.toFixed(1),
    }));
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      // Create updated form data with the new value
      const updatedData = { ...prev };

      // Handle special cases for numbers
      if (name.includes("_cost") || name === "markup_percentage") {
        updatedData[name] = value === "" ? "" : value;
      } else if (name.includes("_time")) {
        updatedData[name] = value === "" ? "" : value;
      } else {
        updatedData[name] = value;
      }

      // Calculate totals if cost or markup changed
      if (name.includes("_cost") || name === "markup_percentage") {
        const material = Number(updatedData.material_cost) || 0;
        const labor = Number(updatedData.labor_cost) || 0;
        const other = Number(updatedData.other_costs) || 0;
        const markup = Number(updatedData.markup_percentage) || 0;


        const total = material + labor  + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        updatedData.total_cost = total.toFixed(2);
        updatedData.final_price = finalPrice.toFixed(2);
      }

      // Calculate totals if time field changed
      if (name.includes("_time")) {
        const preparation = parseFloat(updatedData.preparation_time) || 0;
        const processing = parseFloat(updatedData.processing_time) || 0;
        const finishing = parseFloat(updatedData.finishing_time) || 0;
        const inspection = parseFloat(updatedData.inspection_time) || 0;
        const packaging = parseFloat(updatedData.packaging_time) || 0;

        const total =
          preparation + processing + finishing + inspection + packaging;

        updatedData.total_time_spent = total.toFixed(1);
        updatedData.estimated_hours = total.toFixed(1);
      }

      return updatedData;
    });

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
  const handleFileUpload = async (files, category = "output") => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return [];

    const maxSize = 100 * 1024 * 1024; // 100MB
    const oversizedFiles = fileList.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setUploadError(
        `Some files exceed 100MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`,
      );
      return [];
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "application/octet-stream",
      "application/zip",
      "application/x-rar",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/msword",
    ];

    const designExtensions = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "svg",
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
      "ai",
      "eps",
      "psd",
      "cdr",
      "dwf",
      "3dm",
      "iges",
      "igs",
      "ply",
      "ztl",
      "zpr",
      "sldprt",
      "sldasm",
      "prt",
      "asm",
    ];

    const invalidFiles = fileList.filter(
      (file) =>
        !allowedTypes.includes(file.type) &&
        !designExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(`.${ext}`),
        ),
    );

    if (invalidFiles.length > 0) {
      setUploadError(
        `Invalid file types: ${invalidFiles.map((f) => f.name).join(", ")}`,
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
        file: file,
        url: URL.createObjectURL(file),
        uploadDate: new Date(),
        isExisting: false,
        category: category,
        version: formData.file_version,
        revision: formData.file_revisions,
        status: "uploaded",
      }));

      setDesignFiles((prev) => [...prev, ...newFiles]);

      // Update source/output files array
      if (category === "source") {
        setFormData((prev) => ({
          ...prev,
          source_files: [...prev.source_files, ...newFiles.map((f) => f.name)],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          output_files: [...prev.output_files, ...newFiles.map((f) => f.name)],
        }));
      }

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
  const handleFileChange = async (e, category = "output") => {
    const files = e.target.files;
    if (files.length === 0) return;

    await handleFileUpload(files, category);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e, category = "output") => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files, category);
    }
  };

  // Handle file removal
  const handleRemoveFile = (fileId) => {
    const fileToRemove = designFiles.find((f) => f.id === fileId);
    if (fileToRemove && fileToRemove.url && !fileToRemove.isExisting) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    setDesignFiles((prev) => prev.filter((file) => file.id !== fileId));

    if (previewFile && previewFile.id === fileId) {
      setPreviewFile(null);
      setPreviewUrl("");
    }
  };

  // Categorize files
  const getFilesByCategory = (category) => {
    return designFiles.filter((file) => file.category === category);
  };

  // Preview file
  const handlePreviewFile = (file) => {
    setPreviewFile(file);
    setPreviewUrl(file.url);
  };

  // Download file
  const handleDownloadFile = (file) => {
    if (file.isExisting) {
      window.open(file.url, "_blank");
    } else {
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

  // Get file icon
  const getFileIcon = (file) => {
    const extension = file.name.split(".").pop().toLowerCase();
    const type = file.type || "";

    if (type.includes("image")) return <FiImage className="text-primary" />;
    if (type.includes("pdf")) return <FiFile className="text-danger" />;
    if (type.includes("word") || type.includes("document"))
      return <FiFile className="text-info" />;
    if (type.includes("excel") || type.includes("spreadsheet"))
      return <FiFile className="text-success" />;
    if (type.includes("zip") || type.includes("rar"))
      return <FiArchive className="text-warning" />;

    const designExtensions = [
      "dwg",
      "dxf",
      "stl",
      "step",
      "iges",
      "stp",
      "obj",
      "3dm",
      "blend",
    ];
    if (designExtensions.includes(extension))
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

  // Increment file version
  const incrementVersion = () => {
    const currentVersion = parseFloat(formData.file_version);
    const newVersion = (currentVersion + 0.1).toFixed(1);

    setFormData((prev) => ({
      ...prev,
      file_version: newVersion,
      file_revisions: prev.file_revisions + 1,
    }));
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const filesToUpload = designFiles
        .filter((file) => !file.isExisting && file.file)
        .map((file) => file.file);

      const updateData = {
        // Basic info
        assigned_to: formData.assigned_to,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date || "",
        estimated_hours: formData.estimated_hours || "0",
        actual_hours: formData.actual_hours || "0",
        stage: formData.stage || "",
        remarks: formData.remarks || "",
        design_notes: formData.design_notes || "",
        design_specifications: formData.design_specifications || "",
        stage_type: formData.stage_type || "",

        // Cost
        material_cost: formData.material_cost || "0",
        labor_cost: formData.labor_cost || "0",
        other_costs: formData.other_costs || "0",
        total_cost: formData.total_cost || "0",
        cost_currency: formData.cost_currency || "INR",
        cost_status: formData.cost_status || "estimated",
        markup_percentage: formData.markup_percentage,
        final_price: formData.final_price || "0",

        // Time
        preparation_time: formData.preparation_time || "0",
        processing_time: formData.processing_time || "0",
        finishing_time: formData.finishing_time || "0",
        inspection_time: formData.inspection_time || "0",
        packaging_time: formData.packaging_time || "0",
        total_time_spent: formData.total_time_spent || "0",
        time_breakdown: formData.time_breakdown || "",

        // File tracking
        file_version: formData.file_version,
        file_revisions: formData.file_revisions,
        file_status: formData.file_status,
        backup_location: formData.backup_location || "",

        // Files
        files: designFiles,
      };

      console.log("🚀 Submitting stage update:", {
        stageId: selectedStage._id,
        data: updateData,
      });

      if (onUpdate) {
        const success = await onUpdate(
          selectedStage._id,
          updateData,
          filesToUpload,
        );

        if (success) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setUploadError("Failed to update.");
    }
  };

  if (!selectedStage) return null;

  const isDisabled = loading || uploading;

  // Calculate efficiency
  const efficiency =
    formData.estimated_hours && formData.total_time_spent
      ? (
          (parseFloat(formData.estimated_hours) /
            parseFloat(formData.total_time_spent)) *
          100
        ).toFixed(1)
      : "0";

  // Render section header
  const renderSectionHeader = (title, sectionKey, icon, badgeCount = null) => (
    <div
      className="d-flex justify-content-between align-items-center p-3 border-bottom cursor-pointer bg-light"
      onClick={() => toggleSection(sectionKey)}
      style={{ cursor: "pointer" }}
    >
      <div className="d-flex align-items-center gap-2">
        {icon}
        <h6 className="mb-0 fw-bold">{title}</h6>
        {badgeCount !== null && (
          <span className="badge bg-primary ms-2">{badgeCount}</span>
        )}
      </div>
      <div>
        {expandedSections[sectionKey] ? <FiChevronUp /> : <FiChevronDown />}
      </div>
    </div>
  );

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        overflowY: "auto",
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3" style={{ maxHeight: "100vh" }}>
          <div
            className="modal-header border-bottom pb-3 sticky-top bg-white"
            style={{ zIndex: 1050 }}
          >
            <div>
              <h5 className="modal-title fw-bold fs-5 mb-1">
                <FiEdit className="me-2" />
                Update Stage: {selectedStage.job_card_no || "N/A"}
              </h5>
              {selectedStage && (
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="badge bg-primary">
                    <FiGrid className="me-1" />{" "}
                    {selectedStage.stage_type || "General Stage"}
                  </span>
                  {selectedStage.material && (
                    <span className="badge bg-warning">
                      <FiBox className="me-1" /> {selectedStage.material}
                    </span>
                  )}
                  {selectedStage.design_type && (
                    <span className="badge bg-info">
                      <FiLayers className="me-1" /> {selectedStage.design_type}
                    </span>
                  )}
                  <span className="badge bg-dark">
                    <FiDatabase className="me-1" /> Job Card:{" "}
                    {selectedStage.job_card_no || "N/A"}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isDisabled}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column">
            <div
              className="modal-body"
              style={{ overflowY: "auto", maxHeight: "calc(90vh - 130px)" }}
            >
              {/* Summary Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Cost Status</h6>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-warning me-2">
                              {
                                costStatusOptions.find(
                                  (c) => c.value === formData.cost_status,
                                )?.label
                              }
                            </span>
                            <h4 className="mb-0">
                              ₹ {formData.final_price || "0.00"}
                            </h4>
                          </div>
                        </div>
                        <FiDollarSign className="text-warning" size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Time Tracking</h6>
                          <div className="d-flex align-items-center">
                            <span className="me-2">
                              <FiTrendingUp className="text-success" />
                            </span>
                            <h4 className="mb-0">
                              {formData.total_time_spent || "0"} hrs
                            </h4>
                          </div>
                        </div>
                        <FiClock className="text-info" size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">File Status</h6>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              v{formData.file_version}
                            </span>
                            <h4 className="mb-0">{designFiles.length} files</h4>
                          </div>
                        </div>
                        <FiFile className="text-primary" size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Efficiency</h6>
                          <div className="d-flex align-items-center">
                            <span
                              className={`me-2 ${parseFloat(efficiency) > 100 ? "text-success" : "text-danger"}`}
                            >
                              {parseFloat(efficiency) > 100 ? (
                                <FiTrendingUp />
                              ) : (
                                <FiTrendingDown />
                              )}
                            </span>
                            <h4 className="mb-0">{efficiency}%</h4>
                          </div>
                        </div>
                        <FiActivity className="text-success" size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "📝 Basic Information",
                  "basic",
                  <FiUser />,
                )}
                {expandedSections.basic && (
                  <div className="card-body">
                    <div className="row">
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
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                        {formErrors.status && (
                          <div className="invalid-feedback d-flex align-items-center">
                            <FiAlertCircle className="me-1" />{" "}
                            {formErrors.status}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          <FiTool className="me-1" /> Stage Type
                        </label>
                        <select
                          name="stage_type"
                          className="form-select"
                          value={formData.stage_type}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          <option value="">Select Stage Type</option>
                          {stageTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          <FiTrendingUp className="me-1" /> Next Stage
                        </label>
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
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          <FiBarChart2 className="me-1" /> File Status
                        </label>
                        <select
                          name="file_status"
                          className="form-select"
                          value={formData.file_status}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          <option value="">Select File Status</option>
                          {fileStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">
                          <FiCalendar className="me-1" /> Start Date{" "}
                          <span className="text-danger">*</span>
                        </label>
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
                        {formErrors.start_date && (
                          <div className="invalid-feedback">
                            {formErrors.start_date}
                          </div>
                        )}
                      </div>

                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">
                          <FiCalendar className="me-1" /> End Date
                        </label>
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
                        {formErrors.end_date && (
                          <div className="invalid-feedback">
                            {formErrors.end_date}
                          </div>
                        )}
                      </div>

                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">
                          <FiClock className="me-1" /> Estimated Hours
                        </label>
                        <input
                          type="number"
                          name="estimated_hours"
                          className="form-control"
                          value={formData.estimated_hours}
                          onChange={handleInputChange}
                          min="0"
                          step="0.5"
                          placeholder="e.g., 8.5"
                          disabled={isDisabled}
                        />
                      </div>

                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">
                          <FiClock className="me-1" /> Actual Hours
                        </label>
                        <input
                          type="number"
                          name="actual_hours"
                          className="form-control"
                          value={formData.actual_hours}
                          onChange={handleInputChange}
                          min="0"
                          step="0.5"
                          placeholder="e.g., 7.0"
                          disabled={isDisabled}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          <FiEdit className="me-2" /> Design Notes
                        </label>
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
                          <FiSettings className="me-2" /> Design Specifications
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

                    <div className="mt-3">
                      <label className="form-label fw-medium">
                        <FiEdit className="me-2" /> Remarks & Notes
                      </label>
                      <textarea
                        name="remarks"
                        className="form-control"
                        rows={3}
                        value={formData.remarks}
                        onChange={handleTextareaChange}
                        placeholder="Add any remarks, special instructions, or notes about this stage..."
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Cost Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "💰 Cost Tracking",
                  "cost",
                  <FiDollarSign />,
                )}
                {expandedSections.cost && (
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <label className="form-label fw-medium">
                          Cost Status
                        </label>
                        <select
                          name="cost_status"
                          className="form-select"
                          value={formData.cost_status}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {costStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Material Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="material_cost"
                            className="form-control"
                            value={formData.material_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">Raw materials</div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Labor Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="labor_cost"
                            className="form-control"
                            value={formData.labor_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Worker/Operator time
                        </div>
                      </div>

                      {/* <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Tooling Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="tooling_cost"
                            className="form-control"
                            value={formData.tooling_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Tools & equipment
                        </div>
                      </div> */}

                      {/* <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Machine Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="machine_cost"
                            className="form-control"
                            value={formData.machine_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Machine operations
                        </div>
                      </div> */}

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Other Costs
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="other_costs"
                            className="form-control"
                            value={formData.other_costs}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">Miscellaneous</div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Markup %
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="markup_percentage"
                            className="form-control"
                            value={formData.markup_percentage}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.5"
                            placeholder="30"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3">Cost Summary</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Total Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.total_cost || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>
                              Markup ({formData.markup_percentage || "0"}%):
                            </span>
                            <span className="fw-bold">
                              ₹{" "}
                              {(
                                (parseFloat(formData.total_cost || 0) *
                                  parseFloat(formData.markup_percentage || 0)) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="fw-bold">Final Price:</span>
                            <span className="fw-bold fs-5 text-success">
                              ₹ {formData.final_price || "0.00"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="progress" style={{ height: "20px" }}>
                            <div
                              className="progress-bar bg-primary"
                              style={{
                                width: `${((parseFloat(formData.material_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Material Cost"
                            >
                              Material
                            </div>
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${((parseFloat(formData.labor_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Labor Cost"
                            >
                              Labor
                            </div>
                            {/* <div
                              className="progress-bar bg-warning"
                              style={{
                                width: `${((parseFloat(formData.tooling_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Tooling Cost"
                            >
                              Tooling
                            </div> */}
                            {/* <div
                              className="progress-bar bg-black"
                              style={{
                                width: `${((parseFloat(formData.machine_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Machine Costs"
                            >
                              Machine
                            </div> */}
                            
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${((parseFloat(formData.other_costs || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Other Costs"
                            >
                              Other
                            </div>
                          </div>
                          <div className="mt-2 small text-muted">
                            Cost breakdown visualization
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Time Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader("⏱️ Time Tracking", "time", <FiClock />)}
                {expandedSections.time && (
                  <div className="card-body">
                    <div className="row g-2">
                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Preparation Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="preparation_time"
                            className="form-control"
                            value={formData.preparation_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Setup & preparation
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Processing Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="processing_time"
                            className="form-control"
                            value={formData.processing_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">Main processing</div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Finishing Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="finishing_time"
                            className="form-control"
                            value={formData.finishing_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">Finishing work</div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Inspection Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="inspection_time"
                            className="form-control"
                            value={formData.inspection_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Quality inspection
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Packaging Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="packaging_time"
                            className="form-control"
                            value={formData.packaging_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Packaging & labeling
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Total Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={`${formData.total_time_spent || "0"} hours`}
                            readOnly
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={calculateTotalTime}
                            disabled={isDisabled}
                          >
                            <FiRefreshCw size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Time Breakdown Notes */}
                    <div className="mt-3">
                      <label className="form-label fw-medium small">
                        Time Breakdown Details
                      </label>
                      <textarea
                        name="time_breakdown"
                        className="form-control form-control-sm"
                        rows={3}
                        value={formData.time_breakdown}
                        onChange={handleInputChange}
                        placeholder="Add detailed time breakdown notes..."
                        disabled={isDisabled}
                      ></textarea>
                    </div>

                    {/* Time Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3 small">Time Allocation</h6>
                      <div className="row">
                        <div className="col-md-8">
                          <div
                            className="progress mb-2"
                            style={{ height: "20px" }}
                          >
                            <div
                              className="progress-bar bg-primary"
                              style={{
                                width: `${
                                  (parseFloat(formData.preparation_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Preparation Time"
                            >
                              Preparation
                            </div>
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${
                                  (parseFloat(formData.processing_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Processing Time"
                            >
                              Processing
                            </div>
                            <div
                              className="progress-bar bg-warning"
                              style={{
                                width: `${
                                  (parseFloat(formData.finishing_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Finishing Time"
                            >
                              Finishing
                            </div>
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${
                                  (parseFloat(formData.inspection_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Inspection Time"
                            >
                              Inspection
                            </div>
                              <div
                              className="progress-bar bg-black"
                              style={{
                                width: `${
                                  (parseFloat(formData.packaging_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Packaging Time"
                            >
                              Packaging
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 text-end">
                          <div className="fw-bold fs-5">
                            {formData.total_time_spent || "0"} hrs
                          </div>
                          <div className="small text-muted">
                            Efficiency: {efficiency}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* File Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "📎 File Tracking",
                  "files",
                  <FiFile />,
                  designFiles.length,
                )}
                {expandedSections.files && (
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          File Status
                        </label>
                        <select
                          name="file_status"
                          className="form-select form-select-sm"
                          value={formData.file_status}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {fileStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Current Version
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="text"
                            name="file_version"
                            className="form-control"
                            value={formData.file_version}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={incrementVersion}
                            disabled={isDisabled}
                          >
                            <FiSave size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Backup Location
                        </label>
                        <input
                          type="text"
                          name="backup_location"
                          className="form-control form-control-sm"
                          value={formData.backup_location}
                          onChange={handleInputChange}
                          placeholder="e.g., Google Drive"
                          disabled={isDisabled}
                        />
                      </div>
                    </div>

                    {/* File Upload Sections */}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card border">
                          <div className="card-header bg-info text-white py-2">
                            <h6 className="mb-0 small fw-bold">
                              Source Files
                              <span className="badge bg-light text-dark ms-2">
                                {getFilesByCategory("source").length}
                              </span>
                            </h6>
                          </div>
                          <div className="card-body p-3">
                            <div
                              className="border rounded p-2 text-center bg-light mb-2"
                              style={{
                                borderStyle: "dashed",
                                borderColor: "#6c757d",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.multiple = true;
                                input.accept =
                                  "image/*,.pdf,.doc,.docx,.xls,.xlsx";
                                input.onchange = (e) =>
                                  handleFileChange(e, "source");
                                input.click();
                              }}
                            >
                              <FiUpload size={16} className="text-info mb-1" />
                              <p className="mb-0 small">Upload Source Files</p>
                              <p className="x-small text-muted">
                                Images, PDF, DOC, XLS
                              </p>
                            </div>

                            {getFilesByCategory("source").length > 0 && (
                              <div className="mt-2">
                                <div className="table-responsive">
                                  <table className="table table-sm mb-0">
                                    <thead>
                                      <tr>
                                        <th className="small">File</th>
                                        <th className="small text-end">Size</th>
                                        <th className="small text-end">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {getFilesByCategory("source").map(
                                        (file) => (
                                          <tr key={file.id}>
                                            <td>
                                              <div className="d-flex align-items-center">
                                                <span className="me-2">
                                                  {getFileIcon(file)}
                                                </span>
                                                <div
                                                  className="small text-truncate"
                                                  style={{ maxWidth: "150px" }}
                                                >
                                                  {file.name}
                                                </div>
                                              </div>
                                            </td>
                                            <td className="small text-end">
                                              {formatFileSize(file.size)}
                                            </td>
                                            <td className="text-end">
                                              <div className="btn-group btn-group-sm">
                                                <button
                                                  type="button"
                                                  className="btn btn-outline-primary btn-sm"
                                                  onClick={() =>
                                                    handleDownloadFile(file)
                                                  }
                                                  title="Download"
                                                >
                                                  <FiDownload size={10} />
                                                </button>
                                                <button
                                                  type="button"
                                                  className="btn btn-outline-danger btn-sm"
                                                  onClick={() =>
                                                    handleRemoveFile(file.id)
                                                  }
                                                  title="Remove"
                                                  disabled={isDisabled}
                                                >
                                                  <FiTrash2 size={10} />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card border">
                          <div className="card-header bg-success text-white py-2">
                            <h6 className="mb-0 small fw-bold">
                              Output Files
                              <span className="badge bg-light text-dark ms-2">
                                {getFilesByCategory("output").length}
                              </span>
                            </h6>
                          </div>
                          <div className="card-body p-3">
                            <div
                              className="border rounded p-2 text-center bg-light mb-2"
                              style={{
                                borderStyle: "dashed",
                                borderColor: "#6c757d",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.multiple = true;
                                input.accept =
                                  ".pdf,.dwg,.dxf,.stl,.step,.iges,.stp,.obj,.3dm";
                                input.onchange = (e) =>
                                  handleFileChange(e, "output");
                                input.click();
                              }}
                            >
                              <FiUpload
                                size={16}
                                className="text-success mb-1"
                              />
                              <p className="mb-0 small">Upload Output Files</p>
                              <p className="x-small text-muted">
                                PDF, DWG, STL, STEP, IGES
                              </p>
                            </div>

                            {getFilesByCategory("output").length > 0 && (
                              <div className="mt-2">
                                <div className="table-responsive">
                                  <table className="table table-sm mb-0">
                                    <thead>
                                      <tr>
                                        <th className="small">File</th>
                                        <th className="small text-end">Size</th>
                                        <th className="small text-center">
                                          Version
                                        </th>
                                        <th className="small text-end">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {getFilesByCategory("output").map(
                                        (file) => (
                                          <tr key={file.id}>
                                            <td>
                                              <div className="d-flex align-items-center">
                                                <span className="me-2">
                                                  {getFileIcon(file)}
                                                </span>
                                                <div
                                                  className="small text-truncate"
                                                  style={{ maxWidth: "120px" }}
                                                >
                                                  {file.name}
                                                </div>
                                              </div>
                                            </td>
                                            <td className="small text-end">
                                              {formatFileSize(file.size)}
                                            </td>
                                            <td className="small text-center">
                                              <span className="badge bg-secondary">
                                                v{file.version}
                                              </span>
                                            </td>
                                            <td className="text-end">
                                              <div className="btn-group btn-group-sm">
                                                <button
                                                  type="button"
                                                  className="btn btn-outline-primary btn-sm"
                                                  onClick={() =>
                                                    handleDownloadFile(file)
                                                  }
                                                  title="Download"
                                                >
                                                  <FiDownload size={10} />
                                                </button>
                                                <button
                                                  type="button"
                                                  className="btn btn-outline-danger btn-sm"
                                                  onClick={() =>
                                                    handleRemoveFile(file.id)
                                                  }
                                                  title="Remove"
                                                  disabled={isDisabled}
                                                >
                                                  <FiTrash2 size={10} />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {uploadError && (
                      <div className="alert alert-danger mt-3 py-2 small">
                        <FiAlertCircle className="me-1" /> {uploadError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top pt-3 bg-white">
              <div className="d-flex justify-content-between w-100 align-items-center">
                <div className="text-muted small">
                  <span className="me-3">📊 Tracking enabled</span>
                  <span className="me-3">🔄 Auto-calculations</span>
                  <span>💾 Version: {formData.file_version}</span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={onClose}
                    disabled={isDisabled}
                  >
                    <FiX size={16} />
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
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateStageModal;
