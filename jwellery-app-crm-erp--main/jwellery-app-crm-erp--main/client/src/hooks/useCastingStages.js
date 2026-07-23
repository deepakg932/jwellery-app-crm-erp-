import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useCastingStages() {
  const [castingStages, setCastingStages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [units, setUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [laborCosts, setLaborCosts] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log(laborCosts);

  // Fetch Casting stages
  const fetchCastingStages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch casting stages
      const castingUrl = API_ENDPOINTS.getCastingStages();
      const castingRes = await axios.get(castingUrl);

      let castingStagesData = [];

      if (castingRes.data?.success && Array.isArray(castingRes.data.data)) {
        castingStagesData = castingRes.data.data.map((item) => {
          const stage = item.casting_stage || {};
          const data = stage.data || {};

          return {
            _id: stage._id || item.casting_stage_id,
            casting_stage_id: item.casting_stage_id,
            job_card_id: item._id,
            job_card_no: item.job_card?.job_card_no || "N/A",
            job_card: item.job_card || {},
            stage_name: "Casting",
            design_type: item.job_card?.design_type || "N/A",
            department: "CASTING",
            assigned_to: stage.assigned_to?._id,
            assigned_name: stage.assigned_to?.name || "Unassigned",
            assigned_department: stage.assigned_to?.department || "CASTING",
            status: stage.status || "not_started",
            start_date: stage.start_date,
            end_date: stage.end_date,
            completed_at: stage.completed_at,
            remarks: stage.remarks || "",
            material_id: data.material_id || "",
            material_type: data.material_type || "",
            material_code: data.material_code || "",
            purity: data.purity || "",
            material_issued_qty: data.material_issued_qty || "0",
            material_used_qty: data.material_used_qty || "0",
            material_returned_qty: data.material_returned_qty || "0",
            material_wastage_qty: data.material_wastage_qty || "0",
            material_wastage_type: data.material_wastage_type || "normal",
            material_unit: data.material_unit || "",
            material_unit_id: data.material_unit_id || "",
            casting_method: data.casting_method || "lost_wax",
            mold_type: data.mold_type || "rubber",
            tree_size: data.tree_size || "",
            burnout_time: data.burnout_time || "",
            casting_temperature: data.casting_temperature || "",
            pressure_applied: data.pressure_applied || "",
            vacuum_level: data.vacuum_level || "",
            surface_quality: data.surface_quality || "good",
            dimensional_accuracy:
              data.dimensional_accuracy || "within_tolerance",
            porosity_level: data.porosity_level || "low",
            defects: data.defects || "",
            rework_required: data.rework_required || false,
            rework_reason: data.rework_reason || "",
            labour_hours: data.labour_hours || "0",
            actual_hours: data.actual_hours || "0",
            next_stage: data.next_stage || "",
            stage: data.next_stage || "",
            material_cost: data.material_cost || "0",
            labour_cost: data.labour_cost || "0",
            equipment_cost: data.equipment_cost || "0",
            consumables_cost: data.consumables_cost || "0",
            gas_cost: data.gas_cost || "0",
            other_costs: data.other_costs || "0",
            total_cost: data.total_cost || "0",
            final_price: data.final_price || "0",
            markup_percentage: data.markup_percentage || "25",
            cost_currency: data.cost_currency || "INR",
            cost_status: data.cost_status || "estimated",
            
       
            selected_labor_costs: data.selected_labor_costs || [],
            labor_cost_breakdown: data.labor_cost_breakdown || [],
            labor_cost_breakdown_raw: data.labor_cost_breakdown_raw || [],
            
            preparation_time: data.preparation_time || "0",
            mold_making_time: data.mold_making_time || "0",
            burnout_time_track: data.burnout_time_track || "0",
            casting_time: data.casting_time || "0",
            finishing_time: data.finishing_time || "0",
            quality_check_time: data.quality_check_time || "0",
            total_time_spent: data.total_time_spent || "0",
            time_breakdown: data.time_breakdown || "",
            file_version: data.file_version || "1.0",
            file_revisions: data.file_revisions || 0,
            file_status: data.file_status || "draft",
            backup_location: data.backup_location || "",
            source_files: data.source_files || [],
            output_files: data.output_files || [],
            files: stage.files || [],
            priority: item.job_card?.priority || "medium",
            images: item.job_card?.images || [],
          };
        });
      }

      setCastingStages(castingStagesData);
      return castingStagesData;
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load casting stages");
      setCastingStages([]);
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

      stockMovementsData.forEach((movement) => {
        if (movement.items && Array.isArray(movement.items)) {
          movement.items.forEach((item) => {
            if (item.inventory_item_id) {
              const materialId = item.inventory_item_id._id;
              if (!materialSet.has(materialId)) {
                materialSet.set(materialId, {
                  _id: materialId,
                  material_id: materialId,
                  name: item.inventory_item_id.name || "",
                  item_code: item.inventory_item_id.item_code || "",
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

  // Update Casting stage
  const updateCastingStageWithFiles = async (
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
        finalUpdateData.labour_cost = totalLaborCost.toFixed(2);

        // Recalculate totals with new labor cost
        const material = parseFloat(updateData.material_cost) || 0;
        const equipment = parseFloat(updateData.equipment_cost) || 0;
        const consumables = parseFloat(updateData.consumables_cost) || 0;
        const gas = parseFloat(updateData.gas_cost) || 0;
        const other = parseFloat(updateData.other_costs) || 0;
        const markup = parseFloat(updateData.markup_percentage) || 25;

        const total = material + totalLaborCost + equipment + consumables + gas + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        finalUpdateData.total_cost = total.toFixed(2);
        finalUpdateData.final_price = finalPrice.toFixed(2);
      }

      const url = API_ENDPOINTS.updateCastingStage(stageId);

      const formData = new FormData();

      Object.keys(finalUpdateData).forEach((key) => {
        if (key !== "files" && key !== "material_name" && key !== "unit_name") {
          const value = finalUpdateData[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
      });

      if (finalUpdateData.files && Array.isArray(finalUpdateData.files)) {
        const existingFiles = finalUpdateData.files
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
        finalUpdateData.selected_labor_costs &&
        Array.isArray(finalUpdateData.selected_labor_costs)
      ) {
        formData.append(
          "selected_labor_costs",
          JSON.stringify(
            finalUpdateData.selected_labor_costs.map((cost) => cost._id),
          ),
        );
      }

      // Append labor breakdown as JSON
      if (
        finalUpdateData.labor_cost_breakdown &&
        Array.isArray(finalUpdateData.labor_cost_breakdown)
      ) {
        formData.append(
          "labor_cost_breakdown",
          JSON.stringify(finalUpdateData.labor_cost_breakdown),
        );
      }

      if (filesToUpload.length > 0) {
        filesToUpload.forEach((file, index) => {
          formData.append(`uploaded_files`, file);
        });
      }

      // Debug
      console.log("📤 Sending Casting update data:");
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
        await fetchCastingStages();
        return { success: true, data: res.data.data };
      } else {
        const errorMsg = res.data?.message || "Failed to update Casting stage";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error("Update error:", err);

      if (err.response) {
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

  // Get purity options from materials (dynamic)
  const getPurityOptions = () => {
    const uniquePurities = new Set();

    materials.forEach((material) => {
      if (material.purity && material.purity.trim() !== "") {
        uniquePurities.add(material.purity);
      }
    });

    const purityOptions = Array.from(uniquePurities).map((purity) => ({
      value: purity,
      label: purity,
    }));

    return purityOptions;
  };

  // Fetch all initial data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCastingStages(),
        fetchEmployees(),
        fetchMaterials(),
        fetchUnits(),
        fetchLaborCosts(), 
      ]);
    } catch (error) {
      console.error("Error fetching all data:", error);
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }, [fetchCastingStages]);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    castingStages,
    materials,
    units,
    employees,
    laborCosts, 
    loading,
    error,
    getPurityOptions,
    fetchCastingStages,
    fetchEmployees,
    fetchMaterials,
    fetchUnits,
    fetchLaborCosts, 
    calculateTotalLaborCost,
    calculateLaborBreakdown,
    updateCastingStageWithFiles,
    fetchAllData,
  };
}