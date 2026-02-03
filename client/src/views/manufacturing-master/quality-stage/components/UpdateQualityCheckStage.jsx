import React, { useState, useEffect, useRef } from "react";
import {
  FiUser,
  FiCheck,
  FiX,
  FiClock,
  FiDollarSign,
  FiFile,
  FiUpload,
  FiTrash2,
  FiEye,
  FiDownload,
  FiAlertCircle,
  FiEdit,
  FiSave,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiFilter,
  FiGrid,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiTool,
  FiPackage,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiPercent,
  FiActivity,
  FiShield,
  FiImage,
  FiArchive,
  FiDatabase,
  FiSettings,
  FiRefreshCw,
  FiInfo,
  FiPlus,
  FiMinus,
  FiScissors,
  FiZap,
  FiWatch,
  FiDroplet,
  FiShoppingCart,
  FiDatabase as FiDatabaseIcon,
} from "react-icons/fi";

const UpdateQualityCheckStage = ({
  selectedStage,
  employees = [],
  onUpdate,
  onClose,
  loading = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [qualityFiles, setQualityFiles] = useState([]);
  const [formData, setFormData] = useState({
    assigned_to: "",
    status: "pending",
    start_date: "",
    end_date: "",

    // Quality Check Points
    check_points: [],
    overall_status: "pending",
    dimensions_check: false,
    dimensions_tolerance: "within_spec",
    dimensions_notes: "",
    weight_check: false,
    weight_tolerance: "within_spec",
    weight_notes: "",
    purity_check: false,
    purity_verified: "",
    purity_certificate_no: "",
    finish_check: false,
    finish_quality: "good",
    finish_defects: "",

    // Defects tracking
    defects_detected: [],
    defects_count: 0,
    critical_defects: 0,
    major_defects: 0,
    minor_defects: 0,

    // Inspection details
    inspection_method: "visual",
    measuring_tools_used: [],
    sample_size: 1,
    batch_size: 1,
    accepted_quantity: 0,
    rejected_quantity: 0,

    // Rework and approval
    rework_required: false,
    rework_reason: "",
    approved_by: "",
    approval_date: "",
    certificate_issued: false,
    certificate_number: "",

    // Cost tracking
    inspection_cost: "",
    labour_cost: "",
    equipment_cost: "",
    certification_cost: "",
    other_costs: "",
    total_cost: "",
    cost_currency: "INR",
    cost_status: "estimated",

    // Time tracking
    preparation_time: "",
    inspection_time: "",
    documentation_time: "",
    approval_time: "",
    total_time_spent: "",
    time_breakdown: "",

    // File tracking
    inspection_reports: [],
    defect_images: [],
    certificates: [],
    file_version: "1.0",
    file_revisions: 0,
    file_status: "draft",
    backup_location: "",

    // Next stage
    stage: "",
    remarks: "",
  });

  console.log(selectedStage);

  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    quality: false,
    defects: false,
    cost: false,
    time: false,
    files: false,
  });

  // Available options
  const statusOptions = [
    { value: "pending", label: "Pending", color: "secondary", icon: "⏳" },
    { value: "in_progress", label: "In Progress", color: "info", icon: "🔍" },
    { value: "passed", label: "Passed", color: "success", icon: "✅" },
    { value: "failed", label: "Failed", color: "danger", icon: "❌" },
    { value: "rework", label: "Rework Required", color: "warning", icon: "🔄" },
    { value: "hold", label: "On Hold", color: "danger", icon: "⏸️" },
    { value: "completed", label: "Completed", color: "success", icon: "🏁" },
  ];

  const checkPointOptions = [
    { id: "dimensions", label: "Dimensions Check", category: "measurement" },
    { id: "weight", label: "Weight Check", category: "measurement" },
    { id: "purity", label: "Purity Verification", category: "material" },
    { id: "finish", label: "Surface Finish", category: "appearance" },
    { id: "assembly", label: "Assembly Check", category: "function" },
    { id: "marking", label: "Markings & Stamps", category: "compliance" },
    { id: "polish", label: "Polish Quality", category: "appearance" },
    { id: "stones", label: "Stone Setting", category: "function" },
    { id: "color", label: "Color Consistency", category: "appearance" },
    { id: "packaging", label: "Packaging Check", category: "final" },
  ];

  const toleranceOptions = [
    { value: "within_spec", label: "Within Specification", color: "success" },
    { value: "slight_deviation", label: "Slight Deviation", color: "warning" },
    { value: "out_of_spec", label: "Out of Specification", color: "danger" },
    { value: "na", label: "Not Applicable", color: "secondary" },
  ];

  const finishQualityOptions = [
    { value: "excellent", label: "Excellent", color: "success" },
    { value: "good", label: "Good", color: "info" },
    { value: "average", label: "Average", color: "warning" },
    { value: "poor", label: "Poor", color: "danger" },
  ];

  const inspectionMethodOptions = [
    { value: "visual", label: "Visual Inspection", icon: "👁️" },
    { value: "dimensional", label: "Dimensional Check", icon: "📐" },
    { value: "weight", label: "Weight Measurement", icon: "⚖️" },
    { value: "purity", label: "Purity Testing", icon: "🧪" },
    { value: "functional", label: "Functional Test", icon: "⚙️" },
    { value: "sample", label: "Sample Testing", icon: "🧫" },
    { value: "destructive", label: "Destructive Test", icon: "🔬" },
  ];

  const measuringToolsOptions = [
    { value: "caliper", label: "Digital Caliper" },
    { value: "micrometer", label: "Micrometer" },
    { value: "scale", label: "Digital Scale" },
    { value: "loupe", label: "Jeweler's Loupe" },
    { value: "spectrometer", label: "Spectrometer" },
    { value: "tester", label: "Gold Tester" },
    { value: "gauge", label: "Thickness Gauge" },
    { value: "templates", label: "Size Templates" },
  ];

  const costStatusOptions = [
    { value: "estimated", label: "Estimated", color: "warning", icon: "📊" },
    { value: "calculated", label: "Calculated", color: "info", icon: "🧮" },
    { value: "finalized", label: "Finalized", color: "success", icon: "✅" },
    { value: "approved", label: "Approved", color: "success", icon: "👍" },
  ];

  const fileStatusOptions = [
    { value: "draft", label: "Draft", icon: "📄" },
    { value: "work_in_progress", label: "Work in Progress", icon: "⚙️" },
    { value: "under_review", label: "Under Review", icon: "👁️" },
    { value: "revised", label: "Revised", icon: "🔄" },
    { value: "final", label: "Final", icon: "✅" },
    { value: "archived", label: "Archived", icon: "📦" },
  ];

  const nextStageOptions = [
    { value: "packaging", label: "Packaging", icon: "📦" },
    { value: "dispatch", label: "Dispatch", icon: "🚚" },
    { value: "storage", label: "Storage", icon: "📦" },
    { value: "rework", label: "Rework", icon: "🔄" },
    { value: "scrap", label: "Scrap", icon: "🗑️" },
    { value: "completed", label: "Completed", icon: "🏁" },
  ];

  // Initialize form data
  useEffect(() => {
    if (selectedStage) {
      const initialData = {
        assigned_to: selectedStage.assigned_to || "",
        status: selectedStage.status || "pending",
        start_date: selectedStage.start_date
          ? new Date(selectedStage.start_date).toISOString().split("T")[0]
          : "",
        end_date: selectedStage.end_date
          ? new Date(selectedStage.end_date).toISOString().split("T")[0]
          : "",

        check_points: selectedStage.check_points || [],
        overall_status: selectedStage.overall_status || "pending",
        dimensions_check: selectedStage.dimensions_check || false,
        dimensions_tolerance:
          selectedStage.dimensions_tolerance || "within_spec",
        dimensions_notes: selectedStage.dimensions_notes || "",
        weight_check: selectedStage.weight_check || false,
        weight_tolerance: selectedStage.weight_tolerance || "within_spec",
        weight_notes: selectedStage.weight_notes || "",
        purity_check: selectedStage.purity_check || false,
        purity_verified: selectedStage.purity_verified || "",
        purity_certificate_no: selectedStage.purity_certificate_no || "",
        finish_check: selectedStage.finish_check || false,
        finish_quality: selectedStage.finish_quality || "good",
        finish_defects: selectedStage.finish_defects || "",

        defects_detected: selectedStage.defects_detected || [],
        defects_count: selectedStage.defects_count || 0,
        critical_defects: selectedStage.critical_defects || 0,
        major_defects: selectedStage.major_defects || 0,
        minor_defects: selectedStage.minor_defects || 0,

        inspection_method: selectedStage.inspection_method || "visual",
        measuring_tools_used: selectedStage.measuring_tools_used || [],
        sample_size: selectedStage.sample_size || 1,
        batch_size: selectedStage.batch_size || 1,
        accepted_quantity: selectedStage.accepted_quantity || 0,
        rejected_quantity: selectedStage.rejected_quantity || 0,

        rework_required: selectedStage.rework_required || false,
        rework_reason: selectedStage.rework_reason || "",
        approved_by: selectedStage.approved_by || "",
        approval_date: selectedStage.approval_date || "",
        certificate_issued: selectedStage.certificate_issued || false,
        certificate_number: selectedStage.certificate_number || "",

        inspection_cost: selectedStage.inspection_cost || "",
        labour_cost: selectedStage.labour_cost || "",
        equipment_cost: selectedStage.equipment_cost || "",
        certification_cost: selectedStage.certification_cost || "",
        other_costs: selectedStage.other_costs || "",
        total_cost: selectedStage.total_cost || "",
        cost_currency: selectedStage.cost_currency || "INR",
        cost_status: selectedStage.cost_status || "estimated",

        preparation_time: selectedStage.preparation_time || "",
        inspection_time: selectedStage.inspection_time || "",
        documentation_time: selectedStage.documentation_time || "",
        approval_time: selectedStage.approval_time || "",
        total_time_spent: selectedStage.total_time_spent || "",
        time_breakdown: selectedStage.time_breakdown || "",

        inspection_reports: selectedStage.inspection_reports || [],
        defect_images: selectedStage.defect_images || [],
        certificates: selectedStage.certificates || [],
        file_version: selectedStage.file_version || "1.0",
        file_revisions: selectedStage.file_revisions || 0,
        file_status: selectedStage.file_status || "draft",
        backup_location: selectedStage.backup_location || "",

        stage: selectedStage.stage,
        remarks: selectedStage.remarks || "",
      };

      setFormData(initialData);

      // Initialize files
      if (selectedStage.files && Array.isArray(selectedStage.files)) {
        const existingFiles = selectedStage.files
          .filter((file) => file.isExisting)
          .map((file) => ({
            ...file,
            id: file.id || file._id || Math.random().toString(36).substr(2, 9),
            isExisting: true,
            file: null,
            category: file.category || "inspection",
            version: file.version || "1.0",
          }));
        setQualityFiles(existingFiles);
      } else {
        setQualityFiles([]);
      }

      setFormErrors({});
      calculateTotals();
    }
  }, [selectedStage]);

  // Calculate totals
  const calculateTotals = () => {
    // Calculate total cost
    const inspection = Number(formData.inspection_cost) || 0;
    const labour = Number(formData.labour_cost) || 0;
    const equipment = Number(formData.equipment_cost) || 0;
    const certification = Number(formData.certification_cost) || 0;
    const other = Number(formData.other_costs) || 0;
    const totalCost = inspection + labour + equipment + certification + other;

    // Calculate total time
    const prep = parseFloat(formData.preparation_time) || 0;
    const inspectionTime = parseFloat(formData.inspection_time) || 0;
    const documentation = parseFloat(formData.documentation_time) || 0;
    const approval = parseFloat(formData.approval_time) || 0;
    const totalTime = prep + inspectionTime + documentation + approval;

    // Calculate defects total
    const critical = parseInt(formData.critical_defects) || 0;
    const major = parseInt(formData.major_defects) || 0;
    const minor = parseInt(formData.minor_defects) || 0;
    const totalDefects = critical + major + minor;

    // Calculate accepted and rejected quantities
    const batchSize = parseInt(formData.batch_size) || 0;
    const accepted = parseInt(formData.accepted_quantity) || 0;
    const rejected = parseInt(formData.rejected_quantity) || 0;

    console.log("QUALITY TOTALS CALCULATION:", {
      totalCost,
      totalTime,
      totalDefects,
      batchSize,
      accepted,
      rejected,
    });

    setFormData((prev) => ({
      ...prev,
      total_cost: totalCost.toFixed(2),
      total_time_spent: totalTime.toFixed(1),
      defects_count: totalDefects,
      // Ensure accepted + rejected doesn't exceed batch size
      accepted_quantity: Math.min(accepted, batchSize).toString(),
      rejected_quantity: Math.min(
        rejected,
        batchSize - Math.min(accepted, batchSize),
      ).toString(),
    }));
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      // Create updated form data with the new value
      const updatedData = { ...prev };

      // Handle special cases for numbers
      if (name.includes("_cost") || name === "markup_percentage") {
        updatedData[name] = value === "" ? "" : value;
      } else if (
        name.includes("_time") ||
        name.includes("_defects") ||
        name.includes("_quantity") ||
        name === "batch_size" ||
        name === "sample_size"
      ) {
        updatedData[name] = value === "" ? "" : value;
      } else {
        updatedData[name] = val;
      }

      // Calculate totals if cost field changed
      if (name.includes("_cost")) {
        const inspection = Number(updatedData.inspection_cost) || 0;
        const labour = Number(updatedData.labour_cost) || 0;
        const equipment = Number(updatedData.equipment_cost) || 0;
        const certification = Number(updatedData.certification_cost) || 0;
        const other = Number(updatedData.other_costs) || 0;
        const totalCost =
          inspection + labour + equipment + certification + other;

        updatedData.total_cost = totalCost.toFixed(2);
      }

      // Calculate totals if time field changed
      if (name.includes("_time")) {
        const prep = parseFloat(updatedData.preparation_time) || 0;
        const inspectionTime = parseFloat(updatedData.inspection_time) || 0;
        const documentation = parseFloat(updatedData.documentation_time) || 0;
        const approval = parseFloat(updatedData.approval_time) || 0;
        const totalTime = prep + inspectionTime + documentation + approval;

        updatedData.total_time_spent = totalTime.toFixed(1);
      }

      // Calculate defects total if defects field changed
      if (name.includes("_defects")) {
        const critical = parseInt(updatedData.critical_defects) || 0;
        const major = parseInt(updatedData.major_defects) || 0;
        const minor = parseInt(updatedData.minor_defects) || 0;
        const totalDefects = critical + major + minor;

        updatedData.defects_count = totalDefects;
      }

      // Handle batch size and quantity calculations
      if (
        name === "batch_size" ||
        name === "accepted_quantity" ||
        name === "rejected_quantity"
      ) {
        const batchSize = parseInt(updatedData.batch_size) || 0;
        let accepted = parseInt(updatedData.accepted_quantity) || 0;
        let rejected = parseInt(updatedData.rejected_quantity) || 0;

        // Ensure accepted doesn't exceed batch size
        if (accepted > batchSize) {
          accepted = batchSize;
        }

        // Ensure rejected doesn't exceed remaining
        const remaining = batchSize - accepted;
        if (rejected > remaining) {
          rejected = remaining;
        }

        // Ensure sample size doesn't exceed batch size
        const sampleSize = parseInt(updatedData.sample_size) || 0;
        if (sampleSize > batchSize) {
          updatedData.sample_size = batchSize.toString();
        }

        updatedData.accepted_quantity = accepted.toString();
        updatedData.rejected_quantity = rejected.toString();
      }

      // Ensure sample size doesn't exceed batch size
      if (name === "sample_size") {
        const sampleSize = parseInt(value) || 0;
        const batchSize = parseInt(updatedData.batch_size) || 0;
        updatedData.sample_size = Math.min(sampleSize, batchSize).toString();
      }

      // Update overall status based on defects
      if (
        name.includes("_defects") ||
        name === "accepted_quantity" ||
        name === "rejected_quantity"
      ) {
        const critical = parseInt(updatedData.critical_defects) || 0;
        const rejected = parseInt(updatedData.rejected_quantity) || 0;
        const batchSize = parseInt(updatedData.batch_size) || 0;

        if (critical > 0) {
          updatedData.overall_status = "failed";
          updatedData.rework_required = true;
        } else if (
          rejected > 0 &&
          batchSize > 0 &&
          rejected / batchSize > 0.1
        ) {
          updatedData.overall_status = "rework";
          updatedData.rework_required = true;
        } else if (
          updatedData.overall_status === "pending" ||
          updatedData.overall_status === "in_progress"
        ) {
          updatedData.overall_status = "passed";
          updatedData.rework_required = false;
        }
      }

      // Update status when rework required changes
      if (name === "rework_required") {
        if (val) {
          updatedData.overall_status = "rework";
        } else {
          const critical = parseInt(updatedData.critical_defects) || 0;
          if (critical === 0) {
            updatedData.overall_status = "passed";
          }
        }
      }

      return updatedData;
    });

    // Clear error if exists
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle checkbox array changes
  const handleCheckboxArrayChange = (field, value, checked) => {
    setFormData((prev) => {
      const currentArray = [...(prev[field] || [])];
      if (checked) {
        if (!currentArray.includes(value)) {
          currentArray.push(value);
        }
      } else {
        const index = currentArray.indexOf(value);
        if (index > -1) {
          currentArray.splice(index, 1);
        }
      }
      return {
        ...prev,
        [field]: currentArray,
      };
    });
  };

  // Handle textarea change
  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle check point toggle
  const handleCheckPointToggle = (checkPointId) => {
    setFormData((prev) => {
      const currentPoints = [...(prev.check_points || [])];
      const index = currentPoints.indexOf(checkPointId);

      if (index > -1) {
        currentPoints.splice(index, 1);
      } else {
        currentPoints.push(checkPointId);
      }

      return {
        ...prev,
        check_points: currentPoints,
      };
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.assigned_to) {
      errors.assigned_to = "Assigned Inspector is required";
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

    const batchSize = parseInt(formData.batch_size) || 0;
    const accepted = parseInt(formData.accepted_quantity) || 0;
    const rejected = parseInt(formData.rejected_quantity) || 0;

    if (accepted + rejected > batchSize) {
      errors.accepted_quantity = "Accepted + rejected cannot exceed batch size";
      errors.rejected_quantity = "Accepted + rejected cannot exceed batch size";
    }

    const sampleSize = parseInt(formData.sample_size) || 0;
    if (sampleSize > batchSize) {
      errors.sample_size = "Sample size cannot exceed batch size";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle file upload
  const handleFileUpload = async (files, category = "inspection") => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return [];

    const maxSize = 100 * 1024 * 1024;
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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/msword",
    ];

    const invalidFiles = fileList.filter(
      (file) => !allowedTypes.includes(file.type),
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

      setQualityFiles((prev) => [...prev, ...newFiles]);

      // Update form data arrays
      if (category === "inspection") {
        setFormData((prev) => ({
          ...prev,
          inspection_reports: [
            ...prev.inspection_reports,
            ...newFiles.map((f) => f.name),
          ],
        }));
      } else if (category === "defect") {
        setFormData((prev) => ({
          ...prev,
          defect_images: [
            ...prev.defect_images,
            ...newFiles.map((f) => f.name),
          ],
        }));
      } else if (category === "certificate") {
        setFormData((prev) => ({
          ...prev,
          certificates: [...prev.certificates, ...newFiles.map((f) => f.name)],
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
  const handleFileChange = async (e, category = "inspection") => {
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

  const handleDrop = async (e, category = "inspection") => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files, category);
    }
  };

  // Handle file removal
  const handleRemoveFile = (fileId) => {
    const fileToRemove = qualityFiles.find((f) => f.id === fileId);
    if (fileToRemove && fileToRemove.url && !fileToRemove.isExisting) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    setQualityFiles((prev) => prev.filter((file) => file.id !== fileId));
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

    return <FiFile className="text-muted" />;
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
      const filesToUpload = qualityFiles
        .filter((file) => !file.isExisting && file.file)
        .map((file) => file.file);

      const updateData = {
        assigned_to: formData.assigned_to,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date || "",

        check_points: formData.check_points,
        overall_status: formData.overall_status,
        dimensions_check: formData.dimensions_check || false,
        dimensions_tolerance: formData.dimensions_tolerance || "",
        dimensions_notes: formData.dimensions_notes || "",
        weight_check: formData.weight_check || false,
        weight_tolerance: formData.weight_tolerance || "",
        weight_notes: formData.weight_notes || "",
        purity_check: formData.purity_check || false,
        purity_verified: formData.purity_verified || "",
        purity_certificate_no: formData.purity_certificate_no || "",
        finish_check: formData.finish_check || false,
        finish_quality: formData.finish_quality || "",
        finish_defects: formData.finish_defects || "",

        defects_detected: formData.defects_detected || [],
        defects_count: formData.defects_count || 0,
        critical_defects: formData.critical_defects || 0,
        major_defects: formData.major_defects || 0,
        minor_defects: formData.minor_defects || 0,

        inspection_method: formData.inspection_method || "visual",
        measuring_tools_used: formData.measuring_tools_used || [],
        sample_size: formData.sample_size || 1,
        batch_size: formData.batch_size || 1,
        accepted_quantity: formData.accepted_quantity || 0,
        rejected_quantity: formData.rejected_quantity || 0,

        rework_required: formData.rework_required || false,
        rework_reason: formData.rework_reason || "",
        approved_by: formData.approved_by || "",
        approval_date: formData.approval_date || "",
        certificate_issued: formData.certificate_issued || false,
        certificate_number: formData.certificate_number || "",

        inspection_cost: formData.inspection_cost || "0",
        labour_cost: formData.labour_cost || "0",
        equipment_cost: formData.equipment_cost || "0",
        certification_cost: formData.certification_cost || "0",
        other_costs: formData.other_costs || "0",
        total_cost: formData.total_cost || "0",
        cost_currency: formData.cost_currency || "INR",
        cost_status: formData.cost_status || "estimated",

        preparation_time: formData.preparation_time || "0",
        inspection_time: formData.inspection_time || "0",
        documentation_time: formData.documentation_time || "0",
        approval_time: formData.approval_time || "0",
        total_time_spent: formData.total_time_spent || "0",
        time_breakdown: formData.time_breakdown || "",

        file_version: formData.file_version || "1.0",
        file_revisions: formData.file_revisions || 0,
        file_status: formData.file_status || "draft",
        backup_location: formData.backup_location || "",

        stage: formData.stage,
        remarks: formData.remarks || "",

        // files: qualityFiles,
      };

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

  if (!selectedStage) return null;

  const isDisabled = loading || uploading;

  // Calculate statistics
  const passRate =
    formData.batch_size > 0
      ? (
          (parseInt(formData.accepted_quantity) /
            parseInt(formData.batch_size)) *
          100
        ).toFixed(1)
      : "0";

  const defectRate =
    formData.batch_size > 0
      ? (
          (parseInt(formData.rejected_quantity) /
            parseInt(formData.batch_size)) *
          100
        ).toFixed(1)
      : "0";

  const efficiency =
    formData.total_time_spent > 0
      ? Math.max(
          0,
          Math.min(100, (8 / parseFloat(formData.total_time_spent)) * 100),
        ).toFixed(1)
      : "100";

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
        <div className="modal-content rounded-3" style={{ maxHeight: "90vh" }}>
          <div
            className="modal-header border-bottom pb-3 sticky-top bg-white"
            style={{ zIndex: 1050 }}
          >
            <div>
              <h5 className="modal-title fw-bold fs-5 mb-1">
                <FiCheck className="me-2" />
                Update Quality Check Stage: {selectedStage.job_card_no}
              </h5>
              {selectedStage && (
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="badge bg-primary">
                    <FiShield className="me-1" /> Quality Check
                  </span>
                  <span className="badge bg-info">
                    <FiUser className="me-1" /> Quality Department
                  </span>
                  {formData.stage && (
                    <span className="badge bg-success">
                      <FiPackage className="me-1" />
                      Next:{" "}
                      {nextStageOptions.find(
                        (opt) => opt.value === formData.stage,
                      )?.label || formData.stage}
                    </span>
                  )}
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
                          <h6 className="text-muted mb-1">Quality Status</h6>
                          <div className="d-flex align-items-center">
                            <span
                              className={`badge ${
                                formData.overall_status === "passed"
                                  ? "bg-success"
                                  : formData.overall_status === "failed"
                                    ? "bg-danger"
                                    : formData.overall_status === "rework"
                                      ? "bg-warning"
                                      : "bg-info"
                              } me-2`}
                            >
                              {formData.overall_status?.toUpperCase()}
                            </span>
                            <h4 className="mb-0">{passRate}%</h4>
                          </div>
                        </div>
                        <FiCheckCircle className="text-success" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        {formData.accepted_quantity || 0} of{" "}
                        {formData.batch_size || 0} passed
                        {formData.rework_required && (
                          <span className="text-warning ms-2">
                            ⚠️ Rework required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Defects Summary</h6>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-danger me-2">
                              {formData.defects_count || 0}
                            </span>
                            <h4 className="mb-0">{defectRate}%</h4>
                          </div>
                        </div>
                        <FiAlertTriangle className="text-warning" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Critical: {formData.critical_defects || 0} | Major:{" "}
                        {formData.major_defects || 0} | Minor:{" "}
                        {formData.minor_defects || 0}
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
                      <div className="small text-muted mt-1">
                        Efficiency: {efficiency}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Cost Status</h6>
                          <div className="d-flex align-items-center">
                            <span
                              className={`badge ${
                                formData.cost_status === "estimated"
                                  ? "bg-warning"
                                  : formData.cost_status === "calculated"
                                    ? "bg-info"
                                    : "bg-success"
                              } me-2`}
                            >
                              {
                                costStatusOptions.find(
                                  (c) => c.value === formData.cost_status,
                                )?.label
                              }
                            </span>
                            <h4 className="mb-0">
                              ₹ {formData.total_cost || "0.00"}
                            </h4>
                          </div>
                        </div>
                        <FiDollarSign className="text-warning" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Inspection: ₹{formData.inspection_cost || "0"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "👤 Basic Information",
                  "basic",
                  <FiUser />,
                )}
                {expandedSections.basic && (
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          <FiUser className="me-1" /> Assigned Inspector{" "}
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
                          <option value="">Select Inspector</option>
                          {employees
                            .filter(
                              (emp) =>
                                emp.department
                                  ?.toLowerCase()
                                  .includes("quality") ||
                                emp.role_id?.role_name
                                  ?.toLowerCase()
                                  .includes("quality") ||
                                emp.role_id?.role_name
                                  ?.toLowerCase()
                                  .includes("inspector"),
                            )
                            .map((emp) => (
                              <option key={emp._id} value={emp._id}>
                                {emp.name} (
                                {emp.department ||
                                  emp.role_id?.role_name ||
                                  "Quality"}
                                )
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
                          Overall Status <span className="text-danger">*</span>
                        </label>
                        <select
                          name="overall_status"
                          className={`form-select ${
                            formErrors.status ? "is-invalid" : ""
                          }`}
                          value={formData.overall_status}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          <option value="">Select Status</option>
                          {statusOptions.map((option) => (
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

                      <div className="col-md-4 mb-3">
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

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          <FiPackage className="me-1" /> Next Stage
                        </label>
                        <select
                          name="stage"
                          className="form-select"
                          value={formData.stage}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {nextStageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Batch Size
                        </label>
                        <input
                          type="number"
                          name="batch_size"
                          className={`form-control ${
                            formErrors.sample_size ? "is-invalid" : ""
                          }`}
                          value={formData.batch_size}
                          onChange={handleInputChange}
                          min="1"
                          placeholder="e.g., 100"
                          disabled={isDisabled}
                        />
                        {formErrors.sample_size && (
                          <div className="invalid-feedback">
                            {formErrors.sample_size}
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Sample Size
                        </label>
                        <input
                          type="number"
                          name="sample_size"
                          className={`form-control ${
                            formErrors.sample_size ? "is-invalid" : ""
                          }`}
                          value={formData.sample_size}
                          onChange={handleInputChange}
                          min="1"
                          max={formData.batch_size}
                          placeholder="e.g., 10"
                          disabled={isDisabled}
                        />
                        {formErrors.sample_size && (
                          <div className="invalid-feedback">
                            {formErrors.sample_size}
                          </div>
                        )}
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Approved By
                        </label>
                        <input
                          type="text"
                          name="approved_by"
                          className="form-control"
                          value={formData.approved_by}
                          onChange={handleInputChange}
                          placeholder="Approver name"
                          disabled={isDisabled}
                        />
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
                        placeholder="Add any remarks, special instructions, or notes about this quality check..."
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Quality Check Points Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "🔍 Quality Check Points",
                  "quality",
                  <FiCheckCircle />,
                  formData.check_points?.length || 0,
                )}
                {expandedSections.quality && (
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <label className="form-label fw-medium">
                          Select Check Points
                        </label>
                        <div className="row">
                          {checkPointOptions.map((checkPoint) => (
                            <div key={checkPoint.id} className="col-md-4 mb-2">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`check_${checkPoint.id}`}
                                  checked={formData.check_points?.includes(
                                    checkPoint.id,
                                  )}
                                  onChange={(e) =>
                                    handleCheckPointToggle(checkPoint.id)
                                  }
                                  disabled={isDisabled}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={`check_${checkPoint.id}`}
                                >
                                  {checkPoint.label}
                                  <span className="badge bg-light text-dark ms-2">
                                    {checkPoint.category}
                                  </span>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      {/* Dimensions Check */}
                      <div className="col-md-4 mb-3">
                        <div className="card h-100">
                          <div className="card-header py-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="dimensions_check"
                                id="dimensions_check"
                                checked={formData.dimensions_check}
                                onChange={handleInputChange}
                                disabled={isDisabled}
                              />
                              <label
                                className="form-check-label fw-medium"
                                htmlFor="dimensions_check"
                              >
                                Dimensions Check
                              </label>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="mb-2">
                              <label className="form-label small">
                                Tolerance
                              </label>
                              <select
                                name="dimensions_tolerance"
                                className="form-select form-select-sm"
                                value={formData.dimensions_tolerance}
                                onChange={handleInputChange}
                                disabled={isDisabled}
                              >
                                {toleranceOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="form-label small">Notes</label>
                              <textarea
                                name="dimensions_notes"
                                className="form-control form-control-sm"
                                rows={2}
                                value={formData.dimensions_notes}
                                onChange={handleInputChange}
                                placeholder="Dimension check notes..."
                                disabled={isDisabled}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Weight Check */}
                      <div className="col-md-4 mb-3">
                        <div className="card h-100">
                          <div className="card-header py-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="weight_check"
                                id="weight_check"
                                checked={formData.weight_check}
                                onChange={handleInputChange}
                                disabled={isDisabled}
                              />
                              <label
                                className="form-check-label fw-medium"
                                htmlFor="weight_check"
                              >
                                Weight Check
                              </label>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="mb-2">
                              <label className="form-label small">
                                Tolerance
                              </label>
                              <select
                                name="weight_tolerance"
                                className="form-select form-select-sm"
                                value={formData.weight_tolerance}
                                onChange={handleInputChange}
                                disabled={isDisabled}
                              >
                                {toleranceOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="form-label small">Notes</label>
                              <textarea
                                name="weight_notes"
                                className="form-control form-control-sm"
                                rows={2}
                                value={formData.weight_notes}
                                onChange={handleInputChange}
                                placeholder="Weight check notes..."
                                disabled={isDisabled}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Purity Check */}
                      <div className="col-md-4 mb-3">
                        <div className="card h-100">
                          <div className="card-header py-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="purity_check"
                                id="purity_check"
                                checked={formData.purity_check}
                                onChange={handleInputChange}
                                disabled={isDisabled}
                              />
                              <label
                                className="form-check-label fw-medium"
                                htmlFor="purity_check"
                              >
                                Purity Check
                              </label>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="mb-2">
                              <label className="form-label small">
                                Verified Purity
                              </label>
                              <input
                                type="text"
                                name="purity_verified"
                                className="form-control form-control-sm"
                                value={formData.purity_verified}
                                onChange={handleInputChange}
                                placeholder="e.g., 18K, 22K"
                                disabled={isDisabled}
                              />
                            </div>
                            <div>
                              <label className="form-label small">
                                Certificate No.
                              </label>
                              <input
                                type="text"
                                name="purity_certificate_no"
                                className="form-control form-control-sm"
                                value={formData.purity_certificate_no}
                                onChange={handleInputChange}
                                placeholder="Certificate number"
                                disabled={isDisabled}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Finish Quality Check */}
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header py-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="finish_check"
                                id="finish_check"
                                checked={formData.finish_check}
                                onChange={handleInputChange}
                                disabled={isDisabled}
                              />
                              <label
                                className="form-check-label fw-medium"
                                htmlFor="finish_check"
                              >
                                Finish Quality
                              </label>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="mb-2">
                              <label className="form-label small">
                                Quality Rating
                              </label>
                              <select
                                name="finish_quality"
                                className="form-select form-select-sm"
                                value={formData.finish_quality}
                                onChange={handleInputChange}
                                disabled={isDisabled}
                              >
                                {finishQualityOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="form-label small">
                                Defects
                              </label>
                              <textarea
                                name="finish_defects"
                                className="form-control form-control-sm"
                                rows={2}
                                value={formData.finish_defects}
                                onChange={handleInputChange}
                                placeholder="Describe finish defects..."
                                disabled={isDisabled}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card h-100">
                          <div className="card-header py-2">
                            <h6 className="mb-0 fw-medium">
                              Inspection Details
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-2">
                              <label className="form-label small">Method</label>
                              <select
                                name="inspection_method"
                                className="form-select form-select-sm"
                                value={formData.inspection_method}
                                onChange={handleInputChange}
                                disabled={isDisabled}
                              >
                                {inspectionMethodOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.icon} {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="form-label small">
                                Tools Used
                              </label>
                              <div className="row">
                                {measuringToolsOptions.map((tool) => (
                                  <div key={tool.value} className="col-6 mb-1">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`tool_${tool.value}`}
                                        checked={formData.measuring_tools_used?.includes(
                                          tool.value,
                                        )}
                                        onChange={(e) =>
                                          handleCheckboxArrayChange(
                                            "measuring_tools_used",
                                            tool.value,
                                            e.target.checked,
                                          )
                                        }
                                        disabled={isDisabled}
                                      />
                                      <label
                                        className="form-check-label small"
                                        htmlFor={`tool_${tool.value}`}
                                      >
                                        {tool.label}
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Defects Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "⚠️ Defects Tracking",
                  "defects",
                  <FiAlertTriangle />,
                  formData.defects_count,
                )}
                {expandedSections.defects && (
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          <FiCheck className="me-1" /> Accepted Quantity
                        </label>
                        <input
                          type="number"
                          name="accepted_quantity"
                          className={`form-control ${
                            formErrors.accepted_quantity ? "is-invalid" : ""
                          }`}
                          value={formData.accepted_quantity}
                          onChange={handleInputChange}
                          min="0"
                          max={formData.batch_size}
                          placeholder="e.g., 95"
                          disabled={isDisabled}
                        />
                        {formErrors.accepted_quantity && (
                          <div className="invalid-feedback">
                            {formErrors.accepted_quantity}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          <FiX className="me-1" /> Rejected Quantity
                        </label>
                        <input
                          type="number"
                          name="rejected_quantity"
                          className="form-control"
                          value={formData.rejected_quantity}
                          onChange={handleInputChange}
                          min="0"
                          max={formData.batch_size}
                          placeholder="e.g., 5"
                          disabled={isDisabled}
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Critical Defects
                        </label>
                        <input
                          type="number"
                          name="critical_defects"
                          className="form-control form-control-sm"
                          value={formData.critical_defects}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="e.g., 0"
                          disabled={isDisabled}
                        />
                        <div className="form-text x-small">
                          Safety/functional defects
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Major Defects
                        </label>
                        <input
                          type="number"
                          name="major_defects"
                          className="form-control form-control-sm"
                          value={formData.major_defects}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="e.g., 2"
                          disabled={isDisabled}
                        />
                        <div className="form-text x-small">
                          Appearance/performance defects
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Minor Defects
                        </label>
                        <input
                          type="number"
                          name="minor_defects"
                          className="form-control form-control-sm"
                          value={formData.minor_defects}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="e.g., 3"
                          disabled={isDisabled}
                        />
                        <div className="form-text x-small">
                          Cosmetic defects
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="rework_required"
                            id="rework_required"
                            checked={formData.rework_required}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="rework_required"
                          >
                            Rework Required
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="certificate_issued"
                            id="certificate_issued"
                            checked={formData.certificate_issued}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="certificate_issued"
                          >
                            Certificate Issued
                          </label>
                        </div>
                      </div>
                    </div>

                    {formData.rework_required && (
                      <div className="row mb-3">
                        <div className="col-md-12">
                          <label className="form-label fw-medium">
                            Rework Reason
                          </label>
                          <textarea
                            name="rework_reason"
                            className="form-control"
                            rows={2}
                            value={formData.rework_reason}
                            onChange={handleInputChange}
                            placeholder="Explain why rework is required..."
                            disabled={isDisabled}
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {formData.certificate_issued && (
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            Certificate Number
                          </label>
                          <input
                            type="text"
                            name="certificate_number"
                            className="form-control"
                            value={formData.certificate_number}
                            onChange={handleInputChange}
                            placeholder="e.g., QC-2024-001"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            Approval Date
                          </label>
                          <input
                            type="date"
                            name="approval_date"
                            className="form-control"
                            value={formData.approval_date}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                          />
                        </div>
                      </div>
                    )}

                    {/* Defects Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3">Defects Summary</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Total Defects:</span>
                            <span className="fw-bold">
                              {formData.defects_count || 0}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Critical Defects:</span>
                            <span className="fw-bold text-danger">
                              {formData.critical_defects || 0}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Major Defects:</span>
                            <span className="fw-bold text-warning">
                              {formData.major_defects || 0}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Minor Defects:</span>
                            <span className="fw-bold text-info">
                              {formData.minor_defects || 0}
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="fw-bold">Pass Rate:</span>
                            <span
                              className={`fw-bold ${
                                parseFloat(passRate) >= 95
                                  ? "text-success"
                                  : parseFloat(passRate) >= 90
                                    ? "text-warning"
                                    : "text-danger"
                              }`}
                            >
                              {passRate}%
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="progress" style={{ height: "20px" }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${passRate}%` }}
                              title="Accepted"
                            >
                              Accepted ({formData.accepted_quantity})
                            </div>
                            <div
                              className="progress-bar bg-danger"
                              style={{ width: `${defectRate}%` }}
                              title="Rejected"
                            >
                              Rejected ({formData.rejected_quantity})
                            </div>
                          </div>
                          <div className="mt-3">
                            <div
                              className="progress"
                              style={{ height: "15px" }}
                            >
                              <div
                                className="progress-bar bg-danger"
                                style={{
                                  width: `${(parseInt(formData.critical_defects) / (parseInt(formData.defects_count) || 1)) * 100}%`,
                                }}
                                title="Critical Defects"
                              >
                                Critical
                              </div>
                              <div
                                className="progress-bar bg-warning"
                                style={{
                                  width: `${(parseInt(formData.major_defects) / (parseInt(formData.defects_count) || 1)) * 100}%`,
                                }}
                                title="Major Defects"
                              >
                                Major
                              </div>
                              <div
                                className="progress-bar bg-info"
                                style={{
                                  width: `${(parseInt(formData.minor_defects) / (parseInt(formData.defects_count) || 1)) * 100}%`,
                                }}
                                title="Minor Defects"
                              >
                                Minor
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div
                              className="progress"
                              style={{ height: "15px" }}
                            >
                              <div
                                className="progress-bar bg-danger"
                                style={{
                                  width: `${(formData.critical_defects / (formData.defects_count || 1)) * 100}%`,
                                }}
                                title="Critical Defects"
                              >
                                Critical
                              </div>
                              <div
                                className="progress-bar bg-warning"
                                style={{
                                  width: `${(formData.major_defects / (formData.defects_count || 1)) * 100}%`,
                                }}
                                title="Major Defects"
                              >
                                Major
                              </div>
                              <div
                                className="progress-bar bg-info"
                                style={{
                                  width: `${(formData.minor_defects / (formData.defects_count || 1)) * 100}%`,
                                }}
                                title="Minor Defects"
                              >
                                Minor
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Inspection Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="inspection_cost"
                            className="form-control"
                            value={formData.inspection_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Testing & inspection
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Labour Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="labour_cost"
                            className="form-control"
                            value={formData.labour_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">Inspector wages</div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Equipment Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="equipment_cost"
                            className="form-control"
                            value={formData.equipment_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">Tool usage</div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Certification Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="certification_cost"
                            className="form-control"
                            value={formData.certification_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Certificate fees
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
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

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Total Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={formData.total_cost || "0.00"}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3">Cost Summary</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Inspection Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.inspection_cost || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Labour Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.labour_cost || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Equipment Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.equipment_cost || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Certification Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.certification_cost || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Other Costs:</span>
                            <span className="fw-bold">
                              ₹ {formData.other_costs || "0.00"}
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="fw-bold">Total Cost:</span>
                            <span className="fw-bold fs-5">
                              ₹ {formData.total_cost || "0.00"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="progress" style={{ height: "20px" }}>
                            <div
                              className="progress-bar bg-primary"
                              style={{
                                width: `${((parseFloat(formData.inspection_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Inspection Cost"
                            >
                              Inspection
                            </div>
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${((parseFloat(formData.labour_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Labour Cost"
                            >
                              Labour
                            </div>
                            <div
                              className="progress-bar bg-warning"
                              style={{
                                width: `${((parseFloat(formData.equipment_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Equipment Cost"
                            >
                              Equipment
                            </div>
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${((parseFloat(formData.certification_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Certification Cost"
                            >
                              Certification
                            </div>
                            <div
                              className="progress-bar bg-secondary"
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
                      <div className="col-md-3 mb-2">
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

                      <div className="col-md-3 mb-2">
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
                          Actual inspection
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Documentation Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="documentation_time"
                            className="form-control"
                            value={formData.documentation_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Report preparation
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Approval Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="approval_time"
                            className="form-control"
                            value={formData.approval_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Approval process
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
                            onClick={calculateTotals}
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
                              Prep
                            </div>
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${
                                  (parseFloat(formData.inspection_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Inspection"
                            >
                              Inspect
                            </div>
                            <div
                              className="progress-bar bg-warning"
                              style={{
                                width: `${
                                  (parseFloat(
                                    formData.documentation_time || 0,
                                  ) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Documentation"
                            >
                              Docs
                            </div>
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${
                                  (parseFloat(formData.approval_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Approval"
                            >
                              Approve
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
                  qualityFiles.length,
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
                      <div className="col-md-4">
                        <div className="card border">
                          <div className="card-header bg-info text-white py-2">
                            <h6 className="mb-0 small fw-bold">
                              Inspection Reports
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  qualityFiles.filter(
                                    (f) => f.category === "inspection",
                                  ).length
                                }
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
                                input.accept = ".pdf,.doc,.docx,.xls,.xlsx";
                                input.onchange = (e) =>
                                  handleFileChange(e, "inspection");
                                input.click();
                              }}
                            >
                              <FiUpload size={16} className="text-info mb-1" />
                              <p className="mb-0 small">Upload Reports</p>
                              <p className="x-small text-muted">
                                PDF, DOC, XLS
                              </p>
                            </div>

                            {qualityFiles.filter(
                              (f) => f.category === "inspection",
                            ).length > 0 && (
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
                                      {qualityFiles
                                        .filter(
                                          (f) => f.category === "inspection",
                                        )
                                        .map((file) => (
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
                                                    window.open(
                                                      file.url,
                                                      "_blank",
                                                    )
                                                  }
                                                  title="Open"
                                                >
                                                  <FiEye size={10} />
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
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="card border">
                          <div className="card-header bg-warning text-white py-2">
                            <h6 className="mb-0 small fw-bold">
                              Defect Images
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  qualityFiles.filter(
                                    (f) => f.category === "defect",
                                  ).length
                                }
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
                                input.accept = "image/*";
                                input.onchange = (e) =>
                                  handleFileChange(e, "defect");
                                input.click();
                              }}
                            >
                              <FiUpload
                                size={16}
                                className="text-warning mb-1"
                              />
                              <p className="mb-0 small">Upload Images</p>
                              <p className="x-small text-muted">
                                JPG, PNG, GIF
                              </p>
                            </div>

                            {qualityFiles.filter((f) => f.category === "defect")
                              .length > 0 && (
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
                                      {qualityFiles
                                        .filter((f) => f.category === "defect")
                                        .map((file) => (
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
                                            <td className="text-end">
                                              <div className="btn-group btn-group-sm">
                                                <button
                                                  type="button"
                                                  className="btn btn-outline-primary btn-sm"
                                                  onClick={() =>
                                                    window.open(
                                                      file.url,
                                                      "_blank",
                                                    )
                                                  }
                                                  title="Open"
                                                >
                                                  <FiEye size={10} />
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
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="card border">
                          <div className="card-header bg-success text-white py-2">
                            <h6 className="mb-0 small fw-bold">
                              Certificates
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  qualityFiles.filter(
                                    (f) => f.category === "certificate",
                                  ).length
                                }
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
                                input.accept = ".pdf,.jpg,.png";
                                input.onchange = (e) =>
                                  handleFileChange(e, "certificate");
                                input.click();
                              }}
                            >
                              <FiUpload
                                size={16}
                                className="text-success mb-1"
                              />
                              <p className="mb-0 small">Upload Certificates</p>
                              <p className="x-small text-muted">
                                PDF, JPG, PNG
                              </p>
                            </div>

                            {qualityFiles.filter(
                              (f) => f.category === "certificate",
                            ).length > 0 && (
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
                                      {qualityFiles
                                        .filter(
                                          (f) => f.category === "certificate",
                                        )
                                        .map((file) => (
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
                                            <td className="text-end">
                                              <div className="btn-group btn-group-sm">
                                                <button
                                                  type="button"
                                                  className="btn btn-outline-primary btn-sm"
                                                  onClick={() =>
                                                    window.open(
                                                      file.url,
                                                      "_blank",
                                                    )
                                                  }
                                                  title="Open"
                                                >
                                                  <FiEye size={10} />
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
                                        ))}
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
                  <span className="me-3">🔍 Quality checks</span>
                  <span className="me-3">⚠️ Defects tracking</span>
                  <span>📊 Quality metrics</span>
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
                        Update Quality Check
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

export default UpdateQualityCheckStage;
