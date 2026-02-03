import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useCadStages() {
  const [cadStages, setCadStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);

const fetchCadStages = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const url = API_ENDPOINTS.getCadStages();
    console.log("Fetching CAD stages from:", url);

    const res = await axios.get(url);
    console.log("API Response:", res.data);

    let jobCardsData = [];

    // Extract job cards with CAD stages
    if (res.data?.success && Array.isArray(res.data.data)) {
      jobCardsData = res.data.data;
    }

    console.log("Job cards with CAD stages:", jobCardsData);

    // Filter only job cards that have CAD stage
    const cadStagesData = jobCardsData
      .filter(jobCard => jobCard.cad_stage)
      .map(jobCard => {
        const cadStage = jobCard.cad_stage;
        const cadData = cadStage.data || {};
        
        return {
          // Core IDs
          _id: cadStage._id, 
          cad_stage_id: cadStage._id,
          
          // Job Card Info
          job_card_no: jobCard.job_card_no,
          
          // CAD Stage Basic Info
          assigned_to: cadStage.assigned_to?._id,
          assigned_name: cadStage.assigned_to?.name ,
          assigned_department: cadStage.department ,
          status: cadStage.status,
          start_date: cadStage.start_date,
          
          // CAD Data
          cost_status: cadData.cost_status ,
          file_version: cadData.file_version,
          file_revisions: cadData.file_revisions || 0,
          file_status: cadData.file_status,
          files: cadData.files || [],
          
        };
      });

    console.log("Extracted CAD stages:", cadStagesData);
    setCadStages(cadStagesData);
    return cadStagesData;
  } catch (err) {
    console.error("Fetch error:", err);
    setError(err.response?.data?.message || "Failed to load");
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



  // Update CAD stage with file uploads

const updateCadStageWithFiles = async (
  stageId,  
  updateData,
  filesToUpload = []
) => {
  try {
    setLoading(true);
    setError("");

   
    const url = API_ENDPOINTS.updateCadStage(stageId);
  
 
    const requestData = {
      // Basic Information
      assigned_to: updateData.assigned_to || "",
      stage:updateData.stage,
      status: updateData.status || "pending",
      start_date: updateData.start_date || "",
      end_date: updateData.end_date || "",
      estimated_hours: updateData.estimated_hours || "0",
      actual_hours: updateData.actual_hours || "0",
      cad_software: updateData.cad_software || "",
      complexity_level: updateData.complexity_level || "",
      remarks: updateData.remarks || "",
      department: updateData.department || "CAD",

      // Cost Tracking
      material_cost: updateData.material_cost || "0",
      labor_cost: updateData.labor_cost || "0",
      software_cost: updateData.software_cost || "0",
      machine_cost: updateData.machine_cost || "0",
      other_costs: updateData.other_costs || "0",
      total_cost: updateData.total_cost || "0",
      cost_currency: updateData.cost_currency || "INR",
      cost_status: updateData.cost_status || "estimated",
      markup_percentage: updateData.markup_percentage || "30",
      final_price: updateData.final_price || "0",

      // Time Tracking
      design_time: updateData.design_time || "0",
      modeling_time: updateData.modeling_time || "0",
      rendering_time: updateData.rendering_time || "0",
      revision_time: updateData.revision_time || "0",
      review_time: updateData.review_time || "0",
      total_time_spent: updateData.total_time_spent || "0",
      time_breakdown: updateData.time_breakdown || "",

      // File Tracking
      file_version: updateData.file_version || "1.0",
      file_revisions: updateData.file_revisions || "0",
      file_status: updateData.file_status || "draft",
      backup_location: updateData.backup_location || "",
    };


    const formData = new FormData();

    Object.keys(requestData).forEach(key => {
      formData.append(key, requestData[key]);
    });

    // Handle existing files
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

    // Add new files
    if (filesToUpload.length > 0) {
      filesToUpload.forEach((file, index) => {
        formData.append(`uploaded_files`, file);
      });
    }

    // Debug
    for (let [key, value] of formData.entries()) {
      if (key === 'uploaded_files') {
        console.log(`${key}: File - ${value.name}`);
      } else if (key === 'files') {
        console.log(`${key}: ${value.substring(0, 100)}...`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // ✅ **Make API Call**
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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      await fetchCadStages();
      await fetchEmployees();
    };

    fetchData();
  }, [fetchCadStages]);

  return {
    // Data
    cadStages,
    employees,

    // Loading states
    loading,

    // Error
    error,

    // Functions
    fetchCadStages,
    fetchEmployees,
    updateCadStageWithFiles,
  };
}