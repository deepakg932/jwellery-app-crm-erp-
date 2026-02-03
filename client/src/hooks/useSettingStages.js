import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useSettingStages() {
  const [settingStages, setSettingStages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [stones, setStones] = useState([]);
  const [units, setUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
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
            filesArray = data.files;
          } else if (typeof data.files === 'string') {
            try {
              filesArray = JSON.parse(data.files);
            } catch {
              filesArray = [];
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
          stone_secure: data.stone_secure || true,
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
          markup_percentage: data.markup_percentage || 0,
          cost_currency: data.cost_currency || "INR",
          cost_status: data.cost_status || "estimated",
          
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
              
              // Check if it's a stone (based on name or item_code)
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

      const url = API_ENDPOINTS.updateSettingStage(stageId);
      
      const formData = new FormData();

      Object.keys(updateData).forEach(key => {
        if (key !== 'files' && key !== 'stone_name' && key !== 'unit_name') {
          const value = updateData[key];
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

      if (filesToUpload.length > 0) {
        filesToUpload.forEach((file, index) => {
          formData.append(`uploaded_files`, file);
        });
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
        fetchUnits()
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
    loading,
    error,
    fetchSettingStages,
    fetchEmployees,
    fetchMaterials,
    fetchUnits,
    updateSettingStageWithFiles,
    fetchAllData,
  };
}