// hooks/usePlatingStages.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function usePlatingStages() {
  const [platingStages, setPlatingStages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [units, setUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [laborCosts, setLaborCosts] = useState([]); // Add labor costs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Static plating materials
  const staticPlatingMaterials = [
    {
      _id: "rhodium",
      name: "Rhodium Solution",
      item_code: "PLAT-RHO-001",
      description: "Rhodium electroplating solution for white finish",
      purity: "99.9%",
      unit_name: "ml",
      unit_code: "ML",
      available_quantity: 5000,
      cost: 15,
      supplier_id: "supplier_plating_001"
    },
    {
      _id: "gold",
      name: "Gold Plating Solution",
      item_code: "PLAT-GOLD-001",
      description: "24K gold electroplating solution",
      purity: "24K",
      unit_name: "ml",
      unit_code: "ML",
      available_quantity: 3000,
      cost: 25,
      supplier_id: "supplier_plating_001"
    },
    {
      _id: "rose_gold",
      name: "Rose Gold Solution",
      item_code: "PLAT-RGOLD-001",
      description: "Rose gold electroplating solution",
      purity: "18K",
      unit_name: "ml",
      unit_code: "ML",
      available_quantity: 2000,
      cost: 20,
      supplier_id: "supplier_plating_001"
    },
    {
      _id: "white_gold",
      name: "White Gold Solution",
      item_code: "PLAT-WGOLD-001",
      description: "White gold electroplating solution",
      purity: "18K",
      unit_name: "ml",
      unit_code: "ML",
      available_quantity: 2500,
      cost: 22,
      supplier_id: "supplier_plating_001"
    },
    {
      _id: "silver",
      name: "Silver Plating Solution",
      item_code: "PLAT-SILV-001",
      description: "Sterling silver electroplating solution",
      purity: "92.5%",
      unit_name: "ml",
      unit_code: "ML",
      available_quantity: 4000,
      cost: 12,
      supplier_id: "supplier_plating_001"
    },
    {
      _id: "copper",
      name: "Copper Plating Solution",
      item_code: "PLAT-COPP-001",
      description: "Copper electroplating solution for base layer",
      purity: "99.5%",
      unit_name: "ml",
      unit_code: "ML",
      available_quantity: 6000,
      cost: 8,
      supplier_id: "supplier_plating_001"
    },
    {
      _id: "nickel",
      name: "Nickel Solution",
      item_code: "PLAT-NICK-001",
      description: "Nickel electroplating solution for barrier layer",
      purity: "99.7%",
      unit_name: "ml",
      unit_code: "ML",
      available_quantity: 3500,
      cost: 10,
      supplier_id: "supplier_plating_001"
    },
    {
      _id: "palladium",
      name: "Palladium Solution",
      item_code: "PLAT-PALL-001",
      description: "Palladium electroplating solution",
      purity: "99.95%",
      unit_name: "ml",
      unit_code: "ML",
      available_quantity: 1500,
      cost: 35,
      supplier_id: "supplier_plating_001"
    }
  ];

  // Fetch Plating stages
  const fetchPlatingStages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getPlatingStages();
      const res = await axios.get(url);

      let jobCardsData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        jobCardsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        jobCardsData = res.data;
      }

      console.log("Plating stages raw data:", jobCardsData);

      const platingStagesData = jobCardsData
        .filter(jobCard => jobCard.plating_stage)
        .map(jobCard => {
          const platingStage = jobCard.plating_stage;
          const platingData = platingStage.data || {};
          const jobCardData = jobCard.job_card || {};
          const assignedTo = platingStage.assigned_to || {};

          // Parse files
          let filesArray = [];
          if (platingData.files) {
            if (Array.isArray(platingData.files)) {
              if (platingData.files.length > 0 && typeof platingData.files[0] === "string") {
                try {
                  const parsedFiles = JSON.parse(platingData.files[0]);
                  filesArray = Array.isArray(parsedFiles) ? parsedFiles : [];
                } catch (e) {
                  console.error("Error parsing files:", e);
                  filesArray = [];
                }
              } else {
                filesArray = platingData.files;
              }
            } else if (typeof platingData.files === "string") {
              try {
                filesArray = JSON.parse(platingData.files);
              } catch {
                filesArray = [];
              }
            }
          }

          // Parse labor costs
          let selectedLaborCostsArray = [];
          let laborBreakdownArray = [];
          
          if (platingData.selected_labor_costs) {
            if (Array.isArray(platingData.selected_labor_costs)) {
              selectedLaborCostsArray = platingData.selected_labor_costs;
            } else if (typeof platingData.selected_labor_costs === "string") {
              try {
                selectedLaborCostsArray = JSON.parse(platingData.selected_labor_costs);
              } catch {
                selectedLaborCostsArray = [];
              }
            }
          }

          if (platingData.labor_cost_breakdown) {
            if (Array.isArray(platingData.labor_cost_breakdown)) {
              laborBreakdownArray = platingData.labor_cost_breakdown;
            } else if (typeof platingData.labor_cost_breakdown === "string") {
              try {
                laborBreakdownArray = JSON.parse(platingData.labor_cost_breakdown);
              } catch {
                laborBreakdownArray = [];
              }
            }
          }
          
          return {
            // IDs
            _id: jobCard._id || platingStage._id,
            plating_stage_id: platingStage._id,
            job_card_id: jobCardData._id,
            
            // Job card info
            job_card_no: jobCardData.job_card_no || "N/A",
            design_type: jobCardData.design_type || "N/A",
            job_card_priority: jobCardData.priority,
            job_card_images: jobCardData.images || [],
            job_card_stage: jobCardData.stage,
            job_card_status: jobCardData.status,
            
            // Department info
            department: "PLATING",
            assigned_department: platingStage.department,
            
            // Assignment info
            assigned_to: assignedTo._id,
            assigned_name: assignedTo.name,
            assigned_email: assignedTo.email,
            
            // Stage status
            status: platingStage.status,
            start_date: platingStage.start_date,
            end_date: platingStage.end_date,
            completed_at: platingStage.completed_at,
            remarks: platingStage.remarks,
            createdAt: jobCard.createdAt,
            
            // Material info
            material_id: platingData.material_id || "",
            material_name: platingData.material_name || staticPlatingMaterials.find(m => m._id === platingData.material_id)?.name || "",
            material_code: platingData.material_code || staticPlatingMaterials.find(m => m._id === platingData.material_id)?.item_code || "",
            material_used_qty: platingData.material_used_qty || "",
            material_unit: platingData.material_unit || "ml",
            
            // Plating process details
            plating_type: platingData.plating_type || "electroplating",
            plating_thickness: platingData.plating_thickness || "",
            current_density: platingData.current_density || "",
            voltage_applied: platingData.voltage_applied || "",
            plating_time: platingData.plating_time || "",
            bath_temperature: platingData.bath_temperature || "",
            ph_level: platingData.ph_level || "",
            
            // Quality metrics
            surface_finish: platingData.surface_finish || "good",
            adhesion_quality: platingData.adhesion_quality || "good",
            uniformity: platingData.uniformity || "good",
            defects: platingData.defects || "",
            rework_required: platingData.rework_required || false,
            rework_reason: platingData.rework_reason || "",
            
            // Time tracking
            labour_hours: platingData.labour_hours || "",
            actual_hours: platingData.actual_hours || "",
            preparation_time: platingData.preparation_time || "",
            cleaning_time: platingData.cleaning_time || "",
            plating_time_track: platingData.plating_time_track || "",
            rinsing_time: platingData.rinsing_time || "",
            drying_time: platingData.drying_time || "",
            quality_check_time: platingData.quality_check_time || "",
            total_time_spent: platingData.total_time_spent || "",
            time_breakdown: platingData.time_breakdown || "",
            
            // Next stage
            next_stage: platingData.next_stage || "",
            
            // Cost tracking
            material_cost: platingData.material_cost || "",
            labour_cost: platingData.labour_cost || "",
            equipment_cost: platingData.equipment_cost || "",
            chemical_cost: platingData.chemical_cost || "",
            electricity_cost: platingData.electricity_cost || "",
            other_costs: platingData.other_costs || "",
            total_cost: platingData.total_cost || "",
            final_price: platingData.final_price || "",
            markup_percentage: platingData.markup_percentage || "25",
            cost_currency: platingData.cost_currency || "INR",
            cost_status: platingData.cost_status || "estimated",
            
            // Labor cost tracking (new fields)
            selected_labor_costs: selectedLaborCostsArray || [],
            labor_cost_breakdown: laborBreakdownArray || [],
            
            // File tracking
            file_version: platingData.file_version || "1.0",
            file_revisions: platingData.file_revisions || 0,
            file_status: platingData.file_status || "draft",
            backup_location: platingData.backup_location || "",
            files: filesArray || [],
          };
        });

      setPlatingStages(platingStagesData);
      return platingStagesData;
    } catch (err) {
      console.error("Fetch plating stages error:", err);
      setError(err.response?.data?.message || "Failed to load plating stages");
      setPlatingStages([]);
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

  // Fetch labor costs from price making API - INCLUDE PLATING COSTS
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

    selectedLaborCosts.forEach((cost) => {
      const costAmount = parseFloat(cost.cost_amount) || 0;
      totalLaborCost += costAmount;
    });

    console.log(
      "Calculated total labor cost for plating:",
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

  // Fetch units from units API
  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get(API_ENDPOINTS.getUnits());

      let unitsData = [];
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
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

  // Get static plating materials
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError("");
      // Return static materials
      setMaterials(staticPlatingMaterials);
      return staticPlatingMaterials;
    } catch (err) {
      console.error("Fetch materials error:", err);
      setError("Failed to load plating materials");
      setMaterials(staticPlatingMaterials);
      return staticPlatingMaterials;
    } finally {
      setLoading(false);
    }
  };

  // Update Plating stage with files and labor costs
  const updatePlatingStageWithFiles = async (
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
        const material = parseFloat(updateData.material_cost) || 0;
        const equipment = parseFloat(updateData.equipment_cost) || 0;
        const chemical = parseFloat(updateData.chemical_cost) || 0;
        const electricity = parseFloat(updateData.electricity_cost) || 0;
        const other = parseFloat(updateData.other_costs) || 0;
        const markup = parseFloat(updateData.markup_percentage) || 25;

        const total = material + totalLaborCost + equipment + chemical + electricity + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        finalUpdateData.total_cost = total.toFixed(2);
        finalUpdateData.final_price = finalPrice.toFixed(2);
      }

      const url = API_ENDPOINTS.updatePlatingStage(stageId);
      
      const formData = new FormData();

      Object.keys(finalUpdateData).forEach(key => {
        if (key !== 'files' && key !== 'material_name' && key !== 'unit_name') {
          const value = finalUpdateData[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
      });

      if (updateData.files && Array.isArray(updateData.files)) {
        const existingFiles = updateData.files
          .filter(file => file.isExisting)
          .map(file => ({
            id: file.id,
            name: file.name,
            url: file.url,
            size: file.size,
            type: file.type,
            category: file.category || "output",
            version: file.version || "1.0"
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
      console.log("📤 Sending Plating update data:");
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
        await fetchPlatingStages();
        return { success: true, data: res.data.data };
      } else {
        const errorMsg = res.data?.message || "Failed to update Plating stage";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error("Update plating error:", err);
      
      if (err.response) {
        console.error("Response data:", err.response.data);
        const errorMsg = err.response.data?.message || `Error: ${err.response.status}`;
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
        fetchPlatingStages(),
        fetchEmployees(),
        fetchMaterials(),
        fetchUnits(),
        fetchLaborCosts() // Add labor costs fetch
      ]);
    } catch (error) {
      console.error("Error fetching all data:", error);
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }, [fetchPlatingStages]);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    platingStages,
    materials,
    units,
    employees,
    laborCosts, // Export labor costs
    loading,
    error,
    fetchPlatingStages,
    fetchEmployees,
    fetchMaterials,
    fetchUnits,
    fetchLaborCosts, // Export fetch function
    calculateTotalLaborCost, // Export calculation function
    calculateLaborBreakdown, // Export breakdown function
    updatePlatingStageWithFiles,
    fetchAllData,
  };
}