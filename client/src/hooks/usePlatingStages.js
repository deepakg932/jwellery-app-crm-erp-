// hooks/usePlatingStages.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function usePlatingStages() {
  const [platingStages, setPlatingStages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Static plating materials (since you mentioned they're static)
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
          markup_percentage: platingData.markup_percentage || "",
          cost_currency: platingData.cost_currency || "INR",
          cost_status: platingData.cost_status || "estimated",
          
          // File tracking
          file_version: platingData.file_version || "1.0",
          file_revisions: platingData.file_revisions || 0,
          file_status: platingData.file_status || "draft",
          backup_location: platingData.backup_location || "",
          files: platingData.files || [],
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

  // Update Plating stage
  const updatePlatingStageWithFiles = async (
    stageId,
    updateData,
    filesToUpload = []
  ) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updatePlatingStage(stageId);
      
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
        await fetchPlatingStages();
        return { success: true, data: res.data.data };
      } else {
        const errorMsg = res.data?.message || "Failed to update Plating stage";
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
        fetchPlatingStages(),
        fetchEmployees(),
        fetchMaterials()
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
    employees,
    loading,
    error,
    fetchPlatingStages,
    fetchEmployees,
    fetchMaterials,
    updatePlatingStageWithFiles,
    fetchAllData,
  };
}