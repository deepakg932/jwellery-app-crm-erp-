import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useDesignStages() {
  const [designStages, setDesignStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [laborCosts, setLaborCosts] = useState([]);

  // Fetch all design stages
const fetchDesignStages = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const url = `${API_ENDPOINTS.getDesignStages()}`;
    console.log("Fetching design stages from:", url);

    const res = await axios.get(url);
    console.log("Design stages API Response:", res.data);

    let stagesData = [];

    // Extract data based on response structure
    if (res.data?.success && Array.isArray(res.data.data)) {
      stagesData = res.data.data;
    } else if (Array.isArray(res.data)) {
      stagesData = res.data;
    } else if (res.data?.data && Array.isArray(res.data.data)) {
      stagesData = res.data.data;
    }

    console.log("Extracted stages data:", stagesData);

    // Format design stages data
    const mappedStages = stagesData.map((designStage, index) => {
      const assignedTo = designStage.assigned_to || {};
      
      // Parse labor_cost_breakdown if it exists
      let laborBreakdown = [];
      if (designStage.labor_cost_breakdown && Array.isArray(designStage.labor_cost_breakdown) && designStage.labor_cost_breakdown.length > 0) {
        try {
          // Your response: labor_cost_breakdown is an array with a stringified JSON as first element
          const breakdownString = designStage.labor_cost_breakdown[0];
          if (typeof breakdownString === 'string') {
            // Parse the stringified JSON
            laborBreakdown = JSON.parse(breakdownString);
          } else if (Array.isArray(breakdownString)) {
            // Already an array
            laborBreakdown = breakdownString;
          }
        } catch (err) {
          console.error("Error parsing labor_cost_breakdown:", err, designStage.labor_cost_breakdown);
          laborBreakdown = [];
        }
      }

      return {
        // IDs
        _id: designStage._id,
        job_card_id: designStage.job_card_id,
        job_card_no: designStage.job_card_no,
        
        // Basic Information from Design Stage
        assigned_to: assignedTo._id || "",
        assigned_name: assignedTo.name || "Unassigned",
        assigned_email: assignedTo.email || "",
        assigned_department: designStage.department || "",
        
        // Stage Status and Timing
        status: designStage.status || "pending",
        stage: designStage.stage || "", // Get from response if available
        stage_name: designStage.stage_name || `Design Stage - ${designStage.job_card_no}`,
        stage_type: designStage.stage_type || "", // Get from response if available
        
        // Dates
        start_date: designStage.start_date,
        end_date: designStage.end_date,
        completed_at: designStage.completed_at,
        remarks: designStage.remarks || "",
        createdAt: designStage.createdAt || new Date().toISOString(),
        updatedAt: designStage.updatedAt || new Date().toISOString(),
        
        // Time Tracking
        estimated_hours: designStage.estimated_hours || 0,
        actual_hours: designStage.actual_hours || 0,
        preparation_time: designStage.preparation_time || 0,
        processing_time: designStage.processing_time || 0,
        finishing_time: designStage.finishing_time || 0,
        inspection_time: designStage.inspection_time || 0,
        packaging_time: designStage.packaging_time || 0,
        total_time_spent: designStage.total_time_spent || 0,
        time_breakdown: designStage.time_breakdown || "",
        
        // Design Details
        design_notes: designStage.design_notes || "",
        design_specifications: designStage.design_specifications || "",
        
        // Cost Tracking
        material_cost: designStage.material_cost || 0,
        labor_cost: designStage.labor_cost || 0,
        tooling_cost: designStage.tooling_cost || 0,
        machine_cost: designStage.machine_cost || 0,
        other_costs: designStage.other_costs || 0,
        total_cost: designStage.total_cost || 0,
        markup_percentage: designStage.markup_percentage || 0,
        final_price: designStage.final_price || 0,
        cost_currency: designStage.cost_currency || "INR",
        cost_status: designStage.cost_status || "estimated",
        
        // Labor Cost Details
        selected_labor_costs: designStage.selected_labor_costs || [],
        labor_cost_breakdown: laborBreakdown,
        
        // Files
        files: designStage.files || [],
        design_files: designStage.files || [],
      };
    });

    console.log("Mapped design stages:", mappedStages);
    setDesignStages(mappedStages);
    return mappedStages;
  } catch (err) {
    console.error("Fetch design stages error:", err);

    if (err.response) {
      const errorMessage =
        err.response.data?.message ||
        err.response.data?.error ||
        `Server error: ${err.response.status}`;
      setError(errorMessage);
    } else if (err.request) {
      setError("Network error. Please check your connection.");
    } else {
      console.log("Error fetching design stages:", err.message);
      setError("Failed to load design stages");
    }

    setDesignStages([]);
    return [];
  } finally {
    setLoading(false);
  }
}, []);

  // Fetch employees for assignment
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
        // Try to robustly detect labor-related costs (handle varying API shapes)
        const allItems = response.data.data;

        const potentialLaborItems = allItems.filter((item) => {
          // Try multiple places where cost name might live
          const candidates = [
            item.cost_name,
            item.cost_type_id?.cost_name,
            item.cost_type_id?.cost_name_id?.cost_name,
            item.cost_type?.cost_name,
            item.cost_type_id?.cost_type,
            item.cost_type,
          ].filter(Boolean);

          const joined = candidates.join(" ").toLowerCase();

          // Accept both american/british spellings and exclude karigar
          const isLabor = (joined.includes("labor") || joined.includes("labour") || joined.includes("labour")) && !joined.includes("karigar");

          // Also include explicit flags if backend provides them
          const explicitFlag = item.is_labor === true || item.isLabor === true || item.cost_category === "labor";

          return isLabor || explicitFlag;
        });

        // If nothing matched, fallback to any item with cost_type that seems like labor
        const laborCostData = potentialLaborItems.length > 0 ? potentialLaborItems : allItems.filter(item => {
          const ct = (item.cost_type || "").toString().toLowerCase();
          return ct.includes("labor") || ct.includes("labour");
        });

        // Process and format labor costs
        const processedCosts = laborCostData.map(item => {
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

        // Fallback to mapping all items when no filtered results
        let finalCosts = processedCosts;
        if (finalCosts.length === 0 && Array.isArray(allItems) && allItems.length > 0) {
          finalCosts = allItems.map(item => ({
            ...item,
            _id: item._id,
            cost_name: item.cost_name || item.cost_type_id?.cost_name_id?.cost_name || item.cost_type || "Cost",
            cost_type: item.cost_type || item.cost_type_id?.cost_type || "Direct Cost",
            cost_amount: parseFloat(item.cost_amount) || 0,
            unit: item.unit_id?.name || item.unit || "unit",
            stage_name: item.making_stage_id?.stage_name || item.stage_name || "General",
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
    selectedLaborCosts.forEach(cost => {
      const costAmount = parseFloat(cost.cost_amount) || 0;
      totalLaborCost += costAmount;
    });
    
    console.log("Calculated total labor cost:", totalLaborCost, "from", selectedLaborCosts.length, "items");
    return totalLaborCost;
  };

  // Calculate labor breakdown for selected items
  const calculateLaborBreakdown = (selectedLaborCosts = []) => {
    if (!selectedLaborCosts.length) return [];

    return selectedLaborCosts.map(cost => {
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

  // Update design stage with file uploads - FIXED PAYLOAD
  const updateStageWithFiles = async (
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
      if (updateData.selected_labor_costs && Array.isArray(updateData.selected_labor_costs)) {
        const totalLaborCost = calculateTotalLaborCost(updateData.selected_labor_costs);
        
        // Update labor cost in data
        finalUpdateData.labor_cost = totalLaborCost.toFixed(2);
        
        // Recalculate totals with new labor cost
        const material = parseFloat(updateData.material_cost) || 0;
        const other = parseFloat(updateData.other_costs) || 0;
        const markup = parseFloat(updateData.markup_percentage) || 0;
        
        const total = material + totalLaborCost + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        finalUpdateData.total_cost = total.toFixed(2);
        finalUpdateData.final_price = finalPrice.toFixed(2);
      }

      const url = API_ENDPOINTS.updateDesignStage(stageId);
      console.log("Updating stage at:", url, "with data:", finalUpdateData);

      // Create FormData for file upload
      const formData = new FormData();

      // Basic Information Fields
      formData.append("assigned_to", finalUpdateData.assigned_to || "");
      formData.append("status", finalUpdateData.status || "");
      formData.append("start_date", finalUpdateData.start_date || "");
      formData.append("end_date", finalUpdateData.end_date || "");
      formData.append("remarks", finalUpdateData.remarks || "");
      formData.append(
        "estimated_hours",
        parseFloat(finalUpdateData.estimated_hours) || 0,
      );
      formData.append("actual_hours", parseFloat(finalUpdateData.actual_hours) || 0);
      formData.append("design_notes", finalUpdateData.design_notes || "");
      formData.append(
        "design_specifications",
        finalUpdateData.design_specifications || "",
      );
      formData.append("stage", finalUpdateData.stage || "");

      // Cost Tracking Fields
      formData.append(
        "material_cost",
        parseFloat(finalUpdateData.material_cost) || 0,
      );
      formData.append("labor_cost", parseFloat(finalUpdateData.labor_cost) || 0);
      formData.append("other_costs", parseFloat(finalUpdateData.other_costs) || 0);
      formData.append("total_cost", parseFloat(finalUpdateData.total_cost) || 0);
      formData.append("cost_currency", finalUpdateData.cost_currency || "INR");
      formData.append("cost_status", finalUpdateData.cost_status || "estimated");
      formData.append(
        "markup_percentage",
        parseFloat(finalUpdateData.markup_percentage) || 30,
      );
      formData.append("final_price", parseFloat(finalUpdateData.final_price) || 0);

      // Time Tracking Fields
      formData.append(
        "preparation_time",
        parseFloat(finalUpdateData.preparation_time) || 0,
      );
      formData.append(
        "processing_time",
        parseFloat(finalUpdateData.processing_time) || 0,
      );
      formData.append(
        "finishing_time",
        parseFloat(finalUpdateData.finishing_time) || 0,
      );
      formData.append(
        "inspection_time",
        parseFloat(finalUpdateData.inspection_time) || 0,
      );
      formData.append(
        "packaging_time",
        parseFloat(finalUpdateData.packaging_time) || 0,
      );
      formData.append(
        "total_time_spent",
        parseFloat(finalUpdateData.total_time_spent) || 0,
      );
      formData.append("time_breakdown", finalUpdateData.time_breakdown || "");

      // File Tracking Fields
      formData.append("file_version", finalUpdateData.file_version || "1.0");
      formData.append(
        "file_revisions",
        parseInt(finalUpdateData.file_revisions) || 0,
      );
      formData.append("file_status", finalUpdateData.file_status || "draft");
      formData.append("backup_location", finalUpdateData.backup_location || "");

      // Handle files - FIXED: Append as JSON string
      const existingFiles = finalUpdateData.files?.filter(file => file.isExisting) || [];
      const newFiles = finalUpdateData.files?.filter(file => !file.isExisting) || [];
      
      // Prepare files data for backend
      const filesData = [...existingFiles, ...newFiles].map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        category: file.category || "output",
        version: file.version || "1.0",
        status: file.status || "new",
        isExisting: file.isExisting || false
      }));
      
      formData.append("files_data", JSON.stringify(filesData));

      // Append selected labor costs as JSON array of IDs
      if (updateData.selected_labor_costs && Array.isArray(updateData.selected_labor_costs)) {
        formData.append(
          "selected_labor_costs",
          JSON.stringify(updateData.selected_labor_costs.map(cost => cost._id))
        );
      }
      
      // Append labor breakdown as JSON
      if (updateData.labor_cost_breakdown && Array.isArray(updateData.labor_cost_breakdown)) {
        formData.append(
          "labor_cost_breakdown",
          JSON.stringify(updateData.labor_cost_breakdown)
        );
      }

      // Append new files
      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      const res = await axios.put(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        // Refresh the stages list
        await fetchDesignStages();
        return { success: true, data: res.data.data };
      } else {
        setError(res.data?.message || "Failed to update stage");
        return { success: false, error: res.data?.message };
      }
    } catch (err) {
      console.error("Update design stage error:", err);

      if (err.response) {
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } else if (err.request) {
        const errorMsg = "Network error. Please check your connection.";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } else {
        const errorMsg = err.message || "Failed to update design stage";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      await fetchDesignStages();
      await fetchEmployees();
      await fetchLaborCosts();
    };

    fetchData();
  }, [fetchDesignStages]);

  console.log("Design stages:", designStages);

  return {
    // Data
    designStages,
    employees,
    laborCosts,

    // Loading states
    loading,

    // Error
    error,

    // Functions
    fetchDesignStages,
    fetchEmployees,
    fetchLaborCosts,
    calculateTotalLaborCost,
    calculateLaborBreakdown,
    updateStageWithFiles,
  };
}