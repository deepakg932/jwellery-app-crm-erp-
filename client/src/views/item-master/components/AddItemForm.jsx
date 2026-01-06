import React, { useState, useRef, useEffect } from "react";
import { FiUpload, FiX, FiImage, FiPlus, FiTrash2 } from "react-icons/fi";
import Select from "react-select";

const AddItemModal = ({
  onClose,
  onSave,
  loading = false,
  formData,
  getSubcategoriesForCategory,
  generateProductCode,
  getGSTRateValue,
  dropdownLoading = false,
  fetchHallmarksByMetal,
}) => {
  // Destructure formData with default values
  const {
    categories = [],
    metals = [],
    brands = [],
    costTypes = [],
    purities = [],
    units = [],
    stoneTypes = [],
    stonePurities = [],
    makingCharges = [],
    gstRates = [],
    wastageTypes = [],
    hallmarks = [],
    subcategories = {},
    priceMakings = [],
    materialTypes = [],
  } = formData || {};

  // Helper to get ID
  const getId = (item) => item?.id || item?._id || "";

  // Helper to get name
  const getName = (item) => {
    if (!item) return "";
    return (
      item.purity_name ||
      item.stone_purity ||
      item.name ||
      item.stone_type ||
      item.category_name ||
      item.metal_name ||
      item.brand_name ||
      item.stone_name ||
      item.unit_name ||
      item.cost_type ||
      item.sub_category_name ||
      item.wastage_type ||
      item.material_type ||
      ""
    );
  };
  console.log("💠 AddItemModal rendered with formData:", formData);

  // Metals Table State - START EMPTY
  const [metalsData, setMetalsData] = useState([]);

  // Stones Table State - START EMPTY
  const [stones, setStones] = useState([]);

  // Materials & Wastage Table State - START EMPTY
  const [materialsData, setMaterialsData] = useState([]);

  // Form State
  const [formState, setFormState] = useState({
    product_name: "",
    product_code: generateProductCode ? generateProductCode() : "",
    product_brand: "",
    product_category: "",
    product_subcategory: "",
    selected_price_makings: [],
    markup_percentage: 15,
    gst_rate: "",
    gst_total: 0,
    cgst_rate: 0,
    sgst_rate: 0,
    igst_rate: 0,
    utgst_rate: 0,
    gst_rate_numeric: 0,
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentSubcategories, setCurrentSubcategories] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // NEW: State for hallmarks by metal
  const [hallmarksByMetal, setHallmarksByMetal] = useState({});
  const [loadingHallmarks, setLoadingHallmarks] = useState({});

  // Helper function to get wastage type display value
  const getWastageTypeDisplay = (type) => {
    if (!type) return "";
    if (typeof type === "string") return type;
    return type.wastage_type || type.name || "Unknown";
  };

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    console.log("🔄 AddItemModal initialization check:", {
      dropdownLoading,
      isInitialized,
      stonePuritiesCount: stonePurities.length,
      stonePuritiesSample: stonePurities[0],
    });

    if (dropdownLoading) {
      return;
    }

    if (isInitialized) {
      return;
    }

    // Don't initialize if required data is missing
    if (!categories.length || !gstRates.length) {
      console.log("❌ Missing required dropdown data");
      return;
    }

    // Set product code only
    if (generateProductCode && !formState.product_code) {
      setFormState((prev) => ({
        ...prev,
        product_code: generateProductCode(),
      }));
    }

    console.log("✅ Form initialized with empty tables");

    setIsInitialized(true);
  }, [
    dropdownLoading,
    categories,
    metals,
    brands,
    purities,
    units,
    stoneTypes,
    stonePurities,
    wastageTypes,
    gstRates,
    costTypes,
    materialTypes,
    generateProductCode,
    isInitialized,
  ]);
  
  console.log(wastageTypes, "wastageTypes");

  // Fetch subcategories when category changes
  useEffect(() => {
    let subcats = [];

    if (formState.product_category) {
      if (getSubcategoriesForCategory) {
        subcats = getSubcategoriesForCategory(formState.product_category);
      } else {
        if (formData?.subcategories) {
          const categoryIdStr = String(formState.product_category).trim();
          subcats = formData.subcategories[categoryIdStr] || [];
        }
      }

      setCurrentSubcategories(subcats);

      if (formState.product_subcategory) {
        setFormState((prev) => ({
          ...prev,
          product_subcategory: "",
          product_subcategory_name: "",
        }));
      }
    } else {
      setCurrentSubcategories([]);
      if (formState.product_subcategory) {
        setFormState((prev) => ({
          ...prev,
          product_subcategory: "",
          product_subcategory_name: "",
        }));
      }
    }
  }, [formState.product_category, getSubcategoriesForCategory, formData]);

  // ==================== GST HANDLERS ====================

  // Handle GST rate change
  const handleGSTRateChange = (selectedGstId) => {
    const selectedGST = gstRates.find((gst) => getId(gst) === selectedGstId);

    if (selectedGST) {
      const gstTotal = selectedGST.gst_total || selectedGST.value || 0;
      const cgstPercentage = selectedGST.cgst_percentage || 0;
      const sgstPercentage = selectedGST.sgst_percentage || 0;
      const igstPercentage = selectedGST.igst_percentage || 0;
      const utgstPercentage = selectedGST.utgst_percentage || 0;

      setFormState((prev) => ({
        ...prev,
        gst_rate: selectedGstId,
        gst_rate_numeric: gstTotal,
        gst_total: gstTotal,
        cgst_rate: cgstPercentage,
        sgst_rate: sgstPercentage,
        igst_rate: igstPercentage,
        utgst_rate: utgstPercentage,
      }));
    }
  };

  // Get selected GST display value
  const getSelectedGSTDisplay = () => {
    if (!formState.gst_rate) return "Select GST Rate";

    const selected = gstRates.find((gst) => getId(gst) === formState.gst_rate);

    if (!selected) return "Invalid GST Rate";

    const gstTotal = selected.gst_total || selected.value || 0;
    const cgst = selected.cgst_percentage || 0;
    const sgst = selected.sgst_percentage || 0;
    const igst = selected.igst_percentage || 0;
    const utgst = selected.utgst_percentage || 0;

    if (igst > 0) {
      return `IGST ${igst}%`;
    } else {
      let display = `GST ${gstTotal}%`;
      let details = [];
      if (cgst > 0) details.push(`CGST ${cgst}%`);
      if (sgst > 0) details.push(`SGST ${sgst}%`);
      if (utgst > 0) details.push(`UTGST ${utgst}%`);
      if (details.length > 0) {
        display += ` (${details.join(", ")})`;
      }
      return display;
    }
  };

  // Get selected GST object
  const getSelectedGSTObject = () => {
    if (!formState.gst_rate) return null;
    return gstRates.find((gst) => getId(gst) === formState.gst_rate);
  };

  // ==================== TABLE FUNCTIONS ====================

  // Add Metal Row - Creates empty row
  const addMetalRow = () => {
    const newId = Date.now();

    setMetalsData([
      ...metalsData,
      {
        id: newId,
        metal_type: "",
        weight: 0,
        unit: "",
        purity: "",
        hallmark: "", // Add hallmark field
        rate_per_gram: 0,
      },
    ]);
  };

  // Remove Metal Row
  const removeMetal = (id) => {
    setMetalsData(metalsData.filter((metal) => metal.id !== id));
    // Remove hallmarks for this metal
    setHallmarksByMetal(prev => {
      const newHallmarks = { ...prev };
      delete newHallmarks[id];
      return newHallmarks;
    });
  };

  // Add Stone Row - Creates empty row
  const addStoneRow = () => {
    const newId = Date.now();

    setStones([
      ...stones,
      {
        id: newId,
        stone_type: "",
        stone_purity: "",
        stone_purity_display: "",
        size: 0,
        quantity: 1,
        weight: 0,
        price_per_carat: 0,
      },
    ]);
  };

  // Remove Stone Row
  const removeStone = (id) => {
    setStones(stones.filter((stone) => stone.id !== id));
  };

  // Add Material Row - Creates empty row
  const addMaterialRow = () => {
    const newId = Date.now();

    setMaterialsData([
      ...materialsData,
      {
        id: newId,
        wastage_type: "",
        material_type: "",
        weight: 0,
        unit: "",
        rate_per_unit: 0,
      },
    ]);
  };

  // Remove Material Row
  const removeMaterial = (id) => {
    setMaterialsData(materialsData.filter((mat) => mat.id !== id));
  };

  // ==================== UPDATE FUNCTIONS ====================
  const updateMetal = async (id, field, value) => {
    setMetalsData(
      metalsData.map((metal) => {
        if (metal.id !== id) return metal;
        
        const updatedMetal = { ...metal, [field]: value };
        
        // If metal_type changed, fetch hallmarks
        if (field === "metal_type" && value && fetchHallmarksByMetal) {
          // Clear existing hallmark when metal changes
          updatedMetal.hallmark = "";
          
          // Fetch hallmarks for this metal
          setLoadingHallmarks(prev => ({ ...prev, [id]: true }));
          
          fetchHallmarksByMetal(value)
            .then(hallmarks => {
              setHallmarksByMetal(prev => ({
                ...prev,
                [id]: hallmarks
              }));
            })
            .catch(err => {
              console.error("Error fetching hallmarks:", err);
              setHallmarksByMetal(prev => ({
                ...prev,
                [id]: []
              }));
            })
            .finally(() => {
              setLoadingHallmarks(prev => ({ ...prev, [id]: false }));
            });
        }
        
        return updatedMetal;
      })
    );
  };

  // In the updateStone function:
  const updateStone = (id, field, value) => {
    setStones(
      stones.map((stone) => {
        if (stone.id !== id) return stone;

        // Special handling for stone_purity selection
        if (field === "stone_purity_display") {
          // Find the stone purity object by display name
          const stonePurityObj = stonePurities.find(
            (sp) => sp.stone_purity === value || sp.name === value
          );

          return {
            ...stone,
            stone_purity: stonePurityObj
              ? stonePurityObj.id || stonePurityObj._id
              : "", // Store ID
            stone_purity_display: value, // Store display name
          };
        }

        return { ...stone, [field]: value };
      })
    );
  };

  const updateMaterial = (id, field, value) => {
    setMaterialsData(
      materialsData.map((mat) => {
        if (mat.id !== id) return mat;

        return { ...mat, [field]: value };
      })
    );
  };

  // ==================== FORM HANDLERS ====================
  const handleInputChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle image upload
  const handleImageUpload = (files) => {
    const newFiles = Array.from(files).slice(0, 3 - imageFiles.length);
    newFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload only image files");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
    setImageFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formState.product_name.trim())
      newErrors.product_name = "Product name is required";
    if (!formState.product_code.trim())
      newErrors.product_code = "Product code is required";
    if (!formState.product_category)
      newErrors.product_category = "Category is required";
    if (!formState.gst_rate) newErrors.gst_rate = "GST rate is required";

    return newErrors;
  };

  // ==================== CALCULATIONS ====================

  const getMakingChargeAmount = () => {
    if (
      !formState.selected_price_makings ||
      formState.selected_price_makings.length === 0
    ) {
      return 0;
    }

    // Sum all selected making charges
    const totalAmount = formState.selected_price_makings.reduce((sum, pm) => {
      const costAmount = parseFloat(pm.cost_amount) || 0;
      return sum + costAmount;
    }, 0);

    return totalAmount;
  };

  const calculateMetalSubtotal = (metal) => {
    const weight = parseFloat(metal.weight) || 0;
    const rate = parseFloat(metal.rate_per_gram) || 0;
    return weight * rate; // Just return weight * rate
  };

  const calculateStoneSubtotal = (stone) => {
    const quantity = parseFloat(stone.quantity) || 0;
    const weight = parseFloat(stone.weight) || 0;
    const price = parseFloat(stone.price_per_carat) || 0;
    return quantity * weight * price;
  };

  const calculateMaterialCost = (material) => {
    const weight = parseFloat(material.weight) || 0;
    const rate = parseFloat(material.rate_per_unit) || 0;
    return weight * rate;
  };

  const calculateGST = (amount, percentage) => {
    const rateValue = parseFloat(percentage) || 0;
    return (amount * rateValue) / 100;
  };

  // Calculate GST breakdown
  const calculateGSTBreakdown = (amount) => {
    const selectedGST = getSelectedGSTObject();

    if (!selectedGST) {
      return {
        gstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        utgstAmount: 0,
        totalGST: 0,
      };
    }

    const gstTotal = selectedGST.gst_total || selectedGST.value || 0;
    const cgstPercentage = selectedGST.cgst_percentage || 0;
    const sgstPercentage = selectedGST.sgst_percentage || 0;
    const igstPercentage = selectedGST.igst_percentage || 0;
    const utgstPercentage = selectedGST.utgst_percentage || 0;

    const gstAmount = calculateGST(amount, gstTotal);
    const cgstAmount = calculateGST(amount, cgstPercentage);
    const sgstAmount = calculateGST(amount, sgstPercentage);
    const igstAmount = calculateGST(amount, igstPercentage);
    const utgstAmount = calculateGST(amount, utgstPercentage);

    return {
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      utgstAmount,
      totalGST: gstAmount,
    };
  };

  // Totals
  const totalMetalsCost = metalsData.reduce((sum, metal) => {
    const weight = parseFloat(metal.weight) || 0;
    const rate = parseFloat(metal.rate_per_gram) || 0;
    return sum + weight * rate;
  }, 0);
  const totalStonesCost = stones.reduce(
    (sum, stone) => sum + calculateStoneSubtotal(stone),
    0
  );
  const totalMaterialsCost = materialsData.reduce(
    (sum, mat) => sum + calculateMaterialCost(mat),
    0
  );

  // Making charge from selected price making
  const makingChargeAmount = getMakingChargeAmount();

  const grandTotal =
    totalMetalsCost + totalStonesCost + totalMaterialsCost + makingChargeAmount;

  const sellingPriceBeforeTax =
    grandTotal * (1 + (parseFloat(formState.markup_percentage) || 0) / 100);
  const gstBreakdown = calculateGSTBreakdown(sellingPriceBeforeTax);
  const sellingPriceWithGST = sellingPriceBeforeTax + gstBreakdown.totalGST;

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();

    // Add validation for making charges if needed
    if (formState.selected_price_makings.length === 0) {
      formErrors.making_charge = "At least one making charge type is required";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Get selected GST object
    const selectedGST = getSelectedGSTObject();

    // Prepare final data
    const finalData = {
      // Basic info
      product_name: formState.product_name,
      product_code: formState.product_code,

      // IDs
      product_brand: formState.product_brand,
      product_category: formState.product_category,
      product_subcategory: formState.product_subcategory,

      // Multiple making charges
      making_charges: formState.selected_price_makings.map((pm) => ({
        price_making_id: getId(pm),
        cost_type: pm.cost_type || "",
        stage_name: pm.stage_name || "",
        sub_stage_name: pm.sub_stage_name || "",
        cost_amount: parseFloat(pm.cost_amount) || 0,
        unit_name: pm.unit_name || "",
      })),

      total_making_charge_amount: makingChargeAmount,
      
      // Markup
      markup_percentage: parseFloat(formState.markup_percentage) || 15,

      // GST rates - format as strings with % sign
      gst_rate: selectedGST ? `${selectedGST.gst_total || 0}%` : "0%",
      cgst_rate: selectedGST ? `${selectedGST.cgst_percentage || 0}%` : "0%",
      sgst_rate: selectedGST ? `${selectedGST.sgst_percentage || 0}%` : "0%",
      igst_rate: selectedGST ? `${selectedGST.igst_percentage || 0}%` : "0%",
      utgst_rate: selectedGST ? `${selectedGST.utgst_percentage || 0}%` : "0%",

      // Metals - INCLUDING HALLMARK
      metals: metalsData.map((metal) => ({
        metal_type: metal.metal_type,
        purity: metal.purity,
        weight: parseFloat(metal.weight) || 0,
        unit: metal.unit || "g",
        rate_per_gram: parseFloat(metal.rate_per_gram) || 0,
        hallmark: metal.hallmark || "", // Add hallmark
      })),

      // Stones - send IDs with field names that match backend
      stones: stones.map((stone) => ({
        stone_type: stone.stone_type, // This is the ID
        stone_purity: stone.stone_purity, // This is the ID
        size: parseFloat(stone.size) || 0,
        quantity: parseInt(stone.quantity) || 0,
        weight: parseFloat(stone.weight) || 0,
        price_per_carat: parseFloat(stone.price_per_carat) || 0,
      })),

      // Materials - send IDs with field names that match backend
      materials: materialsData.map((material) => ({
        wastage_type: material.wastage_type, // This is the ID
        material_type: material.material_type, // This is the ID
        weight: parseFloat(material.weight) || 0,
        unit: material.unit || "g",
        rate_per_unit: parseFloat(material.rate_per_unit) || 0,
      })),

      // Images
      images: imageFiles,
    };

    console.log("Submitting data to backend:", {
      basicInfo: {
        name: finalData.product_name,
        code: finalData.product_code,
        brandId: finalData.product_brand,
        categoryId: finalData.product_category,
        subcategoryId: finalData.product_subcategory,
      },
      metalsCount: finalData.metals.length,
      metalsWithHallmark: finalData.metals.filter(m => m.hallmark).length,
      stonesCount: finalData.stones.length,
      materialsCount: finalData.materials.length,
    });
    console.log("Metals data with hallmarks:", finalData.metals);
    
    if (onSave) {
      await onSave(finalData);
    }
  };

  const handleClose = () => {
    imagePreviews.forEach((preview) => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });
    onClose();
  };

  // Helper to get display name by ID
  const getDisplayName = (id, array) => {
    if (!id) return "";
    const item = array.find((item) => getId(item) === id);
    return getName(item) || id;
  };

  // Helper to get stone purity display name
  const getStonePurityDisplay = (stonePurityId) => {
    if (!stonePurityId) return "";

    // Try to find by ID first
    let stonePurity = stonePurities.find(
      (sp) => sp.id === stonePurityId || sp._id === stonePurityId
    );

    // If not found by ID, try by name
    if (!stonePurity) {
      stonePurity = stonePurities.find(
        (sp) => sp.stone_purity === stonePurityId || sp.name === stonePurityId
      );
    }

    return stonePurity
      ? stonePurity.stone_purity || stonePurity.name
      : stonePurityId;
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3">
          {/* Header */}
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add New Inventory Item</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div
              className="modal-body"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              {/* Show loading if dropdowns are loading */}
              {dropdownLoading && (
                <div className="alert alert-info mb-4">
                  <div className="d-flex align-items-center">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Loading dropdown data...
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-3 border-bottom pb-2">
                    Basic Information
                  </h6>
                  <div className="mb-3">
                    <label className="form-label">
                      Product Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.product_name ? "is-invalid" : ""
                      }`}
                      value={formState.product_name}
                      onChange={(e) =>
                        handleInputChange("product_name", e.target.value)
                      }
                      disabled={loading || dropdownLoading}
                    />
                    {errors.product_name && (
                      <div className="invalid-feedback">
                        {errors.product_name}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Product Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.product_code ? "is-invalid" : ""
                      }`}
                      value={formState.product_code}
                      onChange={(e) =>
                        handleInputChange("product_code", e.target.value)
                      }
                      disabled={loading || dropdownLoading}
                    />
                    {errors.product_code && (
                      <div className="invalid-feedback">
                        {errors.product_code}
                      </div>
                    )}
                  </div>

                  {/* MAKING CHARGE TYPE */}
                  <div className="mb-3">
                    <label className="form-label">Making Charge Types</label>

                    <Select
                      isMulti
                      options={priceMakings.map((pm) => ({
                        value: getId(pm),
                        label: pm.cost_type,
                        originalData: pm,
                      }))}
                      value={formState.selected_price_makings.map((pm) => ({
                        value: getId(pm),
                        label: pm.cost_type,
                        originalData: pm,
                      }))}
                      onChange={(selectedOptions) => {
                        const selectedPriceMakings = selectedOptions.map(
                          (option) => option.originalData
                        );
                        handleInputChange(
                          "selected_price_makings",
                          selectedPriceMakings
                        );
                      }}
                      placeholder={
                        dropdownLoading || priceMakings.length === 0
                          ? "Loading making charge types..."
                          : "Select Making Charge Types"
                      }
                      isDisabled={
                        loading || dropdownLoading || priceMakings.length === 0
                      }
                      className={`react-select-container ${
                        dropdownLoading ? "opacity-50" : ""
                      }`}
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: errors.making_charge
                            ? "#dc3545"
                            : "#dee2e6",
                          "&:hover": {
                            borderColor: errors.making_charge
                              ? "#dc3545"
                              : "#ced4da",
                          },
                          backgroundColor: state.isDisabled
                            ? "#e9ecef"
                            : "white",
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      }}
                    />

                    {errors.making_charge && (
                      <div className="invalid-feedback d-block">
                        {errors.making_charge}
                      </div>
                    )}

                    <div className="form-text">
                      You can select multiple making charge types
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  {/* CATEGORY */}
                  <div className="mb-3">
                    <label className="form-label">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${
                        errors.product_category ? "is-invalid" : ""
                      } ${dropdownLoading ? "opacity-50" : ""}`}
                      value={formState.product_category}
                      onChange={(e) => {
                        const selectedCategory = categories.find(
                          (cat) => getId(cat) === e.target.value
                        );
                        handleInputChange("product_category", e.target.value);
                        handleInputChange(
                          "product_category_name",
                          getName(selectedCategory) || ""
                        );
                        handleInputChange("product_subcategory", "");
                        handleInputChange("product_subcategory_name", "");
                      }}
                      disabled={
                        loading || dropdownLoading || categories.length === 0
                      }
                    >
                      <option value="">
                        {dropdownLoading || categories.length === 0
                          ? "Loading categories..."
                          : "Select Category"}
                      </option>
                      {categories.map((cat) => (
                        <option key={getId(cat)} value={getId(cat)}>
                          {getName(cat)}
                        </option>
                      ))}
                    </select>
                    {errors.product_category && (
                      <div className="invalid-feedback">
                        {errors.product_category}
                      </div>
                    )}
                  </div>

                  {/* SUBCATEGORY SECTION */}
                  {formState.product_category && !dropdownLoading && (
                    <div className="mb-3">
                      <label className="form-label">Subcategory</label>
                      {currentSubcategories.length > 0 ? (
                        <select
                          className="form-select"
                          value={formState.product_subcategory || ""}
                          onChange={(e) => {
                            const selectedSub = currentSubcategories.find(
                              (sub) => getId(sub) === e.target.value
                            );
                            handleInputChange(
                              "product_subcategory",
                              e.target.value
                            );
                            handleInputChange(
                              "product_subcategory_name",
                              getName(selectedSub) || ""
                            );
                          }}
                          disabled={loading}
                        >
                          <option value="">Select Subcategory</option>
                          {currentSubcategories.map((sub) => (
                            <option key={getId(sub)} value={getId(sub)}>
                              {getName(sub)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="alert alert-light border p-2 text-center">
                          <small className="text-muted">
                            No subcategories available for this category
                          </small>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BRAND */}
                  <div className="mb-3">
                    <label className="form-label">Brand</label>
                    <select
                      className={`form-select ${
                        dropdownLoading ? "opacity-50" : ""
                      }`}
                      value={formState.product_brand}
                      onChange={(e) => {
                        const selectedBrand = brands.find(
                          (brand) => getId(brand) === e.target.value
                        );
                        handleInputChange("product_brand", e.target.value);
                        handleInputChange(
                          "product_brand_name",
                          getName(selectedBrand) || ""
                        );
                      }}
                      disabled={
                        loading || dropdownLoading || brands.length === 0
                      }
                    >
                      <option value="">
                        {dropdownLoading || brands.length === 0
                          ? "Loading brands..."
                          : "Select Brand"}
                      </option>
                      {brands.map((brand) => (
                        <option key={getId(brand)} value={getId(brand)}>
                          {getName(brand)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* GST Section */}
              <div className="card mb-4 border">
                <div className="card-header bg-light">
                  <h6 className="mb-0 fw-bold">GST Details</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-2 mb-3">
                      <label className="form-label">
                        GST Rate <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${
                          errors.gst_rate ? "is-invalid" : ""
                        } ${dropdownLoading ? "opacity-50" : ""}`}
                        value={formState.gst_rate}
                        onChange={(e) => handleGSTRateChange(e.target.value)}
                        disabled={
                          loading || dropdownLoading || gstRates.length === 0
                        }
                      >
                        <option value="">
                          {dropdownLoading || gstRates.length === 0
                            ? "Loading GST rates..."
                            : "Select GST Rate"}
                        </option>
                        {gstRates.map((gst) => {
                          const gstTotal = gst.gst_total || gst.value || 0;
                          let displayLabel = `GST ${gstTotal}%`;
                          return (
                            <option key={getId(gst)} value={getId(gst)}>
                              {displayLabel}
                            </option>
                          );
                        })}
                      </select>
                      {errors.gst_rate && (
                        <div className="invalid-feedback">
                          {errors.gst_rate}
                        </div>
                      )}
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">Total GST</label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          formState.gst_total ? `${formState.gst_total}%` : "0%"
                        }
                        readOnly
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">CGST Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          formState.cgst_rate ? `${formState.cgst_rate}%` : "0%"
                        }
                        readOnly
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">SGST Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          formState.sgst_rate ? `${formState.sgst_rate}%` : "0%"
                        }
                        readOnly
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">IGST Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          formState.igst_rate ? `${formState.igst_rate}%` : "0%"
                        }
                        readOnly
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">UTGST Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        value={
                          formState.utgst_rate
                            ? `${formState.utgst_rate}%`
                            : "0%"
                        }
                        readOnly
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {!dropdownLoading && (
                    <div className="alert alert-info small mb-0 mt-2">
                      <strong>Selected GST:</strong> {getSelectedGSTDisplay()}
                    </div>
                  )}
                </div>
              </div>

              {/* Metals Table - Updated with Hallmark */}
              <div className="card mb-4 border">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Metal Details</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                    onClick={addMetalRow}
                    disabled={loading || dropdownLoading}
                  >
                    <FiPlus /> Add Metal
                  </button>
                </div>
                <div className="card-body p-0">
                  {metalsData.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-muted mb-0">
                        No metals added. Click "Add Metal" to add metal details.
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Metal Type</th>
                            <th>Purity</th>
                            <th>Hallmark</th>
                            <th>Weight</th>
                            <th>Unit</th>
                            <th>Rate/Gram</th>
                            <th>Subtotal</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metalsData.map((metal) => (
                            <tr key={metal.id}>
                              <td>
                                <select
                                  className={`form-select form-select-sm ${
                                    dropdownLoading ? "opacity-50" : ""
                                  }`}
                                  value={metal.metal_type}
                                  onChange={(e) =>
                                    updateMetal(
                                      metal.id,
                                      "metal_type",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    dropdownLoading ||
                                    metals.length === 0
                                  }
                                >
                                  <option value="">
                                    {dropdownLoading || metals.length === 0
                                      ? "Loading metals..."
                                      : "Select Metal"}
                                  </option>
                                  {metals.map((metalItem) => (
                                    <option
                                      key={getId(metalItem)}
                                      value={getId(metalItem)}
                                    >
                                      {getName(metalItem)}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <select
                                  className={`form-select form-select-sm ${
                                    dropdownLoading ? "opacity-50" : ""
                                  }`}
                                  value={metal.purity}
                                  onChange={(e) =>
                                    updateMetal(
                                      metal.id,
                                      "purity",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    dropdownLoading ||
                                    purities.length === 0
                                  }
                                >
                                  <option value="">
                                    {dropdownLoading || purities.length === 0
                                      ? "Loading purities..."
                                      : "Select Purity"}
                                  </option>
                                  {purities.map((purity) => (
                                    <option
                                      key={getId(purity)}
                                      value={getId(purity)}
                                    >
                                      {getName(purity)}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <select
                                  className={`form-select form-select-sm ${
                                    dropdownLoading || loadingHallmarks[metal.id]
                                      ? "opacity-50"
                                      : ""
                                  }`}
                                  value={metal.hallmark || ""}
                                  onChange={(e) =>
                                    updateMetal(
                                      metal.id,
                                      "hallmark",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    dropdownLoading ||
                                    loadingHallmarks[metal.id] ||
                                    !metal.metal_type ||
                                    (hallmarksByMetal[metal.id] || []).length === 0
                                  }
                                >
                                  <option value="">
                                    {loadingHallmarks[metal.id]
                                      ? "Loading hallmarks..."
                                      : !metal.metal_type
                                      ? "Select metal first"
                                      : (hallmarksByMetal[metal.id] || []).length === 0
                                      ? "No hallmarks available"
                                      : "Select Hallmark"}
                                  </option>
                                  {(hallmarksByMetal[metal.id] || []).map((hallmark) => (
                                    <option key={hallmark._id} value={hallmark._id}>
                                      {hallmark.name}
                                    </option>
                                  ))}
                                </select>
                                {metal.hallmark && (
                                  <small className="text-muted d-block mt-1">
                                    Selected: {
                                      (hallmarksByMetal[metal.id] || []).find(
                                        h => h._id === metal.hallmark
                                      )?.name || "Unknown"
                                    }
                                  </small>
                                )}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.001"
                                  className="form-control form-control-sm"
                                  value={metal.weight}
                                  onChange={(e) =>
                                    updateMetal(
                                      metal.id,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <select
                                  className={`form-select form-select-sm ${
                                    dropdownLoading ? "opacity-50" : ""
                                  }`}
                                  value={metal.unit}
                                  onChange={(e) =>
                                    updateMetal(
                                      metal.id,
                                      "unit",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    dropdownLoading ||
                                    units.length === 0
                                  }
                                >
                                  <option value="">
                                    {dropdownLoading || units.length === 0
                                      ? "Loading units..."
                                      : "Select Unit"}
                                  </option>
                                  {units.map((unit) => (
                                    <option
                                      key={getId(unit)}
                                      value={getId(unit) || getName(unit)}
                                    >
                                      {getName(unit)}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control form-control-sm"
                                  value={metal.rate_per_gram}
                                  onChange={(e) =>
                                    updateMetal(
                                      metal.id,
                                      "rate_per_gram",
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td className="fw-bold">
                                ₹{calculateMetalSubtotal(metal).toFixed(2)}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeMetal(metal.id)}
                                  disabled={loading}
                                >
                                  <FiTrash2 />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {metalsData.length > 0 && (
                    <div className="card-footer text-end fw-bold">
                      Total Metals Cost: ₹{totalMetalsCost.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Stones Table - Empty by default */}
              <div className="card mb-4 border">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Stone Details</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                    onClick={addStoneRow}
                    disabled={loading || dropdownLoading}
                  >
                    <FiPlus /> Add Stone
                  </button>
                </div>
                <div className="card-body p-0">
                  {stones.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-muted mb-0">
                        No stones added. Click "Add Stone" to add stone details.
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Stone Type</th>
                            <th>Stone Purity</th>
                            <th>Size (mm)</th>
                            <th>Quantity</th>
                            <th>Weight (Ct)</th>
                            <th>Price/Ct</th>
                            <th>Subtotal</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stones.map((stone) => (
                            <tr key={stone.id}>
                              <td>
                                <select
                                  className={`form-select form-select-sm ${
                                    dropdownLoading ? "opacity-50" : ""
                                  }`}
                                  value={stone.stone_type}
                                  onChange={(e) =>
                                    updateStone(
                                      stone.id,
                                      "stone_type",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    dropdownLoading ||
                                    stoneTypes.length === 0
                                  }
                                >
                                  <option value="">
                                    {dropdownLoading || stoneTypes.length === 0
                                      ? "Loading stones..."
                                      : "Select Stone"}
                                  </option>
                                  {stoneTypes.map((stoneItem) => (
                                    <option
                                      key={getId(stoneItem)}
                                      value={getId(stoneItem)}
                                    >
                                      {getName(stoneItem)}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <select
                                  className={`form-select form-select-sm ${
                                    dropdownLoading ? "opacity-50" : ""
                                  }`}
                                  value={stone.stone_purity_display || ""}
                                  onChange={(e) =>
                                    updateStone(
                                      stone.id,
                                      "stone_purity_display",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    dropdownLoading ||
                                    stonePurities.length === 0
                                  }
                                >
                                  <option value="">
                                    {dropdownLoading ||
                                    stonePurities.length === 0
                                      ? "Loading stone purities..."
                                      : "Select Stone Purity"}
                                  </option>
                                  {stonePurities.map((purityItem) => (
                                    <option
                                      key={
                                        purityItem.stone_purity_id ||
                                        getId(purityItem)
                                      }
                                      value={
                                        purityItem.stone_purity ||
                                        purityItem.name
                                      }
                                    >
                                      {purityItem.stone_purity ||
                                        purityItem.name}
                                    </option>
                                  ))}
                                </select>
                                {stone.stone_purity && !dropdownLoading && (
                                  <small className="text-muted d-block mt-1">
                                    Selected ID: {stone.stone_purity}
                                  </small>
                                )}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control form-control-sm"
                                  value={stone.size}
                                  onChange={(e) =>
                                    updateStone(
                                      stone.id,
                                      "size",
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={stone.quantity}
                                  onChange={(e) =>
                                    updateStone(
                                      stone.id,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.001"
                                  className="form-control form-control-sm"
                                  value={stone.weight}
                                  onChange={(e) =>
                                    updateStone(
                                      stone.id,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control form-control-sm"
                                  value={stone.price_per_carat}
                                  onChange={(e) =>
                                    updateStone(
                                      stone.id,
                                      "price_per_carat",
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td className="fw-bold">
                                ₹{calculateStoneSubtotal(stone).toFixed(2)}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeStone(stone.id)}
                                  disabled={loading}
                                >
                                  <FiTrash2 />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {stones.length > 0 && (
                    <div className="card-footer text-end fw-bold">
                      Total Stones Cost: ₹{totalStonesCost.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Materials & Wastage Table - Empty by default */}
              <div className="card mb-4 border">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Materials & Wastage</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                    onClick={addMaterialRow}
                    disabled={loading || dropdownLoading}
                  >
                    <FiPlus /> Add Row
                  </button>
                </div>
                <div className="card-body p-0">
                  {materialsData.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-muted mb-0">
                        No materials added. Click "Add Row" to add material
                        details.
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Wastage Type</th>
                            <th>Material Type</th>
                            <th>Weight</th>
                            <th>Unit</th>
                            <th>Rate/Unit</th>
                            <th>Cost</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materialsData.map((material) => (
                            <tr key={material.id}>
                              <td>
                                <select
                                  className={`form-select form-select-sm ${
                                    dropdownLoading ? "opacity-50" : ""
                                  }`}
                                  value={material.wastage_type}
                                  onChange={(e) =>
                                    updateMaterial(
                                      material.id,
                                      "wastage_type",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    dropdownLoading ||
                                    wastageTypes.length === 0
                                  }
                                >
                                  <option value="">Select Wastage Type</option>
                                  {wastageTypes.map((type, index) => {
                                    const displayText =
                                      getWastageTypeDisplay(type);
                                    return (
                                      <option key={index} value={displayText}>
                                        {displayText}
                                      </option>
                                    );
                                  })}
                                </select>
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={material.material_type}
                                  onChange={(e) =>
                                    updateMaterial(
                                      material.id,
                                      "material_type",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    (materialTypes.length === 0 &&
                                      metals.length === 0 &&
                                      stoneTypes.length === 0)
                                  }
                                >
                                  <option value="">Select Material Type</option>

                                  {/* Material Types */}
                                  {materialTypes.length > 0 && (
                                    <optgroup label="Material Types">
                                      {materialTypes.map((mt) => (
                                        <option
                                          key={`material-${getId(mt)}`}
                                          value={mt.id || mt._id}
                                        >
                                          {mt.material_type || mt.name}
                                          {mt.metal_name &&
                                            ` (${mt.metal_name})`}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}

                                  {/* Metals */}
                                  {metals.length > 0 && (
                                    <optgroup label="Metals">
                                      {metals.map((metal) => (
                                        <option
                                          key={`metal-${getId(metal)}`}
                                          value={metal.id || metal._id}
                                        >
                                          {metal.name || metal.metal_name}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}

                                  {/* Stone Types */}
                                  {stoneTypes.length > 0 && (
                                    <optgroup label="Stone Types">
                                      {stoneTypes.map((stone) => (
                                        <option
                                          key={`stone-${getId(stone)}`}
                                          value={stone.id || stone._id}
                                        >
                                          {stone.name || stone.stone_type}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.001"
                                  className="form-control form-control-sm"
                                  value={material.weight}
                                  onChange={(e) =>
                                    updateMaterial(
                                      material.id,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <select
                                  className={`form-select form-select-sm ${
                                    dropdownLoading ? "opacity-50" : ""
                                  }`}
                                  value={material.unit}
                                  onChange={(e) =>
                                    updateMaterial(
                                      material.id,
                                      "unit",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    dropdownLoading ||
                                    units.length === 0
                                  }
                                >
                                  <option value="">Select Unit</option>
                                  {units.map((unit) => (
                                    <option
                                      key={getId(unit)}
                                      value={getName(unit)}
                                    >
                                      {getName(unit)}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control form-control-sm"
                                  value={material.rate_per_unit}
                                  onChange={(e) =>
                                    updateMaterial(
                                      material.id,
                                      "rate_per_unit",
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td className="fw-bold">
                                ₹{calculateMaterialCost(material).toFixed(2)}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeMaterial(material.id)}
                                  disabled={loading}
                                >
                                  <FiTrash2 />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {materialsData.length > 0 && (
                    <div className="card-footer text-end fw-bold">
                      Total Materials & Wastage Cost: ₹
                      {totalMaterialsCost.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Summary with GST */}
              {!dropdownLoading && (
                <div className="card mb-4 border">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 fw-bold">Price Summary with GST</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <table className="table table-borderless">
                          <tbody>
                            {metalsData.length > 0 && (
                              <tr>
                                <td className="fw-bold">Total Metals Cost:</td>
                                <td className="text-end">
                                  ₹{totalMetalsCost.toFixed(2)}
                                </td>
                              </tr>
                            )}

                            {/* MAKING CHARGES SECTION IN PRICE SUMMARY */}
                            {formState.selected_price_makings.length > 0 && (
                              <>
                                <tr className="border-top">
                                  <td colSpan="2" className="fw-bold pt-3">
                                    Making Charges:
                                  </td>
                                </tr>

                                {formState.selected_price_makings.map(
                                  (pm, index) => (
                                    <tr key={getId(pm) || index}>
                                      <td className="ps-3">
                                        • {pm.cost_type || "Charge"}
                                  
                                      </td>
                                      <td className="text-end">
                                        ₹
                                        {parseFloat(
                                          pm.cost_amount || 0
                                        ).toFixed(2)}
                                      </td>
                                    </tr>
                                  )
                                )}

                                <tr className="border-top">
                                  <td className="fw-bold">
                                    Total Making Charges:
                                  </td>
                                  <td className="text-end fw-bold">
                                    ₹{makingChargeAmount.toFixed(2)}
                                  </td>
                                </tr>
                              </>
                            )}
                            {stones.length > 0 && (
                              <tr>
                                <td className="fw-bold">Total Stones Cost:</td>
                                <td className="text-end">
                                  ₹{totalStonesCost.toFixed(2)}
                                </td>
                              </tr>
                            )}
                            {materialsData.length > 0 && (
                              <tr>
                                <td className="fw-bold">
                                  Total Materials & Wastage Cost:
                                </td>
                                <td className="text-end">
                                  ₹{totalMaterialsCost.toFixed(2)}
                                </td>
                              </tr>
                            )}

                            {/* SUBTOTAL BEFORE MAKING CHARGE */}
                            {metalsData.length > 0 && (
                              <tr className="border-top">
                                <td className="fw-bold">
                                  Subtotal (Before Making Charge):
                                </td>
                                <td className="text-end">
                                  ₹
                                  {(
                                    totalMetalsCost +
                                    totalStonesCost +
                                    totalMaterialsCost
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            )}

                            <tr className="border-top">
                              <td className="fw-bold">
                                Grand Total (Before Markup):
                              </td>
                              <td className="text-end fw-bold">
                                ₹{grandTotal.toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-bold">
                                Markup ({formState.markup_percentage || 0}%):
                              </td>
                              <td className="text-end">
                                ₹
                                {(
                                  (grandTotal *
                                    (parseFloat(formState.markup_percentage) ||
                                      0)) /
                                  100
                                ).toFixed(2)}
                              </td>
                            </tr>
                            <tr className="border-top">
                              <td className="fw-bold fs-5">
                                Selling Price (Before Tax):
                              </td>
                              <td className="text-end fs-5 fw-bold">
                                ₹{sellingPriceBeforeTax.toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="col-md-6">
                        <table className="table table-borderless">
                          <tbody>
                            {gstBreakdown.cgstAmount > 0 && (
                              <tr>
                                <td className="fw-bold">
                                  CGST ({formState.cgst_rate}%):
                                </td>
                                <td className="text-end">
                                  ₹{gstBreakdown.cgstAmount.toFixed(2)}
                                </td>
                              </tr>
                            )}
                            {gstBreakdown.sgstAmount > 0 && (
                              <tr>
                                <td className="fw-bold">
                                  SGST ({formState.sgst_rate}%):
                                </td>
                                <td className="text-end">
                                  ₹{gstBreakdown.sgstAmount.toFixed(2)}
                                </td>
                              </tr>
                            )}
                            {gstBreakdown.igstAmount > 0 && (
                              <tr>
                                <td className="fw-bold">
                                  IGST ({formState.igst_rate}%):
                                </td>
                                <td className="text-end">
                                  ₹{gstBreakdown.igstAmount.toFixed(2)}
                                </td>
                              </tr>
                            )}
                            {gstBreakdown.utgstAmount > 0 && (
                              <tr>
                                <td className="fw-bold">
                                  UTGST ({formState.utgst_rate}%):
                                </td>
                                <td className="text-end">
                                  ₹{gstBreakdown.utgstAmount.toFixed(2)}
                                </td>
                              </tr>
                            )}

                            <tr className="border-top">
                              <td className="fw-bold">
                                Total GST ({getSelectedGSTDisplay()}):
                              </td>
                              <td className="text-end">
                                ₹{gstBreakdown.totalGST.toFixed(2)}
                              </td>
                            </tr>

                            <tr className="border-top">
                              <td className="fw-bold fs-5 text-success">
                                Final Selling Price (With GST):
                              </td>
                              <td className="text-end fs-5 fw-bold text-success">
                                ₹{sellingPriceWithGST.toFixed(2)}
                              </td>
                            </tr>

                            <tr>
                              <td colSpan="2" className="pt-3">
                                <div className="mb-3">
                                  <label className="form-label">
                                    Markup Percentage (%)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    value={formState.markup_percentage}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "markup_percentage",
                                        e.target.value
                                      )
                                    }
                                    disabled={loading}
                                  />
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Selected Making Charge Details
                    {formState.selected_price_making && (
                      <div className="alert alert-info small mt-3">
                        <strong>Selected Making Charge Details:</strong>
                        <ul className="mb-0 mt-1">
                          <li>
                            Type:{" "}
                            {formState.selected_price_making.cost_type || "N/A"}
                          </li>
                          <li>
                            Stage:{" "}
                            {formState.selected_price_making.stage_name ||
                              "N/A"}
                          </li>
                          <li>
                            Sub-stage:{" "}
                            {formState.selected_price_making.sub_stage_name ||
                              "N/A"}
                          </li>
                          <li>
                            Cost Amount: ₹
                            {formState.selected_price_making.cost_amount || 0}
                          </li>
                          <li>
                            Unit:{" "}
                            {formState.selected_price_making.unit_name ||
                              "Fixed"}
                          </li>
                          <li>
                            Calculated Amount: ₹{makingChargeAmount.toFixed(2)}
                          </li>
                        </ul>
                      </div>
                    )} */}
                  </div>
                </div>
              )}

              {/* Images Section */}
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Product Images (Max 3)
                </label>
                <div className="row">
                  {[0, 1, 2].map((index) => (
                    <div className="col-md-4 mb-3" key={index}>
                      <div
                        className={`border-2 border-dashed rounded-3 text-center cursor-pointer ${
                          dragActive && !imagePreviews[index]
                            ? "border-primary bg-primary bg-opacity-10"
                            : "border-muted"
                        }`}
                        style={{ height: "150px" }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() =>
                          !imagePreviews[index] && fileInputRef.current?.click()
                        }
                      >
                        {imagePreviews[index] ? (
                          <div className="position-relative h-100">
                            <img
                              src={imagePreviews[index]}
                              alt={`Preview ${index + 1}`}
                              className="img-fluid h-100 w-100 rounded"
                              style={{ objectFit: "cover" }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                              disabled={loading}
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="h-100 d-flex flex-column align-items-center justify-content-center">
                            <FiImage className="text-muted mb-2" size={24} />
                            <p className="text-muted small mb-0">
                              Image {index + 1}
                            </p>
                            <p className="text-muted small">Click to upload</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleImageUpload(e.target.files)}
                  accept="image/*"
                  className="d-none"
                  multiple
                  disabled={loading || imageFiles.length >= 3}
                />
                <div className="form-text">
                  Upload up to 3 product images. Supports JPG, PNG, WEBP • Max
                  5MB each
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={loading || dropdownLoading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;