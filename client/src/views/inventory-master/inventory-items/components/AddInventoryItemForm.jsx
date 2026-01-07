import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiUpload, FiPlus, FiTrash2, FiImage, FiDollarSign } from "react-icons/fi";

const AddInventoryItemForm = ({
  onClose,
  onSave,
  loading = false,
  inventoryCategories = [],
  branches = [],
  metalPurities = [],
  stonePurities = [],
  hallmarks = [],
}) => {
  // Main Form State
  const [formData, setFormData] = useState({
    // Basic Information
    item_name: "",
    item_code: "",
    description: "",
    inventory_category_id: "",
    branch_id: "",
    
    // Jewelry Type Details
    jewelry_type: "Ring",
    size: "",
    gender: "women",
    occasion: "wedding",
    
    // Metals Array
    metals: [
      {
        metal_type: "gold",
        purity: "",
        weight: "",
        color: "yellow",
        hallmark: ""
      }
    ],
    
    // Stones Array
    stones: [
      {
        stone_type: "diamond",
        shape: "round",
        color: "G",
        clarity: "",
        carat_weight: "",
        quantity: 1,
        certificate_type: ""
      }
    ],
    
    // Rates
    gold_rate: "",
    stone_rate: "",
    
    // Making Charges
    making_charges: "",
    making_type: "percentage",
    wastage_percentage: "5",
    profit_margin: "25",
    
    // Stock
    current_stock: "1",
    minimum_stock: "1",
    location_type: "showcase",
    location_details: "",
    
    // Tax
    gst_percentage: "3",
    
    // Additional Professional Fields
    discount_percentage: "0",
    trade_discount: "0",
    warranty_period: "12", // months
    warranty_details: "",
    certification_number: "",
    bis_mark: false,
    insurance_value: "",
    appraisal_value: "",
    supplier_id: "",
    manufacturer: "",
    
    // Status
    status: "active",
    
    // Arrays
    images: [],
    tags: ""
  });

  const [errors, setErrors] = useState({});
  const [autoGenerateCode, setAutoGenerateCode] = useState(true);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [calculatedValues, setCalculatedValues] = useState({
    totalMetalWeight: 0,
    totalCarat: 0,
    metalCost: 0,
    stoneCost: 0,
    makingChargesAmount: 0,
    wastageCharges: 0,
    totalCost: 0,
    sellingPriceBeforeTax: 0,
    cgst: 0,
    sgst: 0,
    finalSellingPrice: 0
  });

  // Auto-generate item code on mount
  useEffect(() => {
    if (autoGenerateCode) {
      const timestamp = Date.now().toString().slice(-6);
      const randomNum = Math.floor(Math.random() * 1000);
      setFormData(prev => ({
        ...prev,
        item_code: `JWL-${timestamp}${randomNum}`
      }));
    }
  }, [autoGenerateCode]);

  // Calculate derived values using useMemo for performance
  const calculateJewelryPricing = useCallback(() => {
    // Calculate metal weight
    const totalMetalWeight = formData.metals.reduce((sum, metal) => {
      return sum + (parseFloat(metal.weight) || 0);
    }, 0);
    
    // Calculate total carat
    const totalCarat = formData.stones.reduce((sum, stone) => {
      return sum + (parseFloat(stone.carat_weight) || 0) * (parseInt(stone.quantity) || 1);
    }, 0);
    
    // Calculate costs if rates are available
    const goldRate = parseFloat(formData.gold_rate) || 0;
    const stoneRate = parseFloat(formData.stone_rate) || 0;
    const metalCost = goldRate * totalMetalWeight;
    const stoneCost = stoneRate * totalCarat;
    
    // Calculate making charges
    let makingChargesAmount = parseFloat(formData.making_charges) || 0;
    if (formData.making_type === "per_gram" && totalMetalWeight > 0) {
      makingChargesAmount = totalMetalWeight * makingChargesAmount;
    } else if (formData.making_type === "percentage" && metalCost > 0) {
      makingChargesAmount = (metalCost * makingChargesAmount) / 100;
    }
    
    // Calculate wastage
    const wastagePercentage = parseFloat(formData.wastage_percentage) || 0;
    const wastageCharges = wastagePercentage > 0 ? (metalCost * wastagePercentage) / 100 : 0;
    
    // Calculate total cost
    const totalCost = metalCost + stoneCost + makingChargesAmount + wastageCharges;
    
    // Calculate selling price with profit margin
    const profitMargin = parseFloat(formData.profit_margin) || 0;
    const sellingPriceBeforeTax = totalCost > 0 ? totalCost * (1 + profitMargin / 100) : 0;
    
    // Apply discounts
    const discountPercentage = parseFloat(formData.discount_percentage) || 0;
    const tradeDiscount = parseFloat(formData.trade_discount) || 0;
    const priceAfterDiscounts = sellingPriceBeforeTax * 
      (1 - discountPercentage / 100) * 
      (1 - tradeDiscount / 100);
    
    // Calculate tax
    const gstPercentage = parseFloat(formData.gst_percentage) || 0;
    const cgst = priceAfterDiscounts * (gstPercentage / 200);
    const sgst = priceAfterDiscounts * (gstPercentage / 200);
    const finalSellingPrice = priceAfterDiscounts + cgst + sgst;
    
    return {
      totalMetalWeight: parseFloat(totalMetalWeight.toFixed(3)),
      totalCarat: parseFloat(totalCarat.toFixed(2)),
      metalCost: parseFloat(metalCost.toFixed(2)),
      stoneCost: parseFloat(stoneCost.toFixed(2)),
      makingChargesAmount: parseFloat(makingChargesAmount.toFixed(2)),
      wastageCharges: parseFloat(wastageCharges.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      sellingPriceBeforeTax: parseFloat(sellingPriceBeforeTax.toFixed(2)),
      priceAfterDiscounts: parseFloat(priceAfterDiscounts.toFixed(2)),
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      finalSellingPrice: parseFloat(finalSellingPrice.toFixed(2))
    };
  }, [
    formData.metals,
    formData.stones,
    formData.gold_rate,
    formData.stone_rate,
    formData.making_charges,
    formData.making_type,
    formData.wastage_percentage,
    formData.profit_margin,
    formData.discount_percentage,
    formData.trade_discount,
    formData.gst_percentage
  ]);

  // Update calculated values when dependencies change
  useEffect(() => {
    const calculated = calculateJewelryPricing();
    setCalculatedValues(calculated);
  }, [calculateJewelryPricing]);

  // Memoized helper functions for performance
  const metalTypes = useMemo(() => {
    const uniqueTypes = [...new Set(metalPurities.map(p => p.metal_type))];
    return uniqueTypes.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    }));
  }, [metalPurities]);

  const stoneTypes = useMemo(() => {
    const uniqueTypes = [...new Set(stonePurities.map(p => p.stone_type))];
    return uniqueTypes.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    }));
  }, [stonePurities]);

  // Get purities for selected metal type
  const getPuritiesForMetal = useCallback((metalType) => {
    return metalPurities
      .filter(p => p.metal_type === metalType)
      .map(p => ({
        value: p.purity_name,
        label: p.purity_name
      }));
  }, [metalPurities]);

  // Get clarities for selected stone type
  const getClaritiesForStone = useCallback((stoneType) => {
    return stonePurities
      .filter(p => p.stone_type === stoneType)
      .map(p => ({
        value: p.stone_purity,
        label: p.stone_purity
      }));
  }, [stonePurities]);

  // Get hallmarks for selected metal type
  const getHallmarksForMetal = useCallback((metalType) => {
    return hallmarks
      .filter(h => h.metal_type_name === metalType)
      .map(h => ({
        value: h.name,
        label: h.name
      }));
  }, [hallmarks]);

  // Input sanitization function
  const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/[<>]/g, '')
      .trim();
  };

  // Handle change for basic fields with sanitization
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const sanitizedValue = type === 'checkbox' ? checked : sanitizeInput(value);
    
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle numeric input
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  // Handle metal changes
  const handleMetalChange = (index, field, value) => {
    const updatedMetals = [...formData.metals];
    const currentMetal = updatedMetals[index];
    
    updatedMetals[index] = {
      ...currentMetal,
      [field]: value
    };
    
    if (field === 'metal_type') {
      const purities = getPuritiesForMetal(value);
      const metalHallmarks = getHallmarksForMetal(value);
      
      updatedMetals[index] = {
        ...updatedMetals[index],
        purity: purities.length > 0 ? purities[0].value : "",
        hallmark: metalHallmarks.length > 0 ? metalHallmarks[0].value : ""
      };
    }
    
    setFormData(prev => ({
      ...prev,
      metals: updatedMetals
    }));
  };

  // Handle stone changes
  const handleStoneChange = (index, field, value) => {
    const updatedStones = [...formData.stones];
    const currentStone = updatedStones[index];
    
    updatedStones[index] = {
      ...currentStone,
      [field]: value
    };
    
    if (field === 'stone_type') {
      const clarities = getClaritiesForStone(value);
      updatedStones[index] = {
        ...updatedStones[index],
        clarity: clarities.length > 0 ? clarities[0].value : ""
      };
    }
    
    setFormData(prev => ({
      ...prev,
      stones: updatedStones
    }));
  };

  // Remove metal
  const removeMetal = (index) => {
    if (formData.metals.length > 1) {
      const updatedMetals = [...formData.metals];
      updatedMetals.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        metals: updatedMetals
      }));
    }
  };

  // Add new metal
  const addMetal = () => {
    const defaultMetalType = metalTypes.length > 0 ? metalTypes[0].value : "gold";
    const purities = getPuritiesForMetal(defaultMetalType);
    const metalHallmarks = getHallmarksForMetal(defaultMetalType);
    
    setFormData(prev => ({
      ...prev,
      metals: [
        ...prev.metals,
        {
          metal_type: defaultMetalType,
          purity: purities.length > 0 ? purities[0].value : "",
          weight: "",
          color: "yellow",
          hallmark: metalHallmarks.length > 0 ? metalHallmarks[0].value : ""
        }
      ]
    }));
  };

  // Remove stone
  const removeStone = (index) => {
    if (formData.stones.length > 1) {
      const updatedStones = [...formData.stones];
      updatedStones.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        stones: updatedStones
      }));
    }
  };

  // Add new stone
  const addStone = () => {
    const defaultStoneType = stoneTypes.length > 0 ? stoneTypes[0].value : "diamond";
    const clarities = getClaritiesForStone(defaultStoneType);
    
    setFormData(prev => ({
      ...prev,
      stones: [
        ...prev.stones,
        {
          stone_type: defaultStoneType,
          shape: "round",
          color: "G",
          clarity: clarities.length > 0 ? clarities[0].value : "",
          carat_weight: "",
          quantity: 1,
          certificate_type: ""
        }
      ]
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Remove image
  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    const updatedPreviews = [...imagePreviews];
    
    updatedImages.splice(index, 1);
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
    
    setImagePreviews(updatedPreviews);
  };

  // Generate barcode
  const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 10000);
    const barcode = `BAR-${timestamp.slice(-8)}-${randomNum.toString().padStart(4, '0')}`;
    
    setFormData(prev => ({
      ...prev,
      item_code: barcode
    }));
  };

  // Generate QR code placeholder
  const generateQRCode = () => {
    alert("QR Code generation would be implemented with a QR library");
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // Basic Info Validation
    if (!formData.item_name.trim()) {
      newErrors.item_name = "Item name is required";
    }

    if (!formData.item_code.trim()) {
      newErrors.item_code = "Item code is required";
    }

    if (!formData.inventory_category_id) {
      newErrors.inventory_category_id = "Inventory category is required";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    // Metals Validation
    formData.metals.forEach((metal, index) => {
      if (!metal.weight || parseFloat(metal.weight) <= 0) {
        newErrors[`metal_weight_${index}`] = "Metal weight must be greater than 0";
      }
      if (!metal.purity) {
        newErrors[`metal_purity_${index}`] = "Purity is required";
      }
    });

    // Stones Validation
    formData.stones.forEach((stone, index) => {
      if (!stone.carat_weight || parseFloat(stone.carat_weight) <= 0) {
        newErrors[`stone_carat_${index}`] = "Carat weight must be greater than 0";
      }
      if (!stone.clarity) {
        newErrors[`stone_clarity_${index}`] = "Clarity is required";
      }
    });

    // Rates Validation
    if (!formData.gold_rate || parseFloat(formData.gold_rate) <= 0) {
      newErrors.gold_rate = "Gold rate is required";
    }

    if (formData.stones.length > 0 && (!formData.stone_rate || parseFloat(formData.stone_rate) <= 0)) {
      newErrors.stone_rate = "Stone rate is required when stones are added";
    }

    // Making charges validation
    const makingCharges = parseFloat(formData.making_charges);
    if (isNaN(makingCharges) || makingCharges < 0) {
      newErrors.making_charges = "Valid making charges required";
    }

    // GST validation
    const gst = parseFloat(formData.gst_percentage);
    if (isNaN(gst) || gst < 0 || gst > 100) {
      newErrors.gst_percentage = "GST must be between 0-100%";
    }

    // Profit margin validation
    const profit = parseFloat(formData.profit_margin);
    if (isNaN(profit) || profit < 0) {
      newErrors.profit_margin = "Profit margin must be positive";
    }

    // Discount validation
    const discount = parseFloat(formData.discount_percentage);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      newErrors.discount_percentage = "Discount must be between 0-100%";
    }

    // Warranty validation
    const warranty = parseInt(formData.warranty_period);
    if (isNaN(warranty) || warranty < 0) {
      newErrors.warranty_period = "Valid warranty period required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare payload
    const payload = {
      item_name: formData.item_name.trim(),
      item_code: formData.item_code.trim(),
      description: formData.description.trim(),
      inventory_category_id: formData.inventory_category_id,
      branch_id: formData.branch_id,
      item_type: "jewelry",
      
      // Jewelry Details
      jewelry_type: formData.jewelry_type,
      size: formData.size,
      gender: formData.gender,
      occasion: formData.occasion,
      
      // Process metals
      metals: formData.metals.map(metal => ({
        metal_type: metal.metal_type,
        purity: metal.purity,
        weight: parseFloat(metal.weight) || 0,
        color: metal.color,
        hallmark: metal.hallmark || ""
      })),
      
      // Process stones
      stones: formData.stones.map(stone => ({
        stone_type: stone.stone_type,
        shape: stone.shape,
        color: stone.color,
        clarity: stone.clarity,
        carat_weight: parseFloat(stone.carat_weight) || 0,
        quantity: parseInt(stone.quantity) || 1,
        certificate_type: stone.certificate_type || ""
      })),
      
      // Rates
      gold_rate: parseFloat(formData.gold_rate) || 0,
      stone_rate: parseFloat(formData.stone_rate) || 0,
      
      // Making charges
      making_charges: parseFloat(formData.making_charges) || 0,
      making_type: formData.making_type,
      wastage_percentage: parseFloat(formData.wastage_percentage) || 5,
      profit_margin: parseFloat(formData.profit_margin) || 25,
      
      // Discounts
      discount_percentage: parseFloat(formData.discount_percentage) || 0,
      trade_discount: parseFloat(formData.trade_discount) || 0,
      
      // Professional fields
      warranty_period: parseInt(formData.warranty_period) || 12,
      warranty_details: formData.warranty_details,
      certification_number: formData.certification_number,
      bis_mark: formData.bis_mark,
      insurance_value: parseFloat(formData.insurance_value) || 0,
      appraisal_value: parseFloat(formData.appraisal_value) || 0,
      manufacturer: formData.manufacturer,
      
      // Stock
      current_stock: parseInt(formData.current_stock) || 1,
      minimum_stock: parseInt(formData.minimum_stock) || 1,
      location_type: formData.location_type,
      location_details: formData.location_details,
      
      // Tax
      gst_percentage: parseFloat(formData.gst_percentage) || 3,
      
      // Calculated values (for reference)
      calculated_values: calculatedValues,
      
      // Status
      status: formData.status,
      
      // Arrays
      images: formData.images,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };

    console.log("Submitting jewelry item payload:", payload);
    onSave(payload);
  };

  // Stone shape options
  const stoneShapes = [
    { value: "round", label: "Round" },
    { value: "princess", label: "Princess" },
    { value: "oval", label: "Oval" },
    { value: "marquise", label: "Marquise" },
    { value: "pear", label: "Pear" },
    { value: "cushion", label: "Cushion" },
    { value: "emerald", label: "Emerald" },
    { value: "asscher", label: "Asscher" },
    { value: "radiant", label: "Radiant" },
    { value: "heart", label: "Heart" }
  ];

  // Color options for diamonds
  const diamondColors = [
    "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N-O", "P-R", "S-Z"
  ];

  // Location type options
  const locationTypes = [
    { value: "showcase", label: "Showcase" },
    { value: "vault", label: "Vault" },
    { value: "workshop", label: "Workshop" },
    { value: "storage", label: "Storage" },
    { value: "display", label: "Display" },
    { value: "safe", label: "Safe" }
  ];

  // Gender options
  const genderOptions = [
    { value: "women", label: "Women" },
    { value: "men", label: "Men" },
    { value: "unisex", label: "Unisex" },
    { value: "kids", label: "Kids" }
  ];

  // Occasion options
  const occasionOptions = [
    { value: "wedding", label: "Wedding" },
    { value: "engagement", label: "Engagement" },
    { value: "birthday", label: "Birthday" },
    { value: "anniversary", label: "Anniversary" },
    { value: "everyday", label: "Everyday Wear" },
    { value: "party", label: "Party" },
    { value: "festival", label: "Festival" },
    { value: "other", label: "Other" }
  ];

  // Jewelry type options
  const jewelryTypeOptions = [
    { value: "Ring", label: "Ring" },
    { value: "Necklace", label: "Necklace" },
    { value: "Earring", label: "Earring" },
    { value: "Bracelet", label: "Bracelet" },
    { value: "Pendant", label: "Pendant" },
    { value: "Bangle", label: "Bangle" },
    { value: "Chain", label: "Chain" },
    { value: "Brooch", label: "Brooch" },
    { value: "Anklet", label: "Anklet" },
    { value: "Cufflinks", label: "Cufflinks" },
    { value: "Other", label: "Other" }
  ];

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
              <FiDollarSign className="me-2" />
              Add Jewelry Item
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
              
              {/* Price Summary Card - At the top for visibility */}
              <div className="mb-4">
                <div className="card border-primary">
                  <div className="card-header bg-primary text-white fw-bold">
                    <FiDollarSign className="me-2" />
                    Price Summary
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Total Metal Weight:</span>
                          <span className="fw-medium">{calculatedValues.totalMetalWeight} g</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Total Carat:</span>
                          <span className="fw-medium">{calculatedValues.totalCarat} ct</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Metal Cost:</span>
                          <span className="fw-medium">₹{calculatedValues.metalCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Stone Cost:</span>
                          <span className="fw-medium">₹{calculatedValues.stoneCost.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Making Charges:</span>
                          <span className="fw-medium">₹{calculatedValues.makingChargesAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Wastage Charges:</span>
                          <span className="fw-medium">₹{calculatedValues.wastageCharges.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Total Cost:</span>
                          <span className="fw-bold">₹{calculatedValues.totalCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Selling Price (incl. GST):</span>
                          <span className="fw-bold text-success fs-5">
                            ₹{calculatedValues.finalSellingPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Basic Information</h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Item Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="item_name"
                      className={`form-control ${errors.item_name ? "is-invalid" : ""}`}
                      placeholder="e.g., Gold Diamond Ring, Silver Necklace"
                      value={formData.item_name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.item_name && (
                      <div className="invalid-feedback">{errors.item_name}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Item Code <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="item_code"
                        className={`form-control ${errors.item_code ? "is-invalid" : ""}`}
                        placeholder="e.g., JWL-001"
                        value={formData.item_code}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <div className="input-group-text">
                        <input
                          className="form-check-input mt-0"
                          type="checkbox"
                          checked={autoGenerateCode}
                          onChange={(e) => setAutoGenerateCode(e.target.checked)}
                          disabled={loading}
                        />
                        <span className="ms-2 small">Auto-generate</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={generateBarcode}
                        disabled={loading}
                        title="Generate Barcode"
                      >
                        BAR
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={generateQRCode}
                        disabled={loading}
                        title="Generate QR Code"
                      >
                        QR
                      </button>
                    </div>
                    {errors.item_code && (
                      <div className="invalid-feedback">{errors.item_code}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="2"
                      placeholder="Enter item description..."
                      value={formData.description}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Inventory Category <span className="text-danger">*</span>
                    </label>
                    <select
                      name="inventory_category_id"
                      className={`form-select ${errors.inventory_category_id ? "is-invalid" : ""}`}
                      value={formData.inventory_category_id}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Category</option>
                      {inventoryCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.inventory_category_id && (
                      <div className="invalid-feedback">{errors.inventory_category_id}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Branch <span className="text-danger">*</span>
                    </label>
                    <select
                      name="branch_id"
                      className={`form-select ${errors.branch_id ? "is-invalid" : ""}`}
                      value={formData.branch_id}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.branch_name}
                        </option>
                      ))}
                    </select>
                    {errors.branch_id && (
                      <div className="invalid-feedback">{errors.branch_id}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Images</h6>
                <div className="row">
                  <div className="col-12">
                    <div className="border rounded p-3 text-center">
                      <input
                        type="file"
                        id="image-upload"
                        className="d-none"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={loading}
                      />
                      <label htmlFor="image-upload" className="btn btn-outline-primary mb-3">
                        <FiImage className="me-2" />
                        Upload Images
                      </label>
                      <p className="text-muted small mb-0">
                        Upload multiple images of the jewelry item (Max 5 images)
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3">
                    <div className="d-flex flex-wrap gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="position-relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            className="img-thumbnail"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                            style={{ width: '24px', height: '24px', padding: '0' }}
                            onClick={() => removeImage(index)}
                            disabled={loading}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Jewelry Details Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Jewelry Details</h6>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label fw-medium">Jewelry Type</label>
                    <select
                      name="jewelry_type"
                      className="form-select"
                      value={formData.jewelry_type}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      {jewelryTypeOptions.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-3">
                    <label className="form-label fw-medium">Size</label>
                    <input
                      type="text"
                      name="size"
                      className="form-control"
                      placeholder="e.g., 18"
                      value={formData.size}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <label className="form-label fw-medium">Gender</label>
                    <select
                      name="gender"
                      className="form-select"
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      {genderOptions.map((gender) => (
                        <option key={gender.value} value={gender.value}>
                          {gender.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-3">
                    <label className="form-label fw-medium">Occasion</label>
                    <select
                      name="occasion"
                      className="form-select"
                      value={formData.occasion}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      {occasionOptions.map((occasion) => (
                        <option key={occasion.value} value={occasion.value}>
                          {occasion.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Metals Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-primary mb-0">Metals Information</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addMetal}
                    disabled={loading}
                  >
                    <FiPlus size={14} /> Add Metal
                  </button>
                </div>
                
                {formData.metals.map((metal, index) => {
                  const purities = getPuritiesForMetal(metal.metal_type);
                  const metalHallmarks = getHallmarksForMetal(metal.metal_type);
                  
                  return (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">Metal #{index + 1}</h6>
                          {formData.metals.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeMetal(index)}
                              disabled={loading}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                        
                        <div className="row g-3">
                          <div className="col-md-3">
                            <label className="form-label fw-medium">Metal Type</label>
                            <select
                              className="form-select"
                              value={metal.metal_type}
                              onChange={(e) => handleMetalChange(index, 'metal_type', e.target.value)}
                              disabled={loading}
                            >
                              {metalTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-medium">
                              Purity <span className="text-danger">*</span>
                            </label>
                            <select
                              className={`form-select ${errors[`metal_purity_${index}`] ? "is-invalid" : ""}`}
                              value={metal.purity}
                              onChange={(e) => handleMetalChange(index, 'purity', e.target.value)}
                              disabled={loading}
                            >
                              <option value="">Select Purity</option>
                              {purities.map((purity) => (
                                <option key={purity.value} value={purity.value}>
                                  {purity.label}
                                </option>
                              ))}
                            </select>
                            {errors[`metal_purity_${index}`] && (
                              <div className="invalid-feedback">{errors[`metal_purity_${index}`]}</div>
                            )}
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-medium">
                              Weight (grams) <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${errors[`metal_weight_${index}`] ? "is-invalid" : ""}`}
                              placeholder="e.g., 3.2"
                              value={metal.weight}
                              onChange={(e) => handleMetalChange(index, 'weight', e.target.value)}
                              disabled={loading}
                            />
                            {errors[`metal_weight_${index}`] && (
                              <div className="invalid-feedback">{errors[`metal_weight_${index}`]}</div>
                            )}
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-medium">Color</label>
                            <select
                              className="form-select"
                              value={metal.color}
                              onChange={(e) => handleMetalChange(index, 'color', e.target.value)}
                              disabled={loading}
                            >
                              <option value="yellow">Yellow</option>
                              <option value="white">White</option>
                              <option value="rose">Rose</option>
                              <option value="platinum">Platinum</option>
                              <option value="silver">Silver</option>
                            </select>
                          </div>

                          <div className="col-md-3">
                            <label className="form-label fw-medium">Hallmark</label>
                            <select
                              className="form-select"
                              value={metal.hallmark}
                              onChange={(e) => handleMetalChange(index, 'hallmark', e.target.value)}
                              disabled={loading}
                            >
                              <option value="">Select Hallmark</option>
                              {metalHallmarks.map((hallmark) => (
                                <option key={hallmark.value} value={hallmark.value}>
                                  {hallmark.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stones Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-primary mb-0">Stones Information</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addStone}
                    disabled={loading}
                  >
                    <FiPlus size={14} /> Add Stone
                  </button>
                </div>
                
                {formData.stones.map((stone, index) => {
                  const clarities = getClaritiesForStone(stone.stone_type);
                  
                  return (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">Stone #{index + 1}</h6>
                          {formData.stones.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeStone(index)}
                              disabled={loading}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                        
                        <div className="row g-3">
                          <div className="col-md-3">
                            <label className="form-label fw-medium">Stone Type</label>
                            <select
                              className="form-select"
                              value={stone.stone_type}
                              onChange={(e) => handleStoneChange(index, 'stone_type', e.target.value)}
                              disabled={loading}
                            >
                              {stoneTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-medium">Shape</label>
                            <select
                              className="form-select"
                              value={stone.shape}
                              onChange={(e) => handleStoneChange(index, 'shape', e.target.value)}
                              disabled={loading}
                            >
                              {stoneShapes.map((shape) => (
                                <option key={shape.value} value={shape.value}>
                                  {shape.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-medium">Color</label>
                            <select
                              className="form-select"
                              value={stone.color}
                              onChange={(e) => handleStoneChange(index, 'color', e.target.value)}
                              disabled={loading}
                            >
                              {diamondColors.map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-medium">
                              Clarity <span className="text-danger">*</span>
                            </label>
                            <select
                              className={`form-select ${errors[`stone_clarity_${index}`] ? "is-invalid" : ""}`}
                              value={stone.clarity}
                              onChange={(e) => handleStoneChange(index, 'clarity', e.target.value)}
                              disabled={loading}
                            >
                              <option value="">Select Clarity</option>
                              {clarities.map((clarity) => (
                                <option key={clarity.value} value={clarity.value}>
                                  {clarity.label}
                                </option>
                              ))}
                            </select>
                            {errors[`stone_clarity_${index}`] && (
                              <div className="invalid-feedback">{errors[`stone_clarity_${index}`]}</div>
                            )}
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-medium">
                              Carat Weight <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${errors[`stone_carat_${index}`] ? "is-invalid" : ""}`}
                              placeholder="e.g., 0.5"
                              value={stone.carat_weight}
                              onChange={(e) => handleStoneChange(index, 'carat_weight', e.target.value)}
                              disabled={loading}
                            />
                            {errors[`stone_carat_${index}`] && (
                              <div className="invalid-feedback">{errors[`stone_carat_${index}`]}</div>
                            )}
                          </div>

                          <div className="col-md-1">
                            <label className="form-label fw-medium">Quantity</label>
                            <input
                              type="number"
                              className="form-control"
                              min="1"
                              value={stone.quantity}
                              onChange={(e) => handleStoneChange(index, 'quantity', e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>
                        
                        <div className="row mt-3">
                          <div className="col-md-6">
                            <label className="form-label fw-medium">Certificate Type</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g., GIA, IGI, HRD"
                              value={stone.certificate_type}
                              onChange={(e) => handleStoneChange(index, 'certificate_type', e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rates Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Current Rates</h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Gold Rate (per gram) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="text"
                        name="gold_rate"
                        className={`form-control ${errors.gold_rate ? "is-invalid" : ""}`}
                        placeholder="e.g., 5000"
                        value={formData.gold_rate}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.gold_rate && (
                      <div className="invalid-feedback">{errors.gold_rate}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Stone Rate (per carat)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="text"
                        name="stone_rate"
                        className={`form-control ${errors.stone_rate ? "is-invalid" : ""}`}
                        placeholder="e.g., 80000"
                        value={formData.stone_rate}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.stone_rate && (
                      <div className="invalid-feedback">{errors.stone_rate}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Making Charges Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Making Charges</h6>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Making Type</label>
                    <select
                      name="making_type"
                      className="form-select"
                      value={formData.making_type}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="percentage">Percentage of Metal Cost</option>
                      <option value="per_gram">Per Gram</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Making Charges <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      {formData.making_type === "percentage" && (
                        <span className="input-group-text">%</span>
                      )}
                      {formData.making_type === "per_gram" && (
                        <span className="input-group-text">₹/g</span>
                      )}
                      {formData.making_type === "fixed" && (
                        <span className="input-group-text">₹</span>
                      )}
                      <input
                        type="text"
                        name="making_charges"
                        className={`form-control ${errors.making_charges ? "is-invalid" : ""}`}
                        placeholder={formData.making_type === "percentage" ? "e.g., 15" : "e.g., 500"}
                        value={formData.making_charges}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.making_charges && (
                      <div className="invalid-feedback">{errors.making_charges}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Wastage Percentage</label>
                    <div className="input-group">
                      <span className="input-group-text">%</span>
                      <input
                        type="text"
                        name="wastage_percentage"
                        className="form-control"
                        placeholder="e.g., 5"
                        value={formData.wastage_percentage}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Discounts Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Pricing & Discounts</h6>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Profit Margin (%) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">%</span>
                      <input
                        type="text"
                        name="profit_margin"
                        className={`form-control ${errors.profit_margin ? "is-invalid" : ""}`}
                        placeholder="e.g., 25"
                        value={formData.profit_margin}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.profit_margin && (
                      <div className="invalid-feedback">{errors.profit_margin}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Customer Discount (%)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">%</span>
                      <input
                        type="text"
                        name="discount_percentage"
                        className={`form-control ${errors.discount_percentage ? "is-invalid" : ""}`}
                        placeholder="e.g., 10"
                        value={formData.discount_percentage}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.discount_percentage && (
                      <div className="invalid-feedback">{errors.discount_percentage}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Trade Discount (%)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">%</span>
                      <input
                        type="text"
                        name="trade_discount"
                        className="form-control"
                        placeholder="e.g., 5"
                        value={formData.trade_discount}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Professional Details</h6>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Warranty Period (months)
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="warranty_period"
                        className={`form-control ${errors.warranty_period ? "is-invalid" : ""}`}
                        placeholder="e.g., 12"
                        value={formData.warranty_period}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                      <span className="input-group-text">months</span>
                    </div>
                    {errors.warranty_period && (
                      <div className="invalid-feedback">{errors.warranty_period}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Certification Number</label>
                    <input
                      type="text"
                      name="certification_number"
                      className="form-control"
                      placeholder="e.g., HALL123456"
                      value={formData.certification_number}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Manufacturer</label>
                    <input
                      type="text"
                      name="manufacturer"
                      className="form-control"
                      placeholder="e.g., Tanishq, Kalyan"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Insurance Value</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="text"
                        name="insurance_value"
                        className="form-control"
                        placeholder="e.g., 100000"
                        value={formData.insurance_value}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Appraisal Value</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="text"
                        name="appraisal_value"
                        className="form-control"
                        placeholder="e.g., 120000"
                        value={formData.appraisal_value}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-check form-switch mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="bis_mark"
                        checked={formData.bis_mark}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <label className="form-check-label fw-medium">
                        BIS Hallmark Certified
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Warranty Details</label>
                    <textarea
                      name="warranty_details"
                      className="form-control"
                      rows="2"
                      placeholder="Enter warranty terms and conditions..."
                      value={formData.warranty_details}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Stock & Location Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Stock & Location</h6>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium">Current Stock</label>
                    <input
                      type="number"
                      name="current_stock"
                      className="form-control"
                      placeholder="e.g., 1"
                      value={formData.current_stock}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Minimum Stock</label>
                    <input
                      type="number"
                      name="minimum_stock"
                      className="form-control"
                      placeholder="e.g., 1"
                      value={formData.minimum_stock}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Location Type</label>
                    <select
                      name="location_type"
                      className="form-select"
                      value={formData.location_type}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      {locationTypes.map((location) => (
                        <option key={location.value} value={location.value}>
                          {location.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Details Section */}
              <div className="mb-4">
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label fw-medium">Location Details</label>
                    <input
                      type="text"
                      name="location_details"
                      className="form-control"
                      placeholder="e.g., Showcase 3, Shelf A, Row 2"
                      value={formData.location_details}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Tax Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Tax Information</h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      GST Percentage (%) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">%</span>
                      <input
                        type="text"
                        name="gst_percentage"
                        className={`form-control ${errors.gst_percentage ? "is-invalid" : ""}`}
                        placeholder="e.g., 3"
                        value={formData.gst_percentage}
                        onChange={handleNumericChange}
                        disabled={loading}
                      />
                    </div>
                    {errors.gst_percentage && (
                      <div className="invalid-feedback">{errors.gst_percentage}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="mb-4">
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label fw-medium">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      className="form-control"
                      placeholder="Enter tags separated by commas (e.g., wedding, gold, diamond, ring)"
                      value={formData.tags}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Status</h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Item Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="sold_out">Sold Out</option>
                      <option value="discontinued">Discontinued</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
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
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Jewelry Item
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

export default AddInventoryItemForm;