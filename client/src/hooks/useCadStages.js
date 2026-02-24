import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useCadStages() {
  const [cadStages, setCadStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [laborCosts, setLaborCosts] = useState([]);

const fetchCadStages = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const url = API_ENDPOINTS.getCadStages();
    console.log("Fetching CAD stages from:", url);

    const res = await axios.get(url);
    console.log("API Response:", res.data);

    let cadStagesData = [];

    // Extract CAD stages from response
    if (res.data?.success && Array.isArray(res.data.data)) {
      cadStagesData = res.data.data.map((cadStage) => {
        console.log("Processing CAD stage:", cadStage);
        
        // Parse labor_cost_breakdown_raw if it's a string
        let parsedLaborCostBreakdownRaw = [];
        if (cadStage.labor_cost_breakdown_raw && cadStage.labor_cost_breakdown_raw.length > 0) {
          try {
            // Handle if it's a string that needs parsing
            if (typeof cadStage.labor_cost_breakdown_raw[0] === 'string') {
              parsedLaborCostBreakdownRaw = JSON.parse(cadStage.labor_cost_breakdown_raw[0]);
            } else {
              parsedLaborCostBreakdownRaw = cadStage.labor_cost_breakdown_raw;
            }
          } catch (e) {
            console.error("Error parsing labor_cost_breakdown_raw:", e);
            parsedLaborCostBreakdownRaw = cadStage.labor_cost_breakdown_raw;
          }
        }

        return {
          // Core IDs
          _id: cadStage._id,
          cad_stage_id: cadStage._id,
          job_card_id: cadStage.job_card_id,

          // Job Card Info
          job_card_no: cadStage.job_card_no,

          // CAD Stage Basic Info
          assigned_to: cadStage.assigned_to?._id,
          assigned_name: cadStage.assigned_to?.name,
          assigned_email: cadStage.assigned_to?.email,
          assigned_department: cadStage.department,
          status: cadStage.status,
          start_date: cadStage.start_date,
          end_date: cadStage.end_date,
          completed_at: cadStage.completed_at,
          remarks: cadStage.remarks,

          // Time tracking
          estimated_hours: cadStage.estimated_hours,
          actual_hours: cadStage.actual_hours,
          design_time: cadStage.design_time || 0,
          revision_time: cadStage.revision_time || 0,
          total_time_spent: cadStage.total_time_spent,
          time_breakdown: cadStage.time_breakdown,

          // CAD Details
          cad_software: cadStage.cad_software,
          complexity_level: cadStage.complexity_level,

          // Cost Tracking
          material_cost: cadStage.material_cost || 0,
          labor_cost: cadStage.labor_cost || 0,
          software_cost: cadStage.software_cost || 0,
          machine_cost: cadStage.machine_cost || 0,
          other_costs: cadStage.other_costs || 0,
          total_cost: cadStage.total_cost,
          markup_percentage: cadStage.markup_percentage,
          final_price: cadStage.final_price,
          cost_currency: cadStage.cost_currency,
          cost_status: cadStage.cost_status,

          // File Tracking (adjust based on your actual file structure)
          file_version: cadStage.file_version || 1,
          file_revisions: cadStage.file_revisions || 0,
          file_status: cadStage.file_status || 'pending',
          files: cadStage.files || [],

          // Selected labor costs (if available)
          selected_labor_costs: cadStage.selected_labor_costs || [],
          labor_cost_breakdown: cadStage.labor_cost_breakdown || [],
          labor_cost_breakdown_raw: parsedLaborCostBreakdownRaw,

          // Dates
          createdAt: cadStage.createdAt,
          updatedAt: cadStage.updatedAt,

          // For UpdateCadCreation component compatibility
          stage: getNextStage(cadStage.status), // Determine next stage based on current status
          source_files: cadStage.files?.filter(f => f.type === 'source') || [], // Filter if files have type
          output_files: cadStage.files?.filter(f => f.type === 'output') || [], // Filter if files have type
          backup_location: getBackupLocation(cadStage.files), // Extract from files if available
        };
      });
    }

    console.log("Processed CAD stages:", cadStagesData);
    setCadStages(cadStagesData);
    return cadStagesData;
  } catch (err) {
    console.error("Fetch error:", err);
    setError(err.response?.data?.message || "Failed to load CAD stages");
    setCadStages([]);
    return [];
  } finally {
    setLoading(false);
  }
}, []);

// Helper function to determine next stage based on current status
const getNextStage = (currentStatus) => {
  const stageFlow = {
    'pending': 'in-progress',
    'in-progress': 'review',
    'review': 'approved',
    'approved': 'completed',
    'rejected': 'rework'
  };
  return stageFlow[currentStatus] || '';
};

