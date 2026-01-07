import React, { useState, useEffect } from "react";
import { FiUpload, FiPlus, FiTrash2 } from "react-icons/fi";

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
    
    // Status
    status: "active",
    
    // Arrays
    images: [],
    tags: ""
  });

  const [errors, setErrors] = useState({});
  const [autoGenerateCode, setAutoGenerateCode] = useState(true);

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

  // Calculate derived values
  useEffect(() => {
    // Calculate metal weight
    const totalMetalWeight = formData.metals.reduce((sum, metal) => {
      return sum + (parseFloat(metal.weight) || 0);
    }, 0);
    
    // Calculate total carat
    const totalCarat = formData.stones.reduce((sum, stone) => {
      return sum + (parseFloat(stone.carat_weight) || 0);
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
    
    // Calculate selling price
    const profitMargin = parseFloat(formData.profit_margin) || 0;
    const sellingPrice = totalCost > 0 ? totalCost * (1 + profitMargin / 100) : 0;
    
    // Calculate tax
    const gstPercentage = parseFloat(formData.gst_percentage) || 0;
    const cgst = sellingPrice * (gstPercentage / 200);
    const sgst = sellingPrice * (gstPercentage / 200);
    
  }, [
    formData.metals,
    formData.stones,
    formData.gold_rate,
    formData.stone_rate,
    formData.making_charges,
    formData.making_type,
    formData.wastage_percentage,
    formData.profit_margin,
    formData.gst_percentage
  ]);

  // Get unique metal types from metal purities
  const getMetalTypes = () => {
    const uniqueTypes = [...new Set(metalPurities.map(p => p.metal_type))];
    return uniqueTypes.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    }));
  };

  // Get purities for selected metal type
  const getPuritiesForMetal = (metalType) => {
    return metalPurities
      .filter(p => p.metal_type === metalType)
      .map(p => ({
        value: p.purity_name,
        label: p.purity_name
      }));
  };

  // Get unique stone types from stone purities
  const getStoneTypes = () => {
    const uniqueTypes = [...new Set(stonePurities.map(p => p.stone_type))];
    return uniqueTypes.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    }));
  };

  // Get clarities (stone purities) for selected stone type
  const getClaritiesForStone = (stoneType) => {
    return stonePurities
      .filter(p => p.stone_type === stoneType)
      .map(p => ({
        value: p.stone_purity,
        label: p.stone_purity
      }));
  };

  // Get hallmarks for selected metal type
  const getHallmarksForMetal = (metalType) => {
    return hallmarks
      .filter(h => h.metal_type_name === metalType)
      .map(h => ({
        value: h.name,
        label: h.name
      }));
  };

  // Handle change for basic fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  // Handle metal changes - with dependent updates
  const handleMetalChange = (index, field, value) => {
    const updatedMetals = [...formData.metals];
    const currentMetal = updatedMetals[index];
    
    // Update the field
    updatedMetals[index] = {
      ...currentMetal,
      [field]: value
    };
    
    // If metal_type changes, reset purity and fetch available purities/hallmarks
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
    
    // Update the field
    updatedStones[index] = {
      ...currentStone,
      [field]: value
    };
    
    // If stone_type changes, reset clarity
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

  // Add new metal with default values
  const addMetal = () => {
    const metalTypes = getMetalTypes();
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

  // Add new stone with default values
  const addStone = () => {
    const stoneTypes = getStoneTypes();
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
      
      // Stock
      current_stock: parseInt(formData.current_stock) || 1,
      minimum_stock: parseInt(formData.minimum_stock) || 1,
      location_type: formData.location_type,
      location_details: formData.location_details,
      
      // Tax
      gst_percentage: parseFloat(formData.gst_percentage) || 3,
      
      // Status
      status: formData.status,
      
      // Arrays
      images: formData.images,
      tags: formData.tags
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
            <h5 className="modal-title fw-bold fs-5">Add Jewelry Item</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
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
                  const metalTypes = getMetalTypes();
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
                  const stoneTypes = getStoneTypes();
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
                <h6 className="fw-bold text-primary mb-3">Rates</h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Gold Rate (per gram) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="gold_rate"
                      className={`form-control ${errors.gold_rate ? "is-invalid" : ""}`}
                      placeholder="e.g., 5000"
                      value={formData.gold_rate}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                    {errors.gold_rate && (
                      <div className="invalid-feedback">{errors.gold_rate}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Stone Rate (per carat)
                    </label>
                    <input
                      type="text"
                      name="stone_rate"
                      className={`form-control ${errors.stone_rate ? "is-invalid" : ""}`}
                      placeholder="e.g., 80000"
                      value={formData.stone_rate}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
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
                    <label className="form-label fw-medium">Making Charges</label>
                    <input
                      type="text"
                      name="making_charges"
                      className="form-control"
                      placeholder={formData.making_type === "percentage" ? "e.g., 15" : "e.g., 500"}
                      value={formData.making_charges}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">Wastage Percentage</label>
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

              {/* Pricing Section */}
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Pricing</h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Profit Margin (%)</label>
                    <input
                      type="text"
                      name="profit_margin"
                      className="form-control"
                      placeholder="e.g., 25"
                      value={formData.profit_margin}
                      onChange={handleNumericChange}
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
                      placeholder="e.g., Showcase 3, Shelf A"
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
                    <label className="form-label fw-medium">GST Percentage (%)</label>
                    <input
                      type="text"
                      name="gst_percentage"
                      className="form-control"
                      placeholder="e.g., 3"
                      value={formData.gst_percentage}
                      onChange={handleNumericChange}
                      disabled={loading}
                    />
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
                      placeholder="Enter tags separated by commas"
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