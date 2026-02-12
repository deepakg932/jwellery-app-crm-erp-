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
            assigned_department: cadStage.department,
            status: cadStage.status,
            start_date: cadStage.start_date,
            end_date: cadStage.end_date,
            completed_at: cadStage.completed_at,
            remarks: cadStage.remarks,

            // Time tracking
            estimated_hours: cadStage.estimated_hours,
            actual_hours: cadStage.actual_hours,
            design_time: cadStage.design_time,
            modeling_time: cadStage.modeling_time,
            rendering_time: cadStage.rendering_time,
            revision_time: cadStage.revision_time,
            review_time: cadStage.review_time,
            total_time_spent: cadStage.total_time_spent,
            time_breakdown: cadStage.time_breakdown,

            // CAD Details
            cad_software: cadStage.cad_software,
            complexity_level: cadStage.complexity_level,

            // Cost Tracking
            material_cost: cadStage.material_cost,
            labor_cost: cadStage.labor_cost,
            software_cost: cadStage.software_cost,
            machine_cost: cadStage.machine_cost,
            other_costs: cadStage.other_costs,
            total_cost: cadStage.total_cost,
            markup_percentage: cadStage.markup_percentage,
            final_price: cadStage.final_price,
            cost_currency: cadStage.cost_currency,
            cost_status: cadStage.cost_status,

            // File Tracking
            file_version: cadStage.file_version,
            file_revisions: cadStage.file_revisions || 0,
            file_status: cadStage.file_status,
            files: cadStage.files || [],

            // Selected labor costs (if available)
            selected_labor_costs: cadStage.selected_labor_costs || [],
            labor_cost_breakdown: cadStage.labor_cost_breakdown || [],
            labor_cost_breakdown_raw: cadStage.labor_cost_breakdown_raw || [],

            // Dates
            createdAt: cadStage.createdAt,
            updatedAt: cadStage.updatedAt,

            // For UpdateCadCreation component compatibility
            stage: "", // Next stage field - empty initially
            source_files: [], // Extract from files if needed
            output_files: [], // Extract from files if needed
            backup_location: "", // Might be in files array
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
        // Filter ONLY labor costs (exclude karigar costs)
        const laborCostData = response.data.data.filter((item) => {
          const costName = item.cost_type_id?.cost_name_id?.cost_name || "";
          const lowerCaseName = costName.toLowerCase();
          // Include only "labor" costs, exclude "karigar" costs
          return (
            lowerCaseName.includes("labor") &&
            !lowerCaseName.includes("karigar")
          );
        });

        // Process and format labor costs - using fixed amounts (not hourly)
        const processedCosts = laborCostData.map((item) => {
          return {
            ...item,
            _id: item._id,
            cost_name:
              item.cost_type_id?.cost_name_id?.cost_name || "Labor Cost",
            cost_type: item.cost_type_id?.cost_type || "Direct Cost",
            cost_amount: parseFloat(item.cost_amount) || 0,
            unit: item.unit_id?.name || "unit",
            stage_name: item.making_stage_id?.stage_name || "General",
            sub_stage_name:
              item.making_sub_stage_id?.sub_stage_name || "General",
            is_active: item.is_active !== false,
          };
        });

        console.log(
          "Processed labor costs (LABOR ONLY - no karigar):",
          processedCosts,
        );
        setLaborCosts(processedCosts);
        return processedCosts;
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
