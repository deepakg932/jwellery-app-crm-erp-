import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function usePolishingStages() {
  const [polishingStages, setPolishingStages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [units, setUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Polishing stages
const fetchPolishingStages = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const url = API_ENDPOINTS.getPolishingStages();
    const res = await axios.get(url);

    let jobCardsData = [];

    if (res.data?.success && Array.isArray(res.data.data)) {
      jobCardsData = res.data.data;
    } else if (Array.isArray(res.data)) {
      jobCardsData = res.data;
    }

    console.log("Polishing stages raw data:", jobCardsData);

    const polishingStagesData = jobCardsData
      .filter(jobCard => jobCard.polishing_stage)
      .map(jobCard => {
        const polishingStage = jobCard.polishing_stage;
        const polishingData = polishingStage.data || {};
        const jobCardData = jobCard.job_card || {};
        const assignedTo = polishingStage.assigned_to || {};
        
        return {
          // IDs
          _id: jobCard._id || polishingStage._id,
          polishing_stage_id: polishingStage._id,
          job_card_id: jobCardData._id,
          
          // Job card info
          job_card_no: jobCardData.job_card_no || "N/A",
          design_type: jobCardData.design_type || "N/A",
          job_card_priority: jobCardData.priority,
          job_card_images: jobCardData.images || [],
          job_card_stage: jobCardData.stage,
          job_card_status: jobCardData.status,
          
          // Department info
          department: "POLISHING",
          assigned_department: polishingStage.department,
          
          // Assignment info
          assigned_to: assignedTo._id,
          assigned_name: assignedTo.name,
          assigned_email: assignedTo.email,
          
          // Stage status
          status: polishingStage.status,
          start_date: polishingStage.start_date,
          end_date: polishingStage.end_date,
          completed_at: polishingStage.completed_at,
          remarks: polishingStage.remarks,
          createdAt: jobCard.createdAt,
          
          // Polishing specific fields
          material_used: polishingData.material_used || "Polish compound",
          material_quantity: polishingData.material_quantity || "",
          material_unit: polishingData.material_unit || "",
          polish_type: polishingData.polish_type || "",
          polish_grade: polishingData.polish_grade || "",
          polishing_method: polishingData.polishing_method || "",
          equipment_used: polishingData.equipment_used || "",
          rpm_speed: polishingData.rpm_speed || "",
          pressure_applied: polishingData.pressure_applied || "",
          surface_finish: polishingData.surface_finish || "",
          brightness_level: polishingData.brightness_level || "",
          scratch_removal: polishingData.scratch_removal || "",
          surface_consistency: polishingData.surface_consistency || "",
          defects_noted: polishingData.defects_noted || "",
          rework_required: polishingData.rework_required || false,
          rework_reason: polishingData.rework_reason || "",
          
          // Time tracking
          labour_hours: polishingData.labour_hours || "",
          actual_hours: polishingData.actual_hours || "",
          preparation_time: polishingData.preparation_time || "",
          polishing_time: polishingData.polishing_time || "",
          inspection_time: polishingData.inspection_time || "",
          total_time_spent: polishingData.total_time_spent || "",
          time_breakdown: polishingData.time_breakdown || "",
          
          // Next stage
          next_stage: polishingData.next_stage || "",
          stage: polishingData.stage || "",
          
          // Cost tracking
          material_cost: polishingData.material_cost || "",
          labour_cost: polishingData.labour_cost || "",
          equipment_cost: polishingData.equipment_cost || "",
          consumables_cost: polishingData.consumables_cost || "",
          other_costs: polishingData.other_costs || "",
          total_cost: polishingData.total_cost || "",
          cost_currency: polishingData.cost_currency || "INR",
          cost_status: polishingData.cost_status || "estimated",
          markup_percentage: polishingData.markup_percentage || "25",
          final_price: polishingData.final_price || "",
          
          // File tracking
          file_version: polishingData.file_version || "1.0",
          file_revisions: polishingData.file_revisions || 0,
          file_status: polishingData.file_status || "draft",
          backup_location: polishingData.backup_location || "",
          files: polishingData.files || [],
        };
      });

    setPolishingStages(polishingStagesData);
    return polishingStagesData;
  } catch (err) {
    console.error("Fetch polishing stages error:", err);
    setError(err.response?.data?.message || "Failed to load polishing stages");
    setPolishingStages([]);
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

  // Fetch materials from stock movements API
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
      
      stockMovementsData.forEach(movement => {
        if (movement.items && Array.isArray(movement.items)) {
          movement.items.forEach(item => {
            if (item.inventory_item_id) {
              const materialId = item.inventory_item_id._id;
              if (!materialSet.has(materialId)) {
                materialSet.set(materialId, {
                  _id: materialId,
                  material_id: materialId,
                  name: item.inventory_item_id.name || "",
                  item_code: item.inventory_item_id.item_code || "",
                  description: item.inventory_item_id.description || "",
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
                  branch_id: movement.branch_id
                });
              }
            }
          });
        }
      });

      const materialsList = Array.from(materialSet.values());
      setMaterials(materialsList);
      return materialsList;
    } catch (err) {
      console.error("Fetch materials error:", err);
      setError("Failed to load materials");
      setMaterials([]);
      return [];
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

  // Update Polishing stage
  const updatePolishingStageWithFiles = async (
    stageId,  
    updateData,
    filesToUpload = []
  ) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updatePolishingStage(stageId);
      
      const formData = new FormData();

      Object.keys(updateData).forEach(key => {
        if (key !== 'files' && key !== 'material_name' && key !== 'unit_name') {
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
        await fetchPolishingStages();
        return { success: true, data: res.data.data };
      } else {
        const errorMsg = res.data?.message || "Failed to update Polishing stage";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error("Update polishing error:", err);
      
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

  // Get polish materials options (static for polishing)
  const getPolishMaterials = () => {
    return [
      { value: "polish_compound", label: "Polish Compound", cost: 150 },
      { value: "rouge_compound", label: "Rouge Compound", cost: 180 },
      { value: "diamond_paste", label: "Diamond Paste", cost: 1200 },
      { value: "cerium_oxide", label: "Cerium Oxide", cost: 200 },
      { value: "jewellers_rouge", label: "Jeweller's Rouge", cost: 250 },
      { value: "tripoli_compound", label: "Tripoli Compound", cost: 175 },
      { value: "white_diamond", label: "White Diamond Compound", cost: 300 },
      { value: "green_compound", label: "Green Compound", cost: 220 },
    ];
  };

  // Get polish grade options
  const getPolishGradeOptions = () => {
    return [
      { value: "coarse", label: "Coarse (80-120 grit)" },
      { value: "medium", label: "Medium (120-240 grit)" },
      { value: "fine", label: "Fine (240-400 grit)" },
      { value: "extra_fine", label: "Extra Fine (400-600 grit)" },
      { value: "ultra_fine", label: "Ultra Fine (600-1200 grit)" },
      { value: "mirror_finish", label: "Mirror Finish (1200+ grit)" },
    ];
  };

  // Fetch all initial data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPolishingStages(),
        fetchEmployees(),
        fetchMaterials(),
        fetchUnits()
      ]);
    } catch (error) {
      console.error("Error fetching all polishing data:", error);
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }, [fetchPolishingStages]);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    polishingStages,
    materials,
    units,
    employees,
    loading,
    error,
    getPolishMaterials,
    getPolishGradeOptions,
    fetchPolishingStages,
    fetchEmployees,
    fetchMaterials,
    fetchUnits,
    updatePolishingStageWithFiles,
    fetchAllData,
  };
}