// Helper function to extract backup location from files
const getBackupLocation = (files) => {
  if (!files || !Array.isArray(files)) return '';
  const backupFile = files.find(f => f.type === 'backup' || f.isBackup);
  return backupFile?.path || backupFile?.url || '';
};

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.getEmployees());
      const employeesData = res.data.data || [];
      setEmployees(employeesData);
      return employeesData;
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
      return [];
    }
  };

  // Fetch labor costs from price making API - FILTER OUT KARIGAR COSTS
  const fetchLaborCosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.getPriceMakings());

      console.log("Price making API Response:", response.data);

      if (response.data?.success && Array.isArray(response.data.data)) {
        const allItems = response.data.data;

        const potentialLaborItems = allItems.filter((item) => {
          const candidates = [
            item.cost_name,
            item.cost_type_id?.cost_name,
            item.cost_type_id?.cost_name_id?.cost_name,
            item.cost_type?.cost_name,
            item.cost_type_id?.cost_type,
            item.cost_type,
          ].filter(Boolean);

          const joined = candidates.join(" ").toLowerCase();

          const isLabor = (joined.includes("labor") || joined.includes("labour")) && !joined.includes("karigar");

          const explicitFlag = item.is_labor === true || item.isLabor === true || item.cost_category === "labor";

          return isLabor || explicitFlag;
        });

        const laborCostData = potentialLaborItems.length > 0 ? potentialLaborItems : allItems.filter(item => {
          const ct = (item.cost_type || "").toString().toLowerCase();
          return ct.includes("labor") || ct.includes("labour");
        });

        const processedCosts = laborCostData.map((item) => {
          const resolvedName = item.cost_name || item.cost_type_id?.cost_name_id?.cost_name || item.cost_type?.cost_name || item.cost_type || "Labor Cost";
          return {
            ...item,
            _id: item._id,
            cost_name: resolvedName,
            cost_type: item.cost_type_id?.cost_type || item.cost_type || "Direct Cost",
            cost_amount: parseFloat(item.cost_amount) || 0,
            unit: item.unit_id?.name || item.unit || "unit",
            stage_name: item.making_stage_id?.stage_name || item.making_stage || "General",
            sub_stage_name: item.making_sub_stage_id?.sub_stage_name || item.making_sub_stage || "General",
            is_active: item.is_active !== false,
          };
        });

        // Fallback: if filtering produced no results, map all items so UI has options
        let finalCosts = processedCosts;
        if (finalCosts.length === 0 && Array.isArray(allItems) && allItems.length > 0) {
          finalCosts = allItems.map((item) => ({
            ...item,
            _id: item._id,
            cost_name: item.cost_name || item.cost_type_id?.cost_name_id?.cost_name || item.cost_type || "Cost",
            cost_type: item.cost_type || item.cost_type_id?.cost_type || "Direct Cost",
            cost_amount: parseFloat(item.cost_amount) || 0,
            unit: item.unit_id?.name || item.unit || "unit",
            stage_name: item.making_stage_id?.stage_name || item.making_stage || "General",
            sub_stage_name: item.making_sub_stage_id?.sub_stage_name || item.sub_stage_name || "General",
            is_active: item.is_active !== false,
          }));
        }

        console.log("Processed labor costs (robust):", finalCosts);
        setLaborCosts(finalCosts);
        return finalCosts;
      }

      setLaborCosts([]);
      return [];
    } catch (err) {
      console.error("Error fetching labor costs:", err);
      setLaborCosts([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Calculate total labor cost based on selected labor cost items
  const calculateTotalLaborCost = (selectedLaborCosts = []) => {
    if (!selectedLaborCosts.length) return 0;

    let totalLaborCost = 0;

    // Sum up the cost_amount from each selected labor cost
    selectedLaborCosts.forEach((cost) => {
      const costAmount = parseFloat(cost.cost_amount) || 0;
      totalLaborCost += costAmount;
    });

    console.log(
      "Calculated total labor cost:",
      totalLaborCost,
      "from",
      selectedLaborCosts.length,
      "items",
    );
    return totalLaborCost;
  };

  // Calculate labor breakdown for selected items
  const calculateLaborBreakdown = (selectedLaborCosts = []) => {
    if (!selectedLaborCosts.length) return [];

    return selectedLaborCosts.map((cost) => {
      const costAmount = parseFloat(cost.cost_amount) || 0;

      return {
        id: cost._id,
        name: cost.cost_name || "Labor",
        type: cost.cost_type || "Direct Cost",
        cost_amount: costAmount,
        unit: cost.unit || "unit",
        total_cost: costAmount.toFixed(2),
        stage: cost.stage_name || "General",
        sub_stage: cost.sub_stage_name || "General",
      };
    });
  };

  // Update CAD stage with file uploads
  const updateCadStageWithFiles = async (
    stageId,
    updateData,
    filesToUpload = [],
  ) => {
    try {
      setLoading(true);
      setError("");

      // Calculate labor cost from selected labor costs if provided
      let finalUpdateData = { ...updateData };

      // If selected_labor_costs is provided, calculate total labor cost
      if (
        updateData.selected_labor_costs &&
        Array.isArray(updateData.selected_labor_costs)
      ) {
        const totalLaborCost = calculateTotalLaborCost(
          updateData.selected_labor_costs,
        );

        // Update labor cost in data
        finalUpdateData.labor_cost = totalLaborCost.toFixed(2);

        // Recalculate totals with new labor cost
        const material = parseFloat(updateData.material_cost) || 0;
        const software = parseFloat(updateData.software_cost) || 0;
        const machine = parseFloat(updateData.machine_cost) || 0;
        const other = parseFloat(updateData.other_costs) || 0;
        const markup = parseFloat(updateData.markup_percentage) || 0;

        const total = material + totalLaborCost + software + machine + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        finalUpdateData.total_cost = total.toFixed(2);
        finalUpdateData.final_price = finalPrice.toFixed(2);
      }

      const url = API_ENDPOINTS.updateCadStage(stageId);

      const requestData = {
        // Basic Information
        assigned_to: finalUpdateData.assigned_to || "",
        stage: finalUpdateData.stage,
        status: finalUpdateData.status || "pending",
        start_date: finalUpdateData.start_date || "",
        end_date: finalUpdateData.end_date || "",
        estimated_hours: finalUpdateData.estimated_hours || "0",
        actual_hours: finalUpdateData.actual_hours || "0",
        cad_software: finalUpdateData.cad_software || "",
        complexity_level: finalUpdateData.complexity_level || "",
        remarks: finalUpdateData.remarks || "",
        department: finalUpdateData.department || "CAD",

        // Cost Tracking
        material_cost: finalUpdateData.material_cost || "0",
        labor_cost: finalUpdateData.labor_cost || "0",
        software_cost: finalUpdateData.software_cost || "0",
        machine_cost: finalUpdateData.machine_cost || "0",
        other_costs: finalUpdateData.other_costs || "0",
        total_cost: finalUpdateData.total_cost || "0",
        cost_currency: finalUpdateData.cost_currency || "INR",
        cost_status: finalUpdateData.cost_status || "estimated",
        markup_percentage: finalUpdateData.markup_percentage || "30",
        final_price: finalUpdateData.final_price || "0",

        // Time Tracking
        design_time: finalUpdateData.design_time || "0",
        modeling_time: finalUpdateData.modeling_time || "0",
        rendering_time: finalUpdateData.rendering_time || "0",
        revision_time: finalUpdateData.revision_time || "0",
        review_time: finalUpdateData.review_time || "0",
        total_time_spent: finalUpdateData.total_time_spent || "0",
        time_breakdown: finalUpdateData.time_breakdown || "",

        // File Tracking
        file_version: finalUpdateData.file_version || "1.0",
        file_revisions: finalUpdateData.file_revisions || "0",
        file_status: finalUpdateData.file_status || "draft",
        backup_location: finalUpdateData.backup_location || "",
      };

      const formData = new FormData();

      // Append all data fields
      Object.keys(requestData).forEach((key) => {
        formData.append(key, requestData[key]);
      });

      // Handle existing files
      if (updateData.files && Array.isArray(updateData.files)) {
        const existingFiles = updateData.files
          .filter((file) => file.isExisting)
          .map((file) => ({
            id: file.id,
            name: file.name,
            url: file.url,
            size: file.size,
            type: file.type,
            category: file.category || "output",
            version: file.version || "1.0",
          }));

        formData.append("files", JSON.stringify(existingFiles));
      }

      // Append selected labor costs as JSON array of IDs
      if (
        updateData.selected_labor_costs &&
        Array.isArray(updateData.selected_labor_costs)
      ) {
        formData.append(
          "selected_labor_costs",
          JSON.stringify(
            updateData.selected_labor_costs.map((cost) => cost._id),
          ),
        );
      }

      // Append labor breakdown as JSON
      if (
        updateData.labor_cost_breakdown &&
        Array.isArray(updateData.labor_cost_breakdown)
      ) {
        formData.append(
          "labor_cost_breakdown",
          JSON.stringify(updateData.labor_cost_breakdown),
        );
      }

      // Add new files
      if (filesToUpload.length > 0) {
        filesToUpload.forEach((file, index) => {
          formData.append(`uploaded_files`, file);
        });
      }

      // Debug
      console.log("📤 Sending CAD update data:");
      for (let [key, value] of formData.entries()) {
        if (key === "uploaded_files") {
          console.log(`${key}: File - ${value.name}`);
        } else if (
          key === "files" ||
          key === "selected_labor_costs" ||
          key === "labor_cost_breakdown"
        ) {
          console.log(`${key}: ${value.substring(0, 100)}...`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // ✅ Make API Call
      const res = await axios.put(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        await fetchCadStages();
        return { success: true, data: res.data.data };
      } else {
        const errorMsg = res.data?.message || "Failed to update CAD stage";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error("❌ Update error:", err);

      if (err.response) {
        console.error("Response data:", err.response.data);
        const errorMsg =
          err.response.data?.message || `Error: ${err.response.status}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      setError(err.message || "Update failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      await fetchCadStages();
      await fetchEmployees();
      await fetchLaborCosts();
    };

    fetchData();
  }, [fetchCadStages]);

  return {
    // Data
    cadStages,
    employees,
    laborCosts,

    // Loading states
    loading,

    // Error
    error,

    // Functions
    fetchCadStages,
    fetchEmployees,
    fetchLaborCosts,
    calculateTotalLaborCost,
    calculateLaborBreakdown,
    updateCadStageWithFiles,
  };
}
