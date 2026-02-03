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
  FiShield,
  FiImage,
  FiArchive,
  FiShoppingCart,
  FiCheckCircle,
  FiTag,
  FiLayers as FiLayersIcon,
  FiShoppingBag,
  FiGift,
  FiShield as FiShieldIcon,
} from "react-icons/fi";

const UpdatePackagingStage = ({
  selectedStage,
  employees = [],
  packagingMaterials = [],
  onUpdate,
  onClose,
  loading = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [packagingFiles, setPackagingFiles] = useState([]);

  console.log(selectedStage);

  const [formData, setFormData] = useState({
    assigned_to: "",
    status: "",
    start_date: "",
    end_date: "",

    // Packaging Materials
    materials_used: [],
    box_used: false,
    box_type: "standard",
    box_quantity: 1,
    box_cost: "",
    certificate_used: false,
    certificate_type: "standard",
    certificate_quantity: 1,
    certificate_cost: "",
    cotton_used: false,
    cotton_quantity: "",
    cotton_cost: "",

    // Quality Check
    quality_check: false,
    quality_score: "100",
    quality_remarks: "",

    // Cost Tracking
    material_cost: "",
    labour_cost: "",
    equipment_cost: "",
    other_costs: "",
    total_cost: "",
    cost_currency: "INR",
    cost_status: "estimated",
    markup_percentage: "15",
    final_price: "",

    // Time Tracking
    preparation_time: "",
    packaging_time: "",
    labeling_time: "",
    quality_time: "",
    documentation_time: "",
    total_time_spent: "",
    time_breakdown: "",

    // Additional Fields
    packaging_type: "standard",
    sealing_method: "sticker",
    weight_after_packaging: "",
    barcode_generated: false,
    barcode_number: "",

    // File Tracking - MAKE SURE THESE ARE ARRAYS
    file_version: "1.0",
    file_revisions: 0,
    source_files: [],
    output_files: [],
    file_status: "draft",
    backup_location: "",

    remarks: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    materials: false,
    quality: false,
    cost: false,
    time: false,
    additional: false,
    files: false,
  });

  const [additionalMaterial, setAdditionalMaterial] = useState({
    name: "",
    quantity: 1,
    cost: "",
    unit: "pieces",
  });

  const statusOptions = [
    {
      value: "not_started",
      label: "Not Started",
      color: "secondary",
      icon: "⏳",
    },
    { value: "preparation", label: "Preparation", color: "info", icon: "📦" },
    { value: "packaging", label: "Packaging", color: "warning", icon: "🎁" },
    { value: "labeling", label: "Labeling", color: "info", icon: "🏷️" },
    {
      value: "quality_check",
      label: "Quality Check",
      color: "warning",
      icon: "🔍",
    },
    {
      value: "documentation",
      label: "Documentation",
      color: "info",
      icon: "📄",
    },
    { value: "completed", label: "Completed", color: "success", icon: "✅" },
    { value: "hold", label: "On Hold", color: "danger", icon: "⏸️" },
  ];

  const packagingTypeOptions = [
    { value: "standard", label: "Standard Packaging", icon: "📦" },
    { value: "premium", label: "Premium Packaging", icon: "🎁" },
    { value: "gift", label: "Gift Packaging", icon: "🎀" },
    { value: "eco_friendly", label: "Eco-Friendly", icon: "🌿" },
    { value: "luxury", label: "Luxury Packaging", icon: "💎" },
  ];

  const boxTypeOptions = [
    { value: "standard", label: "Standard Box" },
    { value: "premium", label: "Premium Box" },
    { value: "gift", label: "Gift Box" },
    { value: "wooden", label: "Wooden Box" },
    { value: "leather", label: "Leather Box" },
  ];

  const certificateTypeOptions = [
    { value: "standard", label: "Standard Certificate" },
    { value: "premium", label: "Premium Certificate" },
    { value: "hologram", label: "Hologram Certificate" },
    { value: "digital", label: "Digital Certificate" },
  ];

  const sealingMethodOptions = [
    { value: "sticker", label: "Security Sticker", icon: "🏷️" },
    { value: "tape", label: "Packaging Tape", icon: "📏" },
    { value: "seal", label: "Wax Seal", icon: "🕯️" },
    { value: "ribbon", label: "Ribbon", icon: "🎀" },
    { value: "shrink_wrap", label: "Shrink Wrap", icon: "🔒" },
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

        // Packaging Materials
        materials_used: selectedStage.materials_used || [],
        box_used: selectedStage.box_used || false,
        box_type: selectedStage.box_type || "standard",
        box_quantity: selectedStage.box_quantity || 1,
        box_cost: selectedStage.box_cost || "",
        certificate_used: selectedStage.certificate_used || false,
        certificate_type: selectedStage.certificate_type || "standard",
        certificate_quantity: selectedStage.certificate_quantity || 1,
        certificate_cost: selectedStage.certificate_cost || "",
        cotton_used: selectedStage.cotton_used || false,
        cotton_quantity: selectedStage.cotton_quantity || "",
        cotton_cost: selectedStage.cotton_cost || "",

        // Quality Check
        quality_check: selectedStage.quality_check || false,
        quality_score: selectedStage.quality_score || "100",
        quality_remarks: selectedStage.quality_remarks || "",

        // Cost Tracking
        material_cost: selectedStage.material_cost || "",
        labour_cost: selectedStage.labour_cost || "",
        equipment_cost: selectedStage.equipment_cost || "",
        other_costs: selectedStage.other_costs || "",
        total_cost: selectedStage.total_cost || "",
        cost_currency: selectedStage.cost_currency || "INR",
        cost_status: selectedStage.cost_status || "estimated",
        markup_percentage: selectedStage.markup_percentage || "15",
        final_price: selectedStage.final_price || "",

        // Time Tracking
        preparation_time: selectedStage.preparation_time || "",
        packaging_time: selectedStage.packaging_time || "",
        labeling_time: selectedStage.labeling_time || "",
        quality_time: selectedStage.quality_time || "",
        documentation_time: selectedStage.documentation_time || "",
        total_time_spent: selectedStage.total_time_spent || "",
        time_breakdown: selectedStage.time_breakdown || "",

        // Additional Fields
        packaging_type: selectedStage.packaging_type || "standard",
        sealing_method: selectedStage.sealing_method || "sticker",
        weight_after_packaging: selectedStage.weight_after_packaging || "",
        barcode_generated: selectedStage.barcode_generated || false,
        barcode_number: selectedStage.barcode_number || "",

        // File Tracking - Ensure these are arrays
        file_version: selectedStage.file_version || "1.0",
        file_revisions: selectedStage.file_revisions || 0,
        source_files: Array.isArray(selectedStage.source_files)
          ? selectedStage.source_files
          : [],
        output_files: Array.isArray(selectedStage.output_files)
          ? selectedStage.output_files
          : [],
        file_status: selectedStage.file_status || "draft",
        backup_location: selectedStage.backup_location || "",

        remarks: selectedStage.remarks || "",
      };

      setFormData(initialData);

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
        setPackagingFiles(existingFiles);
      } else {
        setPackagingFiles([]);
      }

      setFormErrors({});
      calculateTotalCost();
      calculateTotalTime();
    }
  }, [selectedStage]);

  // Calculate total cost
  const calculateTotalCost = () => {
    // Calculate material cost from individual material costs
    const boxCost = formData.box_used ? parseFloat(formData.box_cost || 0) : 0;
    const certificateCost = formData.certificate_used
      ? parseFloat(formData.certificate_cost || 0)
      : 0;
    const cottonCost = formData.cotton_used
      ? parseFloat(formData.cotton_cost || 0)
      : 0;

    const materialCost = boxCost + certificateCost + cottonCost;
    const labour = parseFloat(formData.labour_cost) || 0;
    const equipment = parseFloat(formData.equipment_cost) || 0;
    const other = parseFloat(formData.other_costs) || 0;
    const markup = parseFloat(formData.markup_percentage) || 15;

    console.log("PACKAGING COST CALCULATION:", {
      materialCost,
      labour,
      equipment,
      other,
      markup,
    });

    const total = materialCost + labour + equipment + other;
    const markupAmount = (total * markup) / 100;
    const finalPrice = total + markupAmount;

    setFormData((prev) => ({
      ...prev,
      material_cost: materialCost.toFixed(2),
      total_cost: total.toFixed(2),
      final_price: finalPrice.toFixed(2),
    }));
  };

  // Calculate total time
  const calculateTotalTime = () => {
    const prep = parseFloat(formData.preparation_time) || 0;
    const packaging = parseFloat(formData.packaging_time) || 0;
    const labeling = parseFloat(formData.labeling_time) || 0;
    const quality = parseFloat(formData.quality_time) || 0;
    const documentation = parseFloat(formData.documentation_time) || 0;

    const total = prep + packaging + labeling + quality + documentation;

    console.log("PACKAGING TIME CALCULATION:", {
      prep,
      packaging,
      labeling,
      quality,
      documentation,
      total,
    });

    setFormData((prev) => ({
      ...prev,
      total_time_spent: total.toFixed(1),
    }));
  };

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
        name.includes("_quantity") ||
        name === "quality_score" ||
        name === "weight_after_packaging"
      ) {
        updatedData[name] = value === "" ? "" : value;
      } else {
        updatedData[name] = val;
      }

      // Calculate totals if cost or markup changed
      if (
        name.includes("_cost") ||
        name === "markup_percentage" ||
        name.includes("box_") ||
        name.includes("certificate_") ||
        name.includes("cotton_")
      ) {
        // Recalculate material cost
        const boxCost = updatedData.box_used
          ? parseFloat(updatedData.box_cost || 0)
          : 0;
        const certificateCost = updatedData.certificate_used
          ? parseFloat(updatedData.certificate_cost || 0)
          : 0;
        const cottonCost = updatedData.cotton_used
          ? parseFloat(updatedData.cotton_cost || 0)
          : 0;

        const materialCost = boxCost + certificateCost + cottonCost;
        const labour = parseFloat(updatedData.labour_cost) || 0;
        const equipment = parseFloat(updatedData.equipment_cost) || 0;
        const other = parseFloat(updatedData.other_costs) || 0;
        const markup = parseFloat(updatedData.markup_percentage) || 15;

        console.log("PACKAGING COST CALCULATION IN HANDLE CHANGE:", {
          materialCost,
          labour,
          equipment,
          other,
          markup,
        });

        const total = materialCost + labour + equipment + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        updatedData.material_cost = materialCost.toFixed(2);
        updatedData.total_cost = total.toFixed(2);
        updatedData.final_price = finalPrice.toFixed(2);
      }

      // Calculate totals if time field changed
      if (name.includes("_time")) {
        const prep = parseFloat(updatedData.preparation_time) || 0;
        const packaging = parseFloat(updatedData.packaging_time) || 0;
        const labeling = parseFloat(updatedData.labeling_time) || 0;
        const quality = parseFloat(updatedData.quality_time) || 0;
        const documentation = parseFloat(updatedData.documentation_time) || 0;

        const total = prep + packaging + labeling + quality + documentation;

        updatedData.total_time_spent = total.toFixed(1);
      }

      // Handle material usage array
      if (
        name.includes("box_used") ||
        name.includes("certificate_used") ||
        name.includes("cotton_used")
      ) {
        const materialsUsed = [];
        if (updatedData.box_used) materialsUsed.push("box");
        if (updatedData.certificate_used) materialsUsed.push("certificate");
        if (updatedData.cotton_used) materialsUsed.push("cotton");

        updatedData.materials_used = materialsUsed;
      }

      return updatedData;
    });

    // Clear error if exists
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle checkbox change for materials
  const handleMaterialCheckboxChange = (materialName) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [`${materialName}_used`]: !prev[`${materialName}_used`],
      };

      // Update materials_used array
      const materialsUsed = [];
      if (updatedData.box_used) materialsUsed.push("box");
      if (updatedData.certificate_used) materialsUsed.push("certificate");
      if (updatedData.cotton_used) materialsUsed.push("cotton");

      updatedData.materials_used = materialsUsed;

      // Recalculate costs
      const boxCost = updatedData.box_used
        ? parseFloat(updatedData.box_cost || 0)
        : 0;
      const certificateCost = updatedData.certificate_used
        ? parseFloat(updatedData.certificate_cost || 0)
        : 0;
      const cottonCost = updatedData.cotton_used
        ? parseFloat(updatedData.cotton_cost || 0)
        : 0;

      const materialCost = boxCost + certificateCost + cottonCost;
      const labour = parseFloat(updatedData.labour_cost) || 0;
      const equipment = parseFloat(updatedData.equipment_cost) || 0;
      const other = parseFloat(updatedData.other_costs) || 0;
      const markup = parseFloat(updatedData.markup_percentage) || 15;

      const total = materialCost + labour + equipment + other;
      const markupAmount = (total * markup) / 100;
      const finalPrice = total + markupAmount;

      updatedData.material_cost = materialCost.toFixed(2);
      updatedData.total_cost = total.toFixed(2);
      updatedData.final_price = finalPrice.toFixed(2);

      return updatedData;
    });
  };

  // Handle additional material change
  const handleAdditionalMaterialChange = (e) => {
    const { name, value } = e.target;
    setAdditionalMaterial((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add additional material
  const addAdditionalMaterial = () => {
    if (!additionalMaterial.name.trim() || !additionalMaterial.quantity) return;

    const newMaterial = {
      id: Date.now(),
      name: additionalMaterial.name,
      quantity: parseFloat(additionalMaterial.quantity) || 1,
      cost: parseFloat(additionalMaterial.cost) || 0,
      unit: additionalMaterial.unit,
    };

    setFormData((prev) => ({
      ...prev,
      materials_used: [...prev.materials_used, additionalMaterial.name],
    }));

    // Clear the form
    setAdditionalMaterial({
      name: "",
      quantity: 1,
      cost: "",
      unit: "pieces",
    });

    // Recalculate total cost
    setTimeout(() => calculateTotalCost(), 100);
  };

  // Remove additional material
  //   const removeAdditionalMaterial = (id) => {
  //     setFormData((prev) => ({
  //       ...prev,
  //       additional_materials: prev.additional_materials.filter(
  //         (m) => m.id !== id,
  //       ),
  //       materials_used: prev.materials_used.filter(
  //         (name) =>
  //           !prev.additional_materials.find((m) => m.id === id)?.name === name,
  //       ),
  //     }));

  //     setTimeout(() => calculateTotalCost(), 100);
  //   };

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
      errors.assigned_to = "Assigned Packer is required";
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

  // Handle file upload (similar to casting stage)
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

      setPackagingFiles((prev) => [...prev, ...newFiles]);

      if (category === "source") {
        setFormData((prev) => ({
          ...prev,
          source_files: [
            ...(prev.source_files || []),
            ...newFiles.map((f) => f.name),
          ],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          output_files: [
            ...(prev.output_files || []),
            ...newFiles.map((f) => f.name),
          ],
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
    const fileToRemove = packagingFiles.find((f) => f.id === fileId);
    if (fileToRemove && fileToRemove.url && !fileToRemove.isExisting) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    setPackagingFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Categorize files
  const getFilesByCategory = (category) => {
    return packagingFiles.filter((file) => file.category === category);
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
      const filesToUpload = packagingFiles
        .filter((file) => !file.isExisting && file.file)
        .map((file) => file.file);

      const updateData = {
        assigned_to: formData.assigned_to,
        status: formData.status,
        start_date: formData.start_date,
        end_date: formData.end_date || "",
        remarks: formData.remarks || "",

        // Packaging Materials
        materials_used: Array.isArray(formData.materials_used)
          ? formData.materials_used
          : [],
        box_used: formData.box_used,
        box_type: formData.box_type,
        box_quantity: formData.box_quantity,
        box_cost: formData.box_cost || "0",
        certificate_used: formData.certificate_used,
        certificate_type: formData.certificate_type,
        certificate_quantity: formData.certificate_quantity,
        certificate_cost: formData.certificate_cost || "0",
        cotton_used: formData.cotton_used,
        cotton_quantity: formData.cotton_quantity || "",
        cotton_cost: formData.cotton_cost || "0",

        // Quality Check
        quality_check: formData.quality_check,
        quality_score: formData.quality_score,
        quality_remarks: formData.quality_remarks,

        // Cost Tracking
        material_cost: formData.material_cost || "0",
        labour_cost: formData.labour_cost || "0",
        equipment_cost: formData.equipment_cost || "0",
        other_costs: formData.other_costs || "0",
        total_cost: formData.total_cost || "0",
        cost_currency: formData.cost_currency,
        cost_status: formData.cost_status,
        markup_percentage: formData.markup_percentage,
        final_price: formData.final_price || "0",

        // Time Tracking
        preparation_time: formData.preparation_time || "0",
        packaging_time: formData.packaging_time || "0",
        labeling_time: formData.labeling_time || "0",
        quality_time: formData.quality_time || "0",
        documentation_time: formData.documentation_time || "0",
        total_time_spent: formData.total_time_spent || "0",
        time_breakdown: formData.time_breakdown || "",

        // Additional Fields
        packaging_type: formData.packaging_type,
        sealing_method: formData.sealing_method,
        weight_after_packaging: formData.weight_after_packaging || "",
        barcode_generated: formData.barcode_generated,
        barcode_number: formData.barcode_number || "",

        // File Tracking
        source_files: Array.isArray(formData.source_files)
          ? formData.source_files
          : [],
        output_files: Array.isArray(formData.output_files)
          ? formData.output_files
          : [],
        file_version: formData.file_version,
        file_revisions: formData.file_revisions,
        file_status: formData.file_status,
        backup_location: formData.backup_location || "",
        files: packagingFiles,
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

  const totalMaterialCost =
    (formData.box_used ? parseFloat(formData.box_cost || 0) : 0) +
    (formData.certificate_used
      ? parseFloat(formData.certificate_cost || 0)
      : 0) +
    (formData.cotton_used ? parseFloat(formData.cotton_cost || 0) : 0);

  const efficiency =
    formData.total_time_spent && formData.packaging_time
      ? Math.min(
          100,
          Math.max(
            0,
            (parseFloat(formData.packaging_time) /
              parseFloat(formData.total_time_spent)) *
              100,
          ),
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
                <FiEdit className="me-2" />
                Update Packaging Stage: {selectedStage.job_card_no}
              </h5>
              {selectedStage && (
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="badge bg-success">
                    <FiPackage className="me-1" /> Packaging Stage
                  </span>
                  {formData.packaging_type && (
                    <span className="badge bg-info">
                      <FiGift className="me-1" />{" "}
                      {formData.packaging_type.toUpperCase()} PACKAGING
                    </span>
                  )}
                  {formData.barcode_generated && (
                    <span className="badge bg-primary">
                      <FiTag className="me-1" /> Barcode Generated
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
                          <h6 className="text-muted mb-1">Materials Used</h6>
                          <h4 className="mb-0">
                            {formData.materials_used.length}
                          </h4>
                        </div>
                        <FiBox className="text-warning" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Total Cost: ₹{totalMaterialCost.toFixed(2)}
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
                            <span className="badge bg-success me-2">
                              {formData.quality_check ? "PASSED" : "PENDING"}
                            </span>
                            <h4 className="mb-0">{formData.quality_score}%</h4>
                          </div>
                        </div>
                        <FiShieldIcon className="text-success" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        {formData.quality_check
                          ? "Quality Check Done"
                          : "Needs Quality Check"}
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
                          <FiUser className="me-1" /> Assigned Packer{" "}
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
                          <option value="">Select Packer</option>
                          {employees
                            .filter(
                              (emp) =>
                                emp.department
                                  ?.toLowerCase()
                                  .includes("packaging") ||
                                emp.role_id?.role_name
                                  ?.toLowerCase()
                                  .includes("packaging"),
                            )
                            .map((emp) => (
                              <option key={emp._id} value={emp._id}>
                                {emp.name} (
                                {emp.department ||
                                  emp.role_id?.role_name ||
                                  "Packing Dept"}
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
                          <FiGift className="me-1" /> Packaging Type
                        </label>
                        <select
                          name="packaging_type"
                          className="form-select"
                          value={formData.packaging_type}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {packagingTypeOptions.map((option) => (
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
                          <FiLayersIcon className="me-1" /> Sealing Method
                        </label>
                        <select
                          name="sealing_method"
                          className="form-select"
                          value={formData.sealing_method}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {sealingMethodOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
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
                        placeholder="Add any remarks, special instructions, or notes about this packaging process..."
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Materials Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "📦 Packaging Materials",
                  "materials",
                  <FiShoppingBag />,
                )}
                {expandedSections.materials && (
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">
                      Standard Packaging Materials
                    </h6>

                    {/* Box */}
                    <div className="row mb-3 border-bottom pb-3">
                      <div className="col-md-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="box_used"
                            checked={formData.box_used}
                            onChange={() => handleMaterialCheckboxChange("box")}
                            disabled={isDisabled}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="box_used"
                          >
                            <FiBox className="me-2" /> Jewelry Box
                          </label>
                        </div>

                        {formData.box_used && (
                          <div className="row mt-2">
                            <div className="col-md-4">
                              <label className="form-label small">
                                Box Type
                              </label>
                              <select
                                name="box_type"
                                className="form-select form-select-sm"
                                value={formData.box_type}
                                onChange={handleInputChange}
                                disabled={isDisabled}
                              >
                                {boxTypeOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small">
                                Quantity
                              </label>
                              <input
                                type="number"
                                name="box_quantity"
                                className="form-control form-control-sm"
                                value={formData.box_quantity}
                                onChange={handleInputChange}
                                min="1"
                                disabled={isDisabled}
                              />
                            </div>
                            <div className="col-md-5">
                              <label className="form-label small">
                                Cost (₹)
                              </label>
                              <input
                                type="number"
                                name="box_cost"
                                className="form-control form-control-sm"
                                value={formData.box_cost}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                disabled={isDisabled}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Certificate */}
                    <div className="row mb-3 border-bottom pb-3">
                      <div className="col-md-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="certificate_used"
                            checked={formData.certificate_used}
                            onChange={() =>
                              handleMaterialCheckboxChange("certificate")
                            }
                            disabled={isDisabled}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="certificate_used"
                          >
                            <FiFile className="me-2" /> Certificate of
                            Authenticity
                          </label>
                        </div>

                        {formData.certificate_used && (
                          <div className="row mt-2">
                            <div className="col-md-4">
                              <label className="form-label small">
                                Certificate Type
                              </label>
                              <select
                                name="certificate_type"
                                className="form-select form-select-sm"
                                value={formData.certificate_type}
                                onChange={handleInputChange}
                                disabled={isDisabled}
                              >
                                {certificateTypeOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small">
                                Quantity
                              </label>
                              <input
                                type="number"
                                name="certificate_quantity"
                                className="form-control form-control-sm"
                                value={formData.certificate_quantity}
                                onChange={handleInputChange}
                                min="1"
                                disabled={isDisabled}
                              />
                            </div>
                            <div className="col-md-5">
                              <label className="form-label small">
                                Cost (₹)
                              </label>
                              <input
                                type="number"
                                name="certificate_cost"
                                className="form-control form-control-sm"
                                value={formData.certificate_cost}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                disabled={isDisabled}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cotton */}
                    <div className="row mb-3 border-bottom pb-3">
                      <div className="col-md-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="cotton_used"
                            checked={formData.cotton_used}
                            onChange={() =>
                              handleMaterialCheckboxChange("cotton")
                            }
                            disabled={isDisabled}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="cotton_used"
                          >
                            <FiLayers className="me-2" /> Cotton Padding
                          </label>
                        </div>

                        {formData.cotton_used && (
                          <div className="row mt-2">
                            <div className="col-md-4">
                              <label className="form-label small">
                                Quantity (grams)
                              </label>
                              <input
                                type="number"
                                name="cotton_quantity"
                                className="form-control form-control-sm"
                                value={formData.cotton_quantity}
                                onChange={handleInputChange}
                                min="0"
                                step="0.1"
                                disabled={isDisabled}
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small">
                                Unit Cost (₹/gram)
                              </label>
                              <input
                                type="number"
                                name="cotton_cost"
                                className="form-control form-control-sm"
                                value={formData.cotton_cost}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                disabled={isDisabled}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Material Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3">Material Cost Summary</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Box:</span>
                            <span className="fw-bold">
                              ₹
                              {formData.box_used
                                ? parseFloat(formData.box_cost || 0).toFixed(2)
                                : "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Certificate:</span>
                            <span className="fw-bold">
                              ₹
                              {formData.certificate_used
                                ? parseFloat(
                                    formData.certificate_cost || 0,
                                  ).toFixed(2)
                                : "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Cotton:</span>
                            <span className="fw-bold">
                              ₹
                              {formData.cotton_used
                                ? parseFloat(formData.cotton_cost || 0).toFixed(
                                    2,
                                  )
                                : "0.00"}
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="fw-bold">
                              Total Material Cost:
                            </span>
                            <span className="fw-bold fs-5 text-primary">
                              ₹
                              {parseFloat(formData.material_cost || 0).toFixed(
                                2,
                              )}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Markup ({formData.markup_percentage}%):</span>
                            <span className="fw-bold text-success">
                              ₹
                              {(
                                (parseFloat(formData.material_cost || 0) *
                                  parseFloat(formData.markup_percentage || 0)) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="text-center">
                            <div className="mb-3">
                              <h6 className="fw-bold">Materials Used</h6>
                              <div className="d-flex flex-wrap gap-1 justify-content-center">
                                {formData.materials_used.map(
                                  (material, index) => (
                                    <span key={index} className="badge bg-info">
                                      {material}
                                    </span>
                                  ),
                                )}
                                {formData.materials_used.length === 0 && (
                                  <span className="text-muted small">
                                    No materials selected
                                  </span>
                                )}
                              </div>
                            </div>
                            <div
                              className="progress"
                              style={{ height: "20px" }}
                            >
                              <div
                                className="progress-bar bg-primary"
                                style={{
                                  width: `${(formData.box_used ? parseFloat(formData.box_cost || 0) : 0) / (parseFloat(formData.material_cost || 1) * 100)}%`,
                                }}
                                title="Box"
                              >
                                Box
                              </div>
                              <div
                                className="progress-bar bg-success"
                                style={{
                                  width: `${(formData.certificate_used ? parseFloat(formData.certificate_cost || 0) : 0) / (parseFloat(formData.material_cost || 1) * 100)}%`,
                                }}
                                title="Certificate"
                              >
                                Certificate
                              </div>
                              <div
                                className="progress-bar bg-warning"
                                style={{
                                  width: `${(formData.cotton_used ? parseFloat(formData.cotton_cost || 0) : 0) / (parseFloat(formData.material_cost || 1) * 100)}%`,
                                }}
                                title="Cotton"
                              >
                                Cotton
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quality Check Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "🔍 Quality Check",
                  "quality",
                  <FiShield />,
                )}
                {expandedSections.quality && (
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="quality_check"
                            checked={formData.quality_check}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                quality_check: !prev.quality_check,
                              }))
                            }
                            disabled={isDisabled}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="quality_check"
                          >
                            Quality Check Completed
                          </label>
                        </div>
                      </div>
                    </div>

                    {formData.quality_check && (
                      <>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-medium">
                              Quality Score (%)
                            </label>
                            <input
                              type="number"
                              name="quality_score"
                              className="form-control"
                              value={formData.quality_score}
                              onChange={handleInputChange}
                              min="0"
                              max="100"
                              step="1"
                              disabled={isDisabled}
                            />
                            <div className="form-text">
                              100% = Perfect, 80-99% = Good, Below 80% = Needs
                              Improvement
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-12">
                            <label className="form-label fw-medium">
                              Quality Remarks
                            </label>
                            <textarea
                              name="quality_remarks"
                              className="form-control"
                              rows={3}
                              value={formData.quality_remarks}
                              onChange={handleTextareaChange}
                              placeholder="Note any quality issues, packaging defects, or improvements needed..."
                              disabled={isDisabled}
                            ></textarea>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Quality Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3">Quality Assessment</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Status:</span>
                            <span
                              className={`fw-bold ${
                                formData.quality_check
                                  ? "text-success"
                                  : "text-warning"
                              }`}
                            >
                              {formData.quality_check ? "COMPLETED" : "PENDING"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Score:</span>
                            <span
                              className={`fw-bold ${
                                parseFloat(formData.quality_score) >= 90
                                  ? "text-success"
                                  : parseFloat(formData.quality_score) >= 80
                                    ? "text-warning"
                                    : "text-danger"
                              }`}
                            >
                              {formData.quality_score || "0"}%
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="fw-bold">Overall Status:</span>
                            <span
                              className={`fw-bold ${
                                parseFloat(formData.quality_score) >= 80
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {parseFloat(formData.quality_score) >= 80
                                ? "ACCEPTED"
                                : "REVIEW NEEDED"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="text-center">
                            <div className="mb-2">
                              <div
                                className={`display-6 ${
                                  formData.quality_check &&
                                  parseFloat(formData.quality_score) >= 80
                                    ? "text-success"
                                    : formData.quality_check
                                      ? "text-warning"
                                      : "text-secondary"
                                }`}
                              >
                                {formData.quality_check &&
                                parseFloat(formData.quality_score) >= 80
                                  ? "✅"
                                  : formData.quality_check
                                    ? "⚠️"
                                    : "⏳"}
                              </div>
                            </div>
                            <div className="small text-muted">
                              {formData.quality_check
                                ? parseFloat(formData.quality_score) >= 80
                                  ? "Packaging quality is acceptable."
                                  : "Quality issues detected. Review required."
                                : "Quality check pending."}
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
                        <div className="form-text x-small">
                          Packaging materials cost
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
                        <div className="form-text x-small">
                          Packing labour cost
                        </div>
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
                        <div className="form-text x-small">Machinery usage</div>
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
                        <div className="form-text x-small">
                          Miscellaneous expenses
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
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
                            placeholder="15"
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
                                width: `${((parseFloat(formData.material_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Material Cost"
                            >
                              Material
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
                        <div className="form-text x-small">Material setup</div>
                      </div>

                      <div className="col-md-3 mb-2">
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
                          Actual packaging
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Labeling Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="labeling_time"
                            className="form-control"
                            value={formData.labeling_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Barcodes & labels
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Quality Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="quality_time"
                            className="form-control"
                            value={formData.quality_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">Quality check</div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Documentation
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
                          Paperwork & files
                        </div>
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
                        onChange={handleTextareaChange}
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
                            <div
                              className="progress-bar bg-warning"
                              style={{
                                width: `${
                                  (parseFloat(formData.labeling_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Labeling"
                            >
                              Labeling
                            </div>
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${
                                  (parseFloat(formData.quality_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Quality Check"
                            >
                              Quality
                            </div>
                            <div
                              className="progress-bar bg-dark"
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

              {/* Additional Information Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "📄 Additional Information",
                  "additional",
                  <FiInfo />,
                )}
                {expandedSections.additional && (
                  <div className="card-body">
                    <div className="row g-2">
                      <div className="col-md-6 mb-2">
                        <label className="form-label fw-medium small">
                          Weight After Packaging (grams)
                        </label>
                        <input
                          type="number"
                          name="weight_after_packaging"
                          className="form-control form-control-sm"
                          value={formData.weight_after_packaging}
                          onChange={handleInputChange}
                          min="0"
                          step="0.1"
                          disabled={isDisabled}
                        />
                      </div>

                      <div className="col-md-6 mb-2">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="barcode_generated"
                            checked={formData.barcode_generated}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                barcode_generated: !prev.barcode_generated,
                              }))
                            }
                            disabled={isDisabled}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="barcode_generated"
                          >
                            Barcode Generated
                          </label>
                        </div>
                      </div>

                      {formData.barcode_generated && (
                        <div className="col-md-6 mb-2">
                          <label className="form-label fw-medium small">
                            Barcode Number
                          </label>
                          <input
                            type="text"
                            name="barcode_number"
                            className="form-control form-control-sm"
                            value={formData.barcode_number}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                          />
                        </div>
                      )}
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
                  packagingFiles.length,
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
                              Packaging Documents
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  packagingFiles.filter(
                                    (f) => f.category === "document",
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
                                  ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png";
                                input.onchange = (e) =>
                                  handleFileChange(e, "document");
                                input.click();
                              }}
                            >
                              <FiUpload size={16} className="text-info mb-1" />
                              <p className="mb-0 small">Upload Documents</p>
                              <p className="x-small text-muted">
                                PDF, Word, Excel, Images
                              </p>
                            </div>

                            {packagingFiles.filter(
                              (f) => f.category === "document",
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
                                      {packagingFiles
                                        .filter(
                                          (f) => f.category === "document",
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

                      <div className="col-md-6">
                        <div className="card border">
                          <div className="card-header bg-success text-white py-2">
                            <h6 className="mb-0 small fw-bold">
                              Packaging Photos
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  packagingFiles.filter(
                                    (f) => f.category === "photo",
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
                                  handleFileChange(e, "photo");
                                input.click();
                              }}
                            >
                              <FiUpload
                                size={16}
                                className="text-success mb-1"
                              />
                              <p className="mb-0 small">Upload Photos</p>
                              <p className="x-small text-muted">
                                JPG, PNG, GIF, WebP
                              </p>
                            </div>

                            {packagingFiles.filter(
                              (f) => f.category === "photo",
                            ).length > 0 && (
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
                                      {packagingFiles
                                        .filter((f) => f.category === "photo")
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
                  <span className="me-3">📦 Packaging tracking</span>
                  <span className="me-3">🔍 Quality check</span>
                  <span>📊 Cost & time tracking</span>
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
                    className="btn btn-success d-flex align-items-center gap-2"
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
                        Update Packaging Stage
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

export default UpdatePackagingStage;
