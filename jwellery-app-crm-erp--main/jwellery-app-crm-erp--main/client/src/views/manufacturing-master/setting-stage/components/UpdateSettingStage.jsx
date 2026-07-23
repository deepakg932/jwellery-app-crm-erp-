import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
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
  FiAperture,
  FiHexagon,
  FiTarget,
  FiGrid as FiGridIcon,
  FiStar,
  FiUsers,
} from "react-icons/fi";

const UpdateSettingStage = ({
  selectedStage,
  employees = [],
  materials = [],
  stones = [],
  units = [],
  laborCosts = [], // Add labor costs
  onUpdate,
  onClose,
  loading = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [settingFiles, setSettingFiles] = useState([]);
  const [availableStones, setAvailableStones] = useState([]);
  const [selectedStone, setSelectedStone] = useState(null);
  const [selectedLaborCosts, setSelectedLaborCosts] = useState([]); // Add selected labor costs
  const [laborBreakdown, setLaborBreakdown] = useState([]); // Add labor breakdown

  console.log("Selected stage:", selectedStone);
  console.log("Labor costs received:", laborCosts);

  const [formData, setFormData] = useState({
    assigned_to: "",
    status: "",
    start_date: "",
    end_date: "",
    stone_id: "",
    stone_type: "",
    stone_name: "",
    stone_item_code: "",
    stone_quantity: "",
    stone_weight: "",
    stone_cost: "",
    stone_breakage: 0,
    stone_breakage_reason: "",
    setting_type: "prong",
    setting_method: "manual",
    tool_used: "",
    precision_level: "high",
    stone_secure: true,
    prong_count: 4,
    bezel_thickness: "",
    labour_hours: "",
    actual_hours: "",
    next_stage: "",
    stage: "",
    remarks: "",
    material_cost: "",
    labour_cost: "",
    tool_cost: "",
    stone_cost_total: "",
    other_costs: "",
    total_cost: "",
    cost_currency: "INR",
    cost_status: "estimated",
    markup_percentage: "25",
    final_price: "",
    setting_time: "",
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
    stones: false,
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
    {
      value: "stone_selection",
      label: "Stone Selection",
      color: "info",
      icon: "💎",
    },
    // {
    //   value: "seat_preparation",
    //   label: "Seat Preparation",
    //   color: "info",
    //   icon: "⚒️",
    // },
    // {
    //   value: "stone_setting",
    //   label: "Stone Setting",
    //   color: "warning",
    //   icon: "🔧",
    // },
    // {
    //   value: "prong_shaping",
    //   label: "Prong Shaping",
    //   color: "warning",
    //   icon: "✂️",
    // },
    // {
    //   value: "bezel_setting",
    //   label: "Bezel Setting",
    //   color: "warning",
    //   icon: "🔲",
    // },
    // {
    //   value: "pave_setting",
    //   label: "Pave Setting",
    //   color: "warning",
    //   icon: "✨",
    // },
    // {
    //   value: "channel_setting",
    //   label: "Channel Setting",
    //   color: "warning",
    //   icon: "🛤️",
    // },
    // { value: "polishing", label: "Polishing", color: "info", icon: "🔆" },
    // {
    //   value: "quality_check",
    //   label: "Quality Check",
    //   color: "warning",
    //   icon: "🔍",
    // },
    // { value: "completed", label: "Completed", color: "success", icon: "✅" },
    // { value: "hold", label: "On Hold", color: "danger", icon: "⏸️" },
    // { value: "rework", label: "Rework", color: "danger", icon: "🔄" },

    { value: "draft", label: "Draft", color: "secondary", icon: "✏️" },
    { value: "cancelled", label: "Cancelled", color: "danger", icon: "❌" },

    { value: "approved", label: "Approved", color: "success", icon: "✅" },
  ];

  const settingTypeOptions = [
    {
      value: "prong",
      label: "Prong Setting",
      icon: "🛡️",
      description: "Classic prong setting",
    },
    {
      value: "bezel",
      label: "Bezel Setting",
      icon: "🔲",
      description: "Metal surrounds stone",
    },
    {
      value: "pave",
      label: "Pave Setting",
      icon: "✨",
      description: "Multiple small stones",
    },
    {
      value: "channel",
      label: "Channel Setting",
      icon: "🛤️",
      description: "Stones in channel",
    },
    {
      value: "flush",
      label: "Flush Setting",
      icon: "⬜",
      description: "Stone flush with metal",
    },
    {
      value: "tension",
      label: "Tension Setting",
      icon: "⚡",
      description: "Tension holds stone",
    },
    {
      value: "invisible",
      label: "Invisible Setting",
      icon: "👻",
      description: "No visible metal",
    },
  ];

  const settingMethodOptions = [
    { value: "manual", label: "Manual Setting", icon: "👨‍🔧" },
    { value: "semi_auto", label: "Semi-Automatic", icon: "⚙️" },
    { value: "laser", label: "Laser Setting", icon: "🔦" },
    { value: "pressure", label: "Pressure Setting", icon: "💪" },
  ];

  const precisionLevelOptions = [
    {
      value: "ultra_high",
      label: "Ultra High",
      color: "success",
      description: "0.01mm tolerance",
    },
    {
      value: "high",
      label: "High",
      color: "info",
      description: "0.05mm tolerance",
    },
    {
      value: "medium",
      label: "Medium",
      color: "warning",
      description: "0.1mm tolerance",
    },
    {
      value: "standard",
      label: "Standard",
      color: "secondary",
      description: "0.2mm tolerance",
    },
  ];

  const stoneTypeOptions = [
    { value: "diamond", label: "Diamond", color: "light", icon: "💎" },
    { value: "ruby", label: "Ruby", color: "danger", icon: "🔴" },
    { value: "sapphire", label: "Sapphire", color: "primary", icon: "🔵" },
    { value: "emerald", label: "Emerald", color: "success", icon: "🟢" },
    { value: "pearl", label: "Pearl", color: "light", icon: "⚪" },
    { value: "gemstone", label: "Gemstone", color: "warning", icon: "💎" },
    { value: "moissanite", label: "Moissanite", color: "info", icon: "✨" },
    {
      value: "cubic_zirconia",
      label: "Cubic Zirconia",
      color: "secondary",
      icon: "💠",
    },
  ];

  const toolOptions = [
    { value: "setting_bur", label: "Setting Bur", icon: "🔧" },
    { value: "graver", label: "Graver", icon: "⚒️" },
    { value: "bezel_roller", label: "Bezel Roller", icon: "🔄" },
    { value: "prong_lifter", label: "Prong Lifter", icon: "📐" },
    { value: "stone_claw", label: "Stone Claw", icon: "🦀" },
    { value: "microscope", label: "Microscope", icon: "🔬" },
    { value: "laser_welder", label: "Laser Welder", icon: "🔦" },
    { value: "ultrasonic", label: "Ultrasonic Cleaner", icon: "🌊" },
  ];

  const qualityOptions = [
    { value: "excellent", label: "Excellent", color: "success" },
    { value: "good", label: "Good", color: "info" },
    { value: "average", label: "Average", color: "warning" },
    { value: "poor", label: "Poor", color: "danger" },
  ];

  const nextStageOptions = [
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

  // Prepare options for React Select - SETTING LABOR COSTS (INCLUDING SETTERS)
  const getLaborCostOptions = () => {
    if (!laborCosts || laborCosts.length === 0) return [];

    // Broaden detection: check cost_type, nested names, stage names and explicit flags
    const potential = laborCosts.filter((cost) => {
      const candidates = [
        cost.cost_name,
        cost.cost_type,
        cost.cost_type_id?.cost_type,
        cost.cost_type_id?.cost_name_id?.cost_name,
        cost.stage_name,
        cost.making_stage_id?.stage_name,
        cost.sub_stage_name,
        cost.making_sub_stage_id?.sub_stage_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const looksLikeLabor =
        candidates.includes("labor") ||
        candidates.includes("labour") ||
        candidates.includes("setter") ||
        candidates.includes("karigar") ||
        candidates.includes("craftsman") ||
        candidates.includes("worker") ||
        candidates.includes("setting") ||
        candidates.includes("सेटर") ||
        candidates.includes("कारीगर");

      const explicitFlag =
        cost.is_labor === true ||
        cost.isLabor === true ||
        cost.cost_category === "labor";

      return looksLikeLabor || explicitFlag;
    });

    const filteredCosts = potential.length > 0 ? potential : laborCosts;

    return filteredCosts.map((cost) => ({
      value: cost._id,
      label: `${cost.cost_name || cost.cost_type_id?.cost_name_id?.cost_name || cost.cost_type || "Labor"} (${cost.cost_type || cost.cost_type_id?.cost_type || "Direct Cost"}) - ₹${cost.cost_amount || 0}/${cost.unit || cost.unit_id?.name || "unit"}`,
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
        product_code: cost.item_code || cost.product_code || "-",
        name: cost.cost_name || cost.cost_name_id?.cost_name || "Labor",
        type: cost.cost_type || cost.cost_type_id?.cost_type || "Direct Cost",
        cost_amount: costAmount,
        unit: cost.unit || cost.unit_id?.name || "unit",
        total_cost: costAmount.toFixed(2),
        stage: cost.stage_name || cost.making_stage_id?.stage_name || "-",
        sub_stage:
          cost.sub_stage_name ||
          cost.making_sub_stage_id?.sub_stage_name ||
          "-",
      };
    });

    setLaborBreakdown(breakdown);

    // Calculate total labor cost
    const totalLaborCost = breakdown.reduce(
      (sum, item) => sum + parseFloat(item.total_cost),
      0,
    );

    // Update form data with calculated labor cost
    setFormData((prev) => ({
      ...prev,
      labour_cost: totalLaborCost.toFixed(2),
    }));

    // Recalculate total cost
    calculateTotalCost();
  };

  // Update available stones from both stones array and materials that are stones
  useEffect(() => {
    if (stones && stones.length > 0) {
      setAvailableStones(stones);
    } else if (materials && materials.length > 0) {
      // Filter stones from materials based on name or item_code
      const stoneMaterials = materials.filter(
        (material) =>
          material.name?.toLowerCase().includes("diamond") ||
          material.name?.toLowerCase().includes("gem") ||
          material.name?.toLowerCase().includes("stone") ||
          material.item_code?.toLowerCase().includes("dia") ||
          material.item_code?.toLowerCase().includes("gem") ||
          material.item_code?.toLowerCase().includes("stone"),
      );
      setAvailableStones(stoneMaterials);
    }
  }, [stones, materials]);

  // Initialize form data
  useEffect(() => {
    if (selectedStage && laborCosts.length > 0) {
      console.log("Initializing form with selected stage:", selectedStage);
      console.log("Available stones:", availableStones);

      // Parse selected labor costs if they exist in the stage data
      let parsedSelectedLaborCosts = [];
      if (selectedStage.selected_labor_costs) {
        if (Array.isArray(selectedStage.selected_labor_costs)) {
          // Map the IDs to actual labor cost objects
          parsedSelectedLaborCosts = laborCosts.filter((cost) =>
            selectedStage.selected_labor_costs.includes(cost._id),
          );
        } else if (typeof selectedStage.selected_labor_costs === "string") {
          try {
            const ids = JSON.parse(selectedStage.selected_labor_costs);
            parsedSelectedLaborCosts = laborCosts.filter((cost) =>
              ids.includes(cost._id),
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
            parsedLaborBreakdown = JSON.parse(
              selectedStage.labor_cost_breakdown,
            );
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
        stone_id: selectedStage.stone_id || "",
        stone_type: selectedStage.stone_type || "",
        stone_name: selectedStage.stone_name || selectedStage.stone_type || "",
        stone_item_code: selectedStage.stone_item_code || "",
        stone_quantity: selectedStage.stone_quantity || "",
        stone_weight: selectedStage.stone_weight || "",
        stone_cost: selectedStage.stone_cost || "",
        stone_breakage: selectedStage.stone_breakage || 0,
        stone_breakage_reason: selectedStage.stone_breakage_reason || "",
        setting_type: selectedStage.setting_type || "prong",
        setting_method: selectedStage.setting_method || "manual",
        tool_used: selectedStage.tool_used || "",
        precision_level: selectedStage.precision_level || "high",
        stone_secure:
          selectedStage.stone_secure !== undefined
            ? selectedStage.stone_secure
            : true,
        prong_count: selectedStage.prong_count || 4,
        bezel_thickness: selectedStage.bezel_thickness || "",
        labour_hours: selectedStage.labour_hours || "",
        actual_hours: selectedStage.actual_hours || "",
        next_stage: selectedStage.next_stage || "",
        stage: selectedStage.next_stage || selectedStage.stage || "",
        remarks: selectedStage.remarks || "",
        material_cost: selectedStage.material_cost || "",
        labour_cost: selectedStage.labour_cost || "",
        tool_cost: selectedStage.tool_cost || "",
        stone_cost_total: selectedStage.stone_cost_total || "",
        other_costs: selectedStage.other_costs || "",
        total_cost: selectedStage.total_cost || "",
        cost_currency: selectedStage.cost_currency || "INR",
        cost_status: selectedStage.cost_status || "estimated",
        markup_percentage: selectedStage.markup_percentage || "25",
        final_price: selectedStage.final_price || "",
        setting_time: selectedStage.setting_time || "",
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

      console.log("Initializing form data:", initialData);

      setFormData(initialData);
      setSelectedLaborCosts(parsedSelectedLaborCosts);
      setLaborBreakdown(parsedLaborBreakdown);

      // Calculate labor cost from selected items
      if (parsedSelectedLaborCosts.length > 0) {
        calculateLaborCostFromSelection(parsedSelectedLaborCosts);
      }

      // Find and set selected stone
      if (initialData.stone_item_code && availableStones.length > 0) {
        const stone = availableStones.find(
          (s) =>
            s.item_code === initialData.stone_item_code ||
            s._id === initialData.stone_id ||
            s.name.toLowerCase().includes(initialData.stone_name.toLowerCase()),
        );
        if (stone) {
          setSelectedStone(stone);
          console.log("Selected stone found:", stone);
        }
      }

      // Initialize files
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
        setSettingFiles(existingFiles);
      } else {
        setSettingFiles([]);
      }

      setFormErrors({});
      calculateTotalCost();
      calculateTotalTime();
    }
  }, [selectedStage, availableStones, laborCosts]);

  // Auto-recalculate total time when time fields change
  useEffect(() => {
    calculateTotalTime();
  }, [formData.setting_time, formData.quality_check_time]);

  // Auto-recalculate total cost when individual costs change
  useEffect(() => {
    calculateTotalCost();
  }, [
    formData.stone_cost_total,
    formData.material_cost,
    formData.labour_cost,
    formData.tool_cost,
    formData.other_costs,
    formData.markup_percentage,
  ]);

  // Auto-calculate labor cost whenever selected labor costs change
  useEffect(() => {
    calculateLaborCostFromSelection(selectedLaborCosts);
  }, [selectedLaborCosts]);

const handleStoneChange = (stoneId) => {
  const stone = availableStones.find((s) => s._id === stoneId);
  if (stone) {
    setSelectedStone(stone);
    console.log("Stone selected:", stone);

    // Determine stone type based on name
    let stoneType = "gemstone";
    const stoneName = stone.name?.toLowerCase() || "";
    if (stoneName.includes("diamond")) stoneType = "diamond";
    else if (stoneName.includes("ruby")) stoneType = "ruby";
    else if (stoneName.includes("sapphire")) stoneType = "sapphire";
    else if (stoneName.includes("emerald")) stoneType = "emerald";
    else if (stoneName.includes("pearl")) stoneType = "pearl";
    else if (stoneName.includes("moissanite")) stoneType = "moissanite";
    else if (stoneName.includes("zirconia")) stoneType = "cubic_zirconia";

    // Determine if this is a weight-based stone
    const unit = stone.unit_name || stone.unit || "";
    const isWeight = unit.toLowerCase().includes("kg") || 
                     unit.toLowerCase().includes("gram") || 
                     unit.toLowerCase().includes("carat");

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        stone_id: stone._id,
        stone_type: stoneType,
        stone_name: stone.name,
        stone_item_code: stone.item_code || "",
        stone_cost: stone.cost ? stone.cost.toString() : "0",
        // Clear both fields when changing stone
        stone_quantity: "",
        stone_weight: "",
      };

      return updatedData;
    });
  }
};

  // Calculate total cost
  const calculateTotalCost = () => {
    // Calculate stone cost: stone_cost × quantity
    const stoneUnitCost = Number(formData.stone_cost) || 0;
    const stoneQuantity =
      Number(formData.stone_quantity) || Number(formData.stone_weight) || 0;
    const stoneCost = stoneUnitCost * stoneQuantity;

    const material = Number(formData.material_cost) || 0;
    const labour = Number(formData.labour_cost) || 0;
    const tool = Number(formData.tool_cost) || 0;
    const other = Number(formData.other_costs) || 0;
    const markup = Number(formData.markup_percentage) || 25;

    console.log("SETTING COST CALCULATION:", {
      stoneCost,
      material,
      labour,
      tool,
      other,
      markup,
    });

    const total = stoneCost + material + labour + tool + other;
    const markupAmount = (total * markup) / 100;
    const finalPrice = total + markupAmount;

    setFormData((prev) => ({
      ...prev,
      total_cost: total.toFixed(2),
      final_price: finalPrice.toFixed(2),
      stone_cost_total: stoneCost.toFixed(2),
    }));
  };

  // Calculate total time
  const calculateTotalTime = () => {
    const setting = parseFloat(formData.setting_time) || 0;
    const quality = parseFloat(formData.quality_check_time) || 0;

    const total = setting + quality;

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
        name === "stone_quantity" ||
        name === "stone_weight" ||
        name === "stone_breakage" ||
        name === "labour_hours" ||
        name === "actual_hours" ||
        name === "prong_count" ||
        name === "bezel_thickness"
      ) {
        updatedData[name] = value === "" ? "" : value;

        // If stone_quantity is being updated, clear stone_weight and vice versa
        // This ensures only one field has a value
        if (name === "stone_quantity") {
          updatedData.stone_weight = "";
        } else if (name === "stone_weight") {
          updatedData.stone_quantity = "";
        }
      } else {
        updatedData[name] = val;
      }

      // Calculate totals if cost or markup changed
      if (
        name.includes("_cost") ||
        name === "markup_percentage" ||
        name === "stone_quantity" ||
        name === "stone_weight" ||
        name === "stone_cost"
      ) {
        // Calculate stone cost based on whichever field has value
        const stoneUnitCost = Number(updatedData.stone_cost) || 0;
        const stoneQty = Number(updatedData.stone_quantity) || 0;
        const stoneWt = Number(updatedData.stone_weight) || 0;
        const stoneQuantity = stoneQty || stoneWt; // Use whichever has value
        const stoneCost = stoneUnitCost * stoneQuantity;

        const material = Number(updatedData.material_cost) || 0;
        const labour = Number(updatedData.labour_cost) || 0;
        const tool = Number(updatedData.tool_cost) || 0;
        const other = Number(updatedData.other_costs) || 0;
        const markup = Number(updatedData.markup_percentage) || 25;

        const total = stoneCost + material + labour + tool + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        updatedData.total_cost = total.toFixed(2);
        updatedData.final_price = finalPrice.toFixed(2);
        updatedData.stone_cost_total = stoneCost.toFixed(2);
      }

      // Calculate totals if time field changed
      if (
        name.includes("_time") ||
        name === "labour_hours" ||
        name === "actual_hours"
      ) {
        const setting = parseFloat(updatedData.setting_time) || 0;
        const quality = parseFloat(updatedData.quality_check_time) || 0;

        const total = setting + quality;

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
      errors.assigned_to = "Assigned Setter is required";
    }

    if (!formData.status) {
      errors.status = "Status is required";
    }

    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }

    if (!formData.stone_id) {
      errors.stone_id = "Stone is required";
    }

    // Check if stone quantity/weight has a value
    const stoneValue =
      parseFloat(formData.stone_quantity) ||
      parseFloat(formData.stone_weight) ||
      0;

    if (stoneValue <= 0) {
      errors.stone_quantity =
        "Stone quantity or weight is required and must be greater than 0";
    }

    // Labor costs validation
    if (selectedLaborCosts.length === 0) {
      errors.labor_costs = "At least one labor cost type must be selected";
    }

    // Stock validation
    if (selectedStone && stoneValue > 0) {
      const stock = getAvailableStock();
      const requiredValue = stoneValue;
      const availableValue = stock.available;

      if (requiredValue > availableValue) {
        errors.stone_quantity = `Required ${stock.isWeight ? "weight" : "quantity"} (${requiredValue} ${stock.unit}) exceeds available stock (${availableValue} ${stock.unit})`;
      }
    }

    // Validate stone breakage doesn't exceed quantity
    const breakage = Number(formData.stone_breakage) || 0;
    if (breakage > stoneValue) {
      errors.stone_breakage = `Stone breakage (${breakage}) cannot exceed stone quantity (${stoneValue})`;
    }

    // Date validation
    if (
      formData.end_date &&
      formData.start_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      errors.end_date = "End date cannot be before start date";
    }

    console.log("Validation errors:", errors);
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

    const settingExtensions = [
      "jpg",
      "jpeg",
      "png",
      "pdf",
      "mp4",
      "avi",
      "mov",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "stl",
      "step",
    ];

    const invalidFiles = fileList.filter(
      (file) =>
        !allowedTypes.includes(file.type) &&
        !settingExtensions.some((ext) =>
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

      setSettingFiles((prev) => [...prev, ...newFiles]);

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
    const fileToRemove = settingFiles.find((f) => f.id === fileId);
    if (fileToRemove && fileToRemove.url && !fileToRemove.isExisting) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    setSettingFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Categorize files
  const getFilesByCategory = (category) => {
    return settingFiles.filter((file) => file.category === category);
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

    const settingExtensions = ["stl", "step"];
    if (settingExtensions.includes(extension))
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

    console.log("Form submission started");
    console.log("Current formData:", formData);
    console.log("Selected labor costs:", selectedLaborCosts);

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    try {
      const filesToUpload = settingFiles
        .filter((file) => !file.isExisting && file.file)
        .map((file) => file.file);

      // Determine which value to use for stone quantity/weight
      const stoneQty = parseFloat(formData.stone_quantity) || 0;
      const stoneWt = parseFloat(formData.stone_weight) || 0;

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
        stone_id: formData.stone_id,
        stone_type: formData.stone_type,
        stone_name: formData.stone_name,
        stone_item_code: formData.stone_item_code,
        // Only send the one that has value
        stone_quantity: stoneQty > 0 ? stoneQty.toString() : "0",
        stone_weight: stoneWt > 0 ? stoneWt.toString() : "0",
        stone_cost: formData.stone_cost || "0",
        stone_breakage: formData.stone_breakage || "0",
        stone_breakage_reason: formData.stone_breakage_reason || "",
        setting_type: formData.setting_type || "prong",
        setting_method: formData.setting_method || "manual",
        tool_used: formData.tool_used || "",
        precision_level: formData.precision_level || "high",
        stone_secure:
          formData.stone_secure !== undefined ? formData.stone_secure : true,
        prong_count: formData.prong_count || "4",
        bezel_thickness: formData.bezel_thickness || "",
        material_cost: formData.material_cost || "0",
        labour_cost: formData.labour_cost || "0",
        tool_cost: formData.tool_cost || "0",
        stone_cost_total: formData.stone_cost_total || "0",
        other_costs: formData.other_costs || "0",
        total_cost: formData.total_cost || "0",
        cost_currency: formData.cost_currency || "INR",
        cost_status: formData.cost_status || "estimated",
        markup_percentage: formData.markup_percentage || "25",
        final_price: formData.final_price || "0",
        setting_time: formData.setting_time || "0",
        quality_check_time: formData.quality_check_time || "0",
        total_time_spent: formData.total_time_spent || "0",
        time_breakdown: formData.time_breakdown || "",
        file_version: formData.file_version || "1.0",
        file_revisions: formData.file_revisions || 0,
        file_status: formData.file_status || "draft",
        backup_location: formData.backup_location || "",
        files: settingFiles,

        // Labor cost tracking - ensure these are proper objects/arrays
        selected_labor_costs: selectedLaborCosts.map(
          (cost) => cost._id || cost,
        ),
        labor_cost_breakdown: laborBreakdown,
      };

      console.log("🚀 Submitting Setting stage update:", {
        settingStageId: selectedStage._id,
        data: updateData,
        selectedLaborCostsCount: selectedLaborCosts.length,
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
            result?.error ||
            result?.message ||
            (typeof result === "string"
              ? result
              : "Failed to update Setting stage");
          setUploadError(errorMsg);
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setUploadError(error.message || "Failed to update.");
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

  // Update the stone breakage calculation
  const stoneBreakagePercent =
    formData.stone_quantity || formData.stone_weight
      ? (
          (Number(formData.stone_breakage || 0) /
            (Number(formData.stone_quantity || 0) +
              Number(formData.stone_weight || 0) || 1)) *
          100
        ).toFixed(1)
      : "0";

  const stoneUsagePercent = selectedStone
    ? (
        (parseFloat(formData.stone_quantity || formData.stone_weight || 0) /
          parseFloat(
            selectedStone.available_quantity ||
              selectedStone.available_weight ||
              1,
          )) *
        100
      ).toFixed(1)
    : "0";

  const getAvailableStock = () => {
    if (!selectedStone) return { quantity: 0, weight: 0, unit: "pcs" };

    // Check both quantity and weight fields
    const availableQty = parseFloat(selectedStone.available_quantity) || 0;
    const availableWeight =
      parseFloat(selectedStone.available_weight) ||
      parseFloat(selectedStone.weight) ||
      parseFloat(selectedStone.stock) ||
      0;

    // Determine unit type
    const unit = selectedStone.unit_name || selectedStone.unit || "pcs";
    const isWeightUnit =
      unit.toLowerCase().includes("kg") ||
      unit.toLowerCase().includes("gram") ||
      unit.toLowerCase().includes("carat");

    return {
      quantity: availableQty,
      weight: availableWeight,
      unit: unit,
      isWeight: isWeightUnit,
      available: isWeightUnit ? availableWeight : availableQty,
    };
  };

  // Get stone type badge
  const getStoneTypeBadge = (stoneType) => {
    const stoneConfig = {
      diamond: { color: "light", icon: "💎", textColor: "dark" },
      ruby: { color: "danger", icon: "🔴" },
      sapphire: { color: "primary", icon: "🔵" },
      emerald: { color: "success", icon: "🟢" },
      pearl: { color: "light", icon: "⚪", textColor: "dark" },
      gemstone: { color: "warning", icon: "💎" },
      moissanite: { color: "info", icon: "✨" },
      cubic_zirconia: { color: "secondary", icon: "💠" },
    };

    const config = stoneConfig[stoneType] || {
      color: "secondary",
      icon: "💎",
      textColor: "white",
    };

    return (
      <span
        className={`badge bg-${config.color} text-${config.textColor || "white"} fw-semibold`}
      >
        {config.icon} {stoneType ? stoneType.toUpperCase() : "N/A"}
      </span>
    );
  };

  // Calculate total labor from breakdown
  const totalCalculatedLabor = laborBreakdown.reduce(
    (sum, item) => sum + parseFloat(item.total_cost || 0),
    0,
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
                <FiAperture className="me-2" />
                Update Setting Stage: {selectedStage.job_card_no}
              </h5>
              {selectedStage && (
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="badge bg-primary">
                    <FiTool className="me-1" /> Setting Stage
                  </span>
                  {formData.stone_type && (
                    <span className="badge bg-warning">
                      <FiAperture className="me-1" />{" "}
                      {formData.stone_type.toUpperCase()}
                    </span>
                  )}
                  {formData.setting_type && (
                    <span className="badge bg-success">
                      <FiTarget className="me-1" />{" "}
                      {formData.setting_type.toUpperCase()} SETTING
                    </span>
                  )}
                  <span className="badge bg-info">
                    <FiUsers className="me-1" /> Labor Types:{" "}
                    {selectedLaborCosts.length}
                  </span>
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
                          <h6 className="text-muted mb-1">Stone Tracking</h6>
                          <div className="d-flex align-items-center">
                            <span
                              className={`badge ${parseFloat(stoneBreakagePercent) > 5 ? "bg-danger" : "bg-success"} me-2`}
                            >
                              {formData.stone_breakage || "0"} pcs
                            </span>
                            <h4 className="mb-0">{stoneBreakagePercent}%</h4>
                          </div>
                        </div>
                        <FiAperture className="text-primary" size={24} />
                      </div>
                      <div className="small text-muted mt-1">
                        Used:{" "}
                        {formData.stone_quantity ||
                          formData.stone_weight ||
                          "0"}{" "}
                        of{" "}
                        {selectedStone?.available_quantity ||
                          selectedStone?.available_weight ||
                          "0"}
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
                        Setting: {formData.setting_time || "0"} hrs
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
                          <FiUser className="me-1" /> Assigned Setter{" "}
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
                          <option value="">Select Setter</option>
                          {employees
                            .filter(
                              (emp) =>
                                emp.role_id?.role_name
                                  ?.toLowerCase()
                                  .includes("setting") ||
                                emp.role_id?.role_name
                                  ?.toLowerCase()
                                  .includes("setter") ||
                                emp.role_id?.role_name
                                  ?.toLowerCase()
                                  .includes("designer"),
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
                          placeholder="e.g., 3"
                          disabled={isDisabled}
                        />
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
                          placeholder="e.g., 3.5"
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
                        placeholder="Add any remarks, special instructions, or notes about this setting process..."
                        disabled={isDisabled}
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Stone Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "💎 Stone Tracking",
                  "stones",
                  <FiAperture />,
                )}
                {expandedSections.stones && (
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          <FiAperture className="me-1" /> Stone{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <select
                          name="stone_id"
                          className={`form-select ${
                            formErrors.stone_id ? "is-invalid" : ""
                          }`}
                          value={formData.stone_id}
                          onChange={(e) => handleStoneChange(e.target.value)}
                          disabled={isDisabled}
                        >
                          <option value="">Select Stone</option>
                          {availableStones.map((stone) => (
                            <option key={stone._id} value={stone._id}>
                              {stone.name} ({stone.item_code}) -{" "}
                              {stone.available_quantity ||
                                stone.available_weight}{" "}
                              {stone.unit_name} available
                              {stone.cost ? ` - ₹${stone.cost}/unit` : ""}
                            </option>
                          ))}
                        </select>
                        {formErrors.stone_id && (
                          <div className="invalid-feedback d-block">
                            {formErrors.stone_id}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          <FiGridIcon className="me-1" /> Setting Type
                        </label>
                        <select
                          name="setting_type"
                          className="form-select"
                          value={formData.setting_type}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {settingTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="form-text">
                          {
                            settingTypeOptions.find(
                              (s) => s.value === formData.setting_type,
                            )?.description
                          }
                        </div>
                      </div>
                    </div>

                    {/* Stone Information Card */}
                    {selectedStone && (
                      <div className="card border-info mb-4">
                        <div className="card-header bg-info text-white py-2">
                          <h6 className="mb-0">Stone Information</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3">
                              <div className="mb-2">
                                <small className="text-muted">Item Code</small>
                                <div className="fw-medium">
                                  {selectedStone.item_code || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="mb-2">
                                <small className="text-muted">
                                  Available Stock
                                </small>
                                <div className="fw-medium">
                                  {getAvailableStock().available}{" "}
                                  {getAvailableStock().unit}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="mb-2">
                                <small className="text-muted">Stone Type</small>
                                <div className="fw-medium">
                                  {getStoneTypeBadge(
                                    selectedStone.type || "gemstone",
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="mb-2">
                                <small className="text-muted">Unit Cost</small>
                                <div className="fw-medium">
                                  ₹
                                  {parseFloat(selectedStone.cost || 0).toFixed(
                                    2,
                                  )}{" "}
                                  / {getAvailableStock().unit}
                                </div>
                              </div>
                            </div>
                            {selectedStone.purity && (
                              <div className="col-md-3">
                                <div className="mb-2">
                                  <small className="text-muted">Purity</small>
                                  <div className="fw-medium">
                                    {selectedStone.purity}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="row g-2">
                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Stone Quantity/Weight{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="stone_quantity"
                            className={`form-control ${
                              formErrors.stone_quantity ? "is-invalid" : ""
                            }`}
                            value={
                              formData.stone_quantity ||
                              formData.stone_weight ||
                              ""
                            }
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder={
                              getAvailableStock().isWeight
                                ? "e.g., 10.5"
                                : "e.g., 5"
                            }
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">
                            {getAvailableStock().unit}
                          </span>
                        </div>
                        {formErrors.stone_quantity && (
                          <div className="invalid-feedback d-block">
                            <FiAlertCircle size={12} className="me-1" />
                            {formErrors.stone_quantity}
                          </div>
                        )}
                        <div className="form-text x-small">
                          Available: {getAvailableStock().available}{" "}
                          {getAvailableStock().unit}
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Unit Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="stone_cost"
                            className="form-control"
                            value={formData.stone_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="e.g., 5000"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">
                            {selectedStone?.unit_name}
                          </span>
                        </div>
                        <div className="form-text x-small">
                          Cost per {selectedStone?.unit_name}
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Stone Breakage
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="stone_breakage"
                            className="form-control"
                            value={formData.stone_breakage}
                            onChange={handleInputChange}
                            min="0"
                            max={formData.stone_quantity}
                            step="1"
                            placeholder="e.g., 0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">
                            {selectedStone?.unit_name || "pcs"}
                          </span>
                        </div>
                        <div className="form-text x-small">
                          Stones broken during setting
                        </div>
                      </div>

                      {parseFloat(formData.stone_breakage) > 0 && (
                        <div className="col-md-8 mb-2">
                          <label className="form-label fw-medium small">
                            Breakage Reason
                          </label>
                          <input
                            type="text"
                            name="stone_breakage_reason"
                            className="form-control form-control-sm"
                            value={formData.stone_breakage_reason}
                            onChange={handleInputChange}
                            placeholder="Explain stone breakage reason..."
                            disabled={isDisabled}
                          />
                        </div>
                      )}
                    </div>

                    {/* Stone Summary */}
                    <div className="border rounded-3 p-3 bg-light mt-3">
                      <h6 className="fw-bold mb-3">Stone Summary</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Quantity Required:</span>
                            <span className="fw-bold">
                              {formData.stone_quantity ||
                                formData.stone_weight ||
                                "0"}{" "}
                              {selectedStone?.unit_name ||
                                (formData.stone_weight ? "carats" : "pcs")}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Breakage:</span>
                            <span
                              className={`fw-bold ${
                                parseFloat(formData.stone_breakage || 0) > 0
                                  ? "text-danger"
                                  : "text-success"
                              }`}
                            >
                              {formData.stone_breakage || "0"}{" "}
                              {selectedStone?.unit_name || "pcs"} (
                              {stoneBreakagePercent}%)
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Stone Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.stone_cost_total || "0.00"}
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between mb-2">
                            <span className="fw-bold">Stock Usage:</span>
                            <span
                              className={`fw-bold ${
                                parseFloat(stoneUsagePercent) > 100
                                  ? "text-danger"
                                  : "text-success"
                              }`}
                            >
                              {stoneUsagePercent}% of available stock
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
                                  (parseFloat(formData.stone_quantity || 0) /
                                    parseFloat(
                                      getAvailableStock().quantity || 1,
                                    )) *
                                    100,
                                )}%`,
                              }}
                              title="Stock Used"
                            >
                              Used ({stoneUsagePercent}%)
                            </div>
                            <div
                              className="progress-bar bg-danger"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (parseFloat(formData.stone_breakage || 0) /
                                    parseFloat(formData.stone_quantity || 1)) *
                                    100,
                                )}%`,
                              }}
                              title="Breakage"
                            >
                              Breakage ({stoneBreakagePercent}%)
                            </div>
                          </div>
                          <div className="mt-2 small text-muted">
                            Stone utilization visualization
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Setting Process Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "🔧 Setting Process",
                  "process",
                  <FiTool />,
                )}
                {expandedSections.process && (
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Setting Method
                        </label>
                        <select
                          name="setting_method"
                          className="form-select"
                          value={formData.setting_method}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {settingMethodOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-medium">
                          Precision Level
                        </label>
                        <select
                          name="precision_level"
                          className="form-select"
                          value={formData.precision_level}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          {precisionLevelOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="form-text">
                          {
                            precisionLevelOptions.find(
                              (p) => p.value === formData.precision_level,
                            )?.description
                          }
                        </div>
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          <FiTool className="me-1" /> Tool Used
                        </label>
                        <select
                          name="tool_used"
                          className="form-select form-select-sm"
                          value={formData.tool_used}
                          onChange={handleInputChange}
                          disabled={isDisabled}
                        >
                          <option value="">Select Tool</option>
                          {toolOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Prong Count
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="prong_count"
                            className="form-control"
                            value={formData.prong_count}
                            onChange={handleInputChange}
                            min="3"
                            max="8"
                            step="1"
                            placeholder="e.g., 4"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">prongs</span>
                        </div>
                        <div className="form-text x-small">
                          For prong setting only
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Bezel Thickness
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="bezel_thickness"
                            className="form-control"
                            value={formData.bezel_thickness}
                            onChange={handleInputChange}
                            min="0.1"
                            max="2"
                            step="0.1"
                            placeholder="e.g., 0.8"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">mm</span>
                        </div>
                        <div className="form-text x-small">
                          For bezel setting only
                        </div>
                      </div>
                    </div>

                    <div className="row mt-3">
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="stone_secure"
                            id="stone_secure"
                            checked={formData.stone_secure}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="stone_secure"
                          >
                            Stone Securely Set
                          </label>
                        </div>
                        <div className="form-text">
                          Check if stone is securely set without movement
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
                  selectedLaborCosts.length,
                )}
                {expandedSections.cost && (
                  <div className="card-body">
                    <div className="row mb-3">
                      {/* <div className="col-md-12">
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
                      </div> */}
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
                              (cost) => cost._id === option.value,
                            ),
                          )}
                          onChange={handleLaborCostsChange}
                          placeholder={
                            laborCosts.length === 0
                              ? "Loading labor cost types..."
                              : "Select labor cost types (Setter/Labor costs)"
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
                          Select one or more labor cost types (Setter costs are
                          included). The total labor cost will be calculated
                          automatically.
                        </div>
                      </div>
                    </div>

                    <div className="row g-2">
                      {/* <div className="col-md-4 mb-2">
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
                          Metal/other materials
                        </div>
                      </div> */}

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Tool Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="tool_cost"
                            className="form-control"
                            value={formData.tool_cost}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="form-text x-small">
                          Tool usage/depreciation
                        </div>
                      </div>

                      <div className="col-md-4 mb-2">
                        <label className="form-label fw-medium small">
                          Stone Cost
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            className="form-control bg-light"
                            value={formData.stone_cost_total || "0.00"}
                            readOnly
                          />
                        </div>
                        <div className="form-text x-small">Auto-calculated</div>
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
                        <div className="form-text x-small">Miscellaneous</div>
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

                      <div className="col-md-4 mb-2">
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
                              calculateLaborCostFromSelection(
                                selectedLaborCosts,
                              )
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
                                      {/* <th className="small">Product Code</th> */}
                                      <th className="small">Type</th>
                                      <th className="small">Cost Type</th>
                                      <th className="small">Stage</th>
                                      <th className="small">Sub Stage</th>
                                      <th className="small">Amount</th>
                                      <th className="small">Unit</th>
                                      <th className="small text-end">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {laborBreakdown.map((item) => (
                                      <tr key={item.id}>
                                        {/* <td className="small">
                                          <strong>{item.product_code}</strong>
                                        </td> */}
                                        <td className="small">
                                          <strong>{item.name}</strong>
                                        </td>
                                        <td className="small">
                                          <span className="badge bg-secondary">
                                            {item.type}
                                          </span>
                                        </td>
                                        <td className="small">
                                          <span className="badge bg-info">
                                            {item.stage}
                                          </span>
                                        </td>
                                        <td className="small">
                                          <span className="badge bg-warning">
                                            {item.sub_stage}
                                          </span>
                                        </td>
                                        <td className="small">
                                          ₹{item.cost_amount}
                                        </td>
                                        <td className="small">
                                          <span className="badge bg-success">
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
                                      <td colSpan="7" className="small fw-bold">
                                        Total Labor Cost
                                      </td>
                                      <td className="small fw-bold fs-6">
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
                            <span>Stone Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.stone_cost_total || "0.00"}
                            </span>
                          </div>
                          {/* <div className="d-flex justify-content-between mb-2 small">
                            <span>Material Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.material_cost || "0.00"}
                            </span>
                          </div> */}
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Labor Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.labour_cost || "0.00"}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span>Tool Cost:</span>
                            <span className="fw-bold">
                              ₹ {formData.tool_cost || "0.00"}
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
                                width: `${((parseFloat(formData.stone_cost_total || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Stone Cost"
                            >
                              Stones
                            </div>
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${((parseFloat(formData.material_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Material Cost"
                            >
                              Material
                            </div>
                            <div
                              className="progress-bar bg-warning"
                              style={{
                                width: `${((parseFloat(formData.labour_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Labor Cost"
                            >
                              Labor
                            </div>
                            <div
                              className="progress-bar bg-info"
                              style={{
                                width: `${((parseFloat(formData.tool_cost || 0) / parseFloat(formData.total_cost || 1)) * 100).toFixed(1)}%`,
                              }}
                              title="Tool Cost"
                            >
                              Tool
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
                      <div className="col-md-6 mb-2">
                        <label className="form-label fw-medium small">
                          Setting Time
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            name="setting_time"
                            className="form-control"
                            value={formData.setting_time}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="0.0"
                            disabled={isDisabled}
                          />
                          <span className="input-group-text">hrs</span>
                        </div>
                        <div className="form-text x-small">
                          Actual stone setting time
                        </div>
                      </div>

                      <div className="col-md-6 mb-2">
                        <label className="form-label fw-medium small">
                          Quality Check Time
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

                      <div className="col-md-6 mb-2">
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
                  </div>
                )}
              </div>

              {/* File Tracking Section */}
              <div className="card mb-4">
                {renderSectionHeader(
                  "📎 File Tracking",
                  "files",
                  <FiFile />,
                  settingFiles.length,
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
                              Source Files (Design/Images)
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  settingFiles.filter(
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
                                input.accept = ".jpg,.jpeg,.png,.pdf";
                                input.onchange = (e) =>
                                  handleFileChange(e, "source");
                                input.click();
                              }}
                            >
                              <FiUpload size={16} className="text-info mb-1" />
                              <p className="mb-0 small">Upload Design Files</p>
                              <p className="x-small text-muted">Images, PDFs</p>
                            </div>

                            {settingFiles.filter((f) => f.category === "source")
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
                                      {settingFiles
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
                              Setting Output Files
                              <span className="badge bg-light text-dark ms-2">
                                {
                                  settingFiles.filter(
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
                              <p className="mb-0 small">Upload Setting Files</p>
                              <p className="x-small text-muted">
                                Photos, Videos, Reports
                              </p>
                            </div>

                            {settingFiles.filter((f) => f.category === "output")
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
                                      {settingFiles
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
                  <span className="me-3">
                    <FiUsers className="me-1" />
                    Labor: ₹{formData.labour_cost || "0.00"}
                  </span>
                  <span className="me-3">
                    <FiAperture className="me-1" />
                    Stones: {formData.stone_quantity || "0"}
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
                        Update Setting Stage
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

export default UpdateSettingStage;
