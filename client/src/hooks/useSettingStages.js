import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useSettingStages() {
  const [settingStages, setSettingStages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [stones, setStones] = useState([]);
  const [units, setUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [laborCosts, setLaborCosts] = useState([]); // Add labor costs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Setting stages
  const fetchSettingStages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getSettingStages();
      const res = await axios.get(url);

      let settingStagesData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        settingStagesData = res.data.data.map(item => {
          const stage = item.stone_setting_stage || {};
          const data = stage.data || {};
          const jobCard = item.job_card || {};
          
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
            _id: stage._id || item.stone_stage_id,
            stone_stage_id: item.stone_stage_id,
            job_card_id: jobCard._id || item._id,
            job_card_no: jobCard.job_card_no || "N/A",
            job_card: jobCard,
            stage_name: "Stone Setting",
            design_type: jobCard.design_type || "N/A",
            department: "SETTING",
            assigned_to: stage.assigned_to?._id,
            assigned_name: stage.assigned_to?.name || "Unassigned",
            assigned_department: stage.assigned_to?.department || "SETTING",
            status: stage.status || "not_started",
            start_date: stage.start_date,
            end_date: stage.end_date,
            completed_at: stage.completed_at,
            remarks: stage.remarks || "",
            
            // Stone data
            stone_id: data.stone_id || "",
            stone_type: data.stone_type || "",
            stone_name: data.stone_name || data.stone_type || "",
            stone_item_code: data.stone_item_code || "",
            stone_quantity: data.stone_quantity || 0,
            stone_cost: data.stone_cost || 0,
            stone_cost_total: data.stone_cost_total || 0,
            stone_breakage: data.stone_breakage || 0,
            stone_breakage_reason: data.stone_breakage_reason || "",
            
            // Setting specific data
            setting_type: data.setting_type || "prong",
            setting_method: data.setting_method || "manual",
            tool_used: data.tool_used || "",
            precision_level: data.precision_level || "high",
            stone_secure: data.stone_secure !== undefined ? data.stone_secure : true,
            prong_count: data.prong_count || 4,
            bezel_thickness: data.bezel_thickness || 0,
            
            // Time tracking
            labour_hours: data.labour_hours || 0,
            actual_hours: data.actual_hours || 0,
            setting_time: data.setting_time || 0,
            quality_check_time: data.quality_check_time || 0,
            total_time_spent: data.total_time_spent || 0,
            time_breakdown: data.time_breakdown || "",
            
            // Next stage
            next_stage: data.next_stage || "",
            
            // Cost tracking
            material_cost: data.material_cost || 0,
            labour_cost: data.labour_cost || 0,
            tool_cost: data.tool_cost || 0,
            other_costs: data.other_costs || 0,
            total_cost: data.total_cost || 0,
            final_price: data.final_price || 0,
            markup_percentage: data.markup_percentage || 25,
            cost_currency: data.cost_currency || "INR",
            cost_status: data.cost_status || "estimated",
            
            // Labor cost tracking (new fields)
            selected_labor_costs: selectedLaborCostsArray || [],
            labor_cost_breakdown: laborBreakdownArray || [],
            
            // File tracking
            file_version: data.file_version || "1.0",
            file_revisions: data.file_revisions || 0,
            file_status: data.file_status || "draft",
            backup_location: data.backup_location || "",
            files: filesArray || [],
            
            // Priority from job card
            priority: jobCard.priority || "medium",
            images: jobCard.images || [],
          };
        });
      }

      console.log("Setting stages data:", settingStagesData);
      setSettingStages(settingStagesData);

      return settingStagesData;
    } catch (err) {
      console.error("Fetch setting stages error:", err);
      setError(err.response?.data?.message || "Failed to load setting stages");
      setSettingStages([]);
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

  // Fetch labor costs from price making API - INCLUDE SETTER COSTS
  const fetchLaborCosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.getPriceMakings());

      console.log("Price making API Response for setting:", response.data);

      if (response.data?.success && Array.isArray(response.data.data)) {
        // Filter for setting-related labor costs including setter costs
        const laborCostData = response.data.data.filter((item) => {
          const costName = item.cost_type_id?.cost_name_id?.cost_name || "";
          const stageName = item.making_stage_id?.stage_name || "";
          const subStageName = item.making_sub_stage_id?.sub_stage_name || "";
          const lowerCaseName = costName.toLowerCase();
          const lowerCaseStage = stageName.toLowerCase();
          const lowerCaseSubStage = subStageName.toLowerCase();
          
          // Include labor costs for setting stage
          return (
            lowerCaseName.includes("labor") ||
            lowerCaseName.includes("setter") ||
            lowerCaseName.includes("karigar") ||
            lowerCaseName.includes("craftsman") ||
            lowerCaseName.includes("worker") ||
            lowerCaseName.includes("setting") ||
            lowerCaseStage.includes("setting") ||
            lowerCaseSubStage.includes("setting") ||
            lowerCaseName.includes("सेटर") ||
            lowerCaseName.includes("कारीगर")
          );
        });

        // Process and format labor costs
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

        console.log("Processed labor costs for setting:", processedCosts);
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

    selectedLaborCosts.forEach((cost) => {
      const costAmount = parseFloat(cost.cost_amount) || 0;
      totalLaborCost += costAmount;
    });

    console.log(
      "Calculated total labor cost for setting:",
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

  // Fetch materials and stones from stock movements API
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError("");
      const url = API_ENDPOINTS.getStockMovements();

      const res = await axios.get(url);

      let stockMovementsData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        stockMovementsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        stockMovementsData = res.data;
      }

      const materialSet = new Map();
      const stoneSet = new Map();

      stockMovementsData.forEach((movement) => {
        if (movement.items && Array.isArray(movement.items)) {
          movement.items.forEach((item) => {
            if (item.inventory_item_id) {
              const itemId = item.inventory_item_id._id;
              const itemName = item.inventory_item_id.name?.toLowerCase() || "";
              
              // Check if it's a stone
              const isStone = itemName.includes('diamond') || 
                             itemName.includes('gem') || 
                             itemName.includes('stone') ||
                             itemName.includes('ruby') ||
                             itemName.includes('sapphire') ||
                             itemName.includes('emerald') ||
                             itemName.includes('pearl') ||
                             item.inventory_item_id.item_code?.toLowerCase().includes('stone') ||
                             item.inventory_item_id.item_code?.toLowerCase().includes('dia') ||
                             item.inventory_item_id.item_code?.toLowerCase().includes('gem');

              if (isStone) {
                // It's a stone
                if (!stoneSet.has(itemId)) {
                  const stoneType = itemName.includes('diamond') ? 'diamond' :
                                   itemName.includes('ruby') ? 'ruby' :
                                   itemName.includes('sapphire') ? 'sapphire' :
                                   itemName.includes('emerald') ? 'emerald' :
                                   itemName.includes('pearl') ? 'pearl' : 'gemstone';
                  
                  stoneSet.set(itemId, {
                    _id: itemId,
                    stone_id: itemId,
                    name: item.inventory_item_id.name || "",
                    item_code: item.inventory_item_id.item_code || "",
                    type: stoneType,
                    category: "stone",
                    purity: item.inventory_item_id.purity || "",
                    unit_id: item.unit_id?._id || "",
                    unit_name: item.unit_name || item.unit_id?.name || "",
                    unit_code: item.unit_code || item.unit_id?.code || "",
                    available_quantity: item.received_quantity || 0,
                    available_weight: item.received_weight || 0,
                    cost: item.cost || 0,
                    total_cost: item.total_cost || 0,
                    stock_movement_id: movement._id,
                    po_id: movement.po_id,
                    received_date: movement.received_date,
                    supplier_id: movement.supplier_id,
                    branch_id: movement.branch_id,
                  });
                }
              } else {
                // It's a regular material
                if (!materialSet.has(itemId)) {
                  materialSet.set(itemId, {
                    _id: itemId,
                    material_id: itemId,
                    name: item.inventory_item_id.name || "",
                    item_code: item.inventory_item_id.item_code || "",
                    category: "material",
                    description: "",
                    purity: item.inventory_item_id.purity || "",
                    unit_id: item.unit_id?._id || "",
                    unit_name: item.unit_name || item.unit_id?.name || "",
                    unit_code: item.unit_code || item.unit_id?.code || "",
                    available_quantity: item.received_quantity || 0,
                    available_weight: item.received_weight || 0,
                    cost: item.cost || 0,
                    total_cost: item.total_cost || 0,
                    stock_movement_id: movement._id,
                    po_id: movement.po_id,
                    received_date: movement.received_date,
                    supplier_id: movement.supplier_id,
                    branch_id: movement.branch_id,
                  });
                }
              }
            }
          });
        }
      });

      const materialsList = Array.from(materialSet.values());
      const stonesList = Array.from(stoneSet.values());
      
      setMaterials(materialsList);
      setStones(stonesList);
      
      console.log("Stones fetched:", stonesList);
      console.log("Materials fetched:", materialsList);
      
      return { materials: materialsList, stones: stonesList };
    } catch (err) {
      console.error("Fetch materials error:", err);
      setError("Failed to load materials");
      setMaterials([]);
      setStones([]);
      return { materials: [], stones: [] };
    } finally {
      setLoading(false);
    }
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

  // Update Setting stage
  const updateSettingStageWithFiles = async (
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
        const stoneCost = parseFloat(updateData.stone_cost_total) || 0;
        const material = parseFloat(updateData.material_cost) || 0;
        const tool = parseFloat(updateData.tool_cost) || 0;
        const other = parseFloat(updateData.other_costs) || 0;
        const markup = parseFloat(updateData.markup_percentage) || 25;

        const total = stoneCost + material + totalLaborCost + tool + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        finalUpdateData.total_cost = total.toFixed(2);
        finalUpdateData.final_price = finalPrice.toFixed(2);
      }

      const url = API_ENDPOINTS.updateSettingStage(stageId);
      
      const formData = new FormData();

      Object.keys(finalUpdateData).forEach(key => {
        if (key !== 'files' && key !== 'stone_name' && key !== 'unit_name') {
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
      console.log("📤 Sending Setting update data:");
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
        await fetchSettingStages();
        return { success: true, data: res.data.data };
      } else {
        const errorMsg = res.data?.message || "Failed to update Setting stage";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error("Update error:", err);
      
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
        fetchSettingStages(),
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
  }, [fetchSettingStages]);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    settingStages,
    materials,
    stones,
    units,
    employees,
    laborCosts, // Export labor costs
    loading,
    error,
    fetchSettingStages,
    fetchEmployees,
    fetchMaterials,
    fetchUnits,
    fetchLaborCosts, // Export fetch function
    calculateTotalLaborCost, // Export calculation function
    calculateLaborBreakdown, // Export breakdown function
    updateSettingStageWithFiles,
    fetchAllData,
  };
}