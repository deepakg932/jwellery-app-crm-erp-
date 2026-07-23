// components/UpdatePlatingStage.jsx
import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import {
  FiUser,
  FiDroplet,
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
  FiChevronDown,
  FiChevronUp,
  FiSave,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiSettings,
  FiX,
  FiShield,
  FiZap,
  FiTool,
  FiThermometer,
  FiDroplet as FiDropletIcon,
  FiBattery,
  FiLayers,
  FiUsers,
  FiTarget,
  FiSun,
} from "react-icons/fi";

const UpdatePlatingStage = ({
  selectedStage,
  employees = [],
  materials = [],
  units = [],
  laborCosts = [], // Add labor costs
  onUpdate,
  onClose,
  loading = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [platingFiles, setPlatingFiles] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedLaborCosts, setSelectedLaborCosts] = useState([]); // Add selected labor costs
  const [laborBreakdown, setLaborBreakdown] = useState([]); // Add labor breakdown

  console.log("Selected stage:", selectedStage);
  console.log("Labor costs received for plating:", laborCosts);

  const [formData, setFormData] = useState({
    assigned_to: "",
    status: "",
    start_date: "",
    end_date: "",
    material_id: "",
    material_name: "",
    material_code: "",
    material_used_qty: "",
    material_unit: "ml",
    plating_type: "electroplating",
    plating_thickness: "",
    current_density: "",
    voltage_applied: "",
    plating_time: "",
    bath_temperature: "",
    ph_level: "",
    surface_finish: "good",
    adhesion_quality: "good",
    uniformity: "good",
    defects: "",
    rework_required: false,
    rework_reason: "",
    labour_hours: "",
    actual_hours: "",
    next_stage: "",
    stage: "",
    remarks: "",
    material_cost: "",
    labour_cost: "",
    equipment_cost: "",
    chemical_cost: "",
    electricity_cost: "",
    other_costs: "",
    total_cost: "",
    cost_currency: "INR",
    cost_status: "estimated",
    markup_percentage: "25",
    final_price: "",
    preparation_time: "",
    cleaning_time: "",
    plating_time_track: "",
    rinsing_time: "",
    drying_time: "",
    quality_check_time: "",
    total_time_spent: "",
    time_breakdown: "",
    file_version: "1.0",
    file_revisions: 0,
    file_status: "draft",
    backup_location: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    material: false,
    process: false,
    quality: false,
    cost: true,
    time: false,
    files: false,
  });

  const statusOptions = [
    // {
    //   value: "not_started",
    //   label: "Not Started",
    //   color: "secondary",
    //   icon: "⏳",
    // },
    // { value: "preparation", label: "Preparation", color: "info", icon: "🧪" },
    // { value: "cleaning", label: "Cleaning", color: "info", icon: "🚿" },
    // { value: "plating", label: "Plating", color: "warning", icon: "⚡" },
    // { value: "rinsing", label: "Rinsing", color: "info", icon: "💧" },
    // { value: "drying", label: "Drying", color: "info", icon: "🌬️" },
    // {
    //   value: "quality_check",
    //   label: "Quality Check",
    //   color: "warning",
    //   icon: "🔍",
    // },
    { value: "Approved", label: "approved", color: "success", icon: "✅" },
    { value: "Draft", label: "draft", color: "danger", icon: "⏸️" },
    { value: "Cancelled", label: "cancelled", color: "danger", icon: "🔄" },
  ];

  const platingTypeOptions = [
    { value: "electroplating", label: "Electroplating", icon: "⚡" },
    { value: "electroless", label: "Electroless Plating", icon: "🧪" },
    { value: "immersion", label: "Immersion Plating", icon: "🏊" },
    { value: "brush", label: "Brush Plating", icon: "🖌️" },
  ];

  const surfaceFinishOptions = [
    { value: "excellent", label: "Excellent", color: "success" },
    { value: "good", label: "Good", color: "info" },
    { value: "average", label: "Average", color: "warning" },
    { value: "poor", label: "Poor", color: "danger" },
  ];

  const adhesionQualityOptions = [
    { value: "excellent", label: "Excellent", color: "success" },
    { value: "good", label: "Good", color: "info" },
    { value: "average", label: "Average", color: "warning" },
    { value: "poor", label: "Poor", color: "danger" },
  ];

  const uniformityOptions = [
    { value: "excellent", label: "Excellent", color: "success" },
    { value: "good", label: "Good", color: "info" },
    { value: "average", label: "Average", color: "warning" },
    { value: "poor", label: "Poor", color: "danger" },
  ];

  const nextStageOptions = [
    { value: "quality_check", label: "Quality Check", icon: "🔍" },
    { value: "polishing", label: "Polishing", icon: "✨" },
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

  // Prepare options for React Select - PLATING LABOR COSTS
  const getLaborCostOptions = () => {
    if (!laborCosts || laborCosts.length === 0) return [];

    // Filter for plating-related labor costs
    const filteredCosts = laborCosts.filter((cost) => {
      const costName = (cost.cost_name || "").toLowerCase();
      const stageName = (cost.stage_name || "").toLowerCase();
      const subStageName = (cost.sub_stage_name || "").toLowerCase();
      
      // Include labor and plating costs relevant to plating stage
      return (
        costName
      );
    });

    return filteredCosts.map((cost) => ({
      value: cost._id,
      label: `${cost.cost_name || "Labor"} (${cost.cost_type || "Direct Cost"}) - ₹${cost.cost_amount || 0}/${cost.unit || "unit"}`,
      originalData: cost,
    }));
  };

  // Handle labor cost selection change
  const handleLaborCostsChange = (selectedOptions) => {
    const selectedItems = selectedOptions
      ? selectedOptions.map((option) => option.originalData)
      : [];
    setSelectedLaborCosts(selectedItems);

    // Calculate total labor cost based on selected items
    calculateLaborCostFromSelection(selectedItems);
  };

  // Calculate labor cost from selected items
  const calculateLaborCostFromSelection = (selectedItems) => {
    if (selectedItems.length === 0) {
      setFormData((prev) => ({ ...prev, labour_cost: "0.00" }));
      setLaborBreakdown([]);
      return;
    }

    // Calculate breakdown for selected items
    const breakdown = selectedItems.map((cost) => {
      const costAmount = parseFloat(cost.cost_amount) || 0;

      return {
        id: cost._id,
        name: cost.cost_name || cost.cost_name_id?.cost_name || "Labor",
        type: cost.cost_type || "Direct Cost",
        cost_amount: costAmount,
        unit: cost.unit || "unit",
        total_cost: costAmount.toFixed(2),
        stage: cost.stage_name || "General",
        sub_stage: cost.sub_stage_name || "General",
      };
    });

    setLaborBreakdown(breakdown);

    // Calculate total labor cost
    const totalLaborCost = breakdown.reduce(
      (sum, item) => sum + parseFloat(item.total_cost),
      0
    );

    // Update form data with calculated labor cost
    setFormData((prev) => ({
      ...prev,
      labour_cost: totalLaborCost.toFixed(2),
    }));

    // Recalculate total cost
    calculateTotalCost();
  };

  // Initialize form data
  useEffect(() => {
    if (selectedStage && laborCosts.length > 0) {
      // Parse selected labor costs if they exist in the stage data
      let parsedSelectedLaborCosts = [];
      if (selectedStage.selected_labor_costs) {
        if (Array.isArray(selectedStage.selected_labor_costs)) {
          // Map the IDs to actual labor cost objects
          parsedSelectedLaborCosts = laborCosts.filter(cost => 
            selectedStage.selected_labor_costs.includes(cost._id)
          );
        } else if (typeof selectedStage.selected_labor_costs === "string") {
          try {
            const ids = JSON.parse(selectedStage.selected_labor_costs);
            parsedSelectedLaborCosts = laborCosts.filter(cost => 
              ids.includes(cost._id)
            );
          } catch {
            parsedSelectedLaborCosts = [];
          }
        }
      }

      // Parse labor breakdown if it exists
      let parsedLaborBreakdown = [];
      if (selectedStage.labor_cost_breakdown) {
        if (Array.isArray(selectedStage.labor_cost_breakdown)) {
          parsedLaborBreakdown = selectedStage.labor_cost_breakdown;
        } else if (typeof selectedStage.labor_cost_breakdown === "string") {
          try {
            parsedLaborBreakdown = JSON.parse(selectedStage.labor_cost_breakdown);
          } catch {
            parsedLaborBreakdown = [];
          }
        }
      }

      const initialData = {
        assigned_to: selectedStage.assigned_to || "",
        status: selectedStage.status || "",
        start_date: selectedStage.start_date
          ? new Date(selectedStage.start_date).toISOString().split("T")[0]
          : "",
        end_date: selectedStage.end_date
          ? new Date(selectedStage.end_date).toISOString().split("T")[0]
          : "",
        material_id: selectedStage.material_id || "",
        material_name: selectedStage.material_name || "",
        material_code: selectedStage.material_code || "",
        material_used_qty: selectedStage.material_used_qty || "",
        material_unit: selectedStage.material_unit || "ml",
        plating_type: selectedStage.plating_type || "electroplating",
        plating_thickness: selectedStage.plating_thickness || "",
        current_density: selectedStage.current_density || "",
        voltage_applied: selectedStage.voltage_applied || "",
        plating_time: selectedStage.plating_time || "",
        bath_temperature: selectedStage.bath_temperature || "",
        ph_level: selectedStage.ph_level || "",
        surface_finish: selectedStage.surface_finish || "good",
        adhesion_quality: selectedStage.adhesion_quality || "good",
        uniformity: selectedStage.uniformity || "good",
        defects: selectedStage.defects || "",
        rework_required: selectedStage.rework_required || false,
        rework_reason: selectedStage.rework_reason || "",
        labour_hours: selectedStage.labour_hours || "",
        actual_hours: selectedStage.actual_hours || "",
        next_stage: selectedStage.next_stage || "",
        stage: selectedStage.next_stage || selectedStage.stage || "",
        remarks: selectedStage.remarks || "",
        material_cost: selectedStage.material_cost || "",
        labour_cost: selectedStage.labour_cost || "",
        equipment_cost: selectedStage.equipment_cost || "",
        chemical_cost: selectedStage.chemical_cost || "",
        electricity_cost: selectedStage.electricity_cost || "",
        other_costs: selectedStage.other_costs || "",
        total_cost: selectedStage.total_cost || "",
        cost_currency: selectedStage.cost_currency || "INR",
        cost_status: selectedStage.cost_status || "estimated",
        markup_percentage: selectedStage.markup_percentage || "25",
        final_price: selectedStage.final_price || "",
        preparation_time: selectedStage.preparation_time || "",
        cleaning_time: selectedStage.cleaning_time || "",
        plating_time_track: selectedStage.plating_time_track || "",
        rinsing_time: selectedStage.rinsing_time || "",
        drying_time: selectedStage.drying_time || "",
        quality_check_time: selectedStage.quality_check_time || "",
        total_time_spent: selectedStage.total_time_spent || "",
        time_breakdown: selectedStage.time_breakdown || "",
        file_version: selectedStage.file_version || "1.0",
        file_revisions: selectedStage.file_revisions || 0,
        file_status: selectedStage.file_status || "draft",
        backup_location: selectedStage.backup_location || "",
      };

      console.log("Initializing plating form data:", initialData);

      setFormData(initialData);
      setSelectedLaborCosts(parsedSelectedLaborCosts);
      setLaborBreakdown(parsedLaborBreakdown);

      // Calculate labor cost from selected items
      if (parsedSelectedLaborCosts.length > 0) {
        calculateLaborCostFromSelection(parsedSelectedLaborCosts);
      }

      if (selectedStage.material_id && materials.length > 0) {
        const material = materials.find(
          (m) => m._id === selectedStage.material_id,
        );
        if (material) {
          setSelectedMaterial(material);
        }
      }

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
        setPlatingFiles(existingFiles);
      } else {
        setPlatingFiles([]);
      }

      setFormErrors({});
      calculateTotalCost();
      calculateTotalTime();
    }
  }, [selectedStage, materials, laborCosts]);

  // Auto-recalculate total time when time fields change
  useEffect(() => {
    calculateTotalTime();
  }, [
    formData.preparation_time,
    formData.cleaning_time,
    formData.plating_time_track,
    formData.rinsing_time,
    formData.drying_time,
    formData.quality_check_time,
  ]);

  // Auto-recalculate total cost when individual costs change
  useEffect(() => {
    calculateTotalCost();
  }, [
    formData.material_cost,
    formData.labour_cost,
    formData.equipment_cost,
    formData.chemical_cost,
    formData.electricity_cost,
    formData.other_costs,
    formData.markup_percentage,
  ]);

  // Auto-calculate labor cost whenever selected labor costs change
  useEffect(() => {
    calculateLaborCostFromSelection(selectedLaborCosts);
  }, [selectedLaborCosts]);

  // Handle material selection
  const handleMaterialChange = (materialId) => {
    const material = materials.find((m) => m._id === materialId);
    if (material) {
      setSelectedMaterial(material);
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          material_id: material._id,
          material_name: material.name,
          material_code: material.item_code,
          material_unit: material.unit_name || "ml",
        };

        // Recalculate material cost when material changes
        const used = Number(updatedData.material_used_qty) || 0;
        const unitCost = Number(material.cost) || 0;

        const materialCost = used * unitCost;

        // Also recalculate total cost
        const labour = Number(updatedData.labour_cost) || 0;
        const equipment = Number(updatedData.equipment_cost) || 0;
        const chemical = Number(updatedData.chemical_cost) || 0;
        const electricity = Number(updatedData.electricity_cost) || 0;
        const other = Number(updatedData.other_costs) || 0;
        const markup = Number(updatedData.markup_percentage) || 25;

        const total =
          materialCost + labour + equipment + chemical + electricity + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        updatedData.material_cost = materialCost.toFixed(2);
        updatedData.total_cost = total.toFixed(2);
        updatedData.final_price = finalPrice.toFixed(2);

        return updatedData;
      });
    }
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    const material = parseFloat(formData.material_cost) || 0;
    const labour = parseFloat(formData.labour_cost) || 0;
    const equipment = parseFloat(formData.equipment_cost) || 0;
    const chemical = parseFloat(formData.chemical_cost) || 0;
    const electricity = parseFloat(formData.electricity_cost) || 0;
    const other = parseFloat(formData.other_costs) || 0;
    const markup = parseFloat(formData.markup_percentage) || 25;

    const total = material + labour + equipment + chemical + electricity + other;
    const markupAmount = (total * markup) / 100;
    const finalPrice = total + markupAmount;

    console.log("PLATING COST CALCULATION:", {
      material,
      labour,
      equipment,
      chemical,
      electricity,
      other,
      markup,
      total,
      finalPrice,
    });

    setFormData((prev) => ({
      ...prev,
      total_cost: total.toFixed(2),
      final_price: finalPrice.toFixed(2),
    }));
  };

  // Calculate total time
  const calculateTotalTime = () => {
    const prep = parseFloat(formData.preparation_time) || 0;
    const cleaning = parseFloat(formData.cleaning_time) || 0;
    const plating = parseFloat(formData.plating_time_track) || 0;
    const rinsing = parseFloat(formData.rinsing_time) || 0;
    const drying = parseFloat(formData.drying_time) || 0;
    const quality = parseFloat(formData.quality_check_time) || 0;

    const total = prep + cleaning + plating + rinsing + drying + quality;

    console.log("PLATING TIME CALCULATION:", {
      prep,
      cleaning,
      plating,
      rinsing,
      drying,
      quality,
      total,
    });

    setFormData((prev) => ({
      ...prev,
      total_time_spent: total.toFixed(1),
      labour_hours: total.toFixed(1),
      actual_hours: total.toFixed(1),
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
      } else if (name.includes("_time") || name === "material_used_qty") {
        updatedData[name] = value === "" ? "" : value;
      } else {
        updatedData[name] = val;
      }

      // Calculate totals if cost or markup changed
      if (name.includes("_cost") || name === "markup_percentage") {
        const material = Number(updatedData.material_cost) || 0;
        const labour = Number(updatedData.labour_cost) || 0;
        const equipment = Number(updatedData.equipment_cost) || 0;
        const chemical = Number(updatedData.chemical_cost) || 0;
        const electricity = Number(updatedData.electricity_cost) || 0;
        const other = Number(updatedData.other_costs) || 0;
        const markup = Number(updatedData.markup_percentage) || 25;

        const total = material + labour + equipment + chemical + electricity + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        updatedData.total_cost = total.toFixed(2);
        updatedData.final_price = finalPrice.toFixed(2);
      }

      // Calculate totals if time field changed
      if (name.includes("_time") || name === "plating_time_track") {
        const prep = parseFloat(updatedData.preparation_time) || 0;
        const cleaning = parseFloat(updatedData.cleaning_time) || 0;
        const plating = parseFloat(updatedData.plating_time_track) || 0;
        const rinsing = parseFloat(updatedData.rinsing_time) || 0;
        const drying = parseFloat(updatedData.drying_time) || 0;
        const quality = parseFloat(updatedData.quality_check_time) || 0;

        const total = prep + cleaning + plating + rinsing + drying + quality;

        updatedData.total_time_spent = total.toFixed(1);
        updatedData.labour_hours = total.toFixed(1);
        updatedData.actual_hours = total.toFixed(1);
      }

      // Calculate material cost when quantity changes
      if (name === "material_used_qty" && selectedMaterial) {
        const used = Number(value) || 0;
        const unitCost = Number(selectedMaterial.cost) || 0;
        const materialCost = used * unitCost;

        updatedData.material_cost = materialCost.toFixed(2);

        // Recalculate total with new material cost
        const labour = Number(updatedData.labour_cost) || 0;
        const equipment = Number(updatedData.equipment_cost) || 0;
        const chemical = Number(updatedData.chemical_cost) || 0;
        const electricity = Number(updatedData.electricity_cost) || 0;
        const other = Number(updatedData.other_costs) || 0;
        const markup = Number(updatedData.markup_percentage) || 25;

        const total = materialCost + labour + equipment + chemical + electricity + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        updatedData.total_cost = total.toFixed(2);
        updatedData.final_price = finalPrice.toFixed(2);
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

    if (!formData.material_id) {
      errors.material_id = "Material is required";
    }

    if (!formData.material_used_qty) {
      errors.material_used_qty = "Material used quantity is required";
    }

    if (selectedLaborCosts.length === 0) {
      errors.labor_costs = "At least one labor cost type must be selected";
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
      "application/octet-stream",
      "application/zip",
      "application/x-rar",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/msword",
    ];

    const platingExtensions = [
      "jpg", "jpeg", "png", "pdf", "mp4", "avi", "mov",
      "doc", "docx", "xls", "xlsx"
    ];

    const invalidFiles = fileList.filter(
      (file) =>
        !allowedTypes.includes(file.type) &&
        !platingExtensions.some((ext) =>
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

      setPlatingFiles((prev) => [...prev, ...newFiles]);
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

  // Handle file removal
  const handleRemoveFile = (fileId) => {
    const fileToRemove = platingFiles.find((f) => f.id === fileId);
    if (fileToRemove && fileToRemove.url && !fileToRemove.isExisting) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    setPlatingFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Categorize files
  const getFilesByCategory = (category) => {
    return platingFiles.filter((file) => file.category === category);
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

    if (type.includes("image")) return <FiEye className="text-primary" />;
    if (type.includes("pdf")) return <FiFile className="text-danger" />;
    if (type.includes("word") || type.includes("document"))
      return <FiFile className="text-info" />;
    if (type.includes("excel") || type.includes("spreadsheet"))
      return <FiFile className="text-success" />;
    if (type.includes("zip") || type.includes("rar"))
      return <FiFile className="text-warning" />;

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
      const filesToUpload = platingFiles
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
        material_id: formData.material_id,
        material_name: formData.material_name,
        material_code: formData.material_code,
        material_used_qty: formData.material_used_qty || "0",
        material_unit: formData.material_unit || "ml",
        plating_type: formData.plating_type || "electroplating",
        plating_thickness: formData.plating_thickness || "",
        current_density: formData.current_density || "",
        voltage_applied: formData.voltage_applied || "",
        plating_time: formData.plating_time || "",
        bath_temperature: formData.bath_temperature || "",
        ph_level: formData.ph_level || "",
        surface_finish: formData.surface_finish || "good",
        adhesion_quality: formData.adhesion_quality || "good",
        uniformity: formData.uniformity || "good",
        defects: formData.defects || "",
        rework_required: formData.rework_required || false,
        rework_reason: formData.rework_reason || "",
        material_cost: formData.material_cost || "0",
        labour_cost: formData.labour_cost || "0",
        equipment_cost: formData.equipment_cost || "0",
        chemical_cost: formData.chemical_cost || "0",
        electricity_cost: formData.electricity_cost || "0",
        other_costs: formData.other_costs || "0",
        total_cost: formData.total_cost || "0",
        cost_currency: formData.cost_currency || "INR",
        cost_status: formData.cost_status || "estimated",
        markup_percentage: formData.markup_percentage || "25",
        final_price: formData.final_price || "0",
        preparation_time: formData.preparation_time || "0",
        cleaning_time: formData.cleaning_time || "0",
        plating_time_track: formData.plating_time_track || "0",
        rinsing_time: formData.rinsing_time || "0",
        drying_time: formData.drying_time || "0",
        quality_check_time: formData.quality_check_time || "0",
        total_time_spent: formData.total_time_spent || "0",
        time_breakdown: formData.time_breakdown || "",
        file_version: formData.file_version || "1.0",
        file_revisions: formData.file_revisions || 0,
        file_status: formData.file_status || "draft",
        backup_location: formData.backup_location || "",
        files: platingFiles,

        // Labor cost tracking
        selected_labor_costs: selectedLaborCosts,
        labor_cost_breakdown: laborBreakdown,
      };

      console.log("🚀 Submitting Plating stage update:", {
        platingStageId: selectedStage._id,
        data: updateData,
        selectedLaborCostsCount: selectedLaborCosts.length,
        laborBreakdownCount: laborBreakdown.length,
      });

      if (onUpdate) {
        const result = await onUpdate(
          selectedStage._id,
          updateData,
          filesToUpload,
        );

        console.log("Modal received result:", result);

        if (result === true || (result && result.success === true)) {
          console.log("✅ Update successful, closing modal");
          onClose();
        } else {
          console.log("❌ Update failed, not closing");
          const errorMsg =
            result?.error || result?.message || "Failed to update Plating stage";
          setUploadError(errorMsg);
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

  const efficiency = formData.total_time_spent
    ? (
        (parseFloat(formData.labour_hours || 0) /
          parseFloat(formData.total_time_spent || 1)) *
        100
      ).toFixed(1)
    : "0";

  // Calculate total labor from breakdown
  const totalCalculatedLabor = laborBreakdown.reduce(
    (sum, item) => sum + parseFloat(item.total_cost || 0),
    0
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
        <div className="modal-content rounded-3" style={{ maxHeight: "90vh" }}>
          <div
            className="modal-header border-bottom pb-3 sticky-top bg-white"
            style={{ zIndex: 1050 }}
          >
            <div>
              <h5 className="modal-title fw-bold fs-5 mb-1">
                <FiEdit className="me-2" />
                Update Plating Stage: {selectedStage.job_card_no}
              </h5>
              {selectedStage && (
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="badge bg-warning">
                    <FiLayers className="me-1" /> Plating Stage
                  </span>
                  {formData.material_name && (
                    <span className="badge bg-info">
                      <FiDropletIcon className="me-1" />{" "}
                      {formData.material_name}
                    </span>
                  )}
                  <span className="badge bg-primary">
                    <FiUsers className="me-1" /> Labor Types:{" "}
                    {selectedLaborCosts.length}
                  </span>
                  <span className="badge bg-dark">
                    <FiBarChart2 className="me-1" />
                    Next:{" "}
                    {formData.stage
                      ? nextStageOptions.find(
                          (opt) => opt.value === formData.stage,
                        )?.label || formData.stage
                      : "Not set"}
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
                          <h6 className="text-muted mb-1">Labor Cost</h6>
                          <h4 className="mb-0">
                            ₹ {formData.labour_cost || "0.00"}
                          </h4>
                          <small className="text-muted">
                            {selectedLaborCosts.length} type(s) selected
                          </small>
                        </div>
                        <FiUsers className="text-warning" size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Material Used</h6>
                          <h4 className="mb-0">
                            {formData.material_used_qty || "0"}
                            {formData.material_unit}
                          </h4>
                        </div>
                        <FiDroplet className="text-info" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        {formData.material_name || "Select Material"}
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
                          <h6 className="text-muted mb-1">Final Price</h6>
                          <h4 className="mb-0">
                            ₹ {formData.final_price || "0.00"}
                          </h4>
                          <small className="text-muted">
                            Markup: {formData.markup_percentage || "0"}%
                          </small>
                        </div>
                        <FiDollarSign className="text-success" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Total: ₹{formData.total_cost || "0"}
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
                          <option value="">Select Karigar</option>
                          {employees
                            .filter(
                              (emp) =>
                                emp.role_id?.role_name?.toLowerCase().includes("plating") ||
                                emp.role_id?.role_name?.toLowerCase().includes("plater") ||
                                emp.role_id?.role_name?.toLowerCase().includes("karigar") ||
                                emp.role_id?.role_name?.toLowerCase().includes("designer") ||
                                emp.department?.toLowerCase().includes("plating")
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
                          <FiClock className="me-1" /> Labour Hours
                        </label>
                        <input
                          type="number"
                          name="labour_hours"
                          className="form-control"
                          value={formData.labour_hours}
                          onChange={handleInputChange}
                          min="0"
                          step="0.5"
                          placeholder="e.g., 1"
                          disabled={isDisabled}
                        />
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
                        placeholder="Add any remarks, special instructions, or notes about this plating process..."
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Material Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "🧪 Material Tracking",
                  "material",
                  <FiDroplet />,
                )}
                {expandedSections.material && (
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          <FiDroplet className="me-1" /> Plating Solution{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <select
                          name="material_id"
                          className={`form-select ${
                            formErrors.material_id ? "is-invalid" : ""
                          }`}
                          value={formData.material_id}
                          onChange={(e) => handleMaterialChange(e.target.value)}
                          disabled={isDisabled}
                        >
                          <option value="">Select Plating Solution</option>
                          {materials.map((material) => (
                            <option key={material._id} value={material._id}>
                              {material.item_code} - {material.name} (
                              {material.unit_name}: {material.available_quantity || 0})
                            </option>
                          ))}
                        </select>
                        {formErrors.material_id && (
                          <div className="invalid-feedback d-block">
                            {formErrors.material_id}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Plating Type
                        </label>
                        <select
                          name="plating_type"
                          className="form-select"
                          value={formData.plating_type}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {platingTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Material Information Card */}
                    {selectedMaterial && (
                      <div className="card border-info mb-4">
                        <div className="card-header bg-info text-white">
                          <h6 className="mb-0">Material Information</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3">
                              <div className="mb-2">
                                <small className="text-muted">Item Code</small>
                                <div className="fw-medium">
                                  {selectedMaterial.item_code}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="mb-2">
                                <small className="text-muted">
                                  Available Stock
                                </small>
                                <div className="fw-medium">
                                  {selectedMaterial.available_quantity || 0}{" "}
                                  {selectedMaterial.unit_code}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="mb-2">
                                <small className="text-muted">Purity</small>
                                <div className="fw-medium">
                                  {selectedMaterial.purity || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="mb-2">
                                <small className="text-muted">Unit Cost</small>
                                <div className="fw-medium">
                                  ₹{selectedMaterial.cost || "0.00"}/
                                  {selectedMaterial.unit_name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="row g-2">
                      <div className="col-md-6 mb-2">
                        <label className="form-label fw-medium small">
                          Material Used Quantity{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="material_used_qty"
                            className={`form-control ${
                              formErrors.material_used_qty ? "is-invalid" : ""
                            }`}
                            value={formData.material_used_qty}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            placeholder="e.g., 50"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">
                            {formData.material_unit}
                          </span>
                        </div>
                        {formErrors.material_used_qty && (
                          <div className="invalid-feedback d-block">
                            {formErrors.material_used_qty}
                          </div>
                        )}
                        {selectedMaterial && (
                          <div className="form-text x-small">
                            Available: {selectedMaterial.available_quantity}{" "}
                            {selectedMaterial.unit_name}
                            {formData.material_used_qty &&
                              selectedMaterial.available_quantity &&
                              parseFloat(formData.material_used_qty) >
                                selectedMaterial.available_quantity && (
                                <span className="text-danger ms-2">
                                  ⚠️ Exceeds available stock
                                </span>
                              )}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-2">
                        <label className="form-label fw-medium small">
                          Material Unit
                        </label>
                        <input
                          type="text"
                          name="material_unit"
                          className="form-control form-control-sm"
                          value={formData.material_unit}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                          placeholder="e.g., ml"
                        />
                        <div className="form-text x-small">
                          Unit of measurement
                        </div>
                      </div>
                    </div>

                    {formData.material_used_qty && selectedMaterial && (
                      <div className="border rounded-3 p-3 bg-light mt-3">
                        <h6 className="fw-bold mb-3">
                          Material Cost Calculation
                        </h6>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="d-flex justify-content-between mb-2 small">
                              <span>Quantity Used:</span>
                              <span className="fw-bold">
                                {formData.material_used_qty}{" "}
                                {formData.material_unit}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 small">
                              <span>Unit Cost:</span>
                              <span className="fw-bold">
                                ₹{selectedMaterial.cost || "0.00"}/
                                {selectedMaterial.unit_name}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 small">
                              <span>Material Cost:</span>
                              <span className="fw-bold text-primary">
                                ₹{formData.material_cost || "0.00"}
                              </span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-2">
                              <span className="fw-bold">
                                Total with Markup (
                                {formData.markup_percentage || "0"}%):
                              </span>
                              <span className="fw-bold fs-5 text-success">
                                ₹{formData.final_price || "0.00"}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div
                              className="progress"
                              style={{ height: "20px" }}
                            >
                              <div
                                className="progress-bar bg-info"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (parseFloat(formData.material_used_qty) /
                                      (selectedMaterial.available_quantity ||
                                        1)) *
                                      100,
                                  )}%`,
                                }}
                                title="Material Usage"
                              >
                                Used (
                                {Math.min(
                                  100,
                                  (parseFloat(formData.material_used_qty) /
                                    (selectedMaterial.available_quantity ||
                                      1)) *
                                    100,
                                ).toFixed(1)}
                                %)
                              </div>
                            </div>
                            <div className="mt-2 small text-muted">
                              Stock usage visualization
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Plating Process Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "⚡ Plating Process",
                  "process",
                  <FiZap />,
                )}
                {expandedSections.process && (
                  <div className="card-body">
                    <div className="row g-2">
                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Plating Thickness
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="plating_thickness"
                            className="form-control"
                            value={formData.plating_thickness}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            placeholder="e.g., 0.5"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">μm</span>
                        </div>
                        <div className="form-text x-small">
                          Plating layer thickness
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Current Density
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="current_density"
                            className="form-control"
                            value={formData.current_density}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            placeholder="e.g., 2.5"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">A/dm²</span>
                        </div>
                        <div className="form-text x-small">
                          Current density applied
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Voltage
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="voltage_applied"
                            className="form-control"
                            value={formData.voltage_applied}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            placeholder="e.g., 12"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">V</span>
                        </div>
                        <div className="form-text x-small">Voltage applied</div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Plating Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="plating_time"
                            className="form-control"
                            value={formData.plating_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="e.g., 30"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">min</span>
                        </div>
                        <div className="form-text x-small">
                          Total plating time
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Bath Temperature
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="bath_temperature"
                            className="form-control"
                            value={formData.bath_temperature}
                            onChange={handleInputChange}
                            min="0"
                            placeholder="e.g., 50"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">°C</span>
                        </div>
                        <div className="form-text x-small">
                          Solution temperature
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          pH Level
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="ph_level"
                            className="form-control"
                            value={formData.ph_level}
                            onChange={handleInputChange}
                            min="0"
                            max="14"
                            step="0.1"
                            placeholder="e.g., 7.5"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">pH</span>
                        </div>
                        <div className="form-text x-small">
                          Solution pH level
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quality Metrics Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "🔍 Quality Metrics",
                  "quality",
                  <FiShield />,
                )}
                {expandedSections.quality && (
                  <div className="card-body">
                    <div className="row g-2">
                      <div className="col-md-4 mb-3">
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

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Adhesion Quality
                        </label>
                        <select
                          name="adhesion_quality"
                          className="form-select"
                          value={formData.adhesion_quality}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {adhesionQualityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Uniformity
                        </label>
                        <select
                          name="uniformity"
                          className="form-select"
                          value={formData.uniformity}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {uniformityOptions.map((option) => (
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
                          Defects Description
                        </label>
                        <textarea
                          name="defects"
                          className="form-control"
                          rows={3}
                          value={formData.defects}
                          onChange={handleInputChange}
                          placeholder="Describe any defects found (peeling, discoloration, uneven coating, bubbles, etc.)"
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
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="rework_required"
                          >
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

                    {/* Quality Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3">Quality Assessment</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Surface Finish:</span>
                            <span
                              className={`fw-bold ${
                                formData.surface_finish === "excellent"
                                  ? "text-success"
                                  : formData.surface_finish === "good"
                                    ? "text-info"
                                    : formData.surface_finish === "average"
                                      ? "text-warning"
                                      : "text-danger"
                              }`}
                            >
                              {
                                surfaceFinishOptions.find(
                                  (q) => q.value === formData.surface_finish,
                                )?.label
                              }
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Adhesion Quality:</span>
                            <span
                              className={`fw-bold ${
                                formData.adhesion_quality === "excellent"
                                  ? "text-success"
                                  : formData.adhesion_quality === "good"
                                    ? "text-info"
                                    : formData.adhesion_quality === "average"
                                      ? "text-warning"
                                      : "text-danger"
                              }`}
                            >
                              {
                                adhesionQualityOptions.find(
                                  (d) => d.value === formData.adhesion_quality,
                                )?.label
                              }
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Uniformity:</span>
                            <span
                              className={`fw-bold ${
                                formData.uniformity === "excellent"
                                  ? "text-success"
                                  : formData.uniformity === "good"
                                    ? "text-info"
                                    : formData.uniformity === "average"
                                      ? "text-warning"
                                      : "text-danger"
                              }`}
                            >
                              {
                                uniformityOptions.find(
                                  (p) => p.value === formData.uniformity,
                                )?.label
                              }
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="fw-bold">Overall Status:</span>
                            <span
                              className={`fw-bold ${
                                formData.rework_required
                                  ? "text-danger"
                                  : "text-success"
                              }`}
                            >
                              {formData.rework_required
                                ? "REWORK REQUIRED"
                                : "PASSED"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="text-center">
                            <div className="mb-2">
                              <div
                                className={`display-6 ${
                                  formData.rework_required
                                    ? "text-danger"
                                    : formData.surface_finish === "excellent" &&
                                        formData.adhesion_quality ===
                                          "excellent" &&
                                        formData.uniformity === "excellent"
                                      ? "text-success"
                                      : "text-warning"
                                }`}
                              >
                                {formData.rework_required
                                  ? "⚠️"
                                  : formData.surface_finish === "excellent" &&
                                      formData.adhesion_quality ===
                                        "excellent" &&
                                      formData.uniformity === "excellent"
                                    ? "✅"
                                    : "⚠️"}
                              </div>
                            </div>
                            <div className="small text-muted">
                              {formData.rework_required
                                ? "Quality issues detected. Rework required."
                                : "Quality parameters within acceptable limits."}
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
                  selectedLaborCosts.length
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

                    {/* Labor Cost Selection */}
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <label className="form-label fw-medium">
                          <FiUsers className="me-1" /> Labor Cost Types{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <Select
                          isMulti
                          options={getLaborCostOptions()}
                          value={getLaborCostOptions().filter((option) =>
                            selectedLaborCosts.some(
                              (cost) => cost._id === option.value
                            )
                          )}
                          onChange={handleLaborCostsChange}
                          placeholder={
                            laborCosts.length === 0
                              ? "Loading labor cost types..."
                              : "Select labor cost types (Plating/Labor costs)"
                          }
                          isDisabled={isDisabled || laborCosts.length === 0}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              borderColor: formErrors.labor_costs
                                ? "#dc3545"
                                : "#dee2e6",
                              "&:hover": {
                                borderColor: formErrors.labor_costs
                                  ? "#dc3545"
                                  : "#ced4da",
                              },
                              backgroundColor: state.isDisabled
                                ? "#e9ecef"
                                : "white",
                              minHeight: "42px",
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                            multiValue: (base) => ({
                              ...base,
                              backgroundColor: "#e3f2fd",
                            }),
                            multiValueLabel: (base) => ({
                              ...base,
                              color: "#1976d2",
                              fontWeight: "500",
                            }),
                          }}
                        />
                        {formErrors.labor_costs && (
                          <div className="invalid-feedback d-block">
                            <FiAlertCircle className="me-1" />{" "}
                            {formErrors.labor_costs}
                          </div>
                        )}
                        <div className="form-text">
                          Select one or more labor cost types (Plating costs are
                          included). The total labor cost will be calculated
                          automatically.
                        </div>
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
                          Plating solution cost
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
                        <div className="form-text x-small">
                          Plating machine usage
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Chemical Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="chemical_cost"
                            className="form-control"
                            value={formData.chemical_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Other chemicals
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Electricity Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="electricity_cost"
                            className="form-control"
                            value={formData.electricity_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Power consumption
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

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Labor Cost (Auto)
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="labour_cost"
                            className="form-control bg-light"
                            value={formData.labour_cost}
                            readOnly
                            title="Automatically calculated from selected labor cost types"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              calculateLaborCostFromSelection(selectedLaborCosts)
                            }
                            disabled={isDisabled}
                            title="Recalculate labor cost"
                          >
                            <FiRefreshCw size={14} />
                          </button>
                        </div>
                        <div className="form-text x-small">
                          Auto-calculated from {selectedLaborCosts.length}{" "}
                          selected type(s)
                        </div>
                      </div>
                    </div>

                    {/* Selected Labor Costs Breakdown */}
                    {selectedLaborCosts.length > 0 && (
                      <div className="row mt-3">
                        <div className="col-md-12">
                          <div className="card border">
                            <div className="card-header bg-light py-2">
                              <h6 className="mb-0 small fw-bold">
                                Selected Labor Cost Breakdown
                                <span className="badge bg-primary ms-2">
                                  {selectedLaborCosts.length}
                                </span>
                              </h6>
                            </div>
                            <div className="card-body p-3">
                              <div className="table-responsive">
                                <table className="table table-sm mb-0">
                                  <thead>
                                    <tr>
                                      <th className="small">Type</th>
                                      <th className="small">Cost Type</th>
                                      <th className="small">Amount</th>
                                      <th className="small">Unit</th>
                                      <th className="small text-end">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {laborBreakdown.map((item) => (
                                      <tr key={item.id}>
                                        <td className="small">
                                          <strong>{item.name}</strong>
                                        </td>
                                        <td className="small">
                                          <span className="badge bg-secondary">
                                            {item.type}
                                          </span>
                                        </td>
                                        <td className="small">
                                          ₹{item.cost_amount}
                                        </td>
                                        <td className="small">
                                          <span className="badge bg-info">
                                            {item.unit}
                                          </span>
                                        </td>
                                        <td className="small text-end fw-bold">
                                          ₹{item.total_cost}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="table-active">
                                      <td colSpan="4" className="small fw-bold">
                                        Total Labor Cost
                                      </td>
                                      <td className="small text-end fw-bold fs-6">
                                        ₹ {totalCalculatedLabor.toFixed(2)}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cost Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3">Cost Summary</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Material Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.material_cost || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Labor Cost:</span>
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
                            <span>Chemical Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.chemical_cost || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Electricity Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.electricity_cost || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Other Costs:</span>
                            <span className="fw-bold">
                              ₹ {formData.other_costs || "0.00"}
                            </span>
                          </div>
                          <hr />
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
                              title="Labor Cost"
                            >
                              Labor
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
                                width: `${((parseFloat(formData.chemical_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Chemical Cost"
                            >
                              Chemical
                            </div>
                            <div
                              className="progress-bar bg-danger"
                              style={{
                                width: `${((parseFloat(formData.electricity_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Electricity Cost"
                            >
                              Electricity
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
                          Setup & solution prep
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Cleaning Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="cleaning_time"
                            className="form-control"
                            value={formData.cleaning_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Surface preparation
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Plating Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="plating_time_track"
                            className="form-control"
                            value={formData.plating_time_track}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Actual plating process
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Rinsing Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="rinsing_time"
                            className="form-control"
                            value={formData.rinsing_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Post-plating rinse
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Drying Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="drying_time"
                            className="form-control"
                            value={formData.drying_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">Drying time</div>
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
                              className="progress-bar bg-success"
                              style={{
                                width: `${
                                  (parseFloat(formData.cleaning_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Cleaning"
                            >
                              Clean
                            </div>
                            <div
                              className="progress-bar bg-warning"
                              style={{
                                width: `${
                                  (parseFloat(
                                    formData.plating_time_track || 0,
                                  ) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Plating"
                            >
                              Plate
                            </div>
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${
                                  (parseFloat(formData.rinsing_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Rinsing"
                            >
                              Rinse
                            </div>
                            <div
                              className="progress-bar bg-dark"
                              style={{
                                width: `${
                                  (parseFloat(formData.drying_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Drying"
                            >
                              Dry
                            </div>
                            <div
                              className="progress-bar bg-secondary"
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
                              title="Quality Check"
                            >
                              QC
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
                  platingFiles.length,
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
                              Process Files
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  platingFiles.filter(
                                    (f) => f.category === "process",
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
                                input.accept = "image/*,.mp4,.avi,.mov,.pdf,.doc,.docx";
                                input.onchange = (e) =>
                                  handleFileChange(e, "process");
                                input.click();
                              }}
                            >
                              <FiUpload size={16} className="text-info mb-1" />
                              <p className="mb-0 small">Upload Process Files</p>
                              <p className="x-small text-muted">
                                Photos, Reports, Documents
                              </p>
                            </div>

                            {platingFiles.filter(
                              (f) => f.category === "process",
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
                                      {platingFiles
                                        .filter((f) => f.category === "process")
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
                              Quality Files
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  platingFiles.filter(
                                    (f) => f.category === "quality",
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
                                input.accept = "image/*,.mp4,.avi,.mov,.pdf";
                                input.onchange = (e) =>
                                  handleFileChange(e, "quality");
                                input.click();
                              }}
                            >
                              <FiUpload
                                size={16}
                                className="text-success mb-1"
                              />
                              <p className="mb-0 small">Upload Quality Files</p>
                              <p className="x-small text-muted">
                                Photos, Videos, Reports
                              </p>
                            </div>

                            {platingFiles.filter(
                              (f) => f.category === "quality",
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
                                      {platingFiles
                                        .filter((f) => f.category === "quality")
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
                  <span className="me-3">
                    <FiUsers className="me-1" />
                    Labor: ₹{formData.labour_cost || "0.00"}
                  </span>
                  <span className="me-3">
                    <FiDroplet className="me-1" />
                    Material: {formData.material_used_qty || "0"} {formData.material_unit}
                  </span>
                  <span className="me-3">
                    <FiClock className="me-1" />
                    {formData.total_time_spent || "0"} hrs
                  </span>
                  <span>
                    <FiDollarSign className="me-1" />
                    Final: ₹{formData.final_price || "0.00"}
                  </span>
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
                        Update Plating Stage
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

export default UpdatePlatingStage;