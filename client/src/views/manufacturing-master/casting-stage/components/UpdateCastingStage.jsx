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
  FiDroplet,
  FiWatch,
  FiZap,
  FiScissors,
  FiShield,
  FiImage,
  FiArchive,
  FiShoppingCart,
  FiDatabase as FiDatabaseIcon,
} from "react-icons/fi";

const UpdateCastingStage = ({
  selectedStage,
  employees = [],
  materials = [],
  units = [],
  onUpdate,
  onClose,
  loading = false,
  getPurityOptions,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [castingFiles, setCastingFiles] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [purityOptions, setPurityOptions] = useState([]);
  console.log(selectedMaterial);
  const [formData, setFormData] = useState({
    assigned_to: "",
    status: "",
    start_date: "",
    end_date: "",
    material_id: "",
    material_type: "",
    material_item_code: "",
    material_issued_qty: "",
    material_used_qty: "",
    material_returned_qty: "",
    material_wastage_qty: "",
    material_wastage_type: "normal",
    purity: "",
    material_unit: "",
    material_unit_id: "",
    casting_method: "lost_wax",
    mold_type: "rubber",
    tree_size: "",
    burnout_time: "",
    casting_temperature: "",
    pressure_applied: "",
    vacuum_level: "",
    surface_quality: "good",
    dimensional_accuracy: "within_tolerance",
    porosity_level: "low",
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
    consumables_cost: "",
    gas_cost: "",
    other_costs: "",
    total_cost: "",
    cost_currency: "INR",
    cost_status: "estimated",
    markup_percentage: "25",
    final_price: "",
    preparation_time: "",
    mold_making_time: "",
    burnout_time_track: "",
    casting_time: "",
    finishing_time: "",
    quality_check_time: "",
    total_time_spent: "",
    time_breakdown: "",
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
    material: false,
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
    {
      value: "material_preparation",
      label: "Material Preparation",
      color: "info",
      icon: "⚗️",
    },
    { value: "mold_making", label: "Mold Making", color: "info", icon: "🫧" },
    { value: "burnout", label: "Burnout", color: "warning", icon: "🔥" },
    { value: "casting", label: "Casting", color: "warning", icon: "🌡️" },
    { value: "cooling", label: "Cooling", color: "info", icon: "❄️" },
    { value: "devesting", label: "Devesting", color: "info", icon: "🔨" },
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
      description: "Expected wastage (2-5%)",
    },
    {
      value: "high",
      label: "High",
      color: "warning",
      description: "Above normal wastage (5-10%)",
    },
    {
      value: "excessive",
      label: "Excessive",
      color: "danger",
      description: "Above 10% wastage",
    },
    {
      value: "recovered",
      label: "Recovered",
      color: "info",
      description: "Wastage recovered for reuse",
    },
  ];

  const castingMethodOptions = [
    { value: "lost_wax", label: "Lost Wax Casting", icon: "🕯️" },
    { value: "vacuum_cast", label: "Vacuum Casting", icon: "💨" },
    { value: "centrifugal", label: "Centrifugal Casting", icon: "🌀" },
    { value: "sand_cast", label: "Sand Casting", icon: "🏖️" },
    { value: "die_cast", label: "Die Casting", icon: "⚙️" },
    { value: "investment", label: "Investment Casting", icon: "🫧" },
  ];

  const moldTypeOptions = [
    { value: "rubber", label: "Rubber Mold", icon: "🔴" },
    { value: "silicone", label: "Silicone Mold", icon: "🔵" },
    { value: "plaster", label: "Plaster Mold", icon: "⚪" },
    { value: "sand", label: "Sand Mold", icon: "🟤" },
    { value: "metal", label: "Metal Mold", icon: "⚙️" },
  ];

  const surfaceQualityOptions = [
    { value: "excellent", label: "Excellent", color: "success" },
    { value: "good", label: "Good", color: "info" },
    { value: "average", label: "Average", color: "warning" },
    { value: "poor", label: "Poor", color: "danger" },
  ];

  const dimensionalAccuracyOptions = [
    { value: "within_tolerance", label: "Within Tolerance", color: "success" },
    { value: "slight_deviation", label: "Slight Deviation", color: "warning" },
    {
      value: "significant_deviation",
      label: "Significant Deviation",
      color: "danger",
    },
  ];

  const porosityLevelOptions = [
    { value: "none", label: "None", color: "success" },
    { value: "low", label: "Low", color: "info" },
    { value: "medium", label: "Medium", color: "warning" },
    { value: "high", label: "High", color: "danger" },
  ];

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

  const nextStageOptions = defaultNextStageOptions;
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

  // Initialize dynamic purity options
  useEffect(() => {
    if (getPurityOptions) {
      const dynamicPurityOptions = getPurityOptions();
      setPurityOptions(dynamicPurityOptions);
    }
  }, [getPurityOptions]);

  // Update available materials
  useEffect(() => {
    if (materials && materials.length > 0) {
      const jewelryMaterials = materials.filter(
        (material) =>
          material.name?.toLowerCase().includes("gold") ||
          material.name?.toLowerCase().includes("silver") ||
          material.name?.toLowerCase().includes("platinum") ||
          material.name?.toLowerCase().includes("palladium") ||
          material.name?.toLowerCase().includes("brass") ||
          material.name?.toLowerCase().includes("bronze"),
      );
      setAvailableMaterials(jewelryMaterials);
    }
  }, [materials]);

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
        material_id: selectedStage.material_id || "",
        material_type: selectedStage.material_type || "",
        material_item_code: selectedStage.material_item_code || "",
        material_issued_qty: selectedStage.material_issued_qty || "",
        material_used_qty: selectedStage.material_used_qty || "",
        material_returned_qty: selectedStage.material_returned_qty || "",
        material_wastage_qty: selectedStage.material_wastage_qty || "",
        material_wastage_type: selectedStage.material_wastage_type || "normal",
        purity: selectedStage.purity || "",
        material_unit: selectedStage.material_unit || "",
        material_unit_id: selectedStage.material_unit_id || "",
        casting_method: selectedStage.casting_method || "lost_wax",
        mold_type: selectedStage.mold_type || "rubber",
        tree_size: selectedStage.tree_size || "",
        burnout_time: selectedStage.burnout_time || "",
        casting_temperature: selectedStage.casting_temperature || "",
        pressure_applied: selectedStage.pressure_applied || "",
        vacuum_level: selectedStage.vacuum_level || "",
        surface_quality: selectedStage.surface_quality || "good",
        dimensional_accuracy:
          selectedStage.dimensional_accuracy || "within_tolerance",
        porosity_level: selectedStage.porosity_level || "low",
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
        consumables_cost: selectedStage.consumables_cost || "",
        gas_cost: selectedStage.gas_cost || "",
        other_costs: selectedStage.other_costs || "",
        total_cost: selectedStage.total_cost || "",
        cost_currency: selectedStage.cost_currency || "INR",
        cost_status: selectedStage.cost_status || "estimated",
        markup_percentage: selectedStage.markup_percentage || "25",
        final_price: selectedStage.final_price || "",
        preparation_time: selectedStage.preparation_time || "",
        mold_making_time: selectedStage.mold_making_time || "",
        burnout_time_track: selectedStage.burnout_time_track || "",
        casting_time: selectedStage.casting_time || "",
        finishing_time: selectedStage.finishing_time || "",
        quality_check_time: selectedStage.quality_check_time || "",
        total_time_spent: selectedStage.total_time_spent || "",
        time_breakdown: selectedStage.time_breakdown || "",
        file_version: selectedStage.file_version || "1.0",
        file_revisions: selectedStage.file_revisions || 0,
        source_files: selectedStage.source_files || [],
        output_files: selectedStage.output_files || [],
        file_status: selectedStage.file_status || "draft",
        backup_location: selectedStage.backup_location || "",
      };

      setFormData(initialData);

      if (initialData.material_id && materials.length > 0) {
        const material = materials.find(
          (m) =>
            m._id === initialData.material_id ||
            m.material_id === initialData.material_id,
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
        setCastingFiles(existingFiles);
      } else {
        setCastingFiles([]);
      }

      setFormErrors({});
      calculateMaterialBalance();
      calculateTotalCost();
      calculateTotalTime();
    }
  }, [selectedStage, materials]);

  // Handle material selection
  const handleMaterialChange = (materialId) => {
    const material = materials.find(
      (m) => m._id === materialId || m.material_id === materialId,
    );
    if (material) {
      setSelectedMaterial(material);
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          material_id: material._id || material.material_id,
          material_type: material.name?.toLowerCase() || "",
          material_item_code: material.item_code || "",
          material_unit: material.unit_name || "",
          material_unit_id: material.unit_id || "",
          purity: material.purity || "",
        };

        // Recalculate material cost when material changes
        const issued = Number(updatedData.material_issued_qty) || 0;
        const returned = Number(updatedData.material_returned_qty) || 0;
        const unitCost = Number(material.cost) || 0;

        const materialCost = (issued - returned) * unitCost;

        // Also recalculate total cost
        const labour = Number(updatedData.labour_cost) || 0;
        const equipment = Number(updatedData.equipment_cost) || 0;
        const consumables = Number(updatedData.consumables_cost) || 0;
        const gas = Number(updatedData.gas_cost) || 0;
        const other = Number(updatedData.other_costs) || 0;
        const markup = Number(updatedData.markup_percentage) || 25;

        const total =
          materialCost + labour + equipment + consumables + gas + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        updatedData.material_cost = materialCost.toFixed(2);
        updatedData.total_cost = total.toFixed(2);
        updatedData.final_price = finalPrice.toFixed(2);

        return updatedData;
      });
    }
  };

  // Calculate material balance
  const calculateMaterialBalance = () => {
    const issued = parseFloat(formData.material_issued_qty) || 0;
    const used = parseFloat(formData.material_used_qty) || 0;
    const returned = parseFloat(formData.material_returned_qty) || 0;
    const wastage = parseFloat(formData.material_wastage_qty) || 0;

    if (issued > 0 && used > 0 && wastage === 0) {
      const calculatedWastage = issued - used - returned;
      if (calculatedWastage >= 0) {
        setFormData((prev) => ({
          ...prev,
          material_wastage_qty: calculatedWastage.toFixed(2),
        }));
      }
    }

    if (issued > 0 && used > 0 && wastage > 0 && returned === 0) {
      const calculatedReturned = issued - used - wastage;
      if (calculatedReturned >= 0) {
        setFormData((prev) => ({
          ...prev,
          material_returned_qty: calculatedReturned.toFixed(2),
        }));
      }
    }
  };

  // Calculate total cost
  // const calculateTotalCost = () => {
  //   const material = parseFloat(formData.material_cost) || 0;
  //   const labour = parseFloat(formData.labour_cost) || 0;
  //   const equipment = parseFloat(formData.equipment_cost) || 0;
  //   const consumables = parseFloat(formData.consumables_cost) || 0;
  //   const gas = parseFloat(formData.gas_cost) || 0;
  //   const other = parseFloat(formData.other_costs) || 0;

  //   const total = material + labour + equipment + consumables + gas + other;

  //   const markup = parseFloat(formData.markup_percentage) || 25;
  //   const finalPrice = total * (1 + markup / 100);

  //   setFormData((prev) => ({
  //     ...prev,
  //     total_cost: total.toFixed(2),
  //     final_price: finalPrice.toFixed(2),
  //   }));
  // };

  const calculateTotalCost = () => {
    // Material cost calculate करें: (issued - returned) × unit cost
    const issued = Number(formData.material_issued_qty) || 0;
    const returned = Number(formData.material_returned_qty) || 0;
    const unitCost = Number(selectedMaterial?.cost) || 0;

    const materialCost = (issued - returned) * unitCost;
    const labour = Number(formData.labour_cost) || 0;
    const equipment = Number(formData.equipment_cost) || 0;
    const consumables = Number(formData.consumables_cost) || 0;
    const gas = Number(formData.gas_cost) || 0;
    const other = Number(formData.other_costs) || 0;
    const markup = Number(formData.markup_percentage) || 25;

    console.log("CASTING COST CALCULATION:", {
      materialCost,
      labour,
      equipment,
      consumables,
      gas,
      other,
      markup,
    });

    const total = materialCost + labour + equipment + consumables + gas + other;
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
    const mold = parseFloat(formData.mold_making_time) || 0;
    const burnout = parseFloat(formData.burnout_time_track) || 0;
    const casting = parseFloat(formData.casting_time) || 0;
    const finishing = parseFloat(formData.finishing_time) || 0;
    const quality = parseFloat(formData.quality_check_time) || 0;

    const total = prep + mold + burnout + casting + finishing + quality;

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
      } else if (
        name.includes("_time") ||
        name === "material_issued_qty" ||
        name === "material_used_qty" ||
        name === "material_returned_qty" ||
        name === "material_wastage_qty"
      ) {
        updatedData[name] = value === "" ? "" : value;
      } else {
        updatedData[name] = val;
      }

      // Calculate totals if cost or markup changed
      if (name.includes("_cost") || name === "markup_percentage") {
        const issued = Number(updatedData.material_issued_qty) || 0;
        const returned = Number(updatedData.material_returned_qty) || 0;
        const unitCost = Number(selectedMaterial?.cost) || 0;

        const materialCost = (issued - returned) * unitCost;
        const labour = Number(updatedData.labour_cost) || 0;
        const equipment = Number(updatedData.equipment_cost) || 0;
        const consumables = Number(updatedData.consumables_cost) || 0;
        const gas = Number(updatedData.gas_cost) || 0;
        const other = Number(updatedData.other_costs) || 0;
        const markup = Number(updatedData.markup_percentage) || 25;

        console.log("CASTING COST CALCULATION IN HANDLE CHANGE:", {
          materialCost,
          labour,
          equipment,
          consumables,
          gas,
          other,
          markup,
        });

        const total =
          materialCost + labour + equipment + consumables + gas + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        updatedData.material_cost = materialCost.toFixed(2);
        updatedData.total_cost = total.toFixed(2);
        updatedData.final_price = finalPrice.toFixed(2);
      }

      // Calculate totals if time field changed
      if (name.includes("_time") || name === "burnout_time_track") {
        const prep = parseFloat(updatedData.preparation_time) || 0;
        const mold = parseFloat(updatedData.mold_making_time) || 0;
        const burnout = parseFloat(updatedData.burnout_time_track) || 0;
        const casting = parseFloat(updatedData.casting_time) || 0;
        const finishing = parseFloat(updatedData.finishing_time) || 0;
        const quality = parseFloat(updatedData.quality_check_time) || 0;

        const total = prep + mold + burnout + casting + finishing + quality;

        updatedData.total_time_spent = total.toFixed(1);
        updatedData.labour_hours = total.toFixed(1);
        updatedData.actual_hours = total.toFixed(1);
      }

      // Calculate material balance if material quantities changed
      if (name.includes("material_")) {
        const issued = parseFloat(updatedData.material_issued_qty) || 0;
        const used = parseFloat(updatedData.material_used_qty) || 0;
        const returned = parseFloat(updatedData.material_returned_qty) || 0;
        const wastage = parseFloat(updatedData.material_wastage_qty) || 0;

        if (issued > 0 && used > 0 && wastage === 0) {
          const calculatedWastage = issued - used - returned;
          if (calculatedWastage >= 0) {
            updatedData.material_wastage_qty = calculatedWastage.toFixed(2);
          }
        }

        if (issued > 0 && used > 0 && wastage > 0 && returned === 0) {
          const calculatedReturned = issued - used - wastage;
          if (calculatedReturned >= 0) {
            updatedData.material_returned_qty = calculatedReturned.toFixed(2);
          }
        }
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

    if (!formData.material_issued_qty) {
      errors.material_issued_qty = "Material issued quantity is required";
    }

    if (!formData.material_used_qty) {
      errors.material_used_qty = "Material used quantity is required";
    }

    const issued = Number(formData.material_issued_qty) || 0;
    const used = Number(formData.material_used_qty) || 0;
    const returned = Number(formData.material_returned_qty) || 0;
    const wastage = Number(formData.material_wastage_qty) || 0;

    if (used + returned + wastage > issued) {
      errors.material_balance =
        "Used + Returned + Wastage cannot exceed issued quantity";
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

    const castingExtensions = [
      "jpg",
      "jpeg",
      "png",
      "pdf",
      "stl",
      "step",
      "igs",
      "3dm",
      "mp4",
      "avi",
      "mov",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "dwg",
      "dxf",
      "blend",
      "obj",
      "fbx",
      "iges",
      "stp",
    ];

    const invalidFiles = fileList.filter(
      (file) =>
        !allowedTypes.includes(file.type) &&
        !castingExtensions.some((ext) =>
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

      setCastingFiles((prev) => [...prev, ...newFiles]);

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
    const fileToRemove = castingFiles.find((f) => f.id === fileId);
    if (fileToRemove && fileToRemove.url && !fileToRemove.isExisting) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    setCastingFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Categorize files
  const getFilesByCategory = (category) => {
    return castingFiles.filter((file) => file.category === category);
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

    const castingExtensions = [
      "stl",
      "step",
      "3dm",
      "igs",
      "dwg",
      "dxf",
      "blend",
      "obj",
    ];
    if (castingExtensions.includes(extension))
      return <FiEdit className="text-secondary" />;

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
      const filesToUpload = castingFiles
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
        material_type: formData.material_type,
        material_item_code: formData.material_item_code,
        material_issued_qty: formData.material_issued_qty || "0",
        material_used_qty: formData.material_used_qty || "0",
        material_returned_qty: formData.material_returned_qty || "0",
        material_wastage_qty: formData.material_wastage_qty || "0",
        material_wastage_type: formData.material_wastage_type || "normal",
        purity: formData.purity || "",
        material_unit: formData.material_unit || "",
        material_unit_id: formData.material_unit_id || "",
        casting_method: formData.casting_method || "lost_wax",
        mold_type: formData.mold_type || "rubber",
        tree_size: formData.tree_size || "",
        burnout_time: formData.burnout_time || "",
        casting_temperature: formData.casting_temperature || "",
        pressure_applied: formData.pressure_applied || "",
        vacuum_level: formData.vacuum_level || "",
        surface_quality: formData.surface_quality || "good",
        dimensional_accuracy:
          formData.dimensional_accuracy || "within_tolerance",
        porosity_level: formData.porosity_level || "low",
        defects: formData.defects || "",
        rework_required: formData.rework_required || false,
        rework_reason: formData.rework_reason || "",
        material_cost: formData.material_cost || "0",
        labour_cost: formData.labour_cost || "0",
        equipment_cost: formData.equipment_cost || "0",
        consumables_cost: formData.consumables_cost || "0",
        gas_cost: formData.gas_cost || "0",
        other_costs: formData.other_costs || "0",
        total_cost: formData.total_cost || "0",
        cost_currency: formData.cost_currency || "INR",
        cost_status: formData.cost_status || "estimated",
        markup_percentage: formData.markup_percentage || "25",
        final_price: formData.final_price || "0",
        preparation_time: formData.preparation_time || "0",
        mold_making_time: formData.mold_making_time || "0",
        burnout_time_track: formData.burnout_time_track || "0",
        casting_time: formData.casting_time || "0",
        finishing_time: formData.finishing_time || "0",
        quality_check_time: formData.quality_check_time || "0",
        total_time_spent: formData.total_time_spent || "0",
        time_breakdown: formData.time_breakdown || "",
        file_version: formData.file_version || "1.0",
        file_revisions: formData.file_revisions || 0,
        file_status: formData.file_status || "draft",
        backup_location: formData.backup_location || "",
        files: castingFiles,
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
  console.log(selectedStage);
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
    formData.estimated_hours && formData.total_time_spent
      ? (
          (parseFloat(formData.estimated_hours) /
            parseFloat(formData.total_time_spent || 1)) *
          100
        ).toFixed(1)
      : "0";

  const materialUsagePercent =
    formData.material_issued_qty && formData.material_used_qty
      ? (
          (parseFloat(formData.material_used_qty) /
            parseFloat(formData.material_issued_qty)) *
          100
        ).toFixed(1)
      : "0";

  const getAvailableStock = () => {
    if (!selectedMaterial) return { quantity: 0, weight: 0, unit: "" };

    const unit = selectedMaterial.unit_name || "";
    if (unit.toLowerCase()) {
      return {
        quantity: selectedMaterial.available_weight || 0,
        weight: selectedMaterial.available_weight || 0,
        unit: selectedMaterial.unit_code,
      };
    } else {
      return {
        quantity: selectedMaterial.available_quantity || 0,
        weight: 0,
        unit: unit,
      };
    }
  };
  console.log(selectedMaterial);

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
                Update Casting Stage: {selectedStage.job_card_no}
              </h5>
              {selectedStage && (
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="badge bg-primary">
                    <FiTool className="me-1" /> Casting Stage
                  </span>
                  {formData.material_type && (
                    <span className="badge bg-warning">
                      <FiDroplet className="me-1" />{" "}
                      {formData.material_type.toUpperCase()}
                    </span>
                  )}
                  {formData.purity && (
                    <span className="badge bg-success">
                      <FiShield className="me-1" /> {formData.purity}
                    </span>
                  )}
                  <span className="badge bg-dark">
                    <FiDatabaseIcon className="me-1" />
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
                          <h6 className="text-muted mb-1">Material Balance</h6>
                          <div className="d-flex align-items-center">
                            <span
                              className={`badge ${parseFloat(formData.material_wastage_qty || 0) > 5 ? "bg-danger" : "bg-success"} me-2`}
                            >
                              {formData.material_wastage_qty || "0"}g
                            </span>
                            <h4 className="mb-0">{materialUsagePercent}%</h4>
                          </div>
                        </div>
                        <FiDroplet className="text-warning" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Used: {formData.material_used_qty || "0"}g of{" "}
                        {formData.material_issued_qty || "0"}g
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
                                formData.surface_quality === "excellent"
                                  ? "bg-success"
                                  : formData.surface_quality === "good"
                                    ? "bg-info"
                                    : formData.surface_quality === "average"
                                      ? "bg-warning"
                                      : "bg-danger"
                              } me-2`}
                            >
                              {
                                surfaceQualityOptions.find(
                                  (q) => q.value === formData.surface_quality,
                                )?.label
                              }
                            </span>
                            <h4 className="mb-0">{formData.porosity_level}</h4>
                          </div>
                        </div>
                        <FiShield className="text-success" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Accuracy: {formData.dimensional_accuracy}
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
                                emp.role_id?.role_name?.includes("Casting") ||
                                emp.role_id?.role_name?.includes("Karigar") ||
                                emp.role_id?.role_name?.includes("Technician"),
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
                      <div className="col-md-4 mb-3">
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
                          placeholder="e.g., 4"
                          disabled={isDisabled}
                        />
                      </div>

                      <div className="col-md-4 mb-3">
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
                          placeholder="e.g., 4.5"
                          disabled={isDisabled}
                        />
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
                        placeholder="Add any remarks, special instructions, or notes about this casting process..."
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Material Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "⚖️ Material Tracking",
                  "material",
                  <FiShoppingCart />,
                )}
                {expandedSections.material && (
                  <div className="card-body">
                    {formErrors.material_balance && (
                      <div className="alert alert-danger py-2">
                        <FiAlertCircle className="me-1" />{" "}
                        {formErrors.material_balance}
                      </div>
                    )}

                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          <FiShoppingCart className="me-1" /> Material{" "}
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
                          <option value="">Select Material</option>
                          {availableMaterials.map((material) => (
                            <option
                              key={material._id}
                              value={material._id || material.material_id}
                            >
                              {material.item_code} - {material.name}(
                              {material.unit_name}:{" "}
                              {material.unit_name?.toLowerCase()
                                ? `${material.available_weight}`
                                : `${material.available_quantity || 0}`}
                              )
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
                        <label className="form-label fw-medium">Purity</label>
                        <input
                          name="purity"
                          className="form-control form-control-sm"
                          value={formData.purity}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        />
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
                            <div className="col-md-4">
                              <div className="mb-2">
                                <small className="text-muted">Item Code</small>
                                <div className="fw-medium">
                                  {selectedMaterial.item_code}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-2">
                                <small className="text-muted">
                                  Available Stock
                                </small>
                                <div className="fw-medium">
                                   {selectedMaterial.unit_name?.toLowerCase()
                                ? `${selectedMaterial.available_weight}`
                                : `${selectedMaterial.available_quantity || 0}`}
                                  {selectedMaterial.unit_code}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-2">
                                <small className="text-muted">Purity</small>
                                <div className="fw-medium">
                                  {selectedMaterial.purity || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-2">
                                <small className="text-muted">Unit Cost</small>
                                <div className="fw-medium">
                                  ₹{selectedMaterial.cost || "0.00"}
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
                          Material Issued Quantity{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="material_issued_qty"
                            className={`form-control ${
                              formErrors.material_issued_qty ? "is-invalid" : ""
                            }`}
                            value={formData.material_issued_qty}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="e.g., 8.5"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">
                            {selectedMaterial?.unit_name || "units"}
                          </span>
                        </div>
                        {formErrors.material_issued_qty && (
                          <div className="invalid-feedback d-block">
                            {formErrors.material_issued_qty}
                          </div>
                        )}
                        <div className="form-text x-small">
                          Available: {getAvailableStock().quantity}{" "}
                          {getAvailableStock().unit}
                        </div>
                      </div>

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
                            step="0.01"
                            placeholder="e.g., 8.2"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">
                            {selectedMaterial?.unit_name || "units"}
                          </span>
                        </div>
                        {formErrors.material_used_qty && (
                          <div className="invalid-feedback d-block">
                            {formErrors.material_used_qty}
                          </div>
                        )}
                        <div className="form-text x-small">
                          Actual material used in casting
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Material Returned Quantity
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="material_returned_qty"
                            className="form-control"
                            value={formData.material_returned_qty}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="e.g., 0.3"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">
                            {selectedMaterial?.unit_name || "units"}
                          </span>
                        </div>
                        <div className="form-text x-small">
                          Material returned to stock
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Wastage Quantity
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="material_wastage_qty"
                            className="form-control"
                            value={formData.material_wastage_qty}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="e.g., 0.3"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">
                            {selectedMaterial?.unit_name || "units"}
                          </span>
                        </div>
                        <div className="form-text x-small">
                          Wastage/sprue material
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Wastage Type
                        </label>
                        <select
                          name="material_wastage_type"
                          className="form-select form-select-sm"
                          value={formData.material_wastage_type}
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
                              (w) => w.value === formData.material_wastage_type,
                            )?.description
                          }
                        </div>
                      </div>
                    </div>

                    {/* Material Balance Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3">Material Balance Summary</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Issued:</span>
                            <span className="fw-bold">
                              {formData.material_issued_qty || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Used:</span>
                            <span className="fw-bold">
                              {formData.material_used_qty || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Returned:</span>
                            <span className="fw-bold">
                              {formData.material_returned_qty || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Wastage:</span>
                            <span
                              className={`fw-bold ${
                                parseFloat(formData.material_wastage_qty || 0) >
                                5
                                  ? "text-danger"
                                  : parseFloat(
                                        formData.material_wastage_qty || 0,
                                      ) > 2
                                    ? "text-warning"
                                    : "text-success"
                              }`}
                            >
                              {formData.material_wastage_qty || "0.00"}
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="fw-bold">Balance Check:</span>
                            <span
                              className={`fw-bold ${
                                parseFloat(formData.material_used_qty || 0) +
                                  parseFloat(
                                    formData.material_returned_qty || 0,
                                  ) +
                                  parseFloat(
                                    formData.material_wastage_qty || 0,
                                  ) <=
                                parseFloat(formData.material_issued_qty || 0)
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {(
                                parseFloat(formData.material_used_qty || 0) +
                                parseFloat(
                                  formData.material_returned_qty || 0,
                                ) +
                                parseFloat(formData.material_wastage_qty || 0)
                              ).toFixed(2)}{" "}
                              / {formData.material_issued_qty || "0.00"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="progress" style={{ height: "20px" }}>
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (parseFloat(formData.material_used_qty || 0) /
                                    parseFloat(
                                      formData.material_issued_qty || 1,
                                    )) *
                                    100,
                                )}%`,
                              }}
                              title="Material Used"
                            >
                              Used ({materialUsagePercent}%)
                            </div>
                            <div
                              className="progress-bar bg-warning"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (parseFloat(
                                    formData.material_returned_qty || 0,
                                  ) /
                                    parseFloat(
                                      formData.material_issued_qty || 1,
                                    )) *
                                    100,
                                )}%`,
                              }}
                              title="Material Returned"
                            >
                              Returned
                            </div>
                            <div
                              className="progress-bar bg-danger"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (parseFloat(
                                    formData.material_wastage_qty || 0,
                                  ) /
                                    parseFloat(
                                      formData.material_issued_qty || 1,
                                    )) *
                                    100,
                                )}%`,
                              }}
                              title="Material Wastage"
                            >
                              Wastage
                            </div>
                          </div>
                          <div className="mt-2 small text-muted">
                            Material utilization visualization
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rest of the sections remain the same */}
              {/* Casting Process Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "🏭 Casting Process",
                  "process",
                  <FiTool />,
                )}
                {expandedSections.process && (
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Casting Method
                        </label>
                        <select
                          name="casting_method"
                          className="form-select"
                          value={formData.casting_method}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {castingMethodOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Mold Type
                        </label>
                        <select
                          name="mold_type"
                          className="form-select"
                          value={formData.mold_type}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {moldTypeOptions.map((option) => (
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
                          Tree Size
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="tree_size"
                            className="form-control"
                            value={formData.tree_size}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            placeholder="e.g., 12"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">cm</span>
                        </div>
                        <div className="form-text x-small">
                          Tree/wax assembly size
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Burnout Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="burnout_time"
                            className="form-control"
                            value={formData.burnout_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="e.g., 8.5"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Kiln burnout duration
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Casting Temp
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="casting_temperature"
                            className="form-control"
                            value={formData.casting_temperature}
                            onChange={handleInputChange}
                            min="0"
                            placeholder="e.g., 1100"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">°C</span>
                        </div>
                        <div className="form-text x-small">
                          Metal temperature
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Pressure
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="pressure_applied"
                            className="form-control"
                            value={formData.pressure_applied}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            placeholder="e.g., 2.5"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">bar</span>
                        </div>
                        <div className="form-text x-small">
                          Casting pressure
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Vacuum Level
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="vacuum_level"
                            className="form-control"
                            value={formData.vacuum_level}
                            onChange={handleInputChange}
                            min="0"
                            max="1"
                            step="0.01"
                            placeholder="e.g., 0.95"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">mbar</span>
                        </div>
                        <div className="form-text x-small">
                          Vacuum level during casting
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Labour Hours
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="labour_hours"
                            className="form-control"
                            value={formData.labour_hours}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="e.g., 4"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Estimated labour hours
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Actual Hours
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="actual_hours"
                            className="form-control"
                            value={formData.actual_hours}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="e.g., 4.5"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Actual hours spent
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
                          Surface Quality
                        </label>
                        <select
                          name="surface_quality"
                          className="form-select"
                          value={formData.surface_quality}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {surfaceQualityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Dimensional Accuracy
                        </label>
                        <select
                          name="dimensional_accuracy"
                          className="form-select"
                          value={formData.dimensional_accuracy}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {dimensionalAccuracyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-medium">
                          Porosity Level
                        </label>
                        <select
                          name="porosity_level"
                          className="form-select"
                          value={formData.porosity_level}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {porosityLevelOptions.map((option) => (
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
                          placeholder="Describe any defects found (cracks, porosity, shrinkage, incomplete fill, etc.)"
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
                            <span>Surface Quality:</span>
                            <span
                              className={`fw-bold ${
                                formData.surface_quality === "excellent"
                                  ? "text-success"
                                  : formData.surface_quality === "good"
                                    ? "text-info"
                                    : formData.surface_quality === "average"
                                      ? "text-warning"
                                      : "text-danger"
                              }`}
                            >
                              {
                                surfaceQualityOptions.find(
                                  (q) => q.value === formData.surface_quality,
                                )?.label
                              }
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Dimensional Accuracy:</span>
                            <span
                              className={`fw-bold ${
                                formData.dimensional_accuracy ===
                                "within_tolerance"
                                  ? "text-success"
                                  : formData.dimensional_accuracy ===
                                      "slight_deviation"
                                    ? "text-warning"
                                    : "text-danger"
                              }`}
                            >
                              {
                                dimensionalAccuracyOptions.find(
                                  (d) =>
                                    d.value === formData.dimensional_accuracy,
                                )?.label
                              }
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Porosity Level:</span>
                            <span
                              className={`fw-bold ${
                                formData.porosity_level === "none"
                                  ? "text-success"
                                  : formData.porosity_level === "low"
                                    ? "text-info"
                                    : formData.porosity_level === "medium"
                                      ? "text-warning"
                                      : "text-danger"
                              }`}
                            >
                              {
                                porosityLevelOptions.find(
                                  (p) => p.value === formData.porosity_level,
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
                                    : formData.surface_quality ===
                                          "excellent" &&
                                        formData.dimensional_accuracy ===
                                          "within_tolerance" &&
                                        formData.porosity_level === "none"
                                      ? "text-success"
                                      : "text-warning"
                                }`}
                              >
                                {formData.rework_required
                                  ? "⚠️"
                                  : formData.surface_quality === "excellent" &&
                                      formData.dimensional_accuracy ===
                                        "within_tolerance" &&
                                      formData.porosity_level === "none"
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
                        <div className="form-text x-small">Metal cost</div>
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
                        <div className="form-text x-small">Karigar wages</div>
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
                        <div className="form-text x-small">Machine usage</div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Consumables
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
                          Investment, wax, etc.
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Gas Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="gas_cost"
                            className="form-control"
                            value={formData.gas_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Oxygen/Propane gas
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
                                  width: `${((parseFloat(formData.consumables_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                                }}
                                title="Consumables  Costs"
                              >
                                Consumables 
                              </div>
                              <div
                              className="progress-bar bg-black"
                               style={{
                                width: `${((parseFloat(formData.gas_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Gas Costs"
                            >
                              Gas
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
                          Material & setup prep
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Mold Making
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="mold_making_time"
                            className="form-control"
                            value={formData.mold_making_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Mold preparation
                        </div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Burnout Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="burnout_time_track"
                            className="form-control"
                            value={formData.burnout_time_track}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">Kiln burnout</div>
                      </div>

                      <div className="col-md-3 mb-2">
                        <label className="form-label fw-medium small">
                          Casting Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="casting_time"
                            className="form-control"
                            value={formData.casting_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">Actual casting</div>
                      </div>

                      <div className="col-md-3 mb-2">
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
                        <div className="form-text x-small">
                          Cutting & cleaning
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
                              className="progress-bar bg-success"
                              style={{
                                width: `${
                                  (parseFloat(formData.mold_making_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Mold Making"
                            >
                              Mold
                            </div>

                            <div
                              className="progress-bar bg-warning"
                              style={{
                                width: `${
                                  (parseFloat(
                                    formData.burnout_time_track || 0,
                                  ) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Burnout"
                            >
                              Burnout
                            </div>
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${
                                  (parseFloat(formData.casting_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Casting"
                            >
                              Casting
                            </div>
                            <div
                              className="progress-bar bg-black"
                              style={{
                                width: `${
                                  (parseFloat(formData.finishing_time || 0) /
                                    parseFloat(
                                      formData.total_time_spent || 1,
                                    )) *
                                  100
                                }%`,
                              }}
                              title="Finishing "
                            >
                              Finishing 
                            </div>
                            <div
                              className="progress-bar bg-secondary "
                              style={{
                                width: `${
                                  (parseFloat(formData.quality_check_time || 0) /
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

              {/* File Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "📎 File Tracking",
                  "files",
                  <FiFile />,
                  castingFiles.length,
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
                              Source Files (CAD/Design)
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  castingFiles.filter(
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
                                input.accept =
                                  ".stl,.step,.3dm,.igs,.dwg,.dxf,.pdf,.jpg,.png";
                                input.onchange = (e) =>
                                  handleFileChange(e, "source");
                                input.click();
                              }}
                            >
                              <FiUpload size={16} className="text-info mb-1" />
                              <p className="mb-0 small">Upload Design Files</p>
                              <p className="x-small text-muted">
                                STL, STEP, 3DM, PDF, Images
                              </p>
                            </div>

                            {castingFiles.filter((f) => f.category === "source")
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
                                      {castingFiles
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
                              Casting Output Files
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  castingFiles.filter(
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
                              <p className="mb-0 small">Upload Casting Files</p>
                              <p className="x-small text-muted">
                                Photos, Videos, Reports, Documents
                              </p>
                            </div>

                            {castingFiles.filter((f) => f.category === "output")
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
                                      {castingFiles
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
                  <span className="me-3">⚖️ Material tracking</span>
                  <span className="me-3">🔍 Quality metrics</span>
                  <span>📊 Process parameters</span>
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
                        Update Casting Stage
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

export default UpdateCastingStage;
