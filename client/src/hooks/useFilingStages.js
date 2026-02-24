import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useFilingStages() {
  const [filingStages, setFilingStages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [units, setUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tools, setTools] = useState([]);
  const [laborCosts, setLaborCosts] = useState([]); // Add labor costs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Filing stages
  const fetchFilingStages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getFilingStages();
      const res = await axios.get(url);

      let filingStagesData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        filingStagesData = res.data.data.map((item) => {
          const stage = item.filing_stage || {};
          const data = stage.data || {};

          // Parse filing tools
          let filingToolsArray = [];
          if (data.filing_tools_used && Array.isArray(data.filing_tools_used)) {
            if (
              data.filing_tools_used.length > 0 &&
              typeof data.filing_tools_used[0] === "string"
            ) {
              filingToolsArray = data.filing_tools_used[0]
                .split(",")
                .map((tool) => tool.trim());
            } else {
              filingToolsArray = data.filing_tools_used;
            }
          } else if (typeof data.filing_tools_used === "string") {
            filingToolsArray = data.filing_tools_used
              .split(",")
              .map((tool) => tool.trim());
          }

          // Parse files
          let filesArray = [];
          if (data.files) {
            if (Array.isArray(data.files)) {
              if (data.files.length > 0 && typeof data.files[0] === "string") {
                try {
                  const parsedFiles = JSON.parse(data.files[0]);
                  filesArray = Array.isArray(parsedFiles) ? parsedFiles : [];
                } catch (e) {
                  console.error("Error parsing files:", e);
                  filesArray = [];
                }
              } else {
                filesArray = data.files;
              }
            } else if (typeof data.files === "string") {
              try {
                filesArray = JSON.parse(data.files);
              } catch {
                filesArray = [];
              }
            }
          }

          // Parse labor costs
          let selectedLaborCostsArray = [];
          let laborBreakdownArray = [];
          
          if (data.selected_labor_costs) {
            if (Array.isArray(data.selected_labor_costs)) {
              selectedLaborCostsArray = data.selected_labor_costs;
            } else if (typeof data.selected_labor_costs === "string") {
              try {
                selectedLaborCostsArray = JSON.parse(data.selected_labor_costs);
              } catch {
                selectedLaborCostsArray = [];
              }
            }
          }

          if (data.labor_cost_breakdown) {
            if (Array.isArray(data.labor_cost_breakdown)) {
              laborBreakdownArray = data.labor_cost_breakdown;
            } else if (typeof data.labor_cost_breakdown === "string") {
              try {
                laborBreakdownArray = JSON.parse(data.labor_cost_breakdown);
              } catch {
                laborBreakdownArray = [];
              }
            }
          }

          return {
            _id: stage._id || item.filing_stage_id,
            filing_stage_id: item.filing_stage_id,
            job_card_id: item._id,
            job_card_no: item.job_card?.job_card_no || "N/A",
            job_card: item.job_card || {},
            stage_name: "Filing",
            design_type: item.job_card?.design_type || "N/A",
            department: "FILING",
            assigned_to: stage.assigned_to?._id,
            assigned_name: stage.assigned_to?.name || "Unassigned",
            assigned_department: stage.assigned_to?.department || "FILING",
            status: stage.status || "not_started",
            start_date: stage.start_date,
            end_date: stage.end_date,
            completed_at: stage.completed_at,
            remarks: stage.remarks || "",

            // Filing specific data
            filing_type: data.filing_type || "manual",
            filing_tools_used: filingToolsArray,
            filing_tools: filingToolsArray,
            surface_finish: data.surface_finish || "smooth",
            roughness_level: data.roughness_level || "fine",
            tolerance_level: data.tolerance_level || "standard",
            defects_removed: data.defects_removed || "",
            rework_required: data.rework_required || false,
            rework_reason: data.rework_reason || "",

            // Tool cost data
            tool_cost: data.tool_cost || 0,
            tool_wastage: data.tool_wastage || 0,
            tool_wastage_type: data.tool_wastage_type || "normal",

            // Time tracking
            labour_hours: data.labour_hours || 0,
            actual_hours: data.actual_hours || 0,
            preparation_time: data.preparation_time || 0,
            rough_filing_time: data.rough_filing_time || 0,
            fine_filing_time: data.fine_filing_time || 0,
            polishing_time: data.polishing_time || 0,
            quality_check_time: data.quality_check_time || 0,
            total_time_spent: data.total_time_spent || 0,
            time_breakdown: data.time_breakdown || "",

            // Next stage
            next_stage: data.next_stage || "",

            // Cost tracking
            material_cost: data.material_cost || 0,
            labour_cost: data.labour_cost || 0, // This should come from selected labor costs
            equipment_cost: data.equipment_cost || 0,
            consumables_cost: data.consumables_cost || 0,
            tool_wear_cost: data.tool_wear_cost || 0,
            wastage_cost: data.wastage_cost || 0,
            other_costs: data.other_costs || 0,
            total_cost: data.total_cost || 0,
            final_price: data.final_price || 0,
            markup_percentage: data.markup_percentage || 25,
            cost_currency: data.cost_currency || "INR",
            cost_status: data.cost_status || "estimated",

            // File tracking
            file_version: data.file_version || "1.0",
            file_revisions: data.file_revisions || 0,
            file_status: data.file_status || "draft",
            backup_location: data.backup_location || "",
            files: filesArray || [],

            // Labor cost tracking (new fields)
            selected_labor_costs: selectedLaborCostsArray || [],
            labor_cost_breakdown: laborBreakdownArray || [],

            // Material tracking
            material_id: data.material_id || "",
            material_type: data.material_type || "",
            material_item_code: data.material_item_code || "",
            material_issued_qty: data.material_issued_qty || 0,
            material_used_qty: data.material_used_qty || 0,
            material_returned_qty: data.material_returned_qty || 0,
            material_wastage_qty: data.material_wastage_qty || 0,
            material_wastage_type: data.material_wastage_type || "normal",
            purity: data.purity || "",
            material_unit: data.material_unit || "",
            material_unit_id: data.material_unit_id || "",

            // Priority from job card
            priority: item.job_card?.priority || "medium",
            images: item.job_card?.images || [],
          };
        });
      }

      setFilingStages(filingStagesData);
      return filingStagesData;
    } catch (err) {
      console.error("Fetch filing stages error:", err);
      setError(err.response?.data?.message || "Failed to load filing stages");
      setFilingStages([]);
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

  // Fetch labor costs from price making API - INCLUDE KARIGAR COSTS FOR FILING
  const fetchLaborCosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.getPriceMakings());

      console.log("Price making API Response for filing:", response.data);

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
            item.stage_name,
            item.making_stage_id?.stage_name,
          ].filter(Boolean);

          const joined = candidates.join(" ").toLowerCase();

          // Accept both spellings and include karigar for filing
          const looksLikeLabor = (
            joined.includes("labor") ||
            joined.includes("labour") ||
            joined.includes("karigar") ||
            joined.includes("craftsman") ||
            joined.includes("worker") ||
            joined.includes("कारीगर") ||
            joined.includes("करिगर")
          );

          const explicitFlag = item.is_labor === true || item.isLabor === true || item.cost_category === "labor";

          return looksLikeLabor || explicitFlag;
        });

        const laborCostData = potentialLaborItems.length > 0 ? potentialLaborItems : allItems.filter(item => {
          const ct = (item.cost_type || item.cost_name || "").toString().toLowerCase();
          return ct.includes("labor") || ct.includes("labour") || ct.includes("karigar");
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
            stage_name: item.making_stage_id?.stage_name || item.stage_name || "General",
            sub_stage_name: item.making_sub_stage_id?.sub_stage_name || item.sub_stage_name || "General",
            is_active: item.is_active !== false,
          };
        });
        // If nothing matched, fallback to mapping all returned items so selector isn't empty
        let finalCosts = processedCosts;
        if (finalCosts.length === 0 && Array.isArray(allItems) && allItems.length > 0) {
          finalCosts = allItems.map((item) => ({
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

        console.log("Processed labor costs for filing (robust):", finalCosts);
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

    selectedLaborCosts.forEach((cost) => {
      const costAmount = parseFloat(cost.cost_amount) || 0;
      totalLaborCost += costAmount;
    });

    console.log(
      "Calculated total labor cost for filing:",
      totalLaborCost,
      "from",
      selectedLaborCosts.length,
      "items"
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

  // Fetch units
  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_ENDPOINTS.getUnits());

      let unitsData = [];

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        unitsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        unitsData = response.data;
      } else if (response.data && Array.isArray(response.data.units)) {
        unitsData = response.data.units;
      }

      setUnits(unitsData);
      return unitsData;
    } catch (err) {
      console.error("Error fetching units:", err);
      setError("Failed to fetch units");
      setUnits([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update Filing stage
  const updateFilingStageWithFiles = async (
    stageId,
    updateData,
    filesToUpload = []
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
          updateData.selected_labor_costs
        );

        // Update labor cost in data
        finalUpdateData.labour_cost = totalLaborCost.toFixed(2);

        // Recalculate totals with new labor cost
        const tool = parseFloat(updateData.tool_cost) || 0;
        const equipment = parseFloat(updateData.equipment_cost) || 0;
        const consumables = parseFloat(updateData.consumables_cost) || 0;
        const wastage = parseFloat(updateData.wastage_cost) || 0;
        const other = parseFloat(updateData.other_costs) || 0;
        const markup = parseFloat(updateData.markup_percentage) || 25;

        const total = tool + totalLaborCost + equipment + consumables + wastage + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        finalUpdateData.total_cost = total.toFixed(2);
        finalUpdateData.final_price = finalPrice.toFixed(2);
      }

      const url = API_ENDPOINTS.updateFilingStage(stageId);

      const formData = new FormData();

      Object.keys(finalUpdateData).forEach((key) => {
        if (key !== "files" && key !== "material_name" && key !== "unit_name") {
          const value = finalUpdateData[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
      });

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
            updateData.selected_labor_costs.map((cost) => cost._id)
          )
        );
      }

      // Append labor breakdown as JSON
      if (
        updateData.labor_cost_breakdown &&
        Array.isArray(updateData.labor_cost_breakdown)
      ) {
        formData.append(
          "labor_cost_breakdown",
          JSON.stringify(updateData.labor_cost_breakdown)
        );
      }

      if (filesToUpload.length > 0) {
        filesToUpload.forEach((file, index) => {
          formData.append(`uploaded_files`, file);
        });
      }

      // Debug
      console.log("📤 Sending Filing update data:");
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

      const res = await axios.put(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        await fetchFilingStages();
        return { success: true, data: res.data.data };
      } else {
        const errorMsg = res.data?.message || "Failed to update Filing stage";
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

  // Fetch all initial data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchFilingStages(),
        fetchEmployees(),
        fetchUnits(),
        fetchLaborCosts(), // Add labor costs fetch
      ]);
    } catch (error) {
      console.error("Error fetching all data:", error);
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }, [fetchFilingStages]);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    filingStages,
    units,
    employees,
    laborCosts, // Export labor costs
    loading,
    error,
    fetchFilingStages,
    fetchEmployees,
    fetchUnits,
    fetchLaborCosts, // Export fetch function
    calculateTotalLaborCost, // Export calculation function
    calculateLaborBreakdown, // Export breakdown function
    updateFilingStageWithFiles,
    fetchAllData,
  };
}