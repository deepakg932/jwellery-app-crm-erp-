import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function usePackagingStages() {
  const [packagingStages, setPackagingStages] = useState([]);
  const [employees, setEmployees] = useState([]);
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
        markup_percentage: packagingData.markup_percentage || "",
        cost_currency: packagingData.cost_currency || "INR",
        cost_status: packagingData.cost_status || "estimated",
        
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
        files: stage.files || packagingData.files || [],
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
        emp.role_id?.role_name?.toLowerCase().includes('packaging')
      );
      setEmployees(packagingEmployees);
      return packagingEmployees;
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
      return [];
    }
  };

  // Update Packaging stage
  const updatePackagingStageWithFiles = async (
    stageId,  
    updateData,
    filesToUpload = []
  ) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updatePackagingStage(stageId); // Update with your endpoint
      
      const formData = new FormData();

      Object.keys(updateData).forEach(key => {
        if (key !== 'files' && key !== 'materials_used') {
          const value = updateData[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
      });

      // Handle materials used array
      if (updateData.materials_used && Array.isArray(updateData.materials_used)) {
        formData.append("materials_used", JSON.stringify(updateData.materials_used));
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

      // Handle new file uploads
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

  // Get packaging material options
  const getPackagingMaterialOptions = () => {
    return staticPackagingMaterials.map(material => ({
      ...material,
      label: material.name,
      value: material._id
    }));
  };

  // Fetch all initial data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPackagingStages(),
        fetchEmployees()
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
    loading,
    error,
    getPackagingMaterialOptions,
    fetchPackagingStages,
    fetchEmployees,
    updatePackagingStageWithFiles,
    fetchAllData,
  };
}