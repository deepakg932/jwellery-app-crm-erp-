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

      // Format design stages data - we need to check both design_stage and current_stage
      const mappedStages = stagesData.map((jobCard, index) => {
        // First check for current_stage (new structure)
        const currentStage = jobCard.current_stage || {};
        
        // If no current_stage, check for design_stage (old structure)
        const designStage = currentStage._id ? currentStage : jobCard.design_stage || {};
        
        // Extract data from the stage
        const stageData = designStage || {};
console.log(designStage)
        // Extract assigned person details
        let assignedTo = {};
        let assignedName = "Unassigned";
        
        if (designStage.assigned_to) {
          if (typeof designStage.assigned_to === 'object' && designStage.assigned_to.name) {
            assignedTo = designStage.assigned_to;
            assignedName = designStage.assigned_to.name;
          } else if (designStage.assigned_to.name) {
            assignedName = designStage.assigned_to.name;
          }
        } else if (jobCard.assigned_to) {
          assignedTo = jobCard.assigned_to;
          assignedName = jobCard.assigned_to.name || "Unassigned";
        }

        // Get the first item from job card items for product info
        const firstItem =
          jobCard.items && jobCard.items.length > 0 ? jobCard.items[0] : null;

        // Create stage name
        let stageName = designStage.stage_name || "Design Stage";
        if (jobCard.job_card_no) {
          if (firstItem?.product_name) {
            stageName = `${firstItem.product_name} - ${jobCard.job_card_no}`;
          } else {
            stageName = `Job Card: ${jobCard.job_card_no}`;
          }
        }

        // Handle design files from stage data
        const designFiles = stageData.design_files || [];
        const formattedFiles = Array.isArray(designFiles)
          ? designFiles.map((file, fileIndex) => ({
              id: file._id || `file-${index}-${fileIndex}`,
              name: file.name,
              url: file.url,
              size: file.size || 0,
              type: file.type || "image/jpeg",
              uploaded_at: file.uploaded_at || designStage.createdAt,
              isExisting: true,
            }))
          : [];

        // Handle reference images from job card
        const referenceImages = jobCard.images || [];
        // const referenceFiles = Array.isArray(referenceImages)
        //   ? referenceImages.map((image, fileIndex) => ({
        //       id: `ref-${index}-${fileIndex}`,
        //       name: `reference-${fileIndex + 1}`,
        //       url: image.startsWith("http")
        //         ? image
        //         : `http://localhost:5000${image}`,
        //       size: 0,
        //       type: "image/jpeg",
        //       uploaded_at: jobCard.job_card_date || new Date(),
        //       isReference: true,
        //     }))
        //   : [];

        // Combine all files
        const allFiles = [...formattedFiles,];

    

        // Determine stage type - use stage_name or department
        const stageType = designStage.stage_name || 
                         designStage.department?.toLowerCase() || 
                         jobCard.stage?.toLowerCase() || 
                         "unknown";

        return {
          // Stage identification
          _id: designStage._id,
          job_card_id: designStage.job_card_id || jobCard._id,
          job_card_no: jobCard.job_card_no,
          stage_name: stageName,
          stage_code: jobCard.job_card_no,
          stage_type: stageType,
          stage_order: index + 1,

          // Basic Information from Design Stage
          assigned_to: designStage.assigned_to?._id || designStage.assigned_to || "",
          assigned_department: designStage.department || stageType.charAt(0).toUpperCase() + stageType.slice(1),
          assigned_name: assignedName,
          start_date: designStage.start_date,
          end_date: designStage.end_date,
          status: designStage.status || "pending",
          remarks: designStage.remarks || "",
          completed_at: designStage.completed_at,

          // Stage Specific Details from data field
          estimated_hours: stageData.estimated_hours || 0,
          actual_hours: stageData.actual_hours || 0,
          design_notes: stageData.design_notes || "",
          design_specifications: stageData.design_specifications || "",
        //   auto_start_next: stageData.auto_start_next || false,

          // Design Information from Job Card
          design_type: firstItem?.product_name || "Jewelry Design",

          // Files
          files: allFiles,
          design_files: designFiles,

          // Financial Information from Job Card
          design_cost: jobCard.total_amount || 0,


          // Product Details from job card items
          product_info: firstItem
            ? {
                product_id: firstItem.product_id,
                product_name: firstItem.product_name,
                description: firstItem.description,
                quantity: firstItem.quantity,
                unit_price: firstItem.unit_price,
                total_amount: firstItem.total_amount,
                notes: firstItem.notes,
              }
            : null,

          // Job Card Details
          job_card_details: {
            job_card_date: jobCard.job_card_date,
            expected_delivery_date: jobCard.expected_delivery_date,
            delivery_date: jobCard.delivery_date,
            priority: jobCard.priority || "medium",
            note: jobCard.note,
            instructions: jobCard.instructions,
            stage: jobCard.stage,
            status: jobCard.status,
            images: jobCard.images,
          },

          // Timestamps
          created_at: designStage.createdAt || new Date().toISOString(),
          updated_at: designStage.updatedAt || new Date().toISOString(),

          // Additional Financial Information
          total_amount: jobCard.total_amount,
          advance_amount: jobCard.advance_amount,
          balance_amount: jobCard.balance_amount,

          // Additional details
          quotation_number: jobCard.quotation_number,
          priority: jobCard.priority || "medium",
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
    filesToUpload = []
  ) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateDesignStage(stageId);
      console.log("Updating stage at:", url, "with data:", updateData);

      // Create FormData for file upload
      const formData = new FormData();

      // Append all form fields
      formData.append("assigned_to", updateData.assigned_to || "");
      formData.append("status", updateData.status || "");
      formData.append("start_date", updateData.start_date || "");
      formData.append("end_date", updateData.end_date || "");
      formData.append("remarks", updateData.remarks || "");
      formData.append("estimated_hours", updateData.estimated_hours || "");
      formData.append("actual_hours", updateData.actual_hours || "");
      formData.append("design_notes", updateData.design_notes || "");
      formData.append(
        "design_specifications",
        updateData.design_specifications || ""
      );
    //   formData.append("auto_start_next", updateData.auto_start_next || false);
      formData.append("stage", updateData.stage || "");

      // Append existing files as JSON string
      const existingFiles =
        updateData.files
          ?.filter((file) => file.isExisting && !file.isReference)
          .map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.url,
            uploaded_at: file.uploaded_at || new Date(),
          })) || [];

      formData.append("design_files", JSON.stringify(existingFiles));

      // Append new files
      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
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