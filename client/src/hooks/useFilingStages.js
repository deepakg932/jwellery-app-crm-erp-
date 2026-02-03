import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useFilingStages() {
  const [filingStages, setFilingStages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [units, setUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tools, setTools] = useState([]);
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
            // If it's an array, use it directly
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

          // Parse files - handle array or JSON string
          let filesArray = [];
          if (data.files) {
            if (Array.isArray(data.files)) {
              if (data.files.length > 0 && typeof data.files[0] === "string") {
                try {
                  // Try to parse the string as JSON
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
            labour_cost: data.labour_cost || 0,
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

            // Material tracking (not in your response but kept for compatibility)
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
    filesToUpload = [],
  ) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateFilingStage(stageId);

      const formData = new FormData();

      Object.keys(updateData).forEach((key) => {
        if (key !== "files" && key !== "material_name" && key !== "unit_name") {
          const value = updateData[key];
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
        await fetchFilingStages();
        return { success: true, data: res.data.data };
      } else {
        const errorMsg = res.data?.message || "Failed to update Filing stage";
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

  // Fetch all initial data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchFilingStages(),
        fetchEmployees(),
        fetchUnits(),
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
    loading,
    error,
    fetchFilingStages,
    fetchEmployees,
    fetchUnits,
    updateFilingStageWithFiles,
    fetchAllData,
  };
}
