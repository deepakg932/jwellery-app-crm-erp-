import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useDesignStages() {
  const [designStages, setDesignStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);

  // Fetch all design stages
const fetchDesignStages = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const url = `${API_ENDPOINTS.getDesignStages()}`;
    console.log("Fetching design stages from:", url);

    const res = await axios.get(url);
    console.log("Design stages API Response:", res.data);

    let stagesData = [];

    // Extract data based on response structure
    if (res.data?.success && Array.isArray(res.data.data)) {
      stagesData = res.data.data;
    } else if (Array.isArray(res.data)) {
      stagesData = res.data;
    } else if (res.data?.data && Array.isArray(res.data.data)) {
      stagesData = res.data.data;
    }

    console.log("Extracted stages data:", stagesData);

    // Format design stages data - now using design_stage structure
    const mappedStages = stagesData.map((jobCard, index) => {
      const designStage = jobCard.design_stage || {};
      const assignedTo = designStage.assigned_to || {};

      return {
        // IDs
        _id: designStage._id || jobCard._id,
        job_card_id: jobCard._id,
        job_card_no: jobCard.job_card_no,
        
        // Basic Information from Design Stage
        assigned_to: assignedTo._id || "",
        assigned_name: assignedTo.name || "Unassigned",
        assigned_email: assignedTo.email || "",
        assigned_department: designStage.department || "Design",
        
        // Stage Status and Timing
        status: designStage.status || "pending",
        stage: jobCard.stage || "design", // This is the overall job card stage
        stage_name: designStage.stage_name || `Design - ${jobCard.job_card_no}`,
        stage_type: jobCard.stage || "design",
        
        // Dates
        start_date: designStage.start_date,
        end_date: designStage.end_date,
        completed_at: designStage.completed_at,
        remarks: designStage.remarks || "",
        createdAt: designStage.createdAt || new Date().toISOString(),
        updatedAt: designStage.updatedAt || new Date().toISOString(),
        
        // Time Tracking
        estimated_hours: designStage.estimated_hours || 0,
        actual_hours: designStage.actual_hours || 0,
        preparation_time: designStage.preparation_time || 0,
        processing_time: designStage.processing_time || 0,
        finishing_time: designStage.finishing_time || 0,
        inspection_time: designStage.inspection_time || 0,
        packaging_time: designStage.packaging_time || 0,
        total_time_spent: designStage.total_time_spent || 0,
        
        // Design Details
        design_notes: designStage.design_notes || "",
        design_specifications: designStage.design_specifications || "",
        
        // Cost Tracking
        material_cost: designStage.material_cost || 0,
        labor_cost: designStage.labor_cost || 0,
        tooling_cost: designStage.tooling_cost || 0,
        machine_cost: designStage.machine_cost || 0,
        other_costs: designStage.other_costs || 0,
        total_cost: designStage.total_cost || 0,
        markup_percentage: designStage.markup_percentage || 0,
        final_price: designStage.final_price || 0,
        cost_currency: designStage.cost_currency || "INR",
        cost_status: designStage.cost_status || "estimated",
        
        // Files
        files: designStage.files || [],
        design_files: designStage.files || [],
        
        // Job Card Details
        job_card_status: jobCard.status || "in_progress",
        job_card_stage: jobCard.stage || "design",
        job_card_priority: jobCard.priority || "medium",
      };
    });

    console.log("Mapped design stages:", mappedStages);
    setDesignStages(mappedStages);
    return mappedStages;
  } catch (err) {
    console.error("Fetch design stages error:", err);

    if (err.response) {
      const errorMessage =
        err.response.data?.message ||
        err.response.data?.error ||
        `Server error: ${err.response.status}`;
      setError(errorMessage);
    } else if (err.request) {
      setError("Network error. Please check your connection.");
    } else {
      console.log("Error fetching design stages:", err.message);
      setError("Failed to load design stages");
    }

    setDesignStages([]);
    return [];
  } finally {
    setLoading(false);
  }
}, []);

  // Fetch employees for assignment
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.getEmployees());

      // Direct extraction based on your API structure
      const employeesData = res.data.data || [];

      setEmployees(employeesData);
      return employeesData;
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
      return [];
    }
  };

  // Update design stage with file uploads
  const updateStageWithFiles = async (
    stageId,
    updateData,
    filesToUpload = [],
  ) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateDesignStage(stageId);
      console.log("Updating stage at:", url, "with data:", updateData);

      // Create FormData for file upload
      const formData = new FormData();

      // Basic Information Fields
      formData.append("assigned_to", updateData.assigned_to || "");
      formData.append("status", updateData.status || "");
      formData.append("start_date", updateData.start_date || "");
      formData.append("end_date", updateData.end_date || "");
      formData.append("remarks", updateData.remarks || "");
      formData.append(
        "estimated_hours",
        parseFloat(updateData.estimated_hours) || 0,
      );
      formData.append("actual_hours", parseFloat(updateData.actual_hours) || 0);
      formData.append("design_notes", updateData.design_notes || "");
      formData.append(
        "design_specifications",
        updateData.design_specifications || "",
      );
      formData.append("stage", updateData.stage || "");
      // formData.append("stage_type", updateData.stage_type || "");

      // Cost Tracking Fields
      formData.append(
        "material_cost",
        parseFloat(updateData.material_cost) || 0,
      );
      formData.append("labor_cost", parseFloat(updateData.labor_cost) || 0);
      formData.append("tooling_cost", parseFloat(updateData.tooling_cost) || 0);
      formData.append("machine_cost", parseFloat(updateData.machine_cost) || 0);
      formData.append("other_costs", parseFloat(updateData.other_costs) || 0);
      formData.append("total_cost", parseFloat(updateData.total_cost) || 0);
      formData.append("cost_currency", updateData.cost_currency || "INR");
      formData.append("cost_status", updateData.cost_status || "estimated");
      formData.append(
        "markup_percentage",
        parseFloat(updateData.markup_percentage) || 30,
      );
      formData.append("final_price", parseFloat(updateData.final_price) || 0);

      // Time Tracking Fields
      formData.append(
        "preparation_time",
        parseFloat(updateData.preparation_time) || 0,
      );
      formData.append(
        "processing_time",
        parseFloat(updateData.processing_time) || 0,
      );
      formData.append(
        "finishing_time",
        parseFloat(updateData.finishing_time) || 0,
      );
      formData.append(
        "inspection_time",
        parseFloat(updateData.inspection_time) || 0,
      );
      formData.append(
        "packaging_time",
        parseFloat(updateData.packaging_time) || 0,
      );
      formData.append(
        "total_time_spent",
        parseFloat(updateData.total_time_spent) || 0,
      );
      formData.append("time_breakdown", updateData.time_breakdown || "");

      // File Tracking Fields
      formData.append("file_version", updateData.file_version || "1.0");
      formData.append(
        "file_revisions",
        parseInt(updateData.file_revisions) || 0,
      );
      formData.append("file_status", updateData.file_status || "draft");
      formData.append("backup_location", updateData.backup_location || "");

      // Handle source and output files as JSON arrays
      formData.append(
        "source_files",
        JSON.stringify(updateData.source_files || []),
      );
      formData.append(
        "output_files",
        JSON.stringify(updateData.output_files || []),
      );

      // Separate existing and new files
      const existingFiles =
        updateData.files
          ?.filter(
            (file) => (file.isExisting || file.isReference) && !file.file,
          )
          .map((file) => ({
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.url,
            category: file.category || "output",
            version: file.version || "1.0",
            isExisting: true,
            uploaded_at: file.uploaded_at || new Date(),
            status: file.status || "existing",
          })) || [];

      const newFiles =
        updateData.files
          ?.filter((file) => !file.isExisting && file.file)
          .map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            category: file.category || "output",
            version: file.version || "1.0",
            status: "new",
          })) || [];

      // Send files info as JSON
      const allFilesInfo = [...existingFiles, ...newFiles];
      formData.append("files_info", JSON.stringify(allFilesInfo));

      // Append new files
      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      // Log all FormData entries for debugging
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        if (pair[0] === "files") {
          console.log(`${pair[0]}: [File] ${pair[1].name}`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      const res = await axios.put(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        // Refresh the stages list
        await fetchDesignStages();
        return { success: true, data: res.data.data };
      } else {
        setError(res.data?.message || "Failed to update stage");
        return { success: false, error: res.data?.message };
      }
    } catch (err) {
      console.error("Update design stage error:", err);

      if (err.response) {
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } else if (err.request) {
        const errorMsg = "Network error. Please check your connection.";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } else {
        const errorMsg = err.message || "Failed to update design stage";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      await fetchDesignStages();
      await fetchEmployees();
    };

    fetchData();
  }, [fetchDesignStages]);

  console.log("Design stages:", designStages);

  return {
    // Data
    designStages,
    employees,

    // Loading states
    loading,

    // Error
    error,

    // Functions
    fetchDesignStages,
    fetchEmployees,
    updateStageWithFiles,
  };
}
