import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function usePackagingStages() {
  const [packagingStages, setPackagingStages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [units, setUnits] = useState([]);
  const [laborCosts, setLaborCosts] = useState([]); // Add labor costs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Static packaging materials
  const staticPackagingMaterials = [
    {
      _id: "box_001",
      name: "Jewelry Box",
      item_code: "PACK-BOX-001",
      description: "Premium jewelry box with velvet lining",
      category: "packaging",
      unit: "pieces",
      cost: 50,
      weight: 0.2
    },
    {
      _id: "certificate_001",
      name: "Certificate of Authenticity",
      item_code: "PACK-CERT-001",
      description: "Gold-plated certificate with hologram",
      category: "documentation",
      unit: "pieces",
      cost: 25,
      weight: 0.05
    },
    {
      _id: "cotton_001",
      name: "Premium Cotton Padding",
      item_code: "PACK-COT-001",
      description: "Soft cotton padding for jewelry protection",
      category: "padding",
      unit: "grams",
      cost: 2,
      weight: 0
    },
    {
      _id: "bag_001",
      name: "Premium Carry Bag",
      item_code: "PACK-BAG-001",
      description: "Luxury branded carry bag",
      category: "packaging",
      unit: "pieces",
      cost: 30,
      weight: 0.1
    },
    {
      _id: "polybag_001",
      name: "Poly Bag",
      item_code: "PACK-POLY-001",
      description: "Transparent poly bag for protection",
      category: "packaging",
      unit: "pieces",
      cost: 5,
      weight: 0.01
    },
    {
      _id: "tissue_001",
      name: "Tissue Paper",
      item_code: "PACK-TIS-001",
      description: "Soft tissue paper for wrapping",
      category: "packaging",
      unit: "sheets",
      cost: 1,
      weight: 0
    }
  ];

  // Fetch Packaging stages
  const fetchPackagingStages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getPackagingStages();
      const res = await axios.get(url);

      let packagingStagesData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        packagingStagesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        packagingStagesData = res.data;
      }

      console.log("Packaging stages raw data:", packagingStagesData);

      const processedStages = packagingStagesData.map((stage) => {
        const packagingData = stage.data || {};
        const assignedTo = stage.assigned_to || {};
        
        // Parse files
        let filesArray = [];
        if (packagingData.files) {
          if (Array.isArray(packagingData.files)) {
            if (packagingData.files.length > 0 && typeof packagingData.files[0] === "string") {
              try {
                const parsedFiles = JSON.parse(packagingData.files[0]);
                filesArray = Array.isArray(parsedFiles) ? parsedFiles : [];
              } catch (e) {
                console.error("Error parsing files:", e);
                filesArray = [];
              }
            } else {
              filesArray = packagingData.files;
            }
          } else if (typeof packagingData.files === "string") {
            try {
              filesArray = JSON.parse(packagingData.files);
            } catch {
              filesArray = [];
            }
          }
        }

        // Parse labor costs
        let selectedLaborCostsArray = [];
        let laborBreakdownArray = [];
        
        if (packagingData.selected_labor_costs) {
          if (Array.isArray(packagingData.selected_labor_costs)) {
            selectedLaborCostsArray = packagingData.selected_labor_costs;
          } else if (typeof packagingData.selected_labor_costs === "string") {
            try {
              selectedLaborCostsArray = JSON.parse(packagingData.selected_labor_costs);
            } catch {
              selectedLaborCostsArray = [];
            }
          }
        }

        if (packagingData.labor_cost_breakdown) {
          if (Array.isArray(packagingData.labor_cost_breakdown)) {
            laborBreakdownArray = packagingData.labor_cost_breakdown;
          } else if (typeof packagingData.labor_cost_breakdown === "string") {
            try {
              laborBreakdownArray = JSON.parse(packagingData.labor_cost_breakdown);
            } catch {
              laborBreakdownArray = [];
            }
          }
        }
        
        // Process materials_used array
        const materialsUsed = packagingData.materials_used || [];
        const processedMaterials = Array.isArray(materialsUsed)
          ? materialsUsed
          : typeof materialsUsed === 'string'
            ? materialsUsed.split(',').map(material => material.trim()).filter(material => material)
            : [];

        // Process additional_materials array
        const additionalMaterials = packagingData.additional_materials || [];
        const processedAdditional = Array.isArray(additionalMaterials)
          ? additionalMaterials
          : typeof additionalMaterials === 'string'
            ? additionalMaterials.split(',').map(material => material.trim()).filter(material => material)
            : [];

        // Process defects_detected array
        const defectsDetected = packagingData.defects_detected || [];
        const processedDefects = Array.isArray(defectsDetected)
          ? defectsDetected
          : typeof defectsDetected === 'string'
            ? defectsDetected.split(',').map(defect => defect.trim()).filter(defect => defect)
            : [];

        return {
          // IDs
          _id: stage._id,
          packaging_stage_id: stage._id,
          job_card_id: stage.job_card_id,
          job_card_no: stage.job_card_no,
          
          // Department info
          department: stage.department || "PACKAGING",
          assigned_department: stage.department || "PACKAGING",
          
          // Assignment info
          assigned_to: assignedTo._id,
          assigned_name: assignedTo.name,
          
          // Stage status
          status: stage.status,
          overall_status: packagingData.overall_status || stage.status,
          start_date: stage.start_date,
          end_date: stage.end_date,
          completed_at: stage.completed_at,
          remarks: stage.remarks,
          createdAt: stage.createdAt,
          updatedAt: stage.updatedAt,
          
          // Packaging Materials
          materials_used: processedMaterials,
          box_used: packagingData.box_used || false,
          box_type: packagingData.box_type || "",
          box_quantity: packagingData.box_quantity || "",
          box_cost: packagingData.box_cost || "",
          certificate_used: packagingData.certificate_used || false,
          certificate_type: packagingData.certificate_type || "",
          certificate_quantity: packagingData.certificate_quantity || "",
          certificate_cost: packagingData.certificate_cost || "",
          cotton_used: packagingData.cotton_used || false,
          cotton_quantity: packagingData.cotton_quantity || "",
          cotton_cost: packagingData.cotton_cost || "",
          additional_materials: processedAdditional,
          
          // Surface quality from previous stages
          surface_finish: packagingData.surface_finish || "",
          adhesion_quality: packagingData.adhesion_quality || "",
          uniformity: packagingData.uniformity || "",
          
          // Quality Check
          quality_check: packagingData.quality_check || false,
          quality_score: packagingData.quality_score || "",
          quality_remarks: packagingData.quality_remarks || "",
          defects_detected: processedDefects,
          
          // Cost Tracking
          material_cost: packagingData.material_cost || "",
          labour_cost: packagingData.labour_cost || "",
          equipment_cost: packagingData.equipment_cost || "",
          other_costs: packagingData.other_costs || "",
          total_cost: packagingData.total_cost || "",
          final_price: packagingData.final_price || "",
          markup_percentage: packagingData.markup_percentage || "15",
          cost_currency: packagingData.cost_currency || "INR",
          cost_status: packagingData.cost_status || "estimated",
          
          // Labor cost tracking (new fields)
          selected_labor_costs: selectedLaborCostsArray || [],
          labor_cost_breakdown: laborBreakdownArray || [],
          
          // Time Tracking
          preparation_time: packagingData.preparation_time || "",
          packaging_time: packagingData.packaging_time || "",
          labeling_time: packagingData.labeling_time || "",
          quality_time: packagingData.quality_time || "",
          documentation_time: packagingData.documentation_time || "",
          total_time_spent: packagingData.total_time_spent || "",
          time_breakdown: packagingData.time_breakdown || "",
          
          // Additional Fields
          packaging_type: packagingData.packaging_type || "standard",
          sealing_method: packagingData.sealing_method || "",
          weight_after_packaging: packagingData.weight_after_packaging || "",
          barcode_generated: packagingData.barcode_generated || false,
          barcode_number: packagingData.barcode_number || "",
          invoice_number: packagingData.invoice_number || "",
          
          // File Tracking
          files: filesArray || [],
          file_status: packagingData.file_status || "draft",
          file_version: packagingData.file_version || "1.0",
          file_revisions: packagingData.file_revisions || 0,
          backup_location: packagingData.backup_location || "",
        };
      });

      setPackagingStages(processedStages);
      return processedStages;
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load packaging stages");
      setPackagingStages([]);
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
      // Filter for packaging department employees
      const packagingEmployees = employeesData.filter(emp => 
        emp.department?.toLowerCase().includes('packaging') ||
        emp.role_id?.role_name?.toLowerCase().includes('packaging') ||
        emp.role_id?.role_name?.toLowerCase().includes('designer')
      );
      setEmployees(packagingEmployees);
      return packagingEmployees;
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
      return [];
    }
  };

  // Fetch labor costs from price making API - INCLUDE PACKAGING COSTS
  const fetchLaborCosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.getPriceMakings());

      console.log("Price making API Response for packaging:", response.data);

      if (response.data?.success && Array.isArray(response.data.data)) {
        // Filter for packaging-related labor costs
        const laborCostData = response.data.data.filter((item) => {
          const costName = item.cost_type_id?.cost_name_id?.cost_name || "";
          const stageName = item.making_stage_id?.stage_name || "";
          const subStageName = item.making_sub_stage_id?.sub_stage_name || "";
          const lowerCaseName = costName.toLowerCase();
          const lowerCaseStage = stageName.toLowerCase();
          const lowerCaseSubStage = subStageName.toLowerCase();
          
          // Include labor costs for packaging stage
          return (
            lowerCaseName.includes("labor") ||
            lowerCaseName.includes("packaging") ||
            lowerCaseName.includes("packer") ||
            lowerCaseName.includes("packing") ||
            lowerCaseName.includes("wrapping") ||
            lowerCaseName.includes("boxing") ||
            lowerCaseName.includes("karigar") ||
            lowerCaseName.includes("craftsman") ||
            lowerCaseName.includes("worker") ||
            lowerCaseStage.includes("packaging") ||
            lowerCaseSubStage.includes("packaging") ||
            lowerCaseStage.includes("packing") ||
            lowerCaseSubStage.includes("packing") ||
            lowerCaseName.includes("पैकेजिंग") ||
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

        console.log("Processed labor costs for packaging:", processedCosts);
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
      "Calculated total labor cost for packaging:",
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

  // Get packaging material options
  const getPackagingMaterialOptions = () => {
    return staticPackagingMaterials.map(material => ({
      ...material,
      label: material.name,
      value: material._id
    }));
  };

  // Update Packaging stage with files and labor costs
  const updatePackagingStageWithFiles = async (
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
        const material = parseFloat(updateData.material_cost) || 0;
        const equipment = parseFloat(updateData.equipment_cost) || 0;
        const other = parseFloat(updateData.other_costs) || 0;
        const markup = parseFloat(updateData.markup_percentage) || 15;

        const total = material + totalLaborCost + equipment + other;
        const markupAmount = (total * markup) / 100;
        const finalPrice = total + markupAmount;

        finalUpdateData.total_cost = total.toFixed(2);
        finalUpdateData.final_price = finalPrice.toFixed(2);
      }

      const url = API_ENDPOINTS.updatePackagingStage(stageId);
      
      const formData = new FormData();

      Object.keys(finalUpdateData).forEach(key => {
        if (key !== 'files' && key !== 'materials_used' && key !== 'additional_materials') {
          const value = finalUpdateData[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
      });

      // Handle materials used array
      if (updateData.materials_used && Array.isArray(updateData.materials_used)) {
        formData.append("materials_used", JSON.stringify(updateData.materials_used));
      }

      // Handle additional materials array
      if (updateData.additional_materials && Array.isArray(updateData.additional_materials)) {
        formData.append("additional_materials", JSON.stringify(updateData.additional_materials));
      }

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
      console.log("📤 Sending Packaging update data:");
      for (let [key, value] of formData.entries()) {
        if (key === "uploaded_files") {
          console.log(`${key}: File - ${value.name}`);
        } else if (
          key === "files" ||
          key === "selected_labor_costs" ||
          key === "labor_cost_breakdown" ||
          key === "materials_used" ||
          key === "additional_materials"
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
        await fetchPackagingStages();
        return { success: true, data: res.data.data };
      } else {
        const errorMsg = res.data?.message || "Failed to update Packaging stage";
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
        fetchPackagingStages(),
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
  }, [fetchPackagingStages]);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    packagingStages,
    packagingMaterials: staticPackagingMaterials,
    employees,
    units,
    laborCosts, // Export labor costs
    loading,
    error,
    getPackagingMaterialOptions,
    fetchPackagingStages,
    fetchEmployees,
    fetchUnits,
    fetchLaborCosts, // Export fetch function
    calculateTotalLaborCost, // Export calculation function
    calculateLaborBreakdown, // Export breakdown function
    updatePackagingStageWithFiles,
    fetchAllData,
  };
}