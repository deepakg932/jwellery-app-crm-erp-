// components/DesignStageForm.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FiUpload,
  FiTrash2,
  FiX,
  FiCalendar,
  FiUser,
  FiAlertCircle,
  FiCheckCircle,
  FiImage,
  FiFile,
  FiClock,
  FiDollarSign,
  FiInfo,
  FiPlus,
  FiMinus,
  FiChevronDown,
  FiChevronUp,
  FiPrinter,
  FiEye,
  FiEyeOff,
  FiSettings,
} from "react-icons/fi";
import { TbRulerMeasure } from "react-icons/tb";

const DesignStageForm = ({
  jobCard,
  stage = null,
  employees = [],
  stageTemplates = [],
  existingStages = [],
  onSave,
  onClose,
  loading = false,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    // Basic Information
    job_card_id: jobCard?._id || "",
    stage_name: "",
    stage_code: "",
    stage_type: "design",
    stage_order: 1,

    // Assignment
    assigned_to: "",
    assigned_department: "Design",
    secondary_assignees: [],

    // Timeline
    start_date: new Date().toISOString().split("T")[0],
    planned_end_date: "",
    actual_end_date: "",
    status: "pending",
    priority: "medium",

    // Design Specifications
    design_type: "",
    design_category: "jewelry",
    design_notes: "",
    design_specifications: "",
    materials: [],
    dimensions: "",
    weight: "",
    gemstones: [],
    metal_type: "gold",
    metal_purity: "18k",

    // Requirements
    customer_requirements: "",
    technical_requirements: "",
    safety_requirements: "",
    regulatory_requirements: "",

    // Approval
    requires_customer_approval: true,
    customer_approval_status: "pending",
    approval_date: "",
    approved_by: "",
    approval_notes: "",

    // Reference Materials
    reference_images: [],
    reference_documents: [],
    sample_references: [],
    color_references: [],

    // Time & Cost Tracking
    estimated_hours: 8,
    actual_hours: 0,
    estimated_cost: 0,
    actual_cost: 0,
    labor_cost: 0,
    material_cost: 0,

    // Output/Deliverables
    design_files: [],
    technical_drawings: [],
    material_list: [],
    instructions: [],
    quality_checklist: [],

    // Stage Management
    dependencies: [],
    next_stage: "",
    auto_start_next: true,
    can_skip: false,
    skip_reason: "",

    // Progress Tracking
    progress_percentage: 0,
    blockers: [],
    milestones: [],

    // Quality & Validation
    quality_check: "pending",
    quality_score: 0,
    validation_tests: [],
    inspection_notes: "",

    // Communication
    client_comments: "",
    internal_notes: "",
    meeting_notes: "",

    // Metadata
    created_by: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: "1.0",
    is_template: false,
    template_id: "",
  });

  const [errors, setErrors] = useState({});
  const [referenceImages, setReferenceImages] = useState([]);
  const [referenceDocuments, setReferenceDocuments] = useState([]);
  const [designFiles, setDesignFiles] = useState([]);
  const [technicalDrawings, setTechnicalDrawings] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    specifications: false,
    timeline: false,
    approval: false,
    files: false,
    cost: false,
    quality: false,
  });

  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Enhanced stage types with more details
  const stageTypes = [
    {
      value: "design",
      label: "Design Request",
      code: "STG001",
      description: "Initial design concept and specifications",
      icon: "🎨",
      default_hours: 8,
      department: "Design",
    },
    {
      value: "concept",
      label: "Concept Design",
      code: "STG002",
      description: "Create initial design concepts",
      icon: "💡",
      default_hours: 16,
      department: "Design",
    },
    {
      value: "cad",
      label: "CAD Creation",
      code: "STG003",
      description: "Computer Aided Design modeling",
      icon: "🖥️",
      default_hours: 24,
      department: "CAD",
    },
    {
      value: "prototype",
      label: "Prototype",
      code: "STG004",
      description: "Create physical prototype",
      icon: "🛠️",
      default_hours: 40,
      department: "Production",
    },
    {
      value: "molding",
      label: "Molding",
      code: "STG005",
      description: "Create molds for production",
      icon: "🔧",
      default_hours: 32,
      department: "Production",
    },
    {
      value: "casting",
      label: "Casting",
      code: "STG006",
      description: "Metal casting process",
      icon: "🔥",
      default_hours: 24,
      department: "Casting",
    },
    {
      value: "assembly",
      label: "Assembly",
      code: "STG007",
      description: "Component assembly",
      icon: "⚙️",
      default_hours: 16,
      department: "Assembly",
    },
    {
      value: "polishing",
      label: "Polishing",
      code: "STG008",
      description: "Finishing and polishing",
      icon: "✨",
      default_hours: 8,
      department: "Finishing",
    },
    {
      value: "quality",
      label: "Quality Check",
      code: "STG009",
      description: "Final quality inspection",
      icon: "🔍",
      default_hours: 4,
      department: "Quality",
    },
    {
      value: "packaging",
      label: "Packaging",
      code: "STG010",
      description: "Product packaging",
      icon: "📦",
      default_hours: 2,
      department: "Packaging",
    },
  ];

  // Design categories
  const designCategories = [
    { value: "jewelry", label: "Jewelry" },
    { value: "ring", label: "Ring" },
    { value: "necklace", label: "Necklace" },
    { value: "bracelet", label: "Bracelet" },
    { value: "earring", label: "Earring" },
    { value: "pendant", label: "Pendant" },
    { value: "custom", label: "Custom Design" },
  ];

  // Metal types
  const metalTypes = [
    { value: "gold", label: "Gold" },
    { value: "silver", label: "Silver" },
    { value: "platinum", label: "Platinum" },
    { value: "palladium", label: "Palladium" },
    { value: "rose_gold", label: "Rose Gold" },
    { value: "white_gold", label: "White Gold" },
  ];

  // Metal purity options
  const metalPurities = [
    { value: "9k", label: "9K (37.5%)" },
    { value: "14k", label: "14K (58.5%)" },
    { value: "18k", label: "18K (75%)" },
    { value: "22k", label: "22K (91.6%)" },
    { value: "24k", label: "24K (99.9%)" },
    { value: "925", label: "Sterling Silver (92.5%)" },
    { value: "950", label: "Platinum (95%)" },
  ];

  // Design types
  const designTypes = [
    { value: "sketch", label: "Hand Sketch" },
    { value: "digital", label: "Digital Design" },
    { value: "3d_model", label: "3D Model" },
    { value: "cad", label: "CAD Design" },
    { value: "hybrid", label: "Hybrid Design" },
    { value: "technical", label: "Technical Drawing" },
  ];

  // Status options
  const statusOptions = [
    { value: "pending", label: "Pending", color: "warning", icon: "⏳" },
    { value: "planned", label: "Planned", color: "info", icon: "📅" },
    {
      value: "in_progress",
      label: "In Progress",
      color: "primary",
      icon: "🔄",
    },
    { value: "on_hold", label: "On Hold", color: "secondary", icon: "⏸️" },
    { value: "blocked", label: "Blocked", color: "danger", icon: "🚫" },
    { value: "review", label: "Under Review", color: "warning", icon: "👁️" },
    { value: "revision", label: "Revision", color: "warning", icon: "📝" },
    { value: "completed", label: "Completed", color: "success", icon: "✅" },
    { value: "approved", label: "Approved", color: "success", icon: "👍" },
    { value: "rejected", label: "Rejected", color: "danger", icon: "👎" },
    { value: "cancelled", label: "Cancelled", color: "dark", icon: "❌" },
  ];

  // Priority options
  const priorityOptions = [
    { value: "low", label: "Low", color: "success", icon: "⬇️" },
    { value: "medium", label: "Medium", color: "warning", icon: "➡️" },
    { value: "high", label: "High", color: "danger", icon: "⬆️" },
    { value: "urgent", label: "Urgent", color: "danger", icon: "🚨" },
    { value: "critical", label: "Critical", color: "danger", icon: "💥" },
  ];

  // Department options
  const departmentOptions = [
    { value: "Design", label: "Design Department", icon: "🎨" },
    { value: "CAD", label: "CAD Department", icon: "🖥️" },
    { value: "Production", label: "Production", icon: "🏭" },
    { value: "Casting", label: "Casting", icon: "🔥" },
    { value: "Assembly", label: "Assembly", icon: "⚙️" },
    { value: "Finishing", label: "Finishing", icon: "✨" },
    { value: "Quality", label: "Quality Control", icon: "🔍" },
    { value: "Packaging", label: "Packaging", icon: "📦" },
    { value: "Sales", label: "Sales", icon: "💼" },
    { value: "Management", label: "Management", icon: "👔" },
  ];

  // Initialize form
  useEffect(() => {
    if (stage) {
      setFormData((prev) => ({
        ...prev,
        ...stage,
        start_date: stage.start_date || new Date().toISOString().split("T")[0],
        planned_end_date: stage.planned_end_date || "",
        actual_end_date: stage.actual_end_date || "",
      }));
      setReferenceImages(stage.reference_images || []);
      setReferenceDocuments(stage.reference_documents || []);
      setDesignFiles(stage.design_files || []);
      setTechnicalDrawings(stage.technical_drawings || []);
    } else {
      // Auto-calculate stage order
      const nextOrder =
        existingStages.length > 0
          ? Math.max(...existingStages.map((s) => s.stage_order || 0)) + 1
          : 1;

      setFormData((prev) => ({
        ...prev,
        stage_order: nextOrder,
        job_card_id: jobCard?._id || "",
      }));
    }
  }, [stage, jobCard, existingStages]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      let newValue = type === "checkbox" ? checked : value;

      // Special handling for numeric fields
      if (
        name.includes("hours") ||
        name.includes("cost") ||
        name.includes("percentage") ||
        name.includes("score")
      ) {
        newValue = parseFloat(value) || 0;
      }

      // Auto-calculate actual cost
      if (name === "labor_cost" || name === "material_cost") {
        const laborCost = name === "labor_cost" ? newValue : prev.labor_cost;
        const materialCost =
          name === "material_cost" ? newValue : prev.material_cost;
        const actualCost = parseFloat(laborCost) + parseFloat(materialCost);

        return {
          ...prev,
          [name]: newValue,
          actual_cost: actualCost,
        };
      }

      return {
        ...prev,
        [name]: newValue,
      };
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle stage type change
  const handleStageTypeChange = (e) => {
    const stageType = e.target.value;
    const selectedType = stageTypes.find((type) => type.value === stageType);

    if (selectedType) {
      setFormData((prev) => ({
        ...prev,
        stage_type: stageType,
        stage_name: selectedType.label,
        stage_code: selectedType.code,
        assigned_department: selectedType.department,
        estimated_hours: selectedType.default_hours,
      }));
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      ...template,
      is_template: false,
      template_id: template._id,
      stage_order: prev.stage_order, // Keep original order
      job_card_id: jobCard?._id || "", // Keep job card reference
    }));
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle file uploads
  const handleFileUpload = (files, fileType) => {
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];
    const validDocTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 20 * 1024 * 1024; // 20MB

    const uploadedFiles = Array.from(files).filter((file) => {
      // Check file size
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          files: `File "${file.name}" exceeds 20MB limit`,
        }));
        return false;
      }

      // Check file type based on fileType
      if (fileType === "reference_images" || fileType === "design_files") {
        if (!validImageTypes.includes(file.type)) {
          setErrors((prev) => ({
            ...prev,
            files: `"${file.name}" is not a valid image file`,
          }));
          return false;
        }
      } else if (
        fileType === "reference_documents" ||
        fileType === "technical_drawings"
      ) {
        if (!validDocTypes.includes(file.type)) {
          setErrors((prev) => ({
            ...prev,
            files: `"${file.name}" is not a valid document file`,
          }));
          return false;
        }
      }

      return true;
    });

    // Update appropriate state
    switch (fileType) {
      case "reference_images":
        setReferenceImages((prev) => [...prev, ...uploadedFiles]);
        break;
      case "reference_documents":
        setReferenceDocuments((prev) => [...prev, ...uploadedFiles]);
        break;
      case "design_files":
        setDesignFiles((prev) => [...prev, ...uploadedFiles]);
        break;
      case "technical_drawings":
        setTechnicalDrawings((prev) => [...prev, ...uploadedFiles]);
        break;
      default:
        break;
    }

    // Clear file error if successful
    if (errors.files) {
      setErrors((prev) => ({ ...prev, files: "" }));
    }
  };

  // Remove file
  const removeFile = (index, fileType) => {
    switch (fileType) {
      case "reference_images":
        setReferenceImages((prev) => prev.filter((_, i) => i !== index));
        break;
      case "reference_documents":
        setReferenceDocuments((prev) => prev.filter((_, i) => i !== index));
        break;
      case "design_files":
        setDesignFiles((prev) => prev.filter((_, i) => i !== index));
        break;
      case "technical_drawings":
        setTechnicalDrawings((prev) => prev.filter((_, i) => i !== index));
        break;
      default:
        break;
    }
  };

  // Handle array field updates (materials, gemstones, etc.)
  const handleArrayFieldChange = (fieldName, value, action = "add") => {
    setFormData((prev) => {
      const currentArray = prev[fieldName] || [];
      let newArray;

      if (action === "add") {
        newArray = [...currentArray, value];
      } else if (action === "remove") {
        newArray = currentArray.filter((_, index) => index !== value);
      } else if (action === "update") {
        newArray = currentArray.map((item, index) =>
          index === value.index ? value.value : item
        );
      }

      return {
        ...prev,
        [fieldName]: newArray,
      };
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.stage_type) {
      newErrors.stage_type = "Stage type is required";
    }
    if (!formData.stage_name.trim()) {
      newErrors.stage_name = "Stage name is required";
    }
    if (!formData.assigned_to) {
      newErrors.assigned_to = "Primary assignee is required";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (
      formData.requires_customer_approval &&
      !formData.design_specifications.trim()
    ) {
      newErrors.design_specifications =
        "Design specifications are required when customer approval is needed";
    }
    if (formData.estimated_hours <= 0) {
      newErrors.estimated_hours = "Estimated hours must be greater than 0";
    }
    if (formData.estimated_cost < 0) {
      newErrors.estimated_cost = "Estimated cost cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare FormData
      const formDataToSend = new FormData();

      // Append all form data
      Object.keys(formData).forEach((key) => {
        if (
          typeof formData[key] === "object" &&
          formData[key] !== null &&
          !(formData[key] instanceof File)
        ) {
          // Stringify objects and arrays
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append files
      [
        { files: referenceImages, field: "reference_images" },
        { files: referenceDocuments, field: "reference_documents" },
        { files: designFiles, field: "design_files" },
        { files: technicalDrawings, field: "technical_drawings" },
      ].forEach(({ files, field }) => {
        files.forEach((file, index) => {
          if (file instanceof File) {
            formDataToSend.append(`${field}[${index}]`, file);
          }
        });
      });

      // Calculate total cost if not set
      if (
        !formData.actual_cost &&
        (formData.labor_cost || formData.material_cost)
      ) {
        const totalCost =
          (parseFloat(formData.labor_cost) || 0) +
          (parseFloat(formData.material_cost) || 0);
        formDataToSend.append("actual_cost", totalCost);
      }

      // Call onSave with FormData
      await onSave(formDataToSend);
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to save stage. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${(parseFloat(amount) || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate total file size
  const calculateTotalFileSize = () => {
    const allFiles = [
      ...referenceImages,
      ...referenceDocuments,
      ...designFiles,
      ...technicalDrawings,
    ];
    const totalBytes = allFiles.reduce(
      (total, file) => total + (file.size || 0),
      0
    );
    const mb = totalBytes / (1024 * 1024);
    return mb.toFixed(2);
  };

  // Get available next stages (stages that come after current stage type)
  const getAvailableNextStages = () => {
    const currentTypeIndex = stageTypes.findIndex(
      (type) => type.value === formData.stage_type
    );
    return stageTypes.slice(currentTypeIndex + 1);
  };

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

  // Render file upload section
  const renderFileUploadSection = (
    title,
    fileType,
    files,
    setFiles,
    accept
  ) => (
    <div className="mb-3">
      <label className="form-label fw-medium d-flex align-items-center gap-2">
        <FiFile size={16} />
        {title}
      </label>
      <div className="border rounded p-3">
        <input
          type="file"
          className="form-control mb-3"
          accept={accept}
          multiple
          onChange={(e) => handleFileUpload(e.target.files, fileType)}
          disabled={loading || isSubmitting}
        />
        {files.length > 0 && (
          <div className="mt-3">
            <h6 className="small fw-bold mb-2">
              Uploaded Files ({files.length}):
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="border rounded p-2 position-relative"
                  style={{ minWidth: "120px" }}
                >
                  <div
                    className="small text-truncate"
                    style={{ maxWidth: "100px" }}
                  >
                    {file.name}
                  </div>
                  <div className="small text-muted">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0"
                    onClick={() => removeFile(index, fileType)}
                    disabled={loading || isSubmitting}
                    style={{ transform: "translate(30%, -30%)" }}
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Calculate stage duration
  const calculateDuration = () => {
    if (!formData.start_date || !formData.planned_end_date) return null;

    const start = new Date(formData.start_date);
    const end = new Date(formData.planned_end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const duration = calculateDuration();

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3" style={{ maxHeight: "90vh" }}>
          <div
            className="modal-header border-bottom pb-3 sticky-top bg-white"
            style={{ zIndex: 1050 }}
          >
            <div>
              <h5 className="modal-title fw-bold fs-5 mb-1">
                {isEditing ? "✏️ Edit Design Stage" : "➕ Add New Design Stage"}
                {stage && (
                  <span className="ms-2 badge bg-info">{stage.stage_code}</span>
                )}
              </h5>
              {jobCard && (
                <div className="small text-muted">
                  Job Card: <strong>{jobCard.job_card_number}</strong>
                  {jobCard.customer_name &&
                    ` • Customer: ${jobCard.customer_name}`}
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading || isSubmitting}
              aria-label="Close"
            ></button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="d-flex flex-column"
            style={{ minHeight: "70vh" }}
          >
            <div
              className="modal-body flex-grow-1"
              style={{ overflowY: "auto" }}
            >
              {/* Error Display */}
              {errors.submit && (
                <div
                  className="alert alert-danger alert-dismissible fade show mb-4"
                  role="alert"
                >
                  <FiAlertCircle className="me-2" />
                  {errors.submit}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() =>
                      setErrors((prev) => ({ ...prev, submit: "" }))
                    }
                  />
                </div>
              )}

              {/* Template Selection (Only for new stages) */}
              {!isEditing && stageTemplates.length > 0 && (
                <div className="card mb-4">
                  {renderSectionHeader(
                    "📋 Start from Template",
                    "templates",
                    <FiSettings />
                  )}
                  {expandedSections.templates && (
                    <div className="card-body">
                      <div className="row row-cols-1 row-cols-md-2 g-3">
                        {stageTemplates.map((template) => (
                          <div key={template._id} className="col">
                            <div
                              className={`card border ${
                                selectedTemplate?._id === template._id
                                  ? "border-primary border-2"
                                  : ""
                              } cursor-pointer hover-shadow`}
                              onClick={() => handleTemplateSelect(template)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="card-title mb-0">
                                    {template.stage_name}
                                  </h6>
                                  <span className="badge bg-secondary">
                                    {template.stage_code}
                                  </span>
                                </div>
                                <p className="card-text small text-muted mb-2">
                                  {template.description || "No description"}
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <small className="text-muted">
                                    <FiClock size={12} className="me-1" />
                                    {template.estimated_hours || 0} hrs
                                  </small>
                                  <small className="text-muted">
                                    <FiDollarSign size={12} className="me-1" />
                                    {formatCurrency(
                                      template.estimated_cost || 0
                                    )}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Basic Information Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "📝 Basic Information",
                  "basic",
                  <FiInfo />
                )}
                {expandedSections.basic && (
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Stage Type <span className="text-danger">*</span>
                        </label>
                        <select
                          name="stage_type"
                          className={`form-select ${
                            errors.stage_type ? "is-invalid" : ""
                          }`}
                          value={formData.stage_type}
                          onChange={handleStageTypeChange}
                          disabled={loading || isSubmitting || isEditing}
                        >
                          <option value="">Select Stage Type</option>
                          {stageTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label} ({type.code})
                            </option>
                          ))}
                        </select>
                        {errors.stage_type && (
                          <div className="invalid-feedback">
                            {errors.stage_type}
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Stage Code
                        </label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={formData.stage_code}
                          readOnly
                        />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Stage Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="stage_name"
                          className={`form-control ${
                            errors.stage_name ? "is-invalid" : ""
                          }`}
                          value={formData.stage_name}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                          placeholder="Enter stage name"
                        />
                        {errors.stage_name && (
                          <div className="invalid-feedback">
                            {errors.stage_name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">
                          Stage Order
                        </label>
                        <input
                          type="number"
                          name="stage_order"
                          className="form-control"
                          value={formData.stage_order}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                          min="1"
                        />
                      </div>

                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">Priority</label>
                        <select
                          name="priority"
                          className="form-select"
                          value={formData.priority}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                        >
                          {priorityOptions.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.icon} {priority.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">Status</label>
                        <select
                          name="status"
                          className="form-select"
                          value={formData.status}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                        >
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.icon} {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">Progress</label>
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="range"
                            name="progress_percentage"
                            className="form-range flex-grow-1"
                            value={formData.progress_percentage}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                            min="0"
                            max="100"
                            step="5"
                          />
                          <span
                            className="fw-bold"
                            style={{ minWidth: "40px" }}
                          >
                            {formData.progress_percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment Section */}
              <div className="card mb-4">
                {renderSectionHeader("👥 Assignment", "assignment", <FiUser />)}
                {expandedSections.assignment && (
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Primary Assignee{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiUser size={14} />
                          </span>
                          <select
                            name="assigned_to"
                            className={`form-select ${
                              errors.assigned_to ? "is-invalid" : ""
                            }`}
                            value={formData.assigned_to}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                          >
                            <option value="">Select Primary Assignee</option>
                            {employees.map((employee) => (
                              <option key={employee._id} value={employee._id}>
                                {employee.name} •{" "}
                                {employee.department || "No Department"} •{" "}
                                {employee.role || "No Role"}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.assigned_to && (
                          <div className="invalid-feedback">
                            {errors.assigned_to}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Department
                        </label>
                        <select
                          name="assigned_department"
                          className="form-select"
                          value={formData.assigned_department}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                        >
                          {departmentOptions.map((dept) => (
                            <option key={dept.value} value={dept.value}>
                              {dept.icon} {dept.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              <div className="card mb-4">
                {renderSectionHeader("📅 Timeline", "timeline", <FiCalendar />)}
                {expandedSections.timeline && (
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Start Date <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiCalendar size={14} />
                          </span>
                          <input
                            type="date"
                            name="start_date"
                            className={`form-control ${
                              errors.start_date ? "is-invalid" : ""
                            }`}
                            value={formData.start_date}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                          />
                        </div>
                        {errors.start_date && (
                          <div className="invalid-feedback">
                            {errors.start_date}
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Planned End Date
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiCalendar size={14} />
                          </span>
                          <input
                            type="date"
                            name="planned_end_date"
                            className="form-control"
                            value={formData.planned_end_date}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                            min={formData.start_date}
                          />
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Actual End Date
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FiCalendar size={14} />
                          </span>
                          <input
                            type="date"
                            name="actual_end_date"
                            className="form-control"
                            value={formData.actual_end_date}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                            min={formData.start_date}
                          />
                        </div>
                      </div>
                    </div>

                    {duration !== null && (
                      <div className="alert alert-info mb-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Duration:</strong> {duration} day
                            {duration !== 1 ? "s" : ""}
                          </div>
                          <div>
                            <strong>Hours:</strong> {formData.estimated_hours}{" "}
                            estimated
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Design Specifications Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "🎨 Design Specifications",
                  "specifications",
                  <TbRulerMeasure />
                )}
                {expandedSections.specifications && (
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Design Category
                        </label>
                        <select
                          name="design_category"
                          className="form-select"
                          value={formData.design_category}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                        >
                          {designCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Design Type
                        </label>
                        <select
                          name="design_type"
                          className="form-select"
                          value={formData.design_type}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                        >
                          <option value="">Select Design Type</option>
                          {designTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Metal Type
                        </label>
                        <select
                          name="metal_type"
                          className="form-select"
                          value={formData.metal_type}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                        >
                          {metalTypes.map((metal) => (
                            <option key={metal.value} value={metal.value}>
                              {metal.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">
                          Metal Purity
                        </label>
                        <select
                          name="metal_purity"
                          className="form-select"
                          value={formData.metal_purity}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                        >
                          {metalPurities.map((purity) => (
                            <option key={purity.value} value={purity.value}>
                              {purity.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">
                          Dimensions
                        </label>
                        <input
                          type="text"
                          name="dimensions"
                          className="form-control"
                          value={formData.dimensions}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                          placeholder="e.g., 10x5x2 mm"
                        />
                      </div>

                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">Weight</label>
                        <div className="input-group">
                          <input
                            type="number"
                            name="weight"
                            className="form-control"
                            value={formData.weight}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                            placeholder="0.0"
                            step="0.1"
                          />
                          <span className="input-group-text">grams</span>
                        </div>
                      </div>

                      <div className="col-md-3 mb-3">
                        <label className="form-label fw-medium">
                          Estimated Hours
                        </label>
                        <div className="input-group">
                          <input
                            type="number"
                            name="estimated_hours"
                            className={`form-control ${
                              errors.estimated_hours ? "is-invalid" : ""
                            }`}
                            value={formData.estimated_hours}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                            min="0"
                            step="0.5"
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        {errors.estimated_hours && (
                          <div className="invalid-feedback">
                            {errors.estimated_hours}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Design Specifications{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <textarea
                        name="design_specifications"
                        className={`form-control ${
                          errors.design_specifications ? "is-invalid" : ""
                        }`}
                        rows="4"
                        placeholder="Detailed design specifications, requirements, constraints..."
                        value={formData.design_specifications}
                        onChange={handleChange}
                        disabled={loading || isSubmitting}
                      />
                      {errors.design_specifications && (
                        <div className="invalid-feedback">
                          {errors.design_specifications}
                        </div>
                      )}
                      <div className="form-text">
                        Include all technical details, measurements, and special
                        requirements
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Design Notes
                      </label>
                      <textarea
                        name="design_notes"
                        className="form-control"
                        rows="3"
                        placeholder="Additional design notes, ideas, inspiration..."
                        value={formData.design_notes}
                        onChange={handleChange}
                        disabled={loading || isSubmitting}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cost Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "💰 Cost Tracking",
                  "cost",
                  <FiDollarSign />
                )}
                {expandedSections.cost && (
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Labor Cost
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="labor_cost"
                            className="form-control"
                            value={formData.labor_cost}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Material Cost
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="material_cost"
                            className="form-control"
                            value={formData.material_cost}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Estimated Cost
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="estimated_cost"
                            className={`form-control ${
                              errors.estimated_cost ? "is-invalid" : ""
                            }`}
                            value={formData.estimated_cost}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        {errors.estimated_cost && (
                          <div className="invalid-feedback">
                            {errors.estimated_cost}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="alert alert-success">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Total Actual Cost:</strong>
                        </div>
                        <div className="fs-5 fw-bold">
                          {formatCurrency(formData.actual_cost)}
                        </div>
                      </div>
                      <div className="small text-muted mt-1">
                        Labor: {formatCurrency(formData.labor_cost)} + Material:{" "}
                        {formatCurrency(formData.material_cost)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* File Uploads Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "📎 Files & Documents",
                  "files",
                  <FiFile />,
                  referenceImages.length +
                    referenceDocuments.length +
                    designFiles.length +
                    technicalDrawings.length
                )}
                {expandedSections.files && (
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        {renderFileUploadSection(
                          "Reference Images",
                          "reference_images",
                          referenceImages,
                          setReferenceImages,
                          "image/*"
                        )}
                      </div>
                      <div className="col-md-6">
                        {renderFileUploadSection(
                          "Reference Documents",
                          "reference_documents",
                          referenceDocuments,
                          setReferenceDocuments,
                          ".pdf,.doc,.docx"
                        )}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        {renderFileUploadSection(
                          "Design Files",
                          "design_files",
                          designFiles,
                          setDesignFiles,
                          "image/*,.pdf,.ai,.psd"
                        )}
                      </div>
                      <div className="col-md-6">
                        {renderFileUploadSection(
                          "Technical Drawings",
                          "technical_drawings",
                          technicalDrawings,
                          setTechnicalDrawings,
                          ".pdf,.dwg,.dxf,.stl"
                        )}
                      </div>
                    </div>

                    {(referenceImages.length > 0 ||
                      referenceDocuments.length > 0 ||
                      designFiles.length > 0 ||
                      technicalDrawings.length > 0) && (
                      <div className="alert alert-info mt-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Total Files:</strong>{" "}
                            {referenceImages.length +
                              referenceDocuments.length +
                              designFiles.length +
                              technicalDrawings.length}
                          </div>
                          <div>
                            <strong>Total Size:</strong>{" "}
                            {calculateTotalFileSize()} MB
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Next Stage Settings */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "➡️ Next Stage Settings",
                  "nextStage",
                  <FiChevronDown />
                )}
                {expandedSections.nextStage && (
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            name="auto_start_next"
                            className="form-check-input"
                            checked={formData.auto_start_next}
                            onChange={handleChange}
                            disabled={loading || isSubmitting}
                            id="autoStartNext"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="autoStartNext"
                          >
                            Auto-start next stage when this stage is completed
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Next Stage
                        </label>
                        <select
                          name="next_stage"
                          className="form-select"
                          value={formData.next_stage}
                          onChange={handleChange}
                          disabled={loading || isSubmitting}
                        >
                          <option value="">Select Next Stage (Optional)</option>
                          {getAvailableNextStages().map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label} ({type.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "📝 Notes & Comments",
                  "notes",
                  <FiInfo />
                )}
                {expandedSections.notes && (
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Internal Notes
                      </label>
                      <textarea
                        name="internal_notes"
                        className="form-control"
                        rows="3"
                        placeholder="Internal notes for team members..."
                        value={formData.internal_notes}
                        onChange={handleChange}
                        disabled={loading || isSubmitting}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Client Comments
                      </label>
                      <textarea
                        name="client_comments"
                        className="form-control"
                        rows="3"
                        placeholder="Client feedback and comments..."
                        value={formData.client_comments}
                        onChange={handleChange}
                        disabled={loading || isSubmitting}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Meeting Notes
                      </label>
                      <textarea
                        name="meeting_notes"
                        className="form-control"
                        rows="3"
                        placeholder="Notes from meetings or discussions..."
                        value={formData.meeting_notes}
                        onChange={handleChange}
                        disabled={loading || isSubmitting}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer border-top pt-3 bg-white sticky-bottom">
              <div className="d-flex justify-content-between w-100">
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={onClose}
                    disabled={loading || isSubmitting}
                  >
                    <FiX size={16} />
                    Cancel
                  </button>
                </div>

                <div className="d-flex gap-2">
                  {!isEditing && (
                    <button
                      type="button"
                      className="btn btn-outline-info d-flex align-items-center gap-2"
                      onClick={() => {
                        // Save as template functionality
                        console.log("Save as template");
                      }}
                      disabled={loading || isSubmitting}
                    >
                      <FiSettings size={16} />
                      Save as Template
                    </button>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={loading || isSubmitting}
                  >
                    {loading || isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle size={16} />
                        {isEditing ? "Update Stage" : "Create Stage"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="w-100 mt-2">
                <div className="small text-muted text-center">
                  All fields marked with <span className="text-danger">*</span>{" "}
                  are required
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DesignStageForm;
