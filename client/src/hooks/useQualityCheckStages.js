import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useQualityCheckStages() {
  const [qualityStages, setQualityStages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [units, setUnits] = useState([]);
  const [laborCosts, setLaborCosts] = useState([]); // Add labor costs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Quality Check stages
  const fetchQualityStages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getQualityCheckStages();
      const res = await axios.get(url);

      let jobCardsData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        jobCardsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        jobCardsData = res.data;
      }

      console.log("Quality Stages Raw Data:", jobCardsData);

      const qualityStagesData = jobCardsData
        .filter(jobCard => jobCard.quality_stage)
        .map(jobCard => {
          const qualityStage = jobCard.quality_stage;
          const qualityData = qualityStage.data || {};
          const jobCardData = jobCard.job_card || {};
          const assignedTo = qualityStage.assigned_to || {};
          
          // Parse files
          let filesArray = [];
          if (qualityData.files) {
            if (Array.isArray(qualityData.files)) {
              if (qualityData.files.length > 0 && typeof qualityData.files[0] === "string") {
                try {
                  const parsedFiles = JSON.parse(qualityData.files[0]);
                  filesArray = Array.isArray(parsedFiles) ? parsedFiles : [];
                } catch (e) {
                  console.error("Error parsing files:", e);
                  filesArray = [];
                }
              } else {
                filesArray = qualityData.files;
              }
            } else if (typeof qualityData.files === "string") {
              try {
                filesArray = JSON.parse(qualityData.files);
              } catch {
                filesArray = [];
              }
            }
          }

          // Parse labor costs
          let selectedLaborCostsArray = [];
          let laborBreakdownArray = [];
          
          if (qualityData.selected_labor_costs) {
            if (Array.isArray(qualityData.selected_labor_costs)) {
              selectedLaborCostsArray = qualityData.selected_labor_costs;
            } else if (typeof qualityData.selected_labor_costs === "string") {
              try {
                selectedLaborCostsArray = JSON.parse(qualityData.selected_labor_costs);
              } catch {
                selectedLaborCostsArray = [];
              }
            }
          }

          if (qualityData.labor_cost_breakdown) {
            if (Array.isArray(qualityData.labor_cost_breakdown)) {
              laborBreakdownArray = qualityData.labor_cost_breakdown;
            } else if (typeof qualityData.labor_cost_breakdown === "string") {
              try {
                laborBreakdownArray = JSON.parse(qualityData.labor_cost_breakdown);
              } catch {
                laborBreakdownArray = [];
              }
            }
          }
          
          // Process check_points array
          const checkPoints = qualityData.check_points || [];
          // If check_points is a single string with commas, split it
          const processedCheckPoints = Array.isArray(checkPoints) 
            ? checkPoints 
            : typeof checkPoints === 'string' 
              ? checkPoints.split(',').map(point => point.trim()).filter(point => point)
              : [];
          
          // Process measuring_tools_used array
          const measuringTools = qualityData.measuring_tools_used || [];
          const processedTools = Array.isArray(measuringTools)
            ? measuringTools
            : typeof measuringTools === 'string'
              ? measuringTools.split(',').map(tool => tool.trim()).filter(tool => tool)
              : [];
          
          // Process defects_detected array
          const defectsDetected = qualityData.defects_detected || [];
          const processedDefects = Array.isArray(defectsDetected)
            ? defectsDetected
            : typeof defectsDetected === 'string'
              ? defectsDetected.split(',').map(defect => defect.trim()).filter(defect => defect)
              : [];

          return {
            // IDs
            _id: jobCard._id || qualityStage._id,
            quality_check_stage_id: qualityStage._id,
            job_card_id: jobCardData._id,
            
            // Job card info
            job_card_no: jobCardData.job_card_no || "N/A",
            design_type: jobCardData.design_type || "N/A",
            job_card_priority: jobCardData.priority,
            job_card_images: jobCardData.images || [],
            job_card_stage: jobCardData.stage,
            job_card_status: jobCardData.status,
            
            // Department info
            department: "QUALITY_CHECK",
            assigned_department: qualityStage.department || "Quality Department",
            
            // Assignment info
            assigned_to: assignedTo._id,
            assigned_name: assignedTo.name,
            assigned_email: assignedTo.email,
            
            // Stage status
            status: qualityStage.status,
            overall_status: qualityData.overall_status || qualityStage.status,
            start_date: qualityStage.start_date,
            end_date: qualityStage.end_date,
            remarks: qualityStage.remarks,
            createdAt: jobCard.createdAt,
            
            // Quality Check specific fields
            check_points: processedCheckPoints,
            overall_status: qualityData.overall_status || "pending",
            dimensions_check: qualityData.dimensions_check || false,
            dimensions_tolerance: qualityData.dimensions_tolerance || "",
            dimensions_notes: qualityData.dimensions_notes || "",
            weight_check: qualityData.weight_check || false,
            weight_tolerance: qualityData.weight_tolerance || "",
            weight_notes: qualityData.weight_notes || "",
            purity_check: qualityData.purity_check || false,
            purity_verified: qualityData.purity_verified || "",
            purity_certificate_no: qualityData.purity_certificate_no || "",
            finish_check: qualityData.finish_check || false,
            finish_quality: qualityData.finish_quality || "",
            finish_defects: qualityData.finish_defects || "",
            defects_detected: processedDefects,
            defects_count: qualityData.defects_count || 0,
            critical_defects: qualityData.critical_defects || 0,
            major_defects: qualityData.major_defects || 0,
            minor_defects: qualityData.minor_defects || 0,
            inspection_method: qualityData.inspection_method || "visual",
            measuring_tools_used: processedTools,
            sample_size: qualityData.sample_size || 1,
            batch_size: qualityData.batch_size || 1,
            accepted_quantity: qualityData.accepted_quantity || 0,
            rejected_quantity: qualityData.rejected_quantity || 0,
            rework_required: qualityData.rework_required || false,
            rework_reason: qualityData.rework_reason || "",
            approved_by: qualityData.approved_by || "",
            approval_date: qualityData.approval_date || "",
            certificate_issued: qualityData.certificate_issued || false,
            certificate_number: qualityData.certificate_number || "",
            
            // Surface quality from previous stages
            surface_finish: qualityData.surface_finish || "",
            adhesion_quality: qualityData.adhesion_quality || "",
            uniformity: qualityData.uniformity || "",
            
            // Cost tracking
            inspection_cost: qualityData.inspection_cost || "",
            labour_cost: qualityData.labour_cost || "",
            equipment_cost: qualityData.equipment_cost || "",
            certification_cost: qualityData.certification_cost || "",
            other_costs: qualityData.other_costs || "",
            total_cost: qualityData.total_cost || "",
            cost_currency: qualityData.cost_currency || "INR",
            cost_status: qualityData.cost_status || "estimated",
            
            // Labor cost tracking (new fields)
            selected_labor_costs: selectedLaborCostsArray || [],
            labor_cost_breakdown: laborBreakdownArray || [],
            
            // Time tracking
            preparation_time: qualityData.preparation_time || "",
            inspection_time: qualityData.inspection_time || "",
            documentation_time: qualityData.documentation_time || "",
            approval_time: qualityData.approval_time || "",
            total_time_spent: qualityData.total_time_spent || "",
            time_breakdown: qualityData.time_breakdown || "",
            
            // Next stage
            next_stage: qualityData.next_stage || "",
            
            // File tracking
            inspection_reports: qualityData.inspection_reports || [],
            defect_images: qualityData.defect_images || [],
            certificates: qualityData.certificates || [],
            files: filesArray || [],
            file_version: qualityData.file_version || "1.0",
            file_revisions: qualityData.file_revisions || 0,
            file_status: qualityData.file_status || "draft",
            backup_location: qualityData.backup_location || "",
          };
        });

      setQualityStages(qualityStagesData);
      return qualityStagesData;
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load quality check stages");
      setQualityStages([]);
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
      
      // Filter for quality department employees
      const qualityEmployees = employeesData.filter(emp => 
        emp.department?.toLowerCase().includes('quality') ||
        emp.role_id?.role_name?.toLowerCase().includes('quality') ||
        emp.role_id?.role_name?.toLowerCase().includes('designer')
      );
      
      setEmployees(qualityEmployees);
      return qualityEmployees;
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
      return [];
    }
  };

  // Fetch labor costs from price making API - INCLUDE QUALITY CHECK COSTS
  const fetchLaborCosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.getPriceMakings());

      console.log("Price making API Response for quality check:", response.data);

      if (response.data?.success && Array.isArray(response.data.data)) {
        // Filter for quality check-related labor costs
        const laborCostData = response.data.data.filter((item) => {
          const costName = item.cost_type_id?.cost_name_id?.cost_name || "";
          const stageName = item.making_stage_id?.stage_name || "";
          const subStageName = item.making_sub_stage_id?.sub_stage_name || "";
          const lowerCaseName = costName.toLowerCase();
          const lowerCaseStage = stageName.toLowerCase();
          const lowerCaseSubStage = subStageName.toLowerCase();
          
          // Include labor costs for quality check stage
          return (
            lowerCaseName.includes("labor") ||
            lowerCaseName.includes("quality") ||
            lowerCaseName.includes("inspection") ||
            lowerCaseName.includes("inspector") ||
            lowerCaseName.includes("check") ||
            lowerCaseName.includes("testing") ||
            lowerCaseName.includes("verification") ||
            lowerCaseName.includes("karigar") ||
            lowerCaseName.includes("craftsman") ||
            lowerCaseName.includes("worker") ||
            lowerCaseStage.includes("quality") ||
            lowerCaseSubStage.includes("quality") ||
            lowerCaseStage.includes("inspection") ||
            lowerCaseSubStage.includes("inspection") ||
            lowerCaseName.includes("गुणवत्ता") ||
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

        console.log("Processed labor costs for quality check:", processedCosts);
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
      "Calculated total labor cost for quality check:",
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

  // Update Quality Check stage with files and labor costs
  const updateQualityStageWithFiles = async (
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
        const inspection = parseFloat(updateData.inspection_cost) || 0;
        const equipment = parseFloat(updateData.equipment_cost) || 0;
        const certification = parseFloat(updateData.certification_cost) || 0;
        const other = parseFloat(updateData.other_costs) || 0;

        const total = inspection + totalLaborCost + equipment + certification + other;

        finalUpdateData.total_cost = total.toFixed(2);
      }

      const url = API_ENDPOINTS.updateQualityCheckStage(stageId);
      
      const formData = new FormData();

      Object.keys(finalUpdateData).forEach(key => {
        if (key !== 'files' && key !== 'inspection_reports' && key !== 'defect_images' && key !== 'certificates') {
          const value = finalUpdateData[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
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
            category: file.category || "inspection",
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

      // Handle new file uploads
      if (filesToUpload.length > 0) {
        filesToUpload.forEach((file, index) => {
          formData.append(`uploaded_files`, file);
        });
      }

      // Debug
      console.log("📤 Sending Quality Check update data:");
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
        await fetchQualityStages();
        return { success: true, data: res.data.data };
      } else {
        const errorMsg = res.data?.message || "Failed to update Quality Check stage";
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
        fetchQualityStages(),
        fetchEmployees(),
        fetchUnits(),
        fetchLaborCosts() // Add labor costs fetch
      ]);
    } catch (error) {
      console.error("Error fetching all data:", error);
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }, [fetchQualityStages]);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    qualityStages,
    employees,
    units,
    laborCosts, // Export labor costs
    loading,
    error,
    fetchQualityStages,
    fetchEmployees,
    fetchUnits,
    fetchLaborCosts, // Export fetch function
    calculateTotalLaborCost, // Export calculation function
    calculateLaborBreakdown, // Export breakdown function
    updateQualityStageWithFiles,
    fetchAllData,
  };
}