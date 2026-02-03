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
  FiTool,
  FiRefreshCw,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
  FiSave,
  FiTrendingUp,
  FiX,
  FiShield,
  FiImage,
  FiArchive,
  FiAward,
} from "react-icons/fi";

const UpdateFilingStage = ({
  selectedStage,
  employees = [],
  onUpdate,
  onClose,
  loading = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [filingFiles, setFilingFiles] = useState([]);
  const [selectedFilingTools, setSelectedFilingTools] = useState([]);
  console.log(selectedStage);
  // Static filing tools data (jewellery filing tools)
  const filingToolsData = [
    {
      _id: "needle_file_set",
      name: "Needle File Set",
      category: "hand_tools",
      description: "Set of needle files for delicate work",
      unit: "set",
      cost_per_unit: 2500,
      unit_cost: 2500,
      quantity: 1,
    },
    {
      _id: "flat_file",
      name: "Flat Jeweller's File",
      category: "hand_tools",
      description: "Flat file for general filing",
      unit: "piece",
      cost_per_unit: 800,
      unit_cost: 800,
      quantity: 1,
    },
    {
      _id: "half_round_file",
      name: "Half-Round File",
      category: "hand_tools",
      description: "Half-round file for curved surfaces",
      unit: "piece",
      cost_per_unit: 850,
      unit_cost: 850,
      quantity: 1,
    },
    {
      _id: "round_file",
      name: "Round File",
      category: "hand_tools",
      description: "Round file for holes and rounded edges",
      unit: "piece",
      cost_per_unit: 750,
      unit_cost: 750,
      quantity: 1,
    },
    {
      _id: "triangular_file",
      name: "Triangular File",
      category: "hand_tools",
      description: "Triangular file for corners and angles",
      unit: "piece",
      cost_per_unit: 700,
      unit_cost: 700,
      quantity: 1,
    },
    {
      _id: "square_file",
      name: "Square File",
      category: "hand_tools",
      description: "Square file for square edges and corners",
      unit: "piece",
      cost_per_unit: 720,
      unit_cost: 720,
      quantity: 1,
    },
    {
      _id: "sanding_sticks",
      name: "Sanding Sticks Set",
      category: "abrasives",
      description: "Set of sanding sticks for fine finishing",
      unit: "set",
      cost_per_unit: 1200,
      unit_cost: 1200,
      quantity: 1,
    },
    {
      _id: "polishing_papers",
      name: "Polishing Papers",
      category: "abrasives",
      description: "Various grit polishing papers",
      unit: "pack",
      cost_per_unit: 800,
      unit_cost: 800,
      quantity: 1,
    },
    {
      _id: "rubber_abrasives",
      name: "Rubber Abrasives",
      category: "abrasives",
      description: "Rubber abrasive wheels and points",
      unit: "set",
      cost_per_unit: 1800,
      unit_cost: 1800,
      quantity: 1,
    },
    {
      _id: "rotary_bur_set",
      name: "Rotary Bur Set",
      category: "power_tools",
      description: "Set of rotary burs for motor tools",
      unit: "set",
      cost_per_unit: 3500,
      unit_cost: 3500,
      quantity: 1,
    },
    {
      _id: "polishing_wheels",
      name: "Polishing Wheels",
      category: "finishing",
      description: "Various polishing wheels for buffing",
      unit: "set",
      cost_per_unit: 1500,
      unit_cost: 1500,
      quantity: 1,
    },
    {
      _id: "compounds",
      name: "Polishing Compounds",
      category: "finishing",
      description: "Tripoli, rouge, and other compounds",
      unit: "kit",
      cost_per_unit: 2000,
      unit_cost: 2000,
      quantity: 1,
    },
  ];

  const [formData, setFormData] = useState({
    assigned_to: "",
    status: "",
    start_date: "",
    end_date: "",

    // Filing tools tracking (instead of material tracking)
    filing_tools_used: [], // List of tool IDs used
    tool_wastage: "0.1", // Default wastage in grams (gold dust from filing)
    tool_wastage_type: "normal",

    // Filing specific
    filing_type: "manual",
    surface_finish: "smooth",
    roughness_level: "fine",
    tolerance_level: "standard",
    rework_required: false,

    // Time tracking
    labour_hours: "",
    actual_hours: "",
    preparation_time: "",
    rough_filing_time: "",
    fine_filing_time: "",
    polishing_time: "",
    quality_check_time: "",
    total_time_spent: "",
    time_breakdown: "",

    // Next stage
    next_stage: "",
    stage: "",

    // Remarks
    remarks: "",

    // Cost tracking
    tool_cost: "", // Cost of filing tools used
    labour_cost: "",
    equipment_cost: "",
    consumables_cost: "", // Sandpaper, compounds, etc.
    wastage_cost: "", // Cost of gold dust wastage
    other_costs: "",
    total_cost: "",
    cost_currency: "INR",
    cost_status: "estimated",
    markup_percentage: "25",
    final_price: "",

    // File tracking
    file_version: "1.0",
    file_revisions: 0,
    source_files: [],
    output_files: [],
    file_status: "draft",
    backup_location: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    tools: false,
    process: false,
    quality: false,
    cost: false,
    time: false,
    files: false,
  });

  const statusOptions = [
    {
      value: "not_started",
      label: "Not Started",
      color: "secondary",
      icon: "⏳",
    },
    { value: "preparation", label: "Preparation", color: "info", icon: "⚙️" },
    {
      value: "rough_filing",
      label: "Rough Filing",
      color: "warning",
      icon: "🔨",
    },
    {
      value: "fine_filing",
      label: "Fine Filing",
      color: "warning",
      icon: "✨",
    },
    { value: "polishing", label: "Polishing", color: "info", icon: "💎" },
    {
      value: "quality_check",
      label: "Quality Check",
      color: "warning",
      icon: "🔍",
    },
    { value: "completed", label: "Completed", color: "success", icon: "✅" },
    { value: "hold", label: "On Hold", color: "danger", icon: "⏸️" },
    { value: "rework", label: "Rework", color: "danger", icon: "🔄" },
  ];

  const wastageTypeOptions = [
    {
      value: "normal",
      label: "Normal",
      color: "success",
      description: "Expected gold dust wastage (0.05-0.1g)",
    },
    {
      value: "high",
      label: "High",
      color: "warning",
      description: "Above normal wastage (0.1-0.2g)",
    },
    {
      value: "excessive",
      label: "Excessive",
      color: "danger",
      description: "Above 0.2g wastage",
    },
    {
      value: "recovered",
      label: "Recovered",
      color: "info",
      description: "Gold dust recovered for reuse",
    },
  ];

  const filingTypeOptions = [
    { value: "manual", label: "Manual Filing", icon: "👨‍🔧" },
    { value: "machine", label: "Machine Filing", icon: "⚙️" },
    { value: "cnc", label: "CNC Filing", icon: "🤖" },
    { value: "laser", label: "Laser Filing", icon: "🔦" },
  ];

  const surfaceFinishOptions = [
    { value: "rough", label: "Rough", color: "secondary" },
    { value: "smooth", label: "Smooth", color: "info" },
    { value: "very_smooth", label: "Very Smooth", color: "success" },
    { value: "mirror", label: "Mirror Finish", color: "primary" },
  ];

  const roughnessLevelOptions = [
    { value: "coarse", label: "Coarse", color: "secondary" },
    { value: "medium", label: "Medium", color: "warning" },
    { value: "fine", label: "Fine", color: "info" },
    { value: "very_fine", label: "Very Fine", color: "success" },
  ];

  const toleranceLevelOptions = [
    { value: "rough", label: "Rough (±0.5mm)", color: "secondary" },
    { value: "standard", label: "Standard (±0.1mm)", color: "info" },
    { value: "fine", label: "Fine (±0.05mm)", color: "success" },
    { value: "precision", label: "Precision (±0.01mm)", color: "primary" },
  ];

  const nextStageOptions = [
    { value: "setting", label: "Stone Setting", icon: "💎" },
    { value: "polishing", label: "Polishing", icon: "✨" },
    { value: "plating", label: "Plating", icon: "🔧" },
    { value: "quality", label: "Quality Check", icon: "🔍" },
    { value: "packaging", label: "Packaging", icon: "📦" },
    { value: "none", label: "No Next Stage", icon: "🏁" },
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

  // Initialize form data
  useEffect(() => {
    if (selectedStage) {
      const initialData = {
        assigned_to: selectedStage.assigned_to || "",
        status: selectedStage.status || "",
        start_date: selectedStage.start_date
          ? new Date(selectedStage.start_date).toISOString().split("T")[0]
          : "",
        end_date: selectedStage.end_date
          ? new Date(selectedStage.end_date).toISOString().split("T")[0]
          : "",

        // Filing tools tracking
        filing_tools_used: selectedStage.filing_tools_used || [],
        tool_wastage: selectedStage.tool_wastage || "0.1",
        tool_wastage_type: selectedStage.tool_wastage_type || "normal",

        // Filing specific
        filing_type: selectedStage.filing_type || "manual",
        surface_finish: selectedStage.surface_finish || "smooth",
        roughness_level: selectedStage.roughness_level || "fine",
        tolerance_level: selectedStage.tolerance_level || "standard",
        rework_required: selectedStage.rework_required || false,

        // Time tracking
        labour_hours: selectedStage.labour_hours || "",
        actual_hours: selectedStage.actual_hours || "",
        preparation_time: selectedStage.preparation_time || "",
        rough_filing_time: selectedStage.rough_filing_time || "",
        fine_filing_time: selectedStage.fine_filing_time || "",
        polishing_time: selectedStage.polishing_time || "",
        quality_check_time: selectedStage.quality_check_time || "",
        total_time_spent: selectedStage.total_time_spent || "",
        time_breakdown: selectedStage.time_breakdown || "",

        // Next stage
        next_stage: selectedStage.next_stage || "",
        stage: selectedStage.next_stage || selectedStage.stage || "",

        // Remarks
        remarks: selectedStage.remarks || "",

        // Cost tracking
        tool_cost: selectedStage.tool_cost || "",
        labour_cost: selectedStage.labour_cost || "",
        equipment_cost: selectedStage.equipment_cost || "",
        consumables_cost: selectedStage.consumables_cost || "",
        wastage_cost: selectedStage.wastage_cost || "",
        other_costs: selectedStage.other_costs || "",
        total_cost: selectedStage.total_cost || "",
        cost_currency: selectedStage.cost_currency || "INR",
        cost_status: selectedStage.cost_status || "estimated",
        markup_percentage: selectedStage.markup_percentage || "25",
        final_price: selectedStage.final_price || "",

        // File tracking
        file_version: selectedStage.file_version || "1.0",
        file_revisions: selectedStage.file_revisions || 0,
        source_files: selectedStage.source_files || [],
        output_files: selectedStage.output_files || [],
        file_status: selectedStage.file_status || "draft",
        backup_location: selectedStage.backup_location || "",
      };

      setFormData(initialData);
      setSelectedFilingTools(initialData.filing_tools_used || []);

      if (selectedStage.files && Array.isArray(selectedStage.files)) {
        const existingFiles = selectedStage.files
          .filter((file) => file.isExisting)
          .map((file) => ({
            ...file,
            id: file.id || file._id || Math.random().toString(36).substr(2, 9),
            isExisting: true,
            file: null,
            category: file.category || "output",
            version: file.version || "1.0",
          }));
        setFilingFiles(existingFiles);
      } else {
        setFilingFiles([]);
      }

      setFormErrors({});
      calculateTotalCost();
      calculateTotalTime();
    }
  }, [selectedStage]);

  // Handle tool selection
  // Handle tool selection
  const handleToolToggle = (toolId) => {
    setSelectedFilingTools((prev) => {
      const isSelected = prev.includes(toolId);
      const newTools = isSelected
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId];

      // Calculate tool cost when tools are selected
      const totalToolCost = newTools.reduce((total, toolId) => {
        const tool = filingToolsData.find((t) => t._id === toolId);
        return total + (tool?.unit_cost || 0);
      }, 0);

      setFormData((prevData) => {
        const updatedData = {
          ...prevData,
          filing_tools_used: newTools,
          tool_cost: totalToolCost.toFixed(2),
        };

        // Recalculate total cost when tool cost changes
        const tool = totalToolCost;
        const labour = Number(updatedData.labour_cost) || 0;
        const equipment = Number(updatedData.equipment_cost) || 0;
        const consumables = Number(updatedData.consumables_cost) || 0;
        const wastage = Number(updatedData.wastage_cost) || 0;
        const other = Number(updatedData.other_costs) || 0;
        const markup = Number(updatedData.markup_percentage) || 25;

        const total = tool + labour + equipment + consumables + wastage + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        updatedData.total_cost = total.toFixed(2);
        updatedData.final_price = finalPrice.toFixed(2);

        return updatedData;
      });

      return newTools;
    });
  };

  // Calculate tool cost based on selected tools
  const calculateToolCost = (tools) => {
    const totalToolCost = tools.reduce((total, toolId) => {
      const tool = filingToolsData.find((t) => t._id === toolId);
      return total + (tool?.unit_cost || 0);
    }, 0);

    setFormData((prev) => ({
      ...prev,
      tool_cost: totalToolCost.toFixed(2),
    }));
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    const tool = Number(formData.tool_cost) || 0;
    const labour = Number(formData.labour_cost) || 0;
    const equipment = Number(formData.equipment_cost) || 0;
    const consumables = Number(formData.consumables_cost) || 0;
    const wastage = Number(formData.wastage_cost) || 0;
    const other = Number(formData.other_costs) || 0;
    const markup = Number(formData.markup_percentage) || 25;

    console.log("FILING COST CALCULATION:", {
      tool,
      labour,
      equipment,
      consumables,
      wastage,
      other,
      markup,
    });

    const total = tool + labour + equipment + consumables + wastage + other;
    const markupAmount = (total * markup) / 100;
    const finalPrice = total + markupAmount;

    setFormData((prev) => ({
      ...prev,
      total_cost: total.toFixed(2),
      final_price: finalPrice.toFixed(2),
    }));
  };

  // Calculate total time
  const calculateTotalTime = () => {
    const prep = parseFloat(formData.preparation_time) || 0;
    const rough = parseFloat(formData.rough_filing_time) || 0;
    const fine = parseFloat(formData.fine_filing_time) || 0;
    const polish = parseFloat(formData.polishing_time) || 0;
    const quality = parseFloat(formData.quality_check_time) || 0;

    const total = prep + rough + fine + polish + quality;

    setFormData((prev) => ({
      ...prev,
      total_time_spent: total.toFixed(1),
      labour_hours: total.toFixed(1),
      actual_hours: total.toFixed(1),
    }));
  };

  // Handle form input change
  // Handle form input change
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
        name === "tool_wastage" ||
        name === "labour_hours" ||
        name === "actual_hours"
      ) {
        updatedData[name] = value === "" ? "" : value;
      } else {
        updatedData[name] = val;
      }

      // Calculate totals if cost or markup changed
      if (name.includes("_cost") || name === "markup_percentage") {
        const tool = Number(updatedData.tool_cost) || 0;
        const labour = Number(updatedData.labour_cost) || 0;
        const equipment = Number(updatedData.equipment_cost) || 0;
        const consumables = Number(updatedData.consumables_cost) || 0;
        const wastage = Number(updatedData.wastage_cost) || 0;
        const other = Number(updatedData.other_costs) || 0;
        const markup = Number(updatedData.markup_percentage) || 25;

        console.log("FILING COST CALCULATION IN HANDLE CHANGE:", {
          tool,
          labour,
          equipment,
          consumables,
          wastage,
          other,
          markup,
        });

        const total = tool + labour + equipment + consumables + wastage + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        updatedData.total_cost = total.toFixed(2);
        updatedData.final_price = finalPrice.toFixed(2);
      }

      // Calculate totals if time field changed
      if (
        name.includes("_time") ||
        name === "labour_hours" ||
        name === "actual_hours"
      ) {
        const prep = parseFloat(updatedData.preparation_time) || 0;
        const rough = parseFloat(updatedData.rough_filing_time) || 0;
        const fine = parseFloat(updatedData.fine_filing_time) || 0;
        const polish = parseFloat(updatedData.polishing_time) || 0;
        const quality = parseFloat(updatedData.quality_check_time) || 0;

        const total = prep + rough + fine + polish + quality;

        updatedData.total_time_spent = total.toFixed(1);
        updatedData.labour_hours = total.toFixed(1);
        updatedData.actual_hours = total.toFixed(1);
      }

      // Update next_stage when stage changes
      if (name === "stage") {
        updatedData.next_stage = val;
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
      errors.assigned_to = "Assigned Karigar is required";
    }

    if (!formData.status) {
      errors.status = "Status is required";
    }

    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }

    if (selectedFilingTools.length === 0) {
      errors.filing_tools = "At least one filing tool must be selected";
    }

    if (!formData.labour_hours) {
      errors.labour_hours = "Labour hours are required";
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
      "application/x-rar",
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

      setFilingFiles((prev) => [...prev, ...newFiles]);

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
    const fileToRemove = filingFiles.find((f) => f.id === fileId);
    if (fileToRemove && fileToRemove.url && !fileToRemove.isExisting) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    setFilingFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Categorize files
  const getFilesByCategory = (category) => {
    return filingFiles.filter((file) => file.category === category);
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
      const filesToUpload = filingFiles
        .filter((file) => !file.isExisting && file.file)
        .map((file) => file.file);

      const updateData = {
        assigned_to: formData.assigned_to,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date || "",
        labour_hours: formData.labour_hours || "0",
        actual_hours: formData.actual_hours || "0",
        next_stage: formData.stage || formData.next_stage || "",
        stage: formData.stage || "",
        remarks: formData.remarks || "",

        // Filing tools tracking
        filing_tools_used: selectedFilingTools,
        tool_wastage: formData.tool_wastage || "0.1",
        tool_wastage_type: formData.tool_wastage_type || "normal",

        // Filing specific
        filing_type: formData.filing_type || "manual",
        surface_finish: formData.surface_finish || "smooth",
        roughness_level: formData.roughness_level || "fine",
        tolerance_level: formData.tolerance_level || "standard",
        rework_required: formData.rework_required || false,

        // Time tracking
        preparation_time: formData.preparation_time || "0",
        rough_filing_time: formData.rough_filing_time || "0",
        fine_filing_time: formData.fine_filing_time || "0",
        polishing_time: formData.polishing_time || "0",
        quality_check_time: formData.quality_check_time || "0",
        total_time_spent: formData.total_time_spent || "0",
        time_breakdown: formData.time_breakdown || "",

        // Cost tracking
        tool_cost: formData.tool_cost || "0",
        labour_cost: formData.labour_cost || "0",
        equipment_cost: formData.equipment_cost || "0",
        consumables_cost: formData.consumables_cost || "0",
        wastage_cost: formData.wastage_cost || "0",
        other_costs: formData.other_costs || "0",
        total_cost: formData.total_cost || "0",
        cost_currency: formData.cost_currency || "INR",
        cost_status: formData.cost_status || "estimated",
        markup_percentage: formData.markup_percentage || "25",
        final_price: formData.final_price || "0",

        // File tracking
        file_version: formData.file_version || "1.0",
        file_revisions: formData.file_revisions || 0,
        file_status: formData.file_status || "draft",
        backup_location: formData.backup_location || "",
        files: filingFiles,
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

  // Calculate efficiency (fixed formula)
  const efficiency =
    formData.labour_hours && formData.total_time_spent
      ? (
          (parseFloat(formData.labour_hours) /
            parseFloat(formData.total_time_spent || 1)) *
          100
        ).toFixed(1)
      : "0";

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
                <FiTool className="me-2" />
                Update Filing Stage: {selectedStage.job_card_no}
              </h5>
              {selectedStage && (
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="badge bg-info">
                    <FiTool className="me-1" /> Filing Stage
                  </span>
                  <span className="badge bg-warning">
                    <FiTool className="me-1" /> Tools Used:{" "}
                    {selectedFilingTools.length}
                  </span>
                  <span className="badge bg-dark">
                    {/* <FiSettingsIcon className="me-1" />  */}
                    Type:{" "}
                    {filingTypeOptions.find(
                      (opt) => opt.value === formData.filing_type,
                    )?.label || formData.filing_type}
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
                          <h6 className="text-muted mb-1">Tools & Wastage</h6>
                          <div className="d-flex align-items-center">
                            <span
                              className={`badge ${
                                parseFloat(formData.tool_wastage || 0) > 0.2
                                  ? "bg-danger"
                                  : parseFloat(formData.tool_wastage || 0) > 0.1
                                    ? "bg-warning"
                                    : "bg-success"
                              } me-2`}
                            >
                              {formData.tool_wastage || "0.1"}g
                            </span>
                            <h4 className="mb-0">
                              {selectedFilingTools.length}
                            </h4>
                          </div>
                        </div>
                        <FiTool className="text-warning" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Tools Selected • Gold Dust Wastage
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
                        Labour: {formData.labour_hours || "0"} hrs
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
                      <div className="small text-muted mt-1">
                        Total: ₹{formData.total_cost || "0"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Quality Status</h6>
                          <div className="d-flex align-items-center">
                            <span
                              className={`badge ${
                                formData.surface_finish === "mirror"
                                  ? "bg-success"
                                  : formData.surface_finish === "very_smooth"
                                    ? "bg-info"
                                    : formData.surface_finish === "smooth"
                                      ? "bg-warning"
                                      : "bg-secondary"
                              } me-2`}
                            >
                              {
                                surfaceFinishOptions.find(
                                  (q) => q.value === formData.surface_finish,
                                )?.label
                              }
                            </span>
                            <h4 className="mb-0">{formData.tolerance_level}</h4>
                          </div>
                        </div>
                        <FiAward className="text-success" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Finish: {formData.surface_finish}
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
                          <FiUser className="me-1" /> Assigned Karigar{" "}
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
                          <option value="">Select Filing Karigar</option>
                          {employees
                            .filter((emp) =>
                              emp.role_id?.role_name?.includes("filing"),
                            )
                            .map((emp) => (
                              <option key={emp._id} value={emp._id}>
                                {emp.name} (
                                {emp.role_id?.role_name || "No Role"})
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
                          {nextStageOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          <FiClock className="me-1" /> Labour Hours{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          name="labour_hours"
                          className={`form-control ${
                            formErrors.labour_hours ? "is-invalid" : ""
                          }`}
                          value={formData.labour_hours}
                          onChange={handleInputChange}
                          min="0"
                          step="0.5"
                          placeholder="e.g., 2"
                          disabled={isDisabled}
                        />
                        {formErrors.labour_hours && (
                          <div className="invalid-feedback">
                            {formErrors.labour_hours}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
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
                          placeholder="e.g., 2.5"
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
                        placeholder="Add any remarks, special instructions, or notes about this filing process..."
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Filing Tools Section */}
              <div className="card mb-4">
                {renderSectionHeader("🔧 Filing Tools", "tools", <FiTool />)}
                {expandedSections.tools && (
                  <div className="card-body">
                    {formErrors.filing_tools && (
                      <div className="alert alert-danger py-2">
                        <FiAlertCircle className="me-1" />{" "}
                        {formErrors.filing_tools}
                      </div>
                    )}

                    {/* Filing Tools Selection */}
                    <div className="mb-4">
                      <label className="form-label fw-medium">
                        <FiTool className="me-1" /> Select Filing Tools Used{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="border rounded p-3 bg-light">
                        <div className="row">
                          {filingToolsData.map((tool) => (
                            <div key={tool._id} className="col-md-4 mb-2">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`tool-${tool._id}`}
                                  checked={selectedFilingTools.includes(
                                    tool._id,
                                  )}
                                  onChange={() => handleToolToggle(tool._id)}
                                  disabled={isDisabled}
                                />
                                <label
                                  className="form-check-label small"
                                  htmlFor={`tool-${tool._id}`}
                                >
                                  {tool.name}
                                  <div className="x-small text-muted">
                                    {tool.description} • ₹{tool.unit_cost}
                                  </div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedFilingTools.length > 0 && (
                          <div className="mt-2">
                            <small className="text-muted">
                              Selected: {selectedFilingTools.length} tools •
                              Total Tool Cost: ₹{formData.tool_cost || "0.00"}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-md-6 mb-2">
                        <label className="form-label fw-medium small">
                          Gold Dust Wastage (g)
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="tool_wastage"
                            className="form-control"
                            value={formData.tool_wastage}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="e.g., 0.1"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">grams</span>
                        </div>
                        <div className="form-text x-small">
                          Gold dust generated during filing process
                        </div>
                      </div>

                      <div className="col-md-6 mb-2">
                        <label className="form-label fw-medium small">
                          Wastage Type
                        </label>
                        <select
                          name="tool_wastage_type"
                          className="form-select form-select-sm"
                          value={formData.tool_wastage_type}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {wastageTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="form-text x-small">
                          {
                            wastageTypeOptions.find(
                              (w) => w.value === formData.tool_wastage_type,
                            )?.description
                          }
                        </div>
                      </div>
                    </div>

                    {/* Tools Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3">Filing Tools Summary</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Tools Selected:</span>
                            <span className="fw-bold">
                              {selectedFilingTools.length}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Tool Cost:</span>
                            <span className="fw-bold">
                              ₹{formData.tool_cost || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Gold Dust Wastage:</span>
                            <span
                              className={`fw-bold ${
                                parseFloat(formData.tool_wastage || 0) > 0.2
                                  ? "text-danger"
                                  : parseFloat(formData.tool_wastage || 0) > 0.1
                                    ? "text-warning"
                                    : "text-success"
                              }`}
                            >
                              {formData.tool_wastage || "0.1"}g
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="progress" style={{ height: "20px" }}>
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${Math.min(100, (selectedFilingTools.length / filingToolsData.length) * 100)}%`,
                              }}
                              title="Tools Used"
                            >
                              Tools ({selectedFilingTools.length})
                            </div>
                          </div>
                          <div className="mt-2 small text-muted">
                            Tool selection visualization
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filing Process Section */}
              {/* <div className="card mb-4">
                {renderSectionHeader(
                  "⚙️ Filing Process",
                  "process",
                  <FiTool />
                )}
                {expandedSections.process && (
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Filing Type
                        </label>
                        <select
                          name="filing_type"
                          className="form-select"
                          value={formData.filing_type}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {filingTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Surface Finish
                        </label>
                        <select
                          name="surface_finish"
                          className="form-select"
                          value={formData.surface_finish}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {surfaceFinishOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-medium">
                          Roughness Level
                        </label>
                        <select
                          name="roughness_level"
                          className="form-select"
                          value={formData.roughness_level}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {roughnessLevelOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-medium">
                          Tolerance Level
                        </label>
                        <select
                          name="tolerance_level"
                          className="form-select"
                          value={formData.tolerance_level}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {toleranceLevelOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-12">
                        <label className="form-label fw-medium">
                          Defects Removed
                        </label>
                        <textarea
                          name="defects_removed"
                          className="form-control"
                          rows={3}
                          value={formData.defects_removed}
                          onChange={handleInputChange}
                          placeholder="Describe defects that were removed during filing (scratches, burrs, uneven surfaces, casting marks, etc.)"
                          disabled={isDisabled}
                        ></textarea>
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
                          <label className="form-check-label fw-medium" htmlFor="rework_required">
                            Rework Required
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
                  </div>
                )}
              </div> */}

              {/* Quality Metrics Section */}
              {/* <div className="card mb-4">
                {renderSectionHeader(
                  "🎯 Quality Metrics",
                  "quality",
                  <FiAward />
                )}
                {expandedSections.quality && (
                  <div className="card-body">
                    Quality Summary
                    <div className="border rounded-3 p-3 bg-light mb-3">
                      <h6 className="fw-bold mb-3">Quality Assessment</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Surface Finish:</span>
                            <span className={`fw-bold ${
                              formData.surface_finish === 'mirror' ? 'text-success' :
                              formData.surface_finish === 'very_smooth' ? 'text-info' :
                              formData.surface_finish === 'smooth' ? 'text-warning' : 'text-secondary'
                            }`}>
                              {surfaceFinishOptions.find(q => q.value === formData.surface_finish)?.label}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Roughness Level:</span>
                            <span className={`fw-bold ${
                              formData.roughness_level === 'very_fine' ? 'text-success' :
                              formData.roughness_level === 'fine' ? 'text-info' :
                              formData.roughness_level === 'medium' ? 'text-warning' : 'text-secondary'
                            }`}>
                              {roughnessLevelOptions.find(d => d.value === formData.roughness_level)?.label}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Tolerance Level:</span>
                            <span className={`fw-bold ${
                              formData.tolerance_level === 'precision' ? 'text-success' :
                              formData.tolerance_level === 'fine' ? 'text-info' :
                              formData.tolerance_level === 'standard' ? 'text-warning' : 'text-secondary'
                            }`}>
                              {toleranceLevelOptions.find(p => p.value === formData.tolerance_level)?.label}
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="fw-bold">Overall Status:</span>
                            <span className={`fw-bold ${
                              formData.rework_required ? 'text-danger' : 'text-success'
                            }`}>
                              {formData.rework_required ? 'REWORK REQUIRED' : 'PASSED'}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="text-center">
                            <div className="mb-2">
                              <div className={`display-6 ${
                                formData.rework_required ? 'text-danger' :
                                formData.surface_finish === 'mirror' && 
                                formData.tolerance_level === 'precision' ? 'text-success' : 'text-warning'
                              }`}>
                                {formData.rework_required ? '⚠️' :
                                 formData.surface_finish === 'mirror' && 
                                 formData.tolerance_level === 'precision' ? '✅' : '⚠️'}
                              </div>
                            </div>
                            <div className="small text-muted">
                              {formData.rework_required 
                                ? 'Quality issues detected. Rework required.' 
                                : 'Quality parameters within acceptable limits.'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div> */}

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
                          Setup & tool prep
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Rough Filing
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="rough_filing_time"
                            className="form-control"
                            value={formData.rough_filing_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">Initial shaping</div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Fine Filing
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="fine_filing_time"
                            className="form-control"
                            value={formData.fine_filing_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">Detail work</div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Polishing Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="polishing_time"
                            className="form-control"
                            value={formData.polishing_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Surface finishing
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Quality Check
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="quality_check_time"
                            className="form-control"
                            value={formData.quality_check_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">Inspection time</div>
                      </div>

                      <div className="col-md-3 mb-2">
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
                              Prep
                            </div>
                            <div
                              className="progress-bar bg-warning"
                              style={{
                                width: `${
                                  (parseFloat(formData.rough_filing_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Rough Filing"
                            >
                              Rough
                            </div>
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${
                                  (parseFloat(formData.fine_filing_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Fine Filing"
                            >
                              Fine
                            </div>
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${
                                  (parseFloat(formData.polishing_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Polishing"
                            >
                              Polish
                            </div>

                            <div
                              className="progress-bar bg-secondary "
                              style={{
                                width: `${
                                  (parseFloat(
                                    formData.quality_check_time || 0,
                                  ) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Quality "
                            >
                              Quality
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
                          Tool Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="tool_cost"
                            className="form-control bg-light"
                            value={formData.tool_cost}
                            readOnly
                          />
                        </div>
                        <div className="form-text x-small">
                          Cost of filing tools used
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
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
                        <div className="form-text x-small">Karigar wages</div>
                      </div>

                      <div className="col-md-4 mb-2">
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
                        <div className="form-text x-small">
                          Machine usage cost
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Consumables Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="consumables_cost"
                            className="form-control"
                            value={formData.consumables_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Sandpaper, compounds, etc.
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Wastage Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="wastage_cost"
                            className="form-control"
                            value={formData.wastage_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Gold dust wastage cost
                        </div>
                      </div>

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
                        <div className="form-text x-small">
                          Miscellaneous costs
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          <FiPercent className="me-1" /> Markup %
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
                            placeholder="25"
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
                            <span>Markup ({formData.markup_percentage}%):</span>
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
                                width: `${((parseFloat(formData.tool_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Tool Cost"
                            >
                              Tools
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
                              title="Equipment & Consumables"
                            >
                              Equipment
                            </div>
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${((parseFloat(formData.consumables_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Consumables Costs"
                            >
                              Consumables
                            </div>
                            <div
                              className="progress-bar bg-black"
                              style={{
                                width: `${((parseFloat(formData.wastage_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Wastage  Costs"
                            >
                              Wastage
                            </div>
                            <div
                              className="progress-bar bg-secondary "
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

              {/* File Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "📎 File Tracking",
                  "files",
                  <FiFile />,
                  filingFiles.length,
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
                              Source Files (Before Filing)
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  filingFiles.filter(
                                    (f) => f.category === "source",
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
                                input.accept = "image/*,.pdf,.doc,.docx";
                                input.onchange = (e) =>
                                  handleFileChange(e, "source");
                                input.click();
                              }}
                            >
                              <FiUpload size={16} className="text-info mb-1" />
                              <p className="mb-0 small">Upload Source Files</p>
                              <p className="x-small text-muted">
                                Images, PDFs, Documents
                              </p>
                            </div>

                            {filingFiles.filter((f) => f.category === "source")
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
                                      {filingFiles
                                        .filter((f) => f.category === "source")
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

                      <div className="col-md-6">
                        <div className="card border">
                          <div className="card-header bg-success text-white py-2">
                            <h6 className="mb-0 small fw-bold">
                              Output Files (After Filing)
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  filingFiles.filter(
                                    (f) => f.category === "output",
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
                                input.accept =
                                  "image/*,.mp4,.avi,.mov,.pdf,.doc,.docx";
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
                                Photos, Videos, Reports
                              </p>
                            </div>

                            {filingFiles.filter((f) => f.category === "output")
                              .length > 0 && (
                              <div className="mt-2">
                                <div className="table-responsive">
                                  <table className="table table-sm mb-0">
                                    <thead>
                                      <tr>
                                        <th className="small">File</th>
                                        <th className="small text-end">Size</th>
                                        <th className="small text-center">
                                          Type
                                        </th>
                                        <th className="small text-end">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filingFiles
                                        .filter((f) => f.category === "output")
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
                                            <td className="small text-center">
                                              <span className="badge bg-secondary">
                                                {file.type?.split("/")[0] ||
                                                  "file"}
                                              </span>
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
                  <span className="me-3">🔧 Filing tools</span>
                  <span className="me-3">⏱️ Time tracking</span>
                  <span>💰 Cost tracking</span>
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
                        Update Filing Stage
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

export default UpdateFilingStage;
