import React, { useState, useEffect, useRef } from "react";
import { FiUpload, FiX, FiImage, FiPlus, FiTrash2 } from "react-icons/fi";
import Select from "react-select";

const EditItemModal = ({
  show,
  onHide,
  onSubmit,
  item,
  loading = false,
  formData,
  getSubcategoriesForCategory,
  getGSTRateValue,
  dropdownLoading = false,
  fetchHallmarksByMetal,
}) => {
  // Destructure formData with default values
  const {
    categories = [],
    metals = [],
    brands = [],
    purities = [],
    units = [],
    stoneTypes = [],
    stonePurities = [],
    gstRates = [],
    wastageTypes = [],
    materialTypes = [],
    hallmarks = [],
    priceMakings = [],
    subcategories = {},
  } = formData || {};

  console.log("📦 EditItemModal received props:", {
    item,
    hasFormData: !!formData,
    categoriesCount: categories?.length || 0,
    metalsCount: metals?.length || 0,
    hallmarksCount: hallmarks?.length || 0,
    priceMakingsCount: priceMakings?.length || 0,
  });

  // Metals Table State
  const [metalsData, setMetalsData] = useState([]);

  // Stones Table State
  const [stones, setStones] = useState([]);

  // Materials Table State
  const [materialsData, setMaterialsData] = useState([]);

  // Price Makings State (price_making_costs)
  const [priceMakingCosts, setPriceMakingCosts] = useState([]);

  // Form State
  const [formState, setFormState] = useState({
    product_name: "",
    article_no: "", // Fixed: Use article_no instead of product_code
    product_brand: "",
    product_category: "",
    product_subcategory: "",
    markup_percentage: 15,
    gst_rate: "0%",
    cgst_rate: "0%",
    sgst_rate: "0%",
    igst_rate: "0%",
    utgst_rate: "0%",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentSubcategories, setCurrentSubcategories] = useState([]);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Hallmark states
  const [hallmarksByMetal, setHallmarksByMetal] = useState({});
  const [loadingHallmarks, setLoadingHallmarks] = useState({});

  // Helper function to get wastage type display value
  const getWastageTypeDisplay = (type) => {
    if (!type) return "";
    if (typeof type === "string") return type;
    return type.wastage_type || type.name || "Unknown";
  };

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

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    if (!item) return;

    console.log("Initializing edit form with item:", item);

    // Helper to find ID by name in dropdown data
    const findIdByName = (name, array) => {
      if (!name || !array) return "";
      const found = array.find(
        (item) =>
          item.name === name ||
          item.product_brand === name ||
          item.metal_type === name ||
          item.stone_type === name ||
          item.material_type === name ||
          item.wastage_type === name,
      );
      return found ? getId(found) : name;
    };

    // Helper to find ID for purity
    const findPurityId = (purityName) => {
      if (!purityName) return "";
      const found = purities.find(
        (p) => p.purity_name === purityName || p.name === purityName,
      );
      return found ? getId(found) : purityName;
    };

    // Helper to find ID for stone purity
    const findStonePurityId = (purityName) => {
      if (!purityName) return "";
      const found = stonePurities.find(
        (sp) => sp.stone_purity === purityName || sp.name === purityName,
      );
      return found ? getId(found) : purityName;
    };

    // Set form state from item
    setFormState({
      product_name: item.product_name || "",
      article_no: item.article_no || "", // Fixed: Use article_no
      product_brand: item.product_brand_id?._id || item.product_brand || "",
      product_category:
        item.product_category_id?._id || item.product_category || "",
      product_subcategory:
        item.product_subcategory_id?._id || item.product_subcategory || "",
      markup_percentage: item.markup_percentage || 15,
      gst_rate: item.gst_rate || "0%",
      cgst_rate: item.cgst_rate || "0%",
      sgst_rate: item.sgst_rate || "0%",
      igst_rate: item.igst_rate || "0%",
      utgst_rate: item.utgst_rate || "0%",
    });

    // Initialize price making costs from item
    if (item.price_making_costs) {
      const formattedPriceMakings = item.price_making_costs.map(
        (cost, index) => ({
          id: Date.now() + 3000 + index,
          price_making_id: cost.price_making_id || getId(cost),
          stage_name: cost.stage_name || "",
          sub_stage_name: cost.sub_stage_name || "",
          cost_type: cost.cost_type || "",
          unit_name: cost.unit_name || "",
          cost_amount: cost.cost_amount || 0,
          is_active: cost.is_active !== undefined ? cost.is_active : true,
        }),
      );
      setPriceMakingCosts(formattedPriceMakings);
    }

    // Initialize metals data
    const formattedMetals = (item.metals || []).map((metal, index) => {
      // Try to get metal_type ID from metals dropdown
      let metalTypeId = "";
      if (metal.metal_id) {
        metalTypeId = getId(metal.metal_id);
      } else if (metal.metal_type) {
        metalTypeId = findIdByName(metal.metal_type, metals);
      }

      // Try to get purity ID
      let purityId = "";
      if (metal.purity_id) {
        purityId = getId(metal.purity_id);
      } else if (metal.purity) {
        purityId = findPurityId(metal.purity);
      }

      // Try to get unit ID
      let unitId = "";
      if (metal.unit) {
        const foundUnit = units.find(
          (u) =>
            u.name === metal.unit ||
            u.unit_name === metal.unit ||
            getId(u) === getId(metal.unit),
        );
        unitId = foundUnit ? getId(foundUnit) : metal.unit;
      }

      // Get hallmark ID if exists
      let hallmarkId = "";
      if (metal.hallmark_id) {
        hallmarkId = getId(metal.hallmark_id);
      } else if (metal.hallmark) {
        hallmarkId = getId(metal.hallmark);
      }

      return {
        id: Date.now() + index,
        metal_type: metalTypeId,
        purity: purityId,
        hallmark: hallmarkId,
        weight: metal.weight || 0,
        unit: unitId,
        rate_per_gram: metal.rate_per_gram || 0,
        making_charge_type: metal.making_charge_type || "Fixed",
      };
    });
    console.log("Formatted metals:", formattedMetals);
    setMetalsData(formattedMetals);

    // Initialize stones data
    const formattedStones = (item.stones || []).map((stone, index) => {
      // Try to get stone_type ID
      let stoneTypeId = "";
      if (stone.stone_id) {
        stoneTypeId = getId(stone.stone_id);
      } else if (stone.stone_type) {
        stoneTypeId = findIdByName(stone.stone_type, stoneTypes);
      }

      // Try to get stone_purity ID
      let stonePurityId = "";
      if (stone.stone_purity_id) {
        stonePurityId = getId(stone.stone_purity_id);
      } else if (stone.stone_purity) {
        stonePurityId = findStonePurityId(stone.stone_purity);
      }

      return {
        id: Date.now() + 1000 + index,
        stone_type: stoneTypeId,
        stone_purity: stonePurityId,
        size: stone.size || 0,
        quantity: stone.quantity || 0,
        weight: stone.weight || 0,
        price_per_carat: stone.price_per_carat || 0,
      };
    });
    console.log("Formatted stones:", formattedStones);
    setStones(formattedStones);

    // Initialize materials data
    const formattedMaterials = (item.materials || []).map((material, index) => {
      // Try to get wastage_type ID
      let wastageTypeId = "";
      if (material.wastage_id) {
        wastageTypeId = getId(material.wastage_id);
      } else if (material.wastage_type) {
        wastageTypeId = findIdByName(material.wastage_type, wastageTypes);
      }

      // Try to get material_type ID
      let materialTypeId = "";
      if (material.material_id) {
        materialTypeId = getId(material.material_id);
      } else if (material.material_type) {
        materialTypeId = findIdByName(material.material_type, materialTypes);
      }

      // Try to get unit
      let unitId = "";
      if (material.unit) {
        const foundUnit = units.find(
          (u) =>
            u.name === material.unit ||
            u.unit_name === material.unit ||
            getId(u) === getId(material.unit),
        );
        unitId = foundUnit ? getId(foundUnit) : material.unit;
      }

      return {
        id: Date.now() + 2000 + index,
        wastage_type: wastageTypeId,
        material_type: materialTypeId,
        weight: material.weight || 0,
        unit: unitId,
        rate_per_unit: material.rate_per_unit || 0,
      };
    });
    console.log("Formatted materials:", formattedMaterials);
    setMaterialsData(formattedMaterials);

    // Handle images - FIXED: Use images array from response
    const itemImages = item.images || item.fullImageUrls || [];
    console.log("Item images:", itemImages);
    setExistingImages(itemImages);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
    setErrors({});
  }, [
    item,
    metals,
    purities,
    units,
    stoneTypes,
    stonePurities,
    wastageTypes,
    materialTypes,
    priceMakings,
  ]);

  // Fetch hallmarks for each metal when metals data is initialized
  useEffect(() => {
    const fetchHallmarksForMetals = async () => {
      const promises = metalsData.map(async (metal) => {
        if (metal.metal_type && fetchHallmarksByMetal) {
          try {
            setLoadingHallmarks((prev) => ({ ...prev, [metal.id]: true }));
            const hallmarks = await fetchHallmarksByMetal(metal.metal_type);
            setHallmarksByMetal((prev) => ({
              ...prev,
              [metal.id]: hallmarks,
            }));
          } catch (err) {
            console.error("Error fetching hallmarks:", err);
            setHallmarksByMetal((prev) => ({
              ...prev,
              [metal.id]: [],
            }));
          } finally {
            setLoadingHallmarks((prev) => ({ ...prev, [metal.id]: false }));
          }
        }
      });

      Promise.all(promises);
    };

    if (metalsData.length > 0) {
      fetchHallmarksForMetals();
    }
  }, [metalsData, fetchHallmarksByMetal]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formState.product_category) {
      let subcats = [];

      if (getSubcategoriesForCategory) {
        subcats = getSubcategoriesForCategory(formState.product_category);
      } else if (formData?.subcategories) {
        const categoryIdStr = String(formState.product_category).trim();
        subcats = formData.subcategories[categoryIdStr] || [];
      }

      setCurrentSubcategories(subcats);
    } else {
      setCurrentSubcategories([]);
    }
  }, [formState.product_category, getSubcategoriesForCategory, formData]);

  // ==================== GST HANDLERS ====================
  const handleGSTRateChange = (selectedGstId) => {
    console.log("Selected GST ID:", selectedGstId);

    const selectedGST = gstRates.find((gst) => getId(gst) === selectedGstId);

    if (selectedGST) {
      const gstTotal = selectedGST.gst_total || selectedGST.value || 0;
      const cgstPercentage = selectedGST.cgst_percentage || 0;
      const sgstPercentage = selectedGST.sgst_percentage || 0;
      const igstPercentage = selectedGST.igst_percentage || 0;
      const utgstPercentage = selectedGST.utgst_percentage || 0;

      setFormState((prev) => ({
        ...prev,
        gst_rate: `${gstTotal}%`,
        cgst_rate: `${cgstPercentage}%`,
        sgst_rate: `${sgstPercentage}%`,
        igst_rate: `${igstPercentage}%`,
        utgst_rate: `${utgstPercentage}%`,
      }));
    }
  };

  // ==================== PRICE MAKING COSTS FUNCTIONS ====================
  const addPriceMakingRow = () => {
    const newId = Date.now() + 3000 + priceMakingCosts.length;

    setPriceMakingCosts([
      ...priceMakingCosts,
      {
        id: newId,
        price_making_id: priceMakings.length > 0 ? getId(priceMakings[0]) : "",
        stage_name: "",
        sub_stage_name: "",
        cost_type: "",
        unit_name: "",
        cost_amount: 0,
        is_active: true,
      },
    ]);
  };

  const removePriceMaking = (id) => {
    setPriceMakingCosts(priceMakingCosts.filter((cost) => cost.id !== id));
  };

  const updatePriceMaking = (id, field, value) => {
    setPriceMakingCosts(
      priceMakingCosts.map((cost) => {
        if (cost.id !== id) return cost;
        return { ...cost, [field]: value };
      }),
    );
  };

  // ==================== TABLE FUNCTIONS ====================
  const addMetalRow = () => {
    const newId = Date.now();

    setMetalsData([
      ...metalsData,
      {
        id: newId,
        metal_type: metals.length > 0 ? getId(metals[0]) : "",
        purity: purities.length > 0 ? getId(purities[0]) : "",
        hallmark: "",
        weight: 0,
        unit: units.length > 0 ? getId(units[0]) : "",
        rate_per_gram: 0,
        making_charge_type: "Fixed",
      },
    ]);
  };

  const removeMetal = (id) => {
    setMetalsData(metalsData.filter((metal) => metal.id !== id));
    // Remove hallmarks for this metal
    setHallmarksByMetal((prev) => {
      const newHallmarks = { ...prev };
      delete newHallmarks[id];
      return newHallmarks;
    });
  };

  const addStoneRow = () => {
    const newId = Date.now();

    setStones([
      ...stones,
      {
        id: newId,
        stone_type: stoneTypes.length > 0 ? getId(stoneTypes[0]) : "",
        stone_purity: stonePurities.length > 0 ? getId(stonePurities[0]) : "",
        size: 0,
        quantity: 0,
        weight: 0,
        price_per_carat: 0,
      },
    ]);
  };

  const removeStone = (id) => {
    setStones(stones.filter((stone) => stone.id !== id));
  };

  const addMaterialRow = () => {
    const newId = Date.now();

    setMaterialsData([
      ...materialsData,
      {
        id: newId,
        wastage_type: wastageTypes.length > 0 ? getId(wastageTypes[0]) : "",
        material_type: materialTypes.length > 0 ? getId(materialTypes[0]) : "",
        weight: 0,
        unit: units.length > 0 ? getId(units[0]) : "",
        rate_per_unit: 0,
      },
    ]);
  };

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
          setLoadingHallmarks((prev) => ({ ...prev, [id]: true }));

          fetchHallmarksByMetal(value)
            .then((hallmarks) => {
              setHallmarksByMetal((prev) => ({
                ...prev,
                [id]: hallmarks,
              }));
            })
            .catch((err) => {
              console.error("Error fetching hallmarks:", err);
              setHallmarksByMetal((prev) => ({
                ...prev,
                [id]: [],
              }));
            })
            .finally(() => {
              setLoadingHallmarks((prev) => ({ ...prev, [id]: false }));
            });
        }

        return updatedMetal;
      }),
    );
  };

  const updateStone = (id, field, value) => {
    setStones(
      stones.map((stone) => {
        if (stone.id !== id) return stone;
        return { ...stone, [field]: value };
      }),
    );
  };

  const updateMaterial = (id, field, value) => {
    setMaterialsData(
      materialsData.map((mat) => {
        if (mat.id !== id) return mat;
        return { ...mat, [field]: value };
      }),
    );
  };

  // ==================== FORM HANDLERS ====================
  const handleInputChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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
      handleNewImageUpload(files);
    }
  };

  // FIXED: Proper image upload handling
  const handleNewImageUpload = (files) => {
    const availableSlots =
      3 -
      (existingImages.length - imagesToDelete.length + newImageFiles.length);
    const newFiles = Array.from(files).slice(0, availableSlots);

    const validFiles = [];
    const validPreviews = [];

    newFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload only image files");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      validFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        validPreviews.push(e.target.result);
        // Update state only when all previews are ready
        if (validPreviews.length === validFiles.length) {
          setNewImagePreviews((prev) => [...prev, ...validPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setNewImageFiles((prev) => [...prev, ...validFiles]);
    }
  };

  // FIXED: Image removal functions
  const removeExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete((prev) => [...prev, imageToDelete]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const restoreImage = (imageUrl) => {
    setImagesToDelete((prev) => prev.filter((img) => img !== imageUrl));
    setExistingImages((prev) => [...prev, imageUrl]);
  };

  // ==================== CALCULATIONS ====================
  const calculateMetalSubtotal = (metal) => {
    const weight = parseFloat(metal.weight) || 0;
    const rate = parseFloat(metal.rate_per_gram) || 0;
    return weight * rate;
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

  // Totals
  const totalMetalsCost = metalsData.reduce(
    (sum, metal) => sum + calculateMetalSubtotal(metal),
    0,
  );
  const totalStonesCost = stones.reduce(
    (sum, stone) => sum + calculateStoneSubtotal(stone),
    0,
  );
  const totalMaterialsCost = materialsData.reduce(
    (sum, mat) => sum + calculateMaterialCost(mat),
    0,
  );
  const totalPriceMakingCosts = priceMakingCosts.reduce(
    (sum, cost) => sum + (parseFloat(cost.cost_amount) || 0),
    0,
  );

  const baseTotal = totalMetalsCost + totalStonesCost + totalMaterialsCost;
  const grandTotal = baseTotal + totalPriceMakingCosts;

  const sellingPriceBeforeTax =
    grandTotal * (1 + (parseFloat(formState.markup_percentage) || 0) / 100);

  // Calculate GST amounts based on rates
  const gstTotal = parseFloat(formState.gst_rate?.replace("%", "")) || 0;
  const cgstRate = parseFloat(formState.cgst_rate?.replace("%", "")) || 0;
  const sgstRate = parseFloat(formState.sgst_rate?.replace("%", "")) || 0;
  const igstRate = parseFloat(formState.igst_rate?.replace("%", "")) || 0;
  const utgstRate = parseFloat(formState.utgst_rate?.replace("%", "")) || 0;

  const gstAmount = (sellingPriceBeforeTax * gstTotal) / 100;
  const cgstAmount = (sellingPriceBeforeTax * cgstRate) / 100;
  const sgstAmount = (sellingPriceBeforeTax * sgstRate) / 100;
  const igstAmount = (sellingPriceBeforeTax * igstRate) / 100;
  const utgstAmount = (sellingPriceBeforeTax * utgstRate) / 100;

  const sellingPriceWithGST = sellingPriceBeforeTax + gstAmount;

  // ==================== FORM VALIDATION ====================
  const validateForm = () => {
    const newErrors = {};
    if (!formState.product_name.trim())
      newErrors.product_name = "Product name is required";
    if (!formState.article_no.trim())
      newErrors.article_no = "Article number is required";
    if (!formState.product_category)
      newErrors.product_category = "Category is required";

    return newErrors;
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      // Prepare data in the format expected by updateItem function
      const submitData = {
        // Basic information
        product_name: formState.product_name,
        article_no: formState.article_no,

        // IDs
        product_brand: formState.product_brand,
        product_category: formState.product_category,
        product_subcategory: formState.product_subcategory,

        // Markup
        markup_percentage: parseFloat(formState.markup_percentage) || 15,

        // GST rates
        gst_rate: formState.gst_rate || "0%",
        cgst_rate: formState.cgst_rate || "0%",
        sgst_rate: formState.sgst_rate || "0%",
        igst_rate: formState.igst_rate || "0%",
        utgst_rate: formState.utgst_rate || "0%",

        // Metals data
        metals: metalsData.map((metal) => ({
          metal_type: metal.metal_type,
          purity: metal.purity,
          hallmark: metal.hallmark || "", // Send hallmark ID
          weight: parseFloat(metal.weight) || 0,
          unit: metal.unit,
          rate_per_gram: parseFloat(metal.rate_per_gram) || 0,
          making_charge_type: metal.making_charge_type || "Fixed",
        })),

        // Stones data
        stones: stones.map((stone) => ({
          stone_type: stone.stone_type,
          stone_purity: stone.stone_purity,
          size: parseFloat(stone.size) || 0,
          quantity: parseInt(stone.quantity) || 0,
          weight: parseFloat(stone.weight) || 0,
          price_per_carat: parseFloat(stone.price_per_carat) || 0,
        })),

        // Materials data
        materials: materialsData.map((material) => ({
          wastage_type: material.wastage_type,
          material_type: material.material_type,
          weight: parseFloat(material.weight) || 0,
          unit: material.unit,
          rate_per_unit: parseFloat(material.rate_per_unit) || 0,
        })),

        // Price making costs
        price_making_costs: priceMakingCosts.map((cost) => ({
          price_making_id: cost.price_making_id,
          stage_name: cost.stage_name,
          sub_stage_name: cost.sub_stage_name,
          cost_type: cost.cost_type,
          unit_name: cost.unit_name,
          cost_amount: parseFloat(cost.cost_amount) || 0,
          is_active: cost.is_active !== undefined ? cost.is_active : true,
        })),

        // Images - FIXED: Send new image files
        image: newImageFiles, // This should be an array of File objects

        // Images to delete
        imagesToDelete: imagesToDelete, // This should be an array of image URLs
      };

      console.log("Submitting edit data:", {
        basicInfo: {
          name: submitData.product_name,
          article_no: submitData.article_no,
          brandId: submitData.product_brand,
          categoryId: submitData.product_category,
          subcategoryId: submitData.product_subcategory,
        },
        metalsCount: submitData.metals.length,
        stonesCount: submitData.stones.length,
        materialsCount: submitData.materials.length,
        priceMakingsCount: submitData.price_making_costs.length,
        newImagesCount: submitData.image?.length || 0,
        imagesToDeleteCount: submitData.imagesToDelete?.length || 0,
      });

      if (onSubmit) {
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error("Error preparing form data:", error);
      setErrors({ submit: "Failed to prepare form data" });
    }
  };

  const handleClose = () => {
    // Clean up object URLs
    newImagePreviews.forEach((preview) => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });
    if (onHide) onHide();
  };

  if (!show) return null;

  const currentImages = existingImages.filter(
    (img) => !imagesToDelete.includes(img),
  );
  const totalImages = currentImages.length + newImagePreviews.length;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              Edit Item: {item?.product_name}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="modal-body"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
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
                      disabled={loading}
                    />
                    {errors.product_name && (
                      <div className="invalid-feedback">
                        {errors.product_name}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Article No <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.article_no ? "is-invalid" : ""
                      }`}
                      value={formState.article_no}
                      onChange={(e) =>
                        handleInputChange("article_no", e.target.value)
                      }
                      disabled={loading}
                    />
                    {errors.article_no && (
                      <div className="invalid-feedback">
                        {errors.article_no}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${
                        errors.product_category ? "is-invalid" : ""
                      }`}
                      value={formState.product_category}
                      onChange={(e) => {
                        handleInputChange("product_category", e.target.value);
                        handleInputChange("product_subcategory", "");
                      }}
                      disabled={loading || categories.length === 0}
                    >
                      <option value="">
                        {categories.length === 0
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

                  {formState.product_category && (
                    <div className="mb-3">
                      <label className="form-label">Subcategory</label>
                      {currentSubcategories.length > 0 ? (
                        <select
                          className="form-select"
                          value={formState.product_subcategory}
                          onChange={(e) =>
                            handleInputChange(
                              "product_subcategory",
                              e.target.value,
                            )
                          }
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

                  <div className="mb-3">
                    <label className="form-label">Brand</label>
                    <select
                      className="form-select"
                      value={formState.product_brand}
                      onChange={(e) =>
                        handleInputChange("product_brand", e.target.value)
                      }
                      disabled={loading || brands.length === 0}
                    >
                      <option value="">
                        {brands.length === 0
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
                    <div className="col-md-4 mb-3">
                      <label className="form-label">GST Rate</label>
                      <select
                        className="form-select"
                        value={formState.gst_rate}
                        onChange={(e) => handleGSTRateChange(e.target.value)}
                        disabled={loading || gstRates.length === 0}
                      >
                        <option value="0%">Select GST Rate</option>
                        {gstRates.map((gst) => {
                          const gstTotal = gst.gst_total || gst.value || 0;
                          return (
                            <option key={getId(gst)} value={`${gstTotal}%`}>
                              GST {gstTotal}%
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">CGST Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formState.cgst_rate || "0%"}
                        readOnly
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">SGST Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formState.sgst_rate || "0%"}
                        readOnly
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">IGST Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formState.igst_rate || "0%"}
                        readOnly
                        disabled={loading}
                      />
                    </div>

                    <div className="col-md-2 mb-3">
                      <label className="form-label">UTGST Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formState.utgst_rate || "0%"}
                        readOnly
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Making Costs Section */}
              <div className="card mb-4 border">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Price Making Costs</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                    onClick={addPriceMakingRow}
                    disabled={loading}
                  >
                    <FiPlus /> Add Cost
                  </button>
                </div>
                <div className="card-body p-0">
                  {priceMakingCosts.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-muted mb-0">
                        No price making costs added.
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Stage Name</th>
                            <th>Sub Stage</th>
                            <th>Cost Type</th>
                            <th>Unit</th>
                            <th>Cost Amount</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {priceMakingCosts.map((cost) => (
                            <tr key={cost.id}>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={cost.stage_name}
                                  onChange={(e) =>
                                    updatePriceMaking(
                                      cost.id,
                                      "stage_name",
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={cost.sub_stage_name}
                                  onChange={(e) =>
                                    updatePriceMaking(
                                      cost.id,
                                      "sub_stage_name",
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={cost.cost_type}
                                  onChange={(e) =>
                                    updatePriceMaking(
                                      cost.id,
                                      "cost_type",
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={cost.unit_name}
                                  onChange={(e) =>
                                    updatePriceMaking(
                                      cost.id,
                                      "unit_name",
                                      e.target.value,
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
                                  value={cost.cost_amount}
                                  onChange={(e) =>
                                    updatePriceMaking(
                                      cost.id,
                                      "cost_amount",
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removePriceMaking(cost.id)}
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
                  {priceMakingCosts.length > 0 && (
                    <div className="card-footer text-end fw-bold">
                      Total Price Making Costs: ₹
                      {totalPriceMakingCosts.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Metals Table - UPDATED WITH HALLMARK */}
              <div className="card mb-4 border">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Metal Details</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                    onClick={addMetalRow}
                    disabled={loading}
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
                                  className="form-select form-select-sm"
                                  value={metal.metal_type}
                                  onChange={(e) =>
                                    updateMetal(
                                      metal.id,
                                      "metal_type",
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading || metals.length === 0}
                                >
                                  <option value="">
                                    {metals.length === 0
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
                                  className="form-select form-select-sm"
                                  value={metal.purity}
                                  onChange={(e) =>
                                    updateMetal(
                                      metal.id,
                                      "purity",
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading || purities.length === 0}
                                >
                                  <option value="">
                                    {purities.length === 0
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
                                    loadingHallmarks[metal.id]
                                      ? "opacity-50"
                                      : ""
                                  }`}
                                  value={metal.hallmark || ""}
                                  onChange={(e) =>
                                    updateMetal(
                                      metal.id,
                                      "hallmark",
                                      e.target.value,
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    loadingHallmarks[metal.id] ||
                                    !metal.metal_type ||
                                    (hallmarksByMetal[metal.id] || [])
                                      .length === 0
                                  }
                                >
                                  <option value="">
                                    {loadingHallmarks[metal.id]
                                      ? "Loading hallmarks..."
                                      : !metal.metal_type
                                        ? "Select metal first"
                                        : (hallmarksByMetal[metal.id] || [])
                                              .length === 0
                                          ? "No hallmarks available"
                                          : "Select Hallmark"}
                                  </option>
                                  {(hallmarksByMetal[metal.id] || []).map(
                                    (hallmark) => (
                                      <option
                                        key={getId(hallmark)}
                                        value={getId(hallmark)}
                                      >
                                        {getName(hallmark)}
                                      </option>
                                    ),
                                  )}
                                </select>
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
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={metal.unit}
                                  onChange={(e) =>
                                    updateMetal(
                                      metal.id,
                                      "unit",
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading || units.length === 0}
                                >
                                  <option value="">
                                    {units.length === 0
                                      ? "Loading units..."
                                      : "Select Unit"}
                                  </option>
                                  {units.map((unit) => (
                                    <option
                                      key={getId(unit)}
                                      value={getId(unit)}
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
                                      e.target.value,
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

              {/* Stones Table */}
              <div className="card mb-4 border">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Stone Details</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                    onClick={addStoneRow}
                    disabled={loading}
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
                                  className="form-select form-select-sm"
                                  value={stone.stone_type}
                                  onChange={(e) =>
                                    updateStone(
                                      stone.id,
                                      "stone_type",
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading || stoneTypes.length === 0}
                                >
                                  <option value="">
                                    {stoneTypes.length === 0
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
                                  className="form-select form-select-sm"
                                  value={stone.stone_purity}
                                  onChange={(e) =>
                                    updateStone(
                                      stone.id,
                                      "stone_purity",
                                      e.target.value,
                                    )
                                  }
                                  disabled={
                                    loading || stonePurities.length === 0
                                  }
                                >
                                  <option value="">
                                    {stonePurities.length === 0
                                      ? "Loading stone purities..."
                                      : "Select Stone Purity"}
                                  </option>
                                  {stonePurities.map((purityItem) => (
                                    <option
                                      key={getId(purityItem)}
                                      value={getId(purityItem)}
                                    >
                                      {getName(purityItem)}
                                    </option>
                                  ))}
                                </select>
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
                                      e.target.value,
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
                                      e.target.value,
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
                                      e.target.value,
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
                                      e.target.value,
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

              {/* Materials & Wastage Table */}
              <div className="card mb-4 border">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Materials & Wastage</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                    onClick={addMaterialRow}
                    disabled={loading}
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
                                  className="form-select form-select-sm"
                                  value={material.wastage_type}
                                  onChange={(e) =>
                                    updateMaterial(
                                      material.id,
                                      "wastage_type",
                                      e.target.value,
                                    )
                                  }
                                  disabled={
                                    loading || wastageTypes.length === 0
                                  }
                                >
                                  <option value="">Select Wastage Type</option>
                                  {wastageTypes.map((type) => (
                                    <option
                                      key={getId(type)}
                                      value={getId(type)}
                                    >
                                      {getName(type)}
                                    </option>
                                  ))}
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
                                      e.target.value,
                                    )
                                  }
                                  disabled={
                                    loading || materialTypes.length === 0
                                  }
                                >
                                  <option value="">Select Material Type</option>
                                  {materialTypes.map((mt) => (
                                    <option key={getId(mt)} value={getId(mt)}>
                                      {getName(mt)}
                                    </option>
                                  ))}
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
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={material.unit}
                                  onChange={(e) =>
                                    updateMaterial(
                                      material.id,
                                      "unit",
                                      e.target.value,
                                    )
                                  }
                                  disabled={loading || units.length === 0}
                                >
                                  <option value="">Select Unit</option>
                                  {units.map((unit) => (
                                    <option
                                      key={getId(unit)}
                                      value={getId(unit)}
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
                                      e.target.value,
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

              {/* Price Summary */}
              <div className="card mb-4 border">
                <div className="card-header bg-light">
                  <h6 className="mb-0 fw-bold">Price Summary with GST</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <table className="table table-borderless">
                        <tbody>
                          {totalMetalsCost > 0 && (
                            <tr>
                              <td className="fw-bold">Total Metals Cost:</td>
                              <td className="text-end">
                                ₹{totalMetalsCost.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          {totalStonesCost > 0 && (
                            <tr>
                              <td className="fw-bold">Total Stones Cost:</td>
                              <td className="text-end">
                                ₹{totalStonesCost.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          {totalMaterialsCost > 0 && (
                            <tr>
                              <td className="fw-bold">
                                Total Materials & Wastage Cost:
                              </td>
                              <td className="text-end">
                                ₹{totalMaterialsCost.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          {totalPriceMakingCosts > 0 && (
                            <tr>
                              <td className="fw-bold">
                                Total Price Making Costs:
                              </td>
                              <td className="text-end">
                                ₹{totalPriceMakingCosts.toFixed(2)}
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
                            <td className="fw-bold">Markup Percentage:</td>
                            <td className="text-end">
                              <input
                                type="number"
                                step="0.01"
                                className="form-control form-control-sm"
                                value={formState.markup_percentage}
                                onChange={(e) =>
                                  handleInputChange(
                                    "markup_percentage",
                                    e.target.value,
                                  )
                                }
                                disabled={loading}
                                style={{ width: "100px", display: "inline" }}
                              />
                              %
                            </td>
                          </tr>

                          <tr>
                            <td className="fw-bold">Markup Amount:</td>
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
                          <tr>
                            <td className="fw-bold">GST Breakdown:</td>
                            <td></td>
                          </tr>

                          {cgstAmount > 0 && (
                            <tr>
                              <td className="fw-bold">
                                CGST ({formState.cgst_rate}):
                              </td>
                              <td className="text-end">
                                ₹{cgstAmount.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          {sgstAmount > 0 && (
                            <tr>
                              <td className="fw-bold">
                                SGST ({formState.sgst_rate}):
                              </td>
                              <td className="text-end">
                                ₹{sgstAmount.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          {igstAmount > 0 && (
                            <tr>
                              <td className="fw-bold">
                                IGST ({formState.igst_rate}):
                              </td>
                              <td className="text-end">
                                ₹{igstAmount.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          {utgstAmount > 0 && (
                            <tr>
                              <td className="fw-bold">
                                UTGST ({formState.utgst_rate}):
                              </td>
                              <td className="text-end">
                                ₹{utgstAmount.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          <tr className="border-top">
                            <td className="fw-bold">
                              Total GST ({formState.gst_rate}):
                            </td>
                            <td className="text-end">
                              ₹{gstAmount.toFixed(2)}
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
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Section - FIXED */}
              <div className="mb-4">
                <label className="form-label fw-medium">
                  Product Images ({totalImages}/3)
                </label>
                <div className="row">
                  {currentImages.map((img, index) => (
                    <div className="col-md-4 mb-3" key={`existing-${index}`}>
                      <div
                        className="border rounded-3 position-relative"
                        style={{ height: "150px" }}
                      >
                        <img
                          src={img}
                          alt={`Existing ${index + 1}`}
                          className="img-fluid h-100 w-100 rounded"
                          style={{ objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                          disabled={loading}
                        >
                          <FiX size={12} />
                        </button>
                        <div className="position-absolute bottom-0 start-0 m-2">
                          <span className="badge bg-secondary">Existing</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {newImagePreviews.map((preview, index) => (
                    <div className="col-md-4 mb-3" key={`new-${index}`}>
                      <div
                        className="border rounded-3 position-relative"
                        style={{ height: "150px" }}
                      >
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="img-fluid h-100 w-100 rounded"
                          style={{ objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                          disabled={loading}
                        >
                          <FiX size={12} />
                        </button>
                        <div className="position-absolute bottom-0 start-0 m-2">
                          <span className="badge bg-primary">New</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {totalImages < 3 && (
                    <div className="col-md-4 mb-3">
                      <div
                        className={`border-2 border-dashed rounded-3 text-center cursor-pointer d-flex flex-column align-items-center justify-content-center ${
                          dragActive
                            ? "border-primary bg-primary bg-opacity-10"
                            : "border-muted"
                        }`}
                        style={{ height: "150px" }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FiImage className="text-muted mb-2" size={24} />
                        <p className="text-muted small mb-0">Add Image</p>
                        <p className="text-muted small">
                          {3 - totalImages} slot(s) available
                        </p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleNewImageUpload(e.target.files)}
                        accept="image/*"
                        className="d-none"
                        multiple
                      />
                    </div>
                  )}
                </div>

                {imagesToDelete.length > 0 && (
                  <div className="alert alert-warning py-2">
                    <small>
                      {imagesToDelete.length} image(s) marked for deletion.
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 ms-2"
                        onClick={() => {
                          imagesToDelete.forEach((img) => restoreImage(img));
                        }}
                      >
                        Undo
                      </button>
                    </small>
                  </div>
                )}
              </div>
            </div>

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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Item
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

export default EditItemModal;